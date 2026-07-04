import mongoose from "mongoose";
import { User } from "../models/User.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import transporter from "../config/nodemailer.js";

async function Register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({
      success: false,
      message: "Missing Details",
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User Already Exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === " production",
      sameSite: process.env.NODE_ENV === " production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SEND_EMAIL,
      to: email,
      subject: "Welcome to my Project",
      text: `Welcome to my Project. Your Account has been created with email id: ${email}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "Registered Successful" });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
}

async function Login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: " Email and Password are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid email",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === " production",
      sameSite: process.env.NODE_ENV === " production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Logged In Successful" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

async function Logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === " production",
      sameSite: process.env.NODE_ENV === " production" ? "none" : "strict",
      maxAge: "7*24*60*60*1000",
    });

    return res.json({
      success: true,
      message: "Logged Out",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

export { Login, Register, Logout };
