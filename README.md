# Simple Chat App

### Socket.IO

Install socket.io

```shell
npm install socket.io socket.io-client
```

Server

```typescript
import { Server } from "socket.io";

...

// socket.io
const io = new Server(server, { // create websocket endpoint so that server & client can talk to each other
  cors: {
      origin: "*",
      methods: ['GET', "POST"]
  }
}); 

io.on("connection", (socket) => {
  console.log(`user ${socket.id} is connected.`);

  socket.on('disconnect', () => {
      console.log(`user ${socket.id} left.`);
  });
});

```

Client

```javascript
import io from "socket.io-client";

...

created() {
    // initialize socket
    this.socketInstance = io("http://localhost:3000");
}
```


### Deploying the app using Heroku

[https://61040-fa22.github.io/pages/deployment.html](https://61040-fa22.github.io/pages/deployment.html)