import express from "express";
import connectDB from './db/index.js'

const app = express();

connectDB()
.then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log("Server is listening on port", process.env.PORT);
  })
})
.catch(err => {
  console.log("MongoDB connection failed: ", err);
})