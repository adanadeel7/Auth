import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : { 
        type : String,
        required : true
    }, 

    email : { 
        type : String, 
        required : true, 
        unique : true,
    }, 

    password : { 
        type : String, 
        required : true, 
    }, 

    verifyOTP : { 
        type : String,
        default: " "
    },

    verifyOtpExpireAt : { 
        type : Number,
        default: 0
    },

    isAccountVerified : { 
        type : Boolean,
        default: false
    },

    resetOtp : { 
        type : String,
        default: " "
    },

    ResetOtpExpireAt : { 
        type : Number,
        default: 0
    },
}, {timestamps : true})