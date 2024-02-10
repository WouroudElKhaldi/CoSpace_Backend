import express from "express";
import {
  addRule,
  editRule,
  deleteRule,
  getAllRules,
  getOneRule,
} from "../controllers/rulesController.js";
import upload from "../middlewares/multer.js";

const ruleRouter = express.Router();

// Route for adding a new rule
ruleRouter.post("/", upload.single("image"), addRule);

// Route for editing a rule
ruleRouter.patch("/", upload.single("image"), editRule);

// Route for deleting a rule
ruleRouter.delete("/", deleteRule);

// Route for getting all rules
ruleRouter.get("/", getAllRules);

// Route for getting one rule by ID
ruleRouter.post("/byId", getOneRule);

export default ruleRouter;
