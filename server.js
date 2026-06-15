
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const questions = [
  "你喜歡喝熱茶嗎？",
  "你平常會泡茶嗎？",
  "你喜歡烏龍茶嗎？",
  "你曾參加茶道活動嗎？",
  "你會自己泡茶招待朋友嗎？",
  "你喜歡無糖茶嗎？",
  "你覺得現泡茶比手搖飲好喝嗎？",
  "你願意學習茶道文化嗎？"
];

let currentQuestion = 0;

let results = questions.map(() => ({
  yes: 0,
  no: 0
}));

function getState(){
  return {
    currentQuestion,
    question: questions[currentQuestion],
    total: questions.length,
    results: results[currentQuestion]
  };
}

io.on("connection", (socket) => {

  socket.emit("update", getState());

  socket.on("vote", (type) => {

    if(type === "yes" || type === "no"){
      results[currentQuestion][type]++;
      io.emit("update", getState());
    }

  });

  socket.on("nextQuestion", () => {

    if(currentQuestion < questions.length - 1){
      currentQuestion++;
      io.emit("update", getState());
    }

  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
