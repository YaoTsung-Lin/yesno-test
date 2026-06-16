
const express=require("express");
const http=require("http");
const {Server}=require("socket.io");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(express.static("public"));

const questions=[
"前賢不在，我偷懶一下沒關係！",
"當受到前賢指正時，我不會煩躁，且會反省！",
"別人對我態度很差，我還是會對他好！",
"我的付出沒被看見，我就不想付出了！",
"後學不聽我的，我會生氣不被尊重！",
"當道場安排不如我所想，我還是願意配合！",
"我心裡會評價同修，覺得他人不如我！",
"當事情有更好的作法時，我也不願改變！"
];

let currentQuestion=0;
let results=questions.map(()=>({yes:0,no:0}));
let votes={}; // socketid_question => answer

function state(){
 return {
  currentQuestion,
  total:questions.length,
  question:questions[currentQuestion],
  results:results[currentQuestion]
 };
}

io.on("connection",(socket)=>{

 socket.emit("update",state());

 socket.on("vote",(type)=>{
   if(!["yes","no"].includes(type)) return;

   const key=`${socket.id}_${currentQuestion}`;
   const old=votes[key];

   if(old===type){
      io.emit("update",state());
      return;
   }

   if(old){
      results[currentQuestion][old]--;
   }

   results[currentQuestion][type]++;
   votes[key]=type;

   io.emit("update",state());
 });

 socket.on("nextQuestion",()=>{
   if(currentQuestion<questions.length-1){
      currentQuestion++;
      io.emit("update",state());
   }
 });

 socket.on("prevQuestion",()=>{
   if(currentQuestion>0){
      currentQuestion--;
      io.emit("update",state());
   }
 });

 socket.on("resetVotes",()=>{
   results[currentQuestion]={yes:0,no:0};
   Object.keys(votes).forEach(k=>{
      if(k.endsWith("_"+currentQuestion)) delete votes[k];
   });
   io.emit("update",state());
 });

});

server.listen(process.env.PORT||3000);
