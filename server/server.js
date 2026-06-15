import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoute.js';
import { Server } from 'socket.io';



//Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// console.log("Cloud:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("Key:", process.env.CLOUDINARY_API_KEY);
// console.log("Secret Exists:", !!process.env.CLOUDINARY_API_SECRET);

//Intiallize socket.io
export const io = new Server(server,{
    cors:{origin:'*'}
})

//Store Online User
export const userSocketMap= {}; // {UserId:socketId }

//Socket.io connection handdler

io.on('connection',(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log('User Connected',userId);
    if(userId) userSocketMap[userId] = socket.id;

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', ()=>{
        console.log('User Disconnect',userId);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers',Object.keys(userSocketMap));
    })

})

// Middleware setup
app.use(express.json({limit:'4mb'}));
app.use(cors());


//Routes Setup
app.use("/api/status",(req,res)=> res.send("Server is Live"));
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);     

//connect Database
await connectDB(); 

if(process.env.NODE_ENV!=='production'){
    const PORT = process.env.PORT || 5000;
    server.listen(PORT,()=> console.log("Server is Runing on Port:"+PORT));
}

//Export server on vercel
export default server;