const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        
        rooms[roomId].push(socket.id);

        // Prvému hráčovi priradíme bielu, druhému čiernu
        if (rooms[roomId].length === 1) {
            socket.emit('init', { color: 'w' });
        } else if (rooms[roomId].length === 2) {
            socket.emit('init', { color: 'b' });
            io.to(roomId).emit('startGame');
        } else {
            socket.emit('init', { color: 'spectator' });
        }

        socket.on('move', (moveData) => {
            socket.to(roomId).emit('move', moveData);
        });

        socket.on('disconnect', () => {
            rooms[roomId] = rooms[roomId]?.filter(id => id !== socket.id);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server beží na porte ${PORT}`));
