import express from 'express';
import { checkAuth, login, signup, updateProfile } from '../controllers/userController.js';
import { protectedRoute } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post("/signup",signup);
userRouter.post("/login",login);
userRouter.put("/update-profile",protectedRoute,updateProfile);
userRouter.get("/update-profile",protectedRoute,checkAuth);

export default userRouter;

