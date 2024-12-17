import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from '../utils/apiError.js'
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend 
    //validation -not empty
    //check if user already exist :userName, email
    //check for images, check for avtar 
    // upload them to clodinary
    //create user object -create entry in db 
    //remove password and refresh token field from response
    //return response
    

    //1) here we get the user details from front-end
    const { fullName, email, userName, password} = req.body
    console.log('email', email)
    console.log(userName)
    console.log(fullName)

    //    if (fullName===""){
    //     throw new apiError(400,"fullname is required")
    //    }
    
    //2) 2nd step the validation user data is not empty
    if (
        [fullName, password, email, userName].some((field) =>
            field?.trim() === ''
        )
    ) {
        throw new apiError(400, "all fields are required")
    }

    //check if user is already exist
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new apiError(409, 'User with email or username already exist ')
    }

   //check for avatar and coverImage is exists
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
console.log(avatarLocalPath)
    if (!avatarLocalPath) {
        throw new apiError(400, 'avatar file is required')
    }

     //upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apiError(400, 'avatar file is required')
    }

    console.log(fullName)
    console.log(userName)
    //create user and create entry in database
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url ||"",
        email,
        password,
        userName:userName.toLowerCase()
    })

  
    
   const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
   )
//check for user creation 
   if(!createdUser){
    throw new apiError(500,"something is wrong while registering the user")
   }

   //return response 
   return res.status(201).json(
     new apiResponse(200,createdUser, "user registerd succesfully ")
   )


})

export {
    registerUser,
}