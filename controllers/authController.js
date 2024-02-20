import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import fs from "fs";
import { generateToken } from "../utils/jwt.js";
import { verifycationCodeMailer } from "../utils/mail.js";

export const logIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "all fields are required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    if (user && user.status === "Pending") {
      return res.status(400).json({ message: "User not verified yet" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = generateToken(user);

    // Set token in HTTP-only cookie
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .status(200)
      .json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const generateRandomString = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  let result = "";
  for (let i = 0; i < 8; i++) {
    result +=
      Math.random() < 0.5
        ? letters.charAt(Math.floor(Math.random() * letters.length))
        : numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return result;
};

// Controller for adding a new user ( and admin is adding another admin)
export const SignUp = async (req, res) => {
  const { fullName, email, password, role, phoneNumber } = req.body;

  try {
    if (!fullName || !email || !password || !phoneNumber || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const verificationCode = generateRandomString();
    const deleteCode = generateRandomString();
    const newUser = await User.create({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      role: role,
      phoneNumber: phoneNumber,
      status: "Pending",
      verificationCode: verificationCode,
      deleteCode: deleteCode,
    });

    const emailSent = await verifycationCodeMailer(newUser);

    return res.status(200).json({
      message: "User created, pending , verify your account via email",
      user: newUser,
      email: emailSent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

export const verifyAccount = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "all fields are required" });
  }
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid email" });
  }

  if (code === user.verificationCode) {
    const newUser = await User.findByIdAndUpdate(
      user._id,
      {
        status: "Verified",
      },
      { new: true }
    );

    if (!newUser) {
      return res
        .status(400)
        .json({ error: "An error occured , user not updated" });
    }

    const token = generateToken(user);

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .json({ message: "User updated successfuly" });
  }
  if (code === user.deleteCode) {
    const deletedUser = await User.findByIdAndDelete(user._id);

    if (!deletedUser) {
      return res
        .status(400)
        .json({ error: "An error occured , user not deleted" });
    }

    return res.status(200).json({ message: "User deleted successfuly" });
  }
};

export const loggedInUser = (req, res) => {
  return res.json({ user: req.user }).status(200);
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
