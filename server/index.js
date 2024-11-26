// require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

// SOCKET-IO FOR LISTENNING CHAT CONVERSATIONS
io.on('connection', (socket) => {
    const userAgent = socket.handshake.headers['user-agent'];
    const clientIp = socket.handshake.address;
    // show the logging of new connection
    console.log("\n ========================================")
    console.log(`New connection. User-Agent: ${userAgent}`);
    console.log(`From IPv4 : ${clientIp}`);
    console.log("\n ========================================")

    // listen from client thorught the event load all available chat room
    socket.on('getAvailableChatRooms', (data) => {

        // request client to update
        io.emit('Res-Available-Chat-Rooms', data);
    });

    // listen from client thorught the event load all available chat room
    socket.on('getRoomHistoryChat', (data) => {

        // request client to update
        io.emit('Res-Room-History-Chat', data);
    });


    // listen from client thorught the ontextChange
    socket.on('onTextChange', (data) => {
        // console.log(`Message from client: ${data.text}, whoose id is: ${data.from}`);
        io.emit('on-text-change', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = 3030; // process.env.PORT || 80;
const URL = `http://localhost:${PORT}/`;


server.listen(PORT, () => console.log(`Listening on ${URL}`));