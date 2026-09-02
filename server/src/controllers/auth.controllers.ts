import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { Request, Response } from "express";
import {registerSchema, loginSchema} from "./auth.schema.js";
import { checkPassword, hashPassword } from "../lib/hash.js";
import jwt from "jsonwebtoken"
import { sendEmail } from "../lib/nodemailer.js";
import { createAccessToken, createRefreshToken } from "../lib/token.js";



const jwt_Secret = process.env.JWT_ACCESS_SECRET

function getAppUrl() { 
    return process.env.APP_URL
}

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
        
        if (!jwt_Secret) { 
            throw Error('Jwt_Secret not defined in environment variables')
        }

        const verifyToken = jwt.sign({
            sub : newlyCreatedUser.id
        }, 
            jwt_Secret
        , { 
            expiresIn : '1d'
        }
    )


    const verifyUrl = `${getAppUrl}/auth/verify-email?token=${verifyToken}`
        

    await sendEmail(
        newlyCreatedUser.email, 
        "Verify your email",
        `
            <p> please verify your email by clicking this link :</p>
            <p> 
                <a href=${verifyUrl}> 
                ${verifyUrl} 
                </a>
            </p>

        
         `

    )

    return res.status(201).json({
        message : 'user Registered', 
        user : { 
            id: newlyCreatedUser.id, 
            email : newlyCreatedUser.email, 
            role : newlyCreatedUser.role, 
            isEmailVerified : newlyCreatedUser.isEmailVerified
        } 
    })

    } catch(err) { 
        return res.status(500).json({
            message : "Internal Error"
        })

    }
}

async function verifyEmailHandler(req: Request, res:Response) { 
    const token = req.query.token as string | undefined


    if(!token) { 
        return res.status(400).json({message: " Verification token is missing"})

    }

    try { 
        if (!jwt_Secret) { 
            throw Error("jwt Secret not in envoriment Variables")
        }
        
        const payload =jwt.verify(token, jwt_Secret) as {
            sub : string; 
        }

        const user = await User.findById(
            payload.sub
        )

        if(!user) { 
            return res.status(400).json({message : `User not Found`})


        }

        if (user.isEmailVerified) { 
            return res.json({message : 'Email is already verified'})

        }

        user.isEmailVerified = true

        await user.save()

        return res.json({message : 'Email is now verified, Please Login'})



    } catch(err) { 
        return res.status(500).json({
            message : "Internal Error"
        })
    }
}

async function loginHandler(req : Request, res:Response) { 
    try { 

        const result = loginSchema.safeParse(req.body)

        if (!result.success) { 
            return res.status(400).json({
                message : 'Invalid data', 
                errors :result.error.flatten()
            })

        }

        const {email,password} = result.data
        

        const normalizedEmail = email.toLowerCase().trim()
        const user = await User.findOne({email : normalizedEmail})

        if(!user) { 
            return res.status(400).json({
                message : "Invalid email or password"
            })
        }

         

        const ok = await checkPassword(password,user.passwordHash)


        if(!ok) { 
             return res.status(400).json({
                message : "Invalid email or password"
            })
        }

        if(!user.isEmailVerified) { 
            return res.status(403).json({
                message : "Please Verify Email"
            })
        }

        const accessToken = createAccessToken(
            user.id,
            user.role,
            user.tokenVersion)

        const refreshToken = createRefreshToken(
            user.id,
            user.tokenVersion)

        const isProd = process.env.NODE_ENV === 'production'

        res.cookie("refreshToken", refreshToken, { 
            httpOnly : true, 
            secure : isProd, 
            sameSite : 'lax', 
            maxAge : 7*24*60*60*1000
        })

        return res.status(200).json({ 
            message: 'Login Success', 
            accessToken, 
            user : { 
                id : user.id,
                email : user.email, 
                role : user.role, 
                isEmailVerified : user.isEmailVerified, 
                twoFactorEnabled : user.twoFactorEnabled
            }
        })

    } catch(error) { 

        return res.status(500).json({
            message : "Internal Error"
        })
    }
}


export {
    registerHandler, 
    loginHandler, 
    verifyEmailHandler, 
    
}