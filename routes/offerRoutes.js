import express from "express";
import {
  addOffer,
  editOffer,
  deleteOffer,
  getAllOffers,
  getOneOffer,
} from "../controllers/offerController.js";

const offerRouter = express.Router();

// Route for adding a new offer
offerRouter.post("/", addOffer);

// Route for editing an offer
offerRouter.patch("/", editOffer);

// Route for deleting an offer
offerRouter.delete("/", deleteOffer);

// Route for getting all offers
offerRouter.get("/", getAllOffers);

// Route for getting one offer by ID
offerRouter.get("/byId", getOneOffer);

export default offerRouter;
