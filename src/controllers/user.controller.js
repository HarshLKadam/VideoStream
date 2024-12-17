import { asyncHandler } from "../utils/asyncHandler.js";
import apiErorr from '../utils/apiError.js'
import { User } from "../models/user.model.js";
import { upload } from "../middlewares/multer.middleware.js";
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
    const { fullName, email, userName, password } = req.body
    console.log('email', email)

    //    if (fullName===""){
    //     throw new apiErorr(400,"fullname is required")
    //    }
    
    //2) 2nd step the validation user data is not empty
    if (

        [fullName, password, email, userName].some((field) =>
            field?.trim() === ''
        )
    ) {
        throw new apiErorr(400, "all fields are required")
    }

    //check if user is already exist
    const existedUser = Us
    er.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new apiErorr(409, 'User with email or username already exist ')
    }

    //upload them to cloudinary
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.file?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new apiErorr(400, 'avtar file is required')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apiErorr(400, 'avatar file is required')
    }

    //create user and create entry in database
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url ||"",
        email,
        password,
        userName:userName.toLowerCase()
    })
    
   const createdUSer=await User.findById(user._id).select(
    "-password -refreshToken"
   )
//check for user creation 
   if(!createdUSer){
    throw new apiErorr(500,"something is wrong while registering the user")
   }

   //return response 
   return res.status(201).json(
    apiResponse(200,createdUSer, "user registerd succesfully ")
   )


})

export {
    registerUser,
}