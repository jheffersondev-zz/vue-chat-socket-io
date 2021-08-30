const http = require("http");
const app = require("express")();
const cors = require("cors");
app.use(cors());
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");

client.connect()
const db = client.db("school-friends-chat");
const Messages = db.collection('messages');


app.get("/messages", async (req, res) => {
  const messages = await Messages.find({}).toArray();
  return res.json(messages)
});


app.get("/clear", async (req, res) => {
  const messages = await Messages.deleteMany({})
  return res.json("deleted")
});


io.on('connection', (socket) => {
  console.log(`new client connected ${socket.id}`);

  socket.on('newMessage', async (data) => {
    let message = {
      author: data.author, 
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcZsL6PVn0SNiabAKz7js0QknS2ilJam19QQ&usqp=CAU",
      content: data.content, 
      datetime: data.datetime,
    }

    await Messages.insertOne(message);
    socket.broadcast.emit("userMessage", message);
  });
  
})

server.listen(3000, () => console.log("[+] Server started"))

