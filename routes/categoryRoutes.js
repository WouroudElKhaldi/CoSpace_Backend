import express from "express";
import upload from "../middlewares/multer.js";
import {
  addCategory,
  editCategory,
  deleteCategory,
  getAllCategories,
  getOneCategory,
} from "../controllers/categoryController.js";

const categoryRouter = express.Router();

// Route for adding a new category
categoryRouter.post("/", upload.single("image"), addCategory);

// Route for editing a category
categoryRouter.patch("/", upload.single("image"), editCategory);

// Route for deleting a category
categoryRouter.delete("/", deleteCategory);

// Route for getting all categories
categoryRouter.get("/", getAllCategories);

// Route for getting one category by ID
categoryRouter.post("/byId", getOneCategory);

export default categoryRouter;
