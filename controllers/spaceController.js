import Service from "../models/serviceModel.js";
import User from "../models/userModel.js";
import Space from "../models/spaceModel.js";
import Rating from "../models/ratingModel.js";
import mongoose from "mongoose";
import City from "../models/cityModel.js";

export const addSpace = async (req, res) => {
  try {
    const {
      name,
      cityId,
      address,
      longitude,
      latitude,
      description,
      categoryId,
      email,
    } = req.body;

    // Check if all required fields are provided
    if (
      !name ||
      !cityId ||
      !address ||
      !longitude ||
      !latitude ||
      !description ||
      !categoryId
    ) {
      return res.status(400).json("All fields are required");
    }

    // Check if user with provided email exists
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json("User not found");
    }

    // Create space with appropriate status based on user role
    const newSpace = await Space.create({
      status: "Pending",
      name: name,
      cityId: cityId,
      address: address,
      longitude: longitude,
      latitude: latitude,
      description: description,
      categoryId: categoryId,
      userId: user._id,
    });

    return res.status(200).json(newSpace);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for accepting, canceling, or rejecting a space
export const SpaceStatus = async (req, res) => {
  const { status, id } = req.body;
  try {
    if (!["Pending", "Accepted", "Canceled"].includes(status)) {
      return res.status(401).json({
        error: "Invalid status, status options are Pending, Accepted, Canceled",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    const updatedSpace = await Space.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!updatedSpace) {
      return res.status(404).json("Space not found");
    }

    let updatedUser;

    if (status === "Accepted") {
      updatedUser = await User.findByIdAndUpdate(
        updatedSpace.userId,
        { role: "Manager" },
        { new: true }
      );

      return res.status(200).json({
        status: "Accepted",
        user: updatedUser,
        space: updatedSpace,
      });
    }

    if (status === "Canceled") {
      updatedUser = await User.findByIdAndUpdate(
        updatedSpace.userId,
        { role: "User" },
        { new: true }
      );

      return res
        .status(200)
        .json({ status: "Canceled", user: updatedUser, space: updatedSpace });
    }

    if (status === "Pending") {
      updatedUser = await User.findByIdAndUpdate(
        updatedSpace.userId,
        { role: "User" },
        { new: true }
      );

      return res
        .status(200)
        .json({ status: "Pending", user: updatedUser, space: updatedSpace });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for editing a space
export const editSpace = async (req, res) => {
  try {
    const id = req.body.id;
    const { name, cityId, address, mapAddress, description } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    const updatedSpace = await Space.findByIdAndUpdate(
      id,
      {
        name,
        cityId,
        address,
        mapAddress,
        description,
      },
      { new: true }
    );

    if (!updatedSpace) {
      return res.status(404).json({ error: "Space not found" });
    }

    return res.status(200).json(updatedSpace);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for deleting a space
export const deleteSpace = async (req, res) => {
  try {
    const { id } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    // Find the space to be deleted
    const spaceToDelete = await Space.findById(id);
    if (!spaceToDelete) {
      return res.status(404).json({ error: "Space not found" });
    }

    // Find all services associated with the space
    const servicesToDelete = await Service.find({ spaceId: id });

    // Delete all services associated with the space
    for (const service of servicesToDelete) {
      await Service.findByIdAndDelete(service._id);
    }

    // Delete the space itself
    const deletedSpace = await Space.findByIdAndDelete(id);

    if (!deletedSpace) {
      return res.status(404).json({ error: "Space not found" });
    }

    return res
      .status(200)
      .json({ message: "Space and associated services deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all spaces
export const getAllSpaces = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      const spaces = await Space.find()
        .sort({
          createdAt: -1,
        })
        .populate("categoryId cityId userId");
      return res.json(spaces);
    }
    const spaces = await Space.find({ status: status })
      .sort({
        createdAt: -1,
      })
      .populate("categoryId cityId userId");

    console.log(spaces);
    return res.json(spaces);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting one space by ID
export const getOneSpace = async (req, res) => {
  try {
    const { id } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    const space = await Space.findById(id)
      .populate("cityId")
      .populate("categoryId")
      .populate("userId")
      .populate("amenities");

    if (!space) {
      return res.status(404).json({ error: "Space not found" });
    }

    return res.status(200).json(space);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for adding amenities to a space
export const addAmenitiesToSpace = async (req, res) => {
  try {
    const { spaceId, amenities } = req.body;

    if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    const updatedSpace = await Space.findByIdAndUpdate(
      spaceId,
      { $addToSet: { amenities: { $each: amenities } } },
      { new: true }
    );

    if (!updatedSpace) {
      return res.status(404).json({ error: "Space not found" });
    }

    return res.status(200).json(updatedSpace);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for deleting amenities from a space
export const deleteAmenitiesFromSpace = async (req, res) => {
  try {
    const { spaceId, amenities } = req.body;

    if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).json({ error: "Invalid space ID" });
    }

    const updatedSpace = await Space.findByIdAndUpdate(
      spaceId,
      { $pull: { amenities: { $in: amenities } } },
      { new: true }
    );

    if (!updatedSpace) {
      return res.status(404).json({ error: "Space not found" });
    }

    return res.status(200).json(updatedSpace);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Controller for getting all spaces by userId
export const getSpacesByUserId = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const spaces = await Space.find({ userId: userId }).sort({ createdAt: -1 });

    if (!spaces || spaces.length === 0) {
      return res.status(404).json({ error: "No spaces found for this user" });
    }

    return res.status(200).json(spaces);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

export const getTopRatedSpaces = async (req, res) => {
  try {
    const ratings = await Rating.aggregate([
      {
        $group: {
          _id: "$spaceId",
          totalRating: { $sum: "$rate" },
          count: { $sum: 1 },
          ratings: { $push: "$$ROOT" },
        },
      },
      {
        $sort: { totalRating: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    const topSpaces = [];

    for (let i = 0; i < ratings.length; i++) {
      const space = await Space.findById(ratings[i]._id);
      topSpaces.push({
        space: space,
        totalRating: ratings[i].totalRating,
        count: ratings[i].count,
      });
    }

    res.status(200).json(topSpaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to search for a space by name or city
export const searchSpace = async (req, res) => {
  try {
    const { name, cityName } = req.body;

    // Define regex pattern for case-insensitive search
    const regexName = new RegExp(name, "i");
    const regexCityName = new RegExp(cityName, "i");

    // If name is provided in the request body, search by name
    if (name) {
      const spacesByName = await Space.find({ name: { $regex: regexName } });
      return res.status(200).json(spacesByName);
    }

    // If cityName is provided in the request body, search by city name
    if (cityName) {
      // Find the city by its name
      const city = await City.findOne({ city: { $regex: regexCityName } });
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }

      // Find spaces in the found city
      const spacesByCity = await Space.find({ cityId: city._id });
      return res.status(200).json(spacesByCity);
    }

    // If neither name nor cityName is provided in the request body
    return res.status(400).json({
      message: "Please provide either name or cityName in the request body",
    });
  } catch (error) {
    console.error("Error searching for space:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const filterSpaces = async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      amenities,
      categories,
      minRating,
      maxRating,
      city,
    } = req.body;

    const aggregationPipeline = [];

    if (minPrice !== undefined && maxPrice !== undefined) {
      var priceMatchStage = {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "spaceId",
          as: "services",
        },
      };

      aggregationPipeline.push({
        $match: {
          "services.dailyPrice": {
            $gte: parseFloat(minPrice),
            $lte: parseFloat(maxPrice),
          },
        },
      });
    }

    if (amenities && amenities.length > 0) {
      var amenitiesCondition = {
        $match: {
          amenities: {
            $in: amenities.map(
              (amenity) => new mongoose.Types.ObjectId(amenity)
            ),
          },
        },
      };
      aggregationPipeline.push(amenitiesCondition);
    }

    if (categories && categories.length > 0) {
      var categoryCondition = {
        $match: {
          categoryId: {
            $in: categories.map(
              (category) => new mongoose.Types.ObjectId(category)
            ),
          },
        },
      };
      aggregationPipeline.push(categoryCondition);
    }

    if (minRating !== undefined && maxRating !== undefined) {
      aggregationPipeline.push({
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "spaceId",
          as: "ratings",
        },
      });
      aggregationPipeline.push({
        $unwind: "$ratings",
      });
      aggregationPipeline.push({
        $match: {
          "ratings.rate": {
            $gte: parseFloat(minRating),
            $lte: parseFloat(maxRating),
          },
        },
      });
    }

    if (city) {
      aggregationPipeline.push({
        $match: {
          cityId: new mongoose.Types.ObjectId(city),
        },
      });
    }

    aggregationPipeline.push({
      $group: {
        _id: "$services.spaceId",
        space: {
          $first: "$$ROOT",
        },
      },
    });

    const filteredSpaces = await Space.aggregate(aggregationPipeline);

    return res.json(filteredSpaces);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};
