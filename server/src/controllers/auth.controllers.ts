import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { Request, Response } from "express";
import {registerSchema, loginSchema} from "./auth.schema.js";
import { checkPassword, hashPassword } from "../lib/hash.js";
import jwt from "jsonwebtoken"
import { sendEmail } from "../lib/nodemailer.js";
import { createAccessToken, createRefreshToken,verifyRefreshToken } from "../lib/token.js";
import crypto from "crypto"


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


async function refreshHandler(req : Request, res : Response) { 
    try {
      const token = req.cookies?.refreshToken as string | undefined
      
      if(!token) { 
        return res.status(401).json({message : `Refresh Token Missing` })
      }

      const payload = verifyRefreshToken(token)

      const user = await User.findById(payload.sub)

      if(!user) { 
        return res.status(401).json({message: 'User not found'})
      }


      if (user.tokenVersion !== payload.tokenVersion) { 
            return res.status(401).json({message: 'Refresh token invalidated'})

      }

      const newAccessToken = createAccessToken(
        user.id, 
        user.role, 
        user.tokenVersion
      )

      const newRefreshToken = createRefreshToken(user.id,user.tokenVersion)

       const isProd = process.env.NODE_ENV === 'production'

        res.cookie("refreshToken", newRefreshToken, { 
            httpOnly : true, 
            secure : isProd, 
            sameSite : 'lax', 
            maxAge : 7*24*60*60*1000
        })

         return res.status(200).json({ 
            message: 'Login Success', 
           accessToken: newAccessToken, 
            user : { 
                id : user.id,
                email : user.email, 
                role : user.role, 
                isEmailVerified : user.isEmailVerified, 
                twoFactorEnabled : user.twoFactorEnabled
            }
        })



    } catch (error) { 
        console.log(error)
         return res.status(500).json({
            message : "Internal Error"
        })
    }
}

async function logoutHandler(req: Request, res : Response) { 
    res.clearCookie("refrestToken", {path: '/'})

    return res.status(200).json({
        message : "User logout"
    })
}

async function forgotPasswordHandler(req:Request, res:Response) { 
    const {email} = req.body as {email?:string}

    if(!email) {
        return res.status(400).json({message:'Email is required'})
    }

    const normalizedEmail = email.toLowerCase().trim()

    try { 
        const user = await User.findOne({email : normalizedEmail})
        
        if(!user) { 
            return res.json({
                message : " If an account with this email exists, we will send you a reset link"
            })
        }

        const rawToken = crypto.randomBytes(32).toString('hex')

        const tokenHash = crypto.createHash('sha256').update(rawToken).toString()
        
        user.resetPassword = tokenHash
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000)
        
        await user.save()
        
        const resetUrl = `${getAppUrl()}/auth/reset-password?token=${rawToken}`
        await sendEmail(
            user.email, 
            "Reset Your Password", 
            `<p>You Requested password reset. Click on the below link to reset the password</p>
            <p> 
                <a href= "${resetUrl}">
                ${resetUrl}
                </a>
            </p>
            `

        )

        return res.json({
            message : "If an account with this email exists we will send you a reset link"
            
        })
    
    } catch(error) { 
         console.log(error)
         return res.status(500).json({
            message : "Internal Error"
        })
    }

}

export {
    registerHandler, 
    loginHandler, 
    verifyEmailHandler,
    refreshHandler,
    logoutHandler,
    forgotPasswordHandler
    
}