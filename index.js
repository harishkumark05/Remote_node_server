require('dotenv').config();
const express = require('express');
const app = express();
const amqp = require('amqplib');
const rabbitmqUrl = process.env.RABBITMQ_URL;
const cors = require('cors');

// Set up CORS to allow requests from your frontend application
app.use(cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));
const connect = async () => {
    try {
        const connection = await amqp.connect(rabbitmqUrl);
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