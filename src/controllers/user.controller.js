import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Internal error while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from front-end
  const { fullName, email, username, password } = req.body;

  //validate user details
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required!");
  }

  //check if user already exist
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser)
    throw new apiError(409, "user with email or username already exist");

  //check for images and avater

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  )
    coverImageLocalPath = req.files.coverImage[0].path;

  let avaterLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avater) &&
    req.files.avater.length > 0
  )
    avaterLocalPath = req.files.avater[0].path;

  //upload them to cloudinary, avater
  const avater = await uploadFileOnCloudinary(avaterLocalPath);
  const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);
  if (!avater) {
    throw new apiError(400, "Avater is required");
  }

  //create user object
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    avater: avater.url,
    coverImage: coverImage?.url || "",
    password,
    email,
  });

  //remove password and refreshToken field from resposne
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //check for user creation
  if (!createdUser)
    throw new apiError(500, "Something went wrong while registering the user!");

  //return res
  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "user created successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  //fetch data from front-end
  const { username, email, password } = req.body;

  //validate all fields
  if (!(username || email))
    throw new apiError(400, "username or email is required!");

  //validate data (username or email)
  const findUser = await User.find({
    $or: [{ email }, { username }],
  });
  if (!findUser || findUser.length === 0)
    throw new apiError(404, "user not found with that username or email!");

  //validate password
  const isPasswordvalid = await findUser[0].isPasswordCorrect(password);
  if (!isPasswordvalid) throw new apiError(401, "Password incorrect!");

  //access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    findUser[0]._id
  );

  //send cookie
  const loggedInUser = await User.findById(findUser[0]._id);

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
  //navigate to home page after login
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) throw new apiError(400, "Invalid refresh token");

    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedRefreshToken) throw new apiError(401, "Invalid refresh Token");

    const userid = decodedRefreshToken._id;

    if (!userid) throw new apiError(401, "User not found");

    const user = await User.findById(userid);

    if (!user) throw new apiError(401, "Invalid refresh token");

    if (incomingRefreshToken !== user.refreshToken)
      throw new apiError(401, "Refresh token is expired or used");

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log(req.user);
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new apiError(401, "Password is not correct");
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new apiResponse(200, {}, "Your password is changed"));
});

const getCurrectUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "Current user fetched successfully"));
});

const updateUserInfo = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!(fullName || email)) {
    throw new apiError(401, "All fields are required");
  }

  const updatedInfo = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, updatedInfo, "user updated successfully"));
});

const updateAvater = asyncHandler(async (req, res) => {
  // console.log(req.files.avater[0].path);
  const avaterLocalPath = req.files?.avater[0].path;
  if (!avaterLocalPath) {
    throw new apiError(400, "Avater file is missing");
  }
  const avater = await uploadFileOnCloudinary(avaterLocalPath);

  if (!avater.url) throw new apiError(400, "Error while uploading on avater");



  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avater: avater.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res.status(200).json(new apiResponse(200, avater.url, "Avater is updated"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  // console.log(req.files.avater[0].path);
  const coverImageLocalPath = req.files?.coverImage[0].path;
  if (!coverImageLocalPath) {
    throw new apiError(400, "Avater file is missing");
  }
  const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) throw new apiError(400, "Error while uploading on avater");



  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res.status(200).json(new apiResponse(200, coverImage.url, "Cover Image is updated"));
});

export {
  registerUser,
  loginUser,
  generateAccessAndRefreshToken,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrectUser,
  updateUserInfo,
  updateAvater,
  updateCoverImage
};
