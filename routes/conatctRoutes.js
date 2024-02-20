import express from "express";
import { contact } from "../controllers/contactUs.js";

const contactRouter = express.Router();

// Route for adding a new user
contactRouter.post("/", contact);

export default contactRouter;
