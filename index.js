require('dotenv').config();
const express = require('express');
const app = express();
const amqp = require('amqplib');
const rabbitmqUrl = process.env.RABBITMQ_URL;
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
        allowedHeaders: ["content-type"]
    }
});


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
let message = '';

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
            channel.ack(data);
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }

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
