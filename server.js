
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

let current=0;
let results=questions.map(()=>({yes:0,no:0}));
let votes={};

function state(){
 return {current,questions,results};
}

io.on("connection",(socket)=>{
 socket.emit("state",state());

 socket.on("vote",({question,answer,userId})=>{
   const key=userId+"_"+question;
   const old=votes[key];

   if(old===answer) return;

   if(old) results[question][old]--;
   results[question][answer]++;
   votes[key]=answer;

   io.emit("state",state());
 });

 socket.on("next",()=>{
   if(current<questions.length-1){
     current++;
     io.emit("state",state());
   }
 });

 socket.on("prev",()=>{
   if(current>0){
     current--;
     io.emit("state",state());
   }
 });

 socket.on("reset",()=>{
   results[current]={yes:0,no:0};
   Object.keys(votes).forEach(k=>{
     if(k.endsWith("_"+current)) delete votes[k];
   });
   io.emit("state",state());
 });
});

app.get("/api/results",(req,res)=>res.json(results));

server.listen(process.env.PORT||3000);
