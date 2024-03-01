require('dotenv').config();
const express = require('express');
const app = express();
const amqp = require('amqplib');
const rabbitmqUrl = process.env.RABBITMQ_URL;
const cors = require('cors');


app.use(cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

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

 async function connect () {
    try {
        console.log("Attempting to connect to RabbitMQ...");
        const connection = await amqp.connect("amqps://hhhffwzt:18OB0sANoveOVY_QhztgUaXONis5qq_o@octopus-01.rmq3.cloudamqp.com/hhhffwzt");
        console.log("Connected to RabbitMQ successfully!");

        const channel = await connection.createChannel();
        const queueName = 'queue_A';

        await channel.assertQueue(queueName, { durable: false });

        console.log("Connected to RabbitMQ-B");
        channel.consume(queueName, (data) => {
            let message = data.content.toString();
            console.log("Received message from RabbitA:", message);
            
            // Acknowledge the message
            channel.ack(data);
        });
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}

connect();

// Start the Express server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});