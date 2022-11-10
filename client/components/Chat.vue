<!-- Page for account sign-in and registration -->
<!-- User should be NOT authenticated in order to see this page -->

<template>
  <main>
    <section>
        <h2>Your name</h2>
        <input 
            type="text"
            name="username"
            v-model="username"
        />
        <button
            @click="changeName"
        >
            Change name
        </button>
    </section>

    <section v-if="joinedRoom.length === 0">
        <div v-for="room in rooms" :key="room" @click="joinRoom(room)">
            {{ room }}
        </div>
    </section>
    <section v-else>
        <h2>{{ joinedRoom }}</h2>
        <input
            type="text"
            name="message"
            v-model="text"
        />
        <button
            @click="sendMessage"
        >
            Send chat
        </button>
        <div v-for="message in messages" :key="message.id">
            <b>
            {{ message.username }}
            </b>
            : {{ message.text }}
        </div>
        <button @click="leaveRoom">
            Leave this room
        </button>
    </section>
  </main>
</template>

<script>
import io from "socket.io-client";

export default {
  name: 'Chat',
  data() {
    return {
        username: "Anonymous",
        text: "",
        messages: [],
        rooms: ["Room1", "Room2"], // list of strings (room names)
        joinedRoom: "",
    }
  },
  created() {
    // initialize socket
    this.socketInstance = io("http://localhost:3000");

    // receive message
    this.socketInstance.on("message:received", (data) => {
        this.messages = this.messages.concat(data);
    });

    // reflect changed name
    this.socketInstance.on("username:received", (data) => {
        this.updateNameInMessages(data.userId, data.newUsername);
    });

    // someone joined
    this.socketInstance.on("join", (data) => {
        this.messages = this.messages.concat(data);
    });

    // someone left
    this.socketInstance.on("leave", (data) => {
        this.messages = this.messages.concat(data);
    });
  },
  methods: {
    // send message
    sendMessage() {
        const message = {
            id: new Date().getTime(),
            text: this.text,
            username: this.username,
            userId: this.socketInstance.id,
            roomName: this.joinedRoom,
        };
        this.messages = this.messages.concat(message); // show message in my client
        this.socketInstance.emit('message', message); // send message to others
        this.text = ""; // intialize input
    },
    changeName() {
        this.socketInstance.emit('username', {
            userId: this.socketInstance.id,
            newUsername: this.username,
        }); // send new name to others

        this.updateNameInMessages(this.socketInstance.id, this.username); // change name in my chat
    },
    updateNameInMessages(userId, newUsername) {
        this.messages = this.messages.map(message => {
            if (message.userId === userId) {
                return {
                    ...message,
                    username: newUsername
                }
            }
            return message;
        });
    },
    joinRoom(room) {
        this.socketInstance.emit("join-room", {
            roomName: room,
        });
        this.joinedRoom = room;
    },
    leaveRoom() {
        this.socketInstance.emit("leave-room", {
            roomName: this.joinedRoom,
        });
        this.joinedRoom = "";
    }
  }
};
</script>
