import Service from "../models/serviceModel.js";
import User from "../models/userModel.js";
import Space from "../models/spaceModel.js";
import Rating from "../models/ratingModel.js";
import mongoose from "mongoose";
import City from "../models/cityModel.js";
import SpaceImages from "../models/spaceImagesModel.js";
import Rule from "../models/rulesModel.js";

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
      status,
      admin,
    } = req.body;

    // Check if all required fields are provided
    if (
      !name ||
      !cityId ||
      !address ||
      !longitude ||
      !latitude ||
      !description ||
      !categoryId ||
      !email
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
      status: admin === true ? status : "Pending",
      name: name,
      cityId: cityId,
      address: address,
      longitude: longitude,
      latitude: latitude,
      description: description,
      categoryId: categoryId,
      userId: user._id,
    });

    if (!newSpace) {
      return res.status(404).json("Space Not Added");
    }

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

    // Find all events associated with the space
    const eventsToDelete = await Event.find({ spaceId: id });

    // Delete all events associated with the space
    for (const event of eventsToDelete) {
      await Event.findByIdAndDelete(event._id);
    }

    // Find all rules associated with the space
    const rulesToDelete = await Rule.find({ spaceId: id });

    // Delete all rules associated with the space
    for (const rule of rulesToDelete) {
      await Rule.findByIdAndDelete(rule._id);
    }

    // Find all space images associated with the space
    const spaceImagesToDelete = await SpaceImages.find({ spaceId: id });

    // Delete all space images associated with the space
    for (const spaceImage of spaceImagesToDelete) {
      await SpaceImages.findByIdAndDelete(spaceImage._id);
    }

    // Find all ratings associated with the space
    const ratingsToDelete = await Rating.find({ spaceId: id });

    // Delete all ratings associated with the space
    for (const rating of ratingsToDelete) {
      await Rating.findByIdAndDelete(rating._id);
    }

    // Delete the space itself
    const deletedSpace = await Space.findByIdAndDelete(id);

    if (!deletedSpace) {
      return res.status(404).json({ error: "Space not found" });
    }

    return res.status(200).json({
      message:
        "Space and associated services, events, rules, and space images deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// // Controller for getting all spaces
// export const getAllSpaces = async (req, res) => {
//   try {
//     const { status } = req.body;
//     if (!status) {
//       const spaces = await Space.find()
//         .sort({
//           createdAt: -1,
//         })
//         .populate("categoryId cityId userId");
//       for (let space of spaces) {
//         const spaceImages = await SpaceImages.find({ spaceId: space._id });
//         space.images = spaceImages;
//       }
//       return res.status(200).json(spaces);
//     } else {
//       const spaces = await Space.find({ status: status })
//         .sort({
//           createdAt: -1,
//         })
//         .populate("categoryId cityId userId");

//       for (let space of spaces) {
//         const spaceImages = await SpaceImages.find({ spaceId: space._id });
//         space.images = spaceImages;
//       }
//       return res.status(200).json(spaces);
//     }
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ error: "Internal Server Error", msg: error.message });
//   }
// };

// Controller for getting all spaces
// export const getAllSpaces = async (req, res) => {
//   try {
//     const { status } = req.body;
//     let spacesQuery = Space.find()
//       .sort({ createdAt: -1 })
//       .populate("categoryId cityId userId");

//     if (status) {
//       spacesQuery = spacesQuery.find({ status: status });
//     }

//     const spaces = await spacesQuery.exec();

//     // Fetch and attach images for each space
//     for (let space of spaces) {
//       const spaceImages = await SpaceImages.find({ spaceId: space._id });
//       space.imagesArray = spaceImages.map((image) => image.image);
//       console.log(spaceImages);
//     }

