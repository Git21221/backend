import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrectUser,
  changeCurrentPassword,
  updateUserInfo,
  updateAvater,
  updateCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avater",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJwt, logoutUser);

//endpoint for refresh access token
router.route("/refresh-token").post(refreshAccessToken);

//change user password
router.route("/change-password").post(verifyJwt, changeCurrentPassword);

//get current user info
router.route("/curr-user").get(verifyJwt, getCurrectUser);

//update user info
router.route("/update-user-info").patch(verifyJwt, updateUserInfo);

//update avater
router.route("/update-avater").patch(
  upload.fields([
    {
      name: "avater",
      maxCount: 1,
    },
  ]),
  verifyJwt,
  updateAvater
);

//update cover image
router.route("/update-cover-image").patch(
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  verifyJwt,
  updateCoverImage
);

export default router;
