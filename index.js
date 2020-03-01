var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var currentState = "";
var currentPlayerState = "";

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.use(express.static(path.join(__dirname, 'public')));

server.listen(port, () => {
    console.log('Server listening at port %d', port);
  });

app.get('/panel', function (req, res) {
    console.log("loading panel...");
    res.sendFile(__dirname + '/panel.html');
});

app.get('/playerWidget', function (req, res) {
    console.log("loading playerWidget...");
    res.sendFile(__dirname + '/playerWidget.html');
});

app.get('/eventWidget', function (req, res) {
    console.log("loading eventWidget...");
    res.sendFile(__dirname + '/eventWidget.html');
});

app.get('/activeGameWidget', function (req, res) {
    console.log("loading activeGameWidget...");
    res.sendFile(__dirname + '/activeGameWidget.html');
});

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('paint', function (msg) {
        console.log('Index.js-paint');
        io.emit('paint', currentState);
    });


    socket.on('panelToPlayerUpdate', function (msg) {
        console.log("panelToPlayerUpdate");
        console.log(msg);
        io.emit('playerStateUpdate', msg);
    });    

    socket.on('panelToActiveGameUpdate', function (msg) {
        io.emit('activeGameStateUpdate', msg);
    });

    

    socket.on('startPlayerWidget', function (msg) {
        console.log('Inside startPlayerWidget... ');
        //io.emit('paint', currentState);
    });

    socket.on('startPanel', function (msg) {
        console.log('Inside startPanel... ');
    });    

    socket.on('setCurrentPlayer', function (msg) {
        console.log(msg);
        io.emit('paintPlayer', msg);
    });

    socket.on('setActiveGames', function (msg) {
        console.log(msg);
        io.emit('paintActiveGames', msg);
    });

    socket.on('pinEvents', function (msg) {
        console.log(msg);
        io.emit('updatePinEvents', msg);
    });

});
