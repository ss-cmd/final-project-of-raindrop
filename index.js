//Initialize the express 'app' object
let express = require('express');
let app = express();
app.use('/', express.static('public'));

//users
const users = {}

//Initialize the actual HTTP server

let http = require('http');
let server = http.createServer(app);

let port = process.env.PORT || 8000;
server.listen(port, ()=> {
console.log('listening at ', port);
});


//Initialize socket.io

let io = require('socket.io').listen(server);

//Listen for individual clients/users to connect

io.on('connection', socket => {
    socket.on('new-user', name => {
      users[socket.id] = name 
      socket.name = name;
      socket.broadcast.emit('user-connected', socket.name)
    })
    socket.on('mouseHasBeenClicked', () => {
      console.log('mouseHasBeenClicked by ', socket.name);
      socket.broadcast.emit('mousehasclicked',users[socket.id])
    })
    socket.on('disconnect', () => {
      socket.broadcast.emit('user-disconnected', users[socket.id])
      delete users[socket.id]
    })
  })

