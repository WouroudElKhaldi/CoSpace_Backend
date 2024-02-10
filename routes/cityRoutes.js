import express from "express";
import {
  addCity,
  editCity,
  deleteCity,
  getAllCities,
  getOneCity,
} from "../controllers/cityController.js";

const cityRouter = express.Router();

// Route for adding a new city
cityRouter.post("/", addCity);

// Route for editing a city
cityRouter.patch("/", editCity);

// Route for deleting a city
cityRouter.delete("/", deleteCity);

// Route for getting all cities
cityRouter.get("/", getAllCities);

// Route for getting one city by ID
cityRouter.post("/byId", getOneCity);

export default cityRouter;
