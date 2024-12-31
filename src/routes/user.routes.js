import { Router } from 'express'
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    chnageCurrentUserPassword,
    getCurrentUser,
    UpdateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from '../controllers/user.controller.js';

import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';



//creating the instance of router
const router = Router()

// on register post method will work
router.route("/register").post(
    //use a multer method to upload the files
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    //the name of controller which handle that route
    registerUser
)
router.route('/login').post(loginUser)

//secured routes 
router.route('/logout').post(verifyJWT, logoutUser)

router.route('/refresh-token').post(refreshAccessToken)

router.route('/change-password').post(verifyJWT, chnageCurrentUserPassword)

router.route('/current-user').get(verifyJWT, getCurrentUser)

router.route('/update-account').patch(verifyJWT, UpdateAccountDetails)

router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar)

router.route('/cover-image').patch(verifyJWT, upload.single('coverImahe'), updateUserCoverImage)

router.route('/channel/:username').get(verifyJWT, getUserChannelProfile)

router.route('/history').get(verifyJWT, getWatchHistory)


export default router;