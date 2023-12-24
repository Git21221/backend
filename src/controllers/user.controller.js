import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "register ok",
  });
});

const loginUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "login ok",
  });
});

export { registerUser, loginUser };
