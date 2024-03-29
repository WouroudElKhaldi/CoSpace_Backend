import User from "../models/userModel.js";
import Space from "../models/spaceModel.js";
import Room from "../models/serviceModel.js";
import bcrypt from "bcrypt";
import fs from "fs";
import mongoose from "mongoose";

// Controller for adding a new user ()
export const addUser = async (req, res) => {
  const { role, fullName, email, password, phoneNumber } = req.body;

  try {
    if (!fullName || !email || !password || !phoneNumber || !role) {
      if (req.file) {
        const imagePath = `public/images/${req.file.filename}`;
        fs.unlinkSync(imagePath);
      }
      return res.status(400).json("All fields are required");
    }

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      if (req.file) {
        const imagePath = `public/images/${req.file.filename}`;
        fs.unlinkSync(imagePath);
      }
      return res.status(400).json("Email already exists");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if (req.file) {
      var image = req.file.filename;
    }

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role,
      image,
      phoneNumber,
    });

    if (!newUser) {
      if (req.file) {
        const imagePath = `public/images/${req.file.filename}`;
        fs.unlinkSync(imagePath);
      }
    }

    return res.status(200).json(newUser);
  } catch (error) {
    if (req.file) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
    }
    console.error(error);
    return res.status(500).json({ err: "Internal Server Error", msg: error });
  }
};

// Controller for editing a user
export const editUser = async (req, res) => {
  const id = req.body.id;
  const {
    fullName,
    email,
    password,
    checkPassword,
    role,
    phoneNumber,
    status,
    admin,
  } = req.body;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json("Invalid user ID");
    }

    const existingUser = await User.findById(id);

    if (!admin && password) {
      const arePasswordSame = await bcrypt.compare(
        checkPassword,
        existingUser.password
      );

      if (!admin && !arePasswordSame) {
        return res.status(401).json("Invalid password");
      }
    }

    if (!existingUser) {
      return res.status(404).json("User not found");
    }

    let updatedImage = existingUser.image;
    if (req.file) {
      if (existingUser.image) {
        const imagePath = `public/images/${updatedImage}`;
        fs.unlinkSync(imagePath);
      }

      updatedImage = req.file?.filename;
    }

    let updatedUserData = {};
    if (password) {
      updatedUserData = {
        fullName: fullName || existingUser.fullName,
        email: email || existingUser.email,
        password: await bcrypt.hash(password, 10),
        role: role || existingUser.role,
        image: updatedImage,
        phoneNumber: phoneNumber || existingUser.phoneNumber,
        status: status || existingUser.status,
      };
    } else {
      updatedUserData = {
        fullName: fullName || existingUser.fullName,
        email: email || existingUser.email,
        role: role || existingUser.role,
        image: updatedImage,
        phoneNumber: phoneNumber || existingUser.phoneNumber,
        status: status || existingUser.status,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, {
      new: true,
    });

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    if (req.file) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
    }
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for deleting a user
export const deleteUser = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await User.findOne({ _id: id });

    if (user.image) {
      const imagePath = `public/images/${user.image}`;
      fs.unlinkSync(imagePath);
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find and delete all spaces with the same email as the deleted user
    const spacesToDelete = await Space.find({ email: user.email });
    for (const space of spacesToDelete) {
      // Find all rooms associated with the space
      const roomsToDelete = await Room.find({ spaceId: space._id });
      for (const room of roomsToDelete) {
        await Room.findByIdAndDelete(room._id);
      }

      // Delete the space after deleting all associated rooms
      await Space.findByIdAndDelete(space._id);
    }

    return res.status(200).json({
      message: "User deleted successfully with all his Spaces and rooms",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for getting all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting one user by ID
export const getOneUser = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};
