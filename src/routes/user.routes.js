import {Router} from 'express'
import { loginUser, logoutUser, registerUser,refreshAccessToken} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';


//creating the instance of router
const router=Router()

// on register post method will work
router.route("/register").post(
    //use a multer method to upload the files
   upload.fields([
    {
        name:'avatar',
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
   ]),
   //the name of controller which handle that route
    registerUser
)
router.route('/login').post(loginUser)

//secured routes 
router.route('/logout').post( verifyJWT , logoutUser)
router.route('/refresh-token').post( refreshAccessToken)

export default router;