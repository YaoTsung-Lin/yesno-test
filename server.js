
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const questions = [
  "前賢不在，我偷懶一下沒關係！",
  "當受到前賢指正時，我不會煩躁，且會反省！",
  "別人對我態度很差，我還是會對他好！",
  "我的付出沒被看見，我就不想付出了！",
  "後學不聽我的，我會生氣不被尊重！",
  "當道場安排不如我所想，我還是願意配合！",
  "我心裡會評價同修，覺得他人不如我！",
  "當事情有更好的作法時，我也不願改變！"
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

  socket.on("prevQuestion", () => {

    if(currentQuestion > 0){
      currentQuestion--;
      io.emit("update", getState());
    }

  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
