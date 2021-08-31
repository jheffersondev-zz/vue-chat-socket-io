const http = require("http");
const app = require("express")();
const cors = require("cors");
app.use(cors());
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");

client.connect();
const db = client.db("school-friends-chat");
const Messages = db.collection("messages");

app.get("/messages", async (req, res) => {
  const messages = await Messages.find({}).toArray();
  return res.json(messages);
});

app.get("/clear", async (req, res) => {
  const messages = await Messages.deleteMany({});
  return res.json("deleted");
});

io.on("connection", (socket) => {
  console.log(`new client connected ${socket.id}`);

  socket.on("newUserRegistered", (username) => {
    socket.broadcast.emit("newUserJoinedToChat", username);
  })

  socket.on("typing", (username) => {
    socket.broadcast.emit("userTyping", username);
  })

  socket.on("newMessage", async (data) => {
    let message = {
      author: data.author,
      avatar:"https://i.pinimg.com/originals/35/79/3b/35793b67607923a68d813a72185284fe.jpg",
      content: data.content,
      datetime: data.datetime,
    };

    await Messages.insertOne(message);
    socket.broadcast.emit("userMessage", message);
  });
});

server.listen(3000, () => console.log("[+] Server started"));
