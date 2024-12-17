import { Schema, model } from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'password is required']

    },
    refreshToken: {
        type: String,

    }
}, {
    timestamps: true
}
)

//here pre is mongoose method used to define a middleware function that runs before the save event occcur in usemodel
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    // if the password is not modified then this will work 
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//i added here the custome method which check password is correct or not done it through the .method
userSchema.methods.isPasswordCorrect = async function (password) {
    //this = refers current context means the current value comming from  function 
    return await bcrypt.compare(password, this.password)
}

//add a custom method name as generateAccessToken
userSchema.methods.generateAccessToken = function () {
    //jwt signs is a function that generates jwt Token 
    //jwt signs have 3 parameter inside it payload = data , secret=secret_key , options 
    return jwt.sign(
       //this is first parameter payload =data
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        //second parameter secret_key
        process.env.ACCESS_TOKEN_SECRET,
        //third parameter options =here i have mentioned the expiray 
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const User = model("User", userSchema)