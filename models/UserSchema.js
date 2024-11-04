import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true,
        minLength:[3,"Name must contain at least 3 character!"],
        maxLength:[30,"Name cannot exceed 30 character!"],
    },
    Email:{
        type:String,
        required:true,
        validate:[validator.isEmail,"Please provide a valid email!"],
    },
    Mobile_Number:{
        type:Number,
        required:true,
    },
    Avatar:{
        public_id:{
            type: String,
            required: true,
        },
        url:{
            type: String,
            required: true,
        },
    },
    Education:{
        type:String,
        required:true,
    },
    Role:{
        type: String,
        required: true,
        enum: ["Reader","Author"]
    },
    Password:{
        type:String,
        required:true,
        minLength:[8,"Password must contain at least 8 character!"],
        maxLength:[30,"Password cannot exceed 30 character!"],
    },
    CreatedOn:{
        type:Date,
        default: Date.now,
    },
});

UserSchema.pre("save", async function () {
    if(!this.isModified("Password")){
        next();
    }
    this.Password = await bcrypt.hash(this.Password,10);
});

UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.Password);
};

UserSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_Secret_Key, {
         expiresIn: process.env.JWT_EXPIRES || "7d",
    });
};

export const User=mongoose.model("User",UserSchema);