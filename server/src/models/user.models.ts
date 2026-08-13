import mongoose from "mongoose";
import { boolean } from "zod";
import { required } from "zod/mini";

const userSchema = new mongoose.Schema({
    name : { 
        type: String, 
        required: true
    }, 

    email : { 
        type : String, 
        required : true
    }, 

    passwordHash: { 
        type : String, 
        required : true, 
    }, 

    role : { 
        type : String,
        enum : ['user', 'admin']
    }, 

    isEmailVerified : { 
        type : Boolean, 
        default : false
    }, 

    twoFactorEnabled :  {
        type : Boolean, 
        default : false
    }, 

    twoFactorSecret: { 
        type : String, 
        default: undefined
    }, 

    tokenVersion :  {
        type : Number, 
        default : 0
    }, 

    resetPassword : { 
        type : String, 
        default : undefined
    }, 
     
    resetPasswordExpires : { 
        type : Date, 
        default : undefined
    }, 




}, { 
    timestamps : true, 
})


export const User = mongoose.model("User",userSchema)