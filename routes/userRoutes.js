import express from "express";
import {
  addUser,
  editUser,
  deleteUser,
  getAllUsers,
  getOneUser,
} from "../controllers/userController.js";
import {
  logIn,
  SignUp,
  loggedInUser,
  logOut,
  verifyAccount,
  recoverPassword,
  resetPassword,
} from "../controllers/authController.js";
import upload from "../middlewares/multer.js";
import { authenticate } from "../middlewares/auth.js";

const userRouter = express.Router();

// Route for adding a new user
userRouter.post("/", addUser);

// Route for editing a user
userRouter.patch("/", editUser);

// Route for deleting a user
userRouter.delete("/", deleteUser);

// Route for getting all users
userRouter.get("/", getAllUsers);

// Route for getting one user by ID
userRouter.post("/byId", getOneUser);

// Route for user login
userRouter.post("/login", logIn);

// Route for user signup
userRouter.post("/signup", SignUp);

// Route for getting logged in user details
userRouter.get("/logged-in-user", authenticate, loggedInUser);

// Route for user logout
userRouter.post("/logout", logOut);

// Route for user verification
userRouter.post("/verify", verifyAccount);

// Route for recovering password by email
userRouter.post("/recover", recoverPassword);

// Route for reseting password
userRouter.post("/reset", resetPassword);

export default userRouter;
