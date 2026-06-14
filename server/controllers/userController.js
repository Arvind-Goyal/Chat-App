import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js" ;
import bcrypt from 'bcryptjs' ;

//Sign Up 

 export const signup = async (req,res)=>{
    const { fullName,email,password,bio} = req.body;
    try {
        if(!fullName || !email || !password || !bio){
            return res.json({success: false,message :"Missing Detail"})
        }
    const user = await User.findOne({email});
    if(user){
        return res.json({success: false , message : "User Already exist ..."});
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const newUser = await User.create({
        fullName,email ,password:hashedPassword , bio
    });
    const token =  generateToken(newUser._id);
    res.json({success: true, userData:newUser,token ,message:"Account created successfully "});
    } catch(error) {
        console.log(error.message);
        res.json({success: false , message:error.message});
    }

 }

 // Login 

 export const login = async (req,res)=>{
    try {
        const {email,password} = req.body;
        const userData = await User.findOne({email});

        const isPass = await bcrypt.compare(password,userData.password);
        if(!isPass) {
            return res.json({sucess:false , message:"Invalid Credential"});
        }
        const token = generateToken(userData._id);
        res.json({success:true,userData,token,message:"Login successfull"});
    } catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message});

    }
 }

 //  user is AUntheticated

 export const checkAuth = (req,res)=>{
    res.json({success: true,user: req.user});
 }

 // update profile

 export const updateProfile = async (req,res)=>{
     try{
        const {profilePic,bio,fullName} = req.body; 
        const userId = req.user._id;
        // console.log(req.user);
        // console.log(req.user._id);

        let updatedUser;
        if(!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId,{bio,fullName}, {new:true});
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId,{profilePic: upload.secure_url , bio,fullName},{new:true});
        }
        res.json({success:true,user:updatedUser});

    } catch(error){
        console.log(error.message);
        console.log("hii");
        
        res.json({success:false,message:error.message});
    }
 }

// export const updateProfile = async (req,res)=>{
//     try {

//         const upload = await cloudinary.uploader.upload(
//           "https://res.cloudinary.com/demo/image/upload/sample.jpg"
//         );

//         console.log("SUCCESS");
//         console.log(JSON.stringify(upload, null, 2));

//         res.json({success:true});

//     } catch(error) {

//         console.log("ERROR");
//         console.log(error);
//         console.log(error.message);
//         console.log(JSON.stringify(error, null, 2));

//         res.json({
//             success:false,
//             message:error.message
//         });
//     }
// }

