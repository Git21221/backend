import express from "express";
import "dotenv/config";
const app = express();

app.get("/", (req, res) => {
  res.send("<h2>Hello</h2>");
});

app.get("/hi", (req, res) => {
  res.send("<h1>Kya hi likh rha hai..pdhai kr</h1>");
});

app.get("/hii", (req, res) => {
  res.send("<h1>dekho firse hii likh rha hai....pdhai kr bhai</h1>");
});

app.listen(process.env.PORT, () => {
  console.log(`server is live at ${process.env.PORT}`);
});
