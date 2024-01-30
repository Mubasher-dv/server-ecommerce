import express from "express";
import { changePassword, forgetPassword, getMyProfile, logOut, login, resetPassword, signUp, updatePic, updateProfile } from "../controllers/user.js";
import { isAuthenticated } from "../middleware/auth.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.post("/login", login)

router.post("/new", singleUpload, signUp)

router.get("/me", isAuthenticated, getMyProfile)

router.get("/logout", isAuthenticated, logOut)

//updating routes
router.put("/updateprofile", isAuthenticated, updateProfile)

router.put("/changepassword", isAuthenticated, changePassword)

router.put("/updatepic", isAuthenticated, singleUpload, updatePic)

// forget password & reset password
router.route("/forgetpassword").post(forgetPassword).put(resetPassword)


export default router;