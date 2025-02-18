module.exports = (io) => {
    // Event listener for new connections
    io.on('connection', (socket) => {
      console.log('New user connected');
      
      // Event listener for chat messages
      socket.on('chatMessage', (msg) => {
        // Emit the message to all connected clients
        io.emit('message', msg);
      });
  
      // Event listener for disconnecting users
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  };
  