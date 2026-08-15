import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { Request, Response } from "express";
import registerSchema from "./auth.schema.js";
import { hashPassword } from "../lib/hash.js";


async function registerHandler(req :Request, res:Response) { 
    try { 
        const result = registerSchema.safeParse(req.body)

        if (!result.success) { 
            return res.status(400).json({
                message : 'Invalid data', 
                errors :result.error.flatten()
            })

        }

        const {name,email,password} = result.data

        const normalizedEmail = email.toLowerCase().trim()
        
        const existingUser = await User.findOne({email : normalizedEmail})
        
        if (existingUser) {
            return res.status(400).json({
                message : " User already exists"
            })
        }
        
        const passwordhash = await hashPassword(password)

        const newlyCreatedUser = await User.create({
            name : name, 
            email: normalizedEmail, 
            role : 'user', 
            isEmailVerified : false, 
            twoFactorEnabled : false, 
        })


        // email verification 
        
    } catch(err) { 

    }
}