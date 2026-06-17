
const express=require("express");
const http=require("http");
const {Server}=require("socket.io");
const app=express();
const server=http.createServer(app);
const io=new Server(server);
app.use(express.static("public"));
const questions=["前賢不在，我偷懶一下沒關係！","當受到前賢指正時，我不會煩躁，且會反省！","別人對我態度很差，我還是會對他好！","我的付出沒被看見，我就不想付出了！","後學不聽我的，我會生氣不被尊重！","當道場安排不如我所想，我還是願意配合！","我心裡會評價同修，覺得他人不如我！","當事情有更好的作法時，我也不願改變！"];
let stage='start'; let current=0; let results=questions.map(()=>({yes:0,no:0})); let votes={};
function state(){return {stage,current,questions,results};}
io.on('connection',s=>{s.emit('state',state());
s.on('start',()=>{stage='quiz'; current=0; io.emit('state',state());});
s.on('restart',()=>{stage='start'; current=0; io.emit('state',state());});
s.on('resetAll',()=>{results=questions.map(()=>({yes:0,no:0})); votes={}; stage='start'; current=0; io.emit('state',state());});
s.on('vote',({question,answer,userId})=>{let k=userId+'_'+question; let old=votes[k]; if(old===answer)return; if(old)results[question][old]--; results[question][answer]++; votes[k]=answer; io.emit('state',state());});
s.on('next',()=>{if(current<questions.length-1){current++;} else {stage='end';} io.emit('state',state());});
s.on('prev',()=>{if(current>0) current--; io.emit('state',state());});});
app.get('/api/results',(req,res)=>res.json({questions,results}));
server.listen(process.env.PORT||3000);
