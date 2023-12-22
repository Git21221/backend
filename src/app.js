import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// limiting json size
app.use(
  express.json({
    limit: "16kb",
  })
);

// url encoding that express should understand
app.use(express.urlencoded({ extended: "16kb" }));

//to store pdf and pdf
app.use(express.static("public"));

app.use(cookieParser());
