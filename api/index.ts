// This file must be in the /api folder for Vercel to detect it as a serverless function
import express from 'express';
import session from 'express-session';
import logger from 'morgan';
import http from 'http';
import dotenv from 'dotenv';
import path from "path";
import { Server } from "socket.io";


// Load environmental variables
dotenv.config({});

// Initalize an express app
const app = express();

// Set the port
app.set('port', process.env.PORT || 3000);

// Log requests in the terminal
app.use(logger('dev'));

// Parse incoming requests with JSON payloads ('content-type: application/json' in header)
app.use(express.json());

// Parse incoming requests with urlencoded payloads ('content-type: application/x-www-form-urlencoded' in header)
app.use(express.urlencoded({extended: false}));

// Initialize cookie session
// https://www.npmjs.com/package/express-session#options
app.use(session({
  secret: '61040', // Should generate a real secret
  resave: true,
  saveUninitialized: false,
}));

// Connect with the frontend
const isProduction = process.env.NODE_ENV === 'production';
const vuePath = path.resolve(__dirname, "..", "client", isProduction ? "dist" : "public");
app.use(express.static(vuePath));

// Create server to listen to request at specified port
const server = http.createServer(app);
server.listen(app.get('port'), () => {
  console.log(`Express server running at http://localhost:${app.get('port') as number}`);
});

// socket.io
const io = new Server(server, { // create websocket endpoint so that server & client can talk to each other
  cors: {
      origin: "*",
      methods: ['GET', "POST"]
  }
}); 

const users : { [key: string]: string} = {}; // temporary array to save socketId-username pairs. In practice, use mongodb.

io.on("connection", (socket) => {
  console.log(`user ${socket.id} is connected.`);
  socket.broadcast.emit('join', {
    id: new Date().getTime(),
    text: "A new user joined.",
    username: "Server",
    userId: "",
  });
  users[socket.id] = "Anonymous";

  socket.on('message', data => {
      socket.broadcast.emit('message:received', data);
  });

  socket.on('username', data => {
    users[data.userId] = data.newUsername;
    socket.broadcast.emit('username:received', data);
  });

  socket.on('disconnect', () => {
      console.log(`user ${socket.id} left.`);
      socket.broadcast.emit('leave', {
        id: new Date().getTime(),
        text: `User ${users[socket.id]} left.`,
        username: "Server",
        userId: "",
      });
  });
});