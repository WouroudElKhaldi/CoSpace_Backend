import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import dotend from "dotenv";
import { generateToken } from "../utils/jwt.js";
dotend.config();

export const google = async (req, res, next) => {
  const { name, email, photo } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      const token = generateToken(user);
      const { password, ...rest } = user.get();
      res.cookie("token", token, { httpOnly: true }).status(200).json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      const newUser = await User.create({
        fullName: name,
        email: email,
        password: hashedPassword,
        image: photo,
        role: "User",
        status: "Verified",
      });

      const token = generateToken(newUser);
      const { password, ...rest } = newUser.get();
      return res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
