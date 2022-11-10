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
    <section>
        <h2>Say something</h2>
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
    </section>
    <section>
        <div v-for="message in messages" :key="message.id">
            <b>
            {{ message.username }}
            </b>
            : {{ message.text }}
        </div>
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
    }
  }
};
</script>
