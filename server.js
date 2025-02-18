const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const dotenv = require('dotenv');
const cors = require('cors');
const Message = require('./models/Message');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors());
app.use(express.json());

// Create WebSocket server instance
const wss = new WebSocket.Server({ server });

// MongoDB Connection
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// WebSocket Event Handling
wss.on('connection', async (ws) => {
    console.log('🔗 A user connected');

    // Send previous messages from MongoDB
    const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
    ws.send(JSON.stringify({ type: "old_messages", data: messages }));

    ws.on('message', async (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            console.log(`📩 Received from ${parsedMessage.username}: ${parsedMessage.text}`);

            // Save message to MongoDB
            const newMessage = new Message({
                username: parsedMessage.username,
                text: parsedMessage.text
            });
            await newMessage.save();

            // Broadcast the message to all clients
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: "new_message", data: parsedMessage }));

                    // Send a notification event to other users
                    if (client !== ws) {  // Don't send a notification to the sender
                        client.send(JSON.stringify({ type: "notification", data: `${parsedMessage.username} sent a new message!` }));
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('❌ A user disconnected');
    });
});



// Sample API Route
app.get('/', (req, res) => {
    res.send('Welcome to the Real-Time Chat API 🚀');
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
