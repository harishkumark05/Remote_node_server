# Sensor Data Monitoring System

This Node.js application serves as a backend server for a sensor data monitoring system.
It receives sensor data from a message queue, handles user authentication, and communicates with the frontend via Socket.io for real-time updates.

## Prerequisites
- Node.js installed on your system
- RabbitMQ server or cloud-based service credentials (for message queuing)
- Basic knowledge of Express.js, Socket.io, and JWT (JSON Web Tokens)

## Features
- Receives sensor data from a message queue and broadcasts it to connected clients in real-time.
- Implements user authentication using JWT for secure access to protected endpoints.
- Provides RESTful API endpoints for interacting with sensor data and user authentication.
- Utilizes Socket.io for bidirectional communication between the server and frontend.
- Supports Cross-Origin Resource Sharing (CORS) to enable secure communication between client and server.

## Endpoints
- `POST /login`: Endpoint for user authentication. Requires username and pin in the request body.
- `GET /data`: Endpoint to retrieve sensor data. Requires a valid JWT token in the Authorization header.
- `GET /profile/data.json`: Endpoint to retrieve profile data. Requires a valid JWT token in the Authorization header.

## Dependencies Used
- Express.js: Web framework for handling HTTP requests.
- Socket.io: Library for real-time, bidirectional communication between web clients and servers.
- AMQP: Library for interacting with RabbitMQ message broker.
- JWT: JSON Web Token implementation for Node.js.
- CORS: Middleware for enabling Cross-Origin Resource Sharing.

