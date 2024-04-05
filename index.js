require('dotenv').config();
const express = require('express');
const app = express();
const amqp = require('amqplib');
const rabbitmqUrl = process.env.RABBITMQ_URL;
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken')
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
        allowedHeaders: ["content-type"]
    }
});
let message = '';
let dataArray =[];

const SECRET_KEY = 'abcdefghi';
const users = [
{id:1,username:'admin',pin:'1234'},
{id:2,username:'user',pin:'3214'}
  ]

app.use(cors(
{
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
        allowedHeaders: ["content-type"]
    }
    ))
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended:true, limit:'50mb'}));

app.get('/',(req,res)=>{
  console.log('working')
  res.send('I am working')
})
app.get('/test',(req,res)=>{
  console.log('test working')
  res.send('completed-test')
})

app.get('/arduinoArr',(req,res) =>{
    res.send(dataArray)
    // console.log(dataArray)
})
app.post('/login', (req,res)=>{
  const {username,pin}= req.body;
console.log(username)
  const user = users.find(x => x.username === username);
  if(!user || user.pin !== pin){

    return res.status(401).json({message:'Invalid user pin'});
  }
  else{
    const token = jwt.sign({userId:user.id},SECRET_KEY);
    res.json({token})
  }
})

//verify token for auth

const tokenVerification =(req,res,next)=>{
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined'){
    const tok= bearerHeader.split(' ')[1];
    req.token = tok;
    next();
  }else{
    res.sendStatus(403);
  }
}

app.get('/data',tokenVerification,(req,res)=>{
  jwt.verify(req.token, SECRET_KEY, (err,authData)=>{
    if(err){
      res.sendStatus(403)
    }else{
      res.json({data:['item1','item2']})
    }
  })
})
app.get('/profile/data.json', tokenVerification, (req, res) => {
    // Verify the token
    jwt.verify(req.token, SECRET_KEY, (err, authData) => {
        if (err) {
            // If token verification fails, return a 403 Forbidden status
            res.sendStatus(403);
        } else {
            // If token verification succeeds, read data from 'data.json' file
            fs.readFile('./data.json', 'utf8', (err, data) => {
                if (err) {
                    res.status(500).send('Internal Server Error');
                    return;
                }
                // Set response headers and send the data
                res.setHeader('Content-Type', 'application/json');
                res.send(data);
            });
        }
    });
});
async function connect() {
    try {
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        const queueName = 'queue_A';

        await channel.assertQueue(queueName, { durable: false });

        console.log("Connected to RabbitMQ-B");
        channel.consume(queueName, (data) => {
            message = data.content.toString();
            console.log("Received message from RabbitA:", message);
            io.emit('broadcastEvent', message);
            // Acknowledge the message
            formAnArray(JSON.parse(message))
            channel.ack(data);
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }

}
function formAnArray(msg) {
    //get time stamp
    const timestamp = new Date().toISOString();

    //combine message with time stamp
   const dataWithTimestamp = {time:timestamp,...msg}

    if (dataArray.length >= 10) {
        dataArray.pop();
    }
    dataArray.unshift(dataWithTimestamp);
}
connect().catch(error => {
    console.log('Error occurred')
    console.error(error);
});

io.on('connection', (socket) => {
    console.log('Client connected');

    // When a client connects, emit the current message if available
    if (message) {
        socket.emit('broadcastEvent', message);
    }

    socket.on('customEvent', (data) => {
        console.log('Received data from client:', data);
        // Broadcast the data to all connected clients
        io.emit('broadcastEvent', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
// Start the Express server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