//     return res.json(spaces);
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ error: "Internal Server Error", msg: error.message });
//   }
// };
export const getAllSpaces = async (req, res) => {
  try {
    const { status } = req.body;

    let pipeline = [
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "spaceimages",
          localField: "_id",
          foreignField: "spaceId",
          as: "images",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "cities",
          localField: "cityId",
          foreignField: "_id",
          as: "city",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "spaceId",
          as: "ratings",
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "spaceId",
          as: "services",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $unwind: "$city",
      },
      {
        $unwind: "$user",
      },
      {
        $addFields: {
          averageRating: { $avg: "$ratings.rate" },
        },
      },
      {
        $unwind: "$services",
      },
      {
        $group: {
          _id: "$_id",
          data: { $first: "$$ROOT" },
          dailyPrice: { $min: "$services.dailyPrice" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$data", { dailyPrice: "$dailyPrice" }],
          },
        },
      },
    ];

    if (status) {
      pipeline.unshift({ $match: { status: status } });
    }

    let spaces = await Space.aggregate(pipeline);

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

    let pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "spaceimages",
          localField: "_id",
          foreignField: "spaceId",
          as: "images",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "amenities",
          let: { amenityIds: "$amenities" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$amenityIds"] },
              },
            },
          ],
          as: "amenities",
        },
      },
      {
        $lookup: {
          from: "cities",
          localField: "cityId",
          foreignField: "_id",
          as: "city",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "spaceId",
          as: "ratings",
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "spaceId",
          as: "services",
        },
      },
      {
        $lookup: {
          from: "rules",
          localField: "_id",
          foreignField: "spaceId",
          as: "rules",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $unwind: "$city",
      },
      {
        $unwind: "$user",
      },
      {
        $addFields: {
          averageRating: { $avg: "$ratings.rate" },
        },
      },
      {
        $addFields: {
          allServices: "$services",
        },
      },
      {
        $unwind: "$services",
      },
      {
        $group: {
          _id: "$_id",
          data: { $first: "$$ROOT" },
          dailyPrice: { $min: "$services.dailyPrice" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$data", { dailyPrice: "$dailyPrice" }],
          },
        },
      },
    ];

    const space = await Space.aggregate(pipeline);

    if (!space.length) {
      return res.status(404).json({ error: "Space not found" });
    }

    return res.status(200).json(space[0]);
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
      return res.status(400).json("Invalid user ID");
    }

    const spaces = await Space.find({ userId: userId }).sort({ createdAt: -1 });

    if (!spaces || spaces.length === 0) {
      return res.status(404).json("No spaces found for this user");
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

// // Controller function to search for a space by name or city
// export const searchSpace = async (req, res) => {
//   try {
//     const { data } = req.body;

//     const regexData = new RegExp(data, "i");

//     const city = await City.findOne({
//       city: { $regex: regexData },
//     });

//     const spacesByCity = city ? await Space.find({ cityId: city._id }) : [];

//     // Find spaces by name
//     const spacesByName = await Space.find({
//       name: { $regex: regexData },
//       status: "Accepted",
//     });

//     // Combine the results
//     const spaces = [...spacesByCity, ...spacesByName];

//     return res.status(200).json(spaces);
//   } catch (error) {
//     console.error("Error searching for space:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// Controller function to search for a space by name or city
export const searchSpace = async (req, res) => {
  try {
    const { data } = req.body;

    const regexData = new RegExp(data, "i");

    const city = await City.findOne({
      city: { $regex: regexData },
    });

    const spacesByCity = city ? await Space.find({ cityId: city._id }) : [];

    // Find spaces by name
    const spacesByName = await Space.find({
      name: { $regex: regexData },
      status: "Accepted",
    });

    // Combine the results
    let spaces = [...spacesByCity, ...spacesByName];

    // Aggregation pipeline to populate necessary fields and calculate minimum daily price
    const pipeline = [
      {
        $match: {
          _id: { $in: spaces.map((space) => space._id) },
          status: "Accepted",
        },
      },
      {
        $lookup: {
          from: "spaceimages",
          localField: "_id",
          foreignField: "spaceId",
          as: "images",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "cities",
          localField: "cityId",
          foreignField: "_id",
          as: "city",
        },
      },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "spaceId",
          as: "ratings",
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "spaceId",
          as: "services",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $unwind: "$city",
      },
      {
        $addFields: {
          averageRating: { $avg: "$ratings.rate" },
        },
      },
      {
        $unwind: "$services",
      },
      {
        $group: {
          _id: "$_id",
          data: { $first: "$$ROOT" },
          dailyPrice: { $min: "$services.dailyPrice" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$data", { dailyPrice: "$dailyPrice" }],
          },
        },
      },
    ];

    // Execute the aggregation pipeline
    spaces = await Space.aggregate(pipeline);

    return res.status(200).json(spaces);
  } catch (error) {
    console.error("Error searching for space:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSpacesByCity = async (req, res) => {
  const cityName = req.body.cityName;

  try {
    const spaces = await Space.find({
      "cityId.city": cityName,
    });

    res.status(200).json(spaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller for filtering spaces
export const filterSpaces = async (req, res) => {
  try {
    const { minPrice, maxPrice, amenities, categories } = req.body;

    let exactMinPrice = 0;
    let exactMaxPrice = 10000000000000;

    if (minPrice && minPrice > 0 && maxPrice && maxPrice > 0) {
      exactMinPrice = minPrice;
      exactMaxPrice = maxPrice;
    }

    // Query services collection to find services within price range
    const services = await Service.find({
      dailyPrice: { $gte: exactMinPrice, $lte: exactMaxPrice },
    });

    // Extract space IDs from the found services
    const spaceIds = services.map((service) => service.spaceId);

    // Aggregation pipeline to filter spaces and populate necessary fields
    const pipeline = [
      {
        $match: {
          _id: { $in: spaceIds },
          status: "Accepted",
        },
      },
      {
        $lookup: {
          from: "spaceimages",
          localField: "_id",
          foreignField: "spaceId",
          as: "images",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $lookup: {
          from: "cities",
          localField: "cityId",
          foreignField: "_id",
          as: "city",
        },
      },
      {
        $unwind: "$city",
      },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "spaceId",
          as: "ratings",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$ratings.rate" },
        },
      },
      {
        $project: {
          "ratings.spaceId": 0,
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "spaceId",
          as: "services",
        },
      },
      {
        $addFields: {
          allServices: "$services",
        },
      },
      {
        $unwind: "$services",
      },
      {
        $group: {
          _id: "$_id",
          data: { $first: "$$ROOT" },
          dailyPrice: { $min: "$services.dailyPrice" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$data", { dailyPrice: "$dailyPrice" }],
          },
        },
      },
    ];

    // Execute the aggregation pipeline
    let spaces = await Space.aggregate(pipeline);

    // Filter spaces by categoryIds
    if (categories && categories.length > 0) {
      spaces = spaces.filter((space) =>
        categories.includes(String(space.category._id))
      );
    }

    // Filter spaces by amenities
    if (amenities && amenities.length > 0) {
      spaces = spaces.filter((space) =>
        space.amenities.some((amenity) =>
          amenities.includes(String(amenity._id))
        )
      );
    }

    return res.status(200).json(spaces);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};
