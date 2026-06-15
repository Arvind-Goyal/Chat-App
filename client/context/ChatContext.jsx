import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({children})=>{
    
    const [messages,setMessages] = useState([]);
    const[users,setUsers] = useState([]);
    const[selectedUser,setSelectedUser] = useState(null);
    const[unseenMessages,setUnseenMessages] = useState({});

    const {socket,axios} = useContext(AuthContext);

    //function to get all users
    const getUsers = async()=>{
        try{
            const {data} = await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users);
                setUnseenMessages(data.unseenMessage);
            }

        }catch(error){
            toast.error(error.message);
        }
    }

    //function to get messge for selected user

    const getMessages = async(userId)=>{
        try{
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.msg);
            }
        }catch(error){
            toast.error(error.message);
        }
    }
    
    //function to send msg

    const sendMessage = async(messageData)=>{
        try{
            const{data} = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages,data.newMsg]
                )
            }else{
                toast.error(data.message);
            }
        }catch(error){
            toast.error(error.message);
        }
    }
    //function to get realtime message technically called to subscribe 

    const subscribeToMessage = async ()=>{
        if(!socket) return ;
        socket.on("newMsg",(newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages)=>[...prevMessages,newMessage]
                );
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else {
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,[newMessage.senderId]: prevUnseenMessages[newMessage.senderId]?prevUnseenMessages[newMessage.senderId]+1 :1
                }))
            }
        })
    }

    // unsubscribe message 
    const unsubscribeFromMessage = ()=>{
        if(socket) socket.off("newMsg");
    }

    useEffect(()=>{
        subscribeToMessage();
        return ()=> unsubscribeFromMessage();
    },[socket,selectedUser])

    const value={
        messages,users,selectedUser,getUsers,setMessages,
        sendMessage,setSelectedUser,unseenMessages,setUnseenMessages,getMessages,
    }
    
    return (
    <ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>
    )
}