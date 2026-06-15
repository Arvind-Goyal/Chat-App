import cloudinary from '../lib/cloudinary.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import {io, userSocketMap} from '../server.js';

// get all user except login in user

export const getUsersForSidebar = async (req,res)=>{
    try{
        const userId = req.user._id;
        const filterUsers = await User.find({_id:{$ne:userId}}).select("-password");

        // count no. of unseen message
        const unseenMessage = {};
        const promises = filterUsers.map( async (user)=>{
                const msg =  await Message.find({senderId: user._id , receiverId: userId,seen:false});
                if(msg.length >0){
                    unseenMessage[user._id] = msg.length;
                }
        })
        await Promise.all(promises);
        res.json({success:true , users:filterUsers,unseenMessage}); 
    }catch(error){
            console.log(error.message);
            res.json({success:false,message:error.message}); 
    }
}

// get all msg of selected user 

export const getMessages = async (req,res)=>{
    try{
        const {id:selectedUser} = req.params;
        const myId = req.user._id;

        const msg = await Message.find({
            $or:[
                {senderId:myId,receiverId:selectedUser},
                {senderId:selectedUser ,receiverId:myId},
            ]
        })
        await Message.updateMany({senderId:selectedUser ,receiverId : myId},{seen:true});
        res.json({success:true,msg});
    } catch {
        console.log(error.message);
            res.json({success:false,message:error.message}); 
    }
}

// api to mark message seen using message id::


export const markMessageAsSeen = async(req,res)=>{
    try {
        const {id} = req.params;
        await Message.findByIdAndUpdate(id,{seen:true});
        res.json({success:true});
    } catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message}); 
    }
}

//send msg to selected User

export const sendMessage = async (req,res)=>{
    try{
        const { text,image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;
        
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl =  uploadResponse.secure_url;
        }
        const newMsg = await Message.create({
            senderId,receiverId,text,image:imageUrl
        })

        // emit new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMsg", newMsg);
        }
        res.json({success:true,newMsg}); 

    } catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message}); 
    } 
}