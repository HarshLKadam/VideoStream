import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from '../utils/apiError.js'
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        //saving  refresh token in database
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {
            accessToken,
            refreshToken
        }
    }
    catch (error) {
        throw new apiError(500, "something went wrong while generating refresh and access token")
    }
}

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

    console.log(req.files)

    //check for avatar and coverImage is exists
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //     const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log(avatarLocalPath)

    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new apiError(400, 'avatar file is required')
    }

    console.log(avatarLocalPath)
    console.log("cover image", coverImageLocalPath)

    //upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apiError(400, 'avatar file is required')
    }

    console.log(fullName)
    console.log(userName)
    //create user and create entry in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })



    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    //check for user creation 
    if (!createdUser) {
        throw new apiError(500, "something is wrong while registering the user")
    }

    //return response 
    return res.status(201).json(
        new apiResponse(200, createdUser, "user registerd succesfully ")
    )


})

const loginUser = asyncHandler(async (req, res) => {
    //get data by req.body 
    //check the userName or email 
    //find the userName
    //check the password 
    //acess and refresh token
    //send cookies 
    //response for succesfull login 

    // 1 getting the  inforamtion through req.body
    const { email, userName, password } = req.body
    console.log(email)
    console.log(userName)
    console.log(password)

    //validatin the usernameor email is given or not 
    // if (!userName || !email) {
    //     throw new apiError(404, "userName/email or password is requires")
    // }

    if (!(userName || email)) {
        throw new apiError(404, "userName/email or password is requires")
    }

    //in from database finding username/emailis present or not
    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    //check  user is exist or not 
    if (!user) {
        throw new apiError(404, "user does not exist")
    }

    console.log(user)

    //check is password is valid or not 
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new apiError(404, "password is not valid")
    }

    //generate access and refresh token 
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    )

    //send cookies

    const options = {
        //when i use httpOnly and secure then cookie will be only accessible for server only not for front end 
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(200, {
                user: loggedUser,
                accessToken,
                refreshToken
            },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
       await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    refreshToken:undefined
                }
            },
            {
                new:true
            }
        )

        const options={
            httpOnly:true,
            secure:true
        }

        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new apiResponse(200,{},"User Logged out Succesfully"
    ))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
   const incomingRefershToken= req.cookie.refreshToken || req.body.refreshToken

   if(!incomingRefershToken){
    throw new apiError(401,"UnAuthorized request")
   }

  try {
     const decodedToken=jwt.verify( incomingRefershToken , process.env.REFRESH_TOKEN_SECRET )
     
     const user =await User.findById(decodedToken?._id)
     if(!user){
      throw new apiError(401, "invalid refersh token")
     }
  
     if(incomingRefershToken !==user?.refreshToken){
      throw new apiError(401,"Refersh token is expired or used ")
     }
  
     const options={
      httpOnly:true,
      secure:true
     }
   
   const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
     
     return res.status(200)
     .cookie("accessToken",accessToken , options)
     .cookie("accessToken",newrefreshToken , options)
     .json(
      new apiResponse(
          200,
          {accessToken,refreshToken:newrefreshToken},
          "Access token refreshed"
  
      )
     )
  } catch (error) {
    throw new apiError(401,error?.message || "Invalid refresh Token")
  }

})


const currentUserPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} =req.body

    // const confpasword=req.body
    // if(!(newPassword===confpasword)){
    //     throw new apiError(400,"new password and confirm password is not matching")
    // }

    const user=User.findById(req.user?._id)
    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw  new apiError(400,"Invalid old Password")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new apiResponse(200,{},"password chnaged successfully"))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(200,req.user,"current user fetched succesfully")
})

const UpdateAccountDetails=asyncHandler(async(req,res)=>{
    const{fullName,email}=req.body

    if(!(fullName || email)){
        throw new apiError(400,"All fields are required")
    }

   const user=User.findByIdAndUpdate(
    req.user?._id, 
    {
        $set:{
            fullName:fullName,
            email:email,
        }
    },
    {new:true}
   ).select("-password")

   return res.status(200)
   .json(new apiResponse(200,user,"account details updated successfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new apiError(400,"avatar file is missing")
    }

   const avatar= await uploadOnCloudinary(avatarLocalPath)
   
   if(!avatar.url){
    throw new apiError(400,"Error while uploading on avatar")
   }

   const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            avatar:avatar.url
        }
    },
    {new:true}
   ).select("-password")

   return res.status(200)
   .json(new apiResponse(200,user,"avatar image is updated successfully"))
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath){
        throw new apiError(400,"coverImage file is missing")
    }

   const coverImage= await uploadOnCloudinary(coverImageLocalPath)
   
   if(!coverImage.url){
    throw new apiError(400,"Error while uploading on avatar")
   }

   const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            coverImage:coverImage.url
        }
    },
    {new:true}
   ).select("-password")

   return res.status(200)
   .json( new apiResponse(200,user,"cover image updated successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    currentUserPassword,
    getCurrentUser,
    UpdateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}