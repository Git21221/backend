import express from "express";
import "dotenv/config";
import 'cors'
const app = express();

const jokedata = [
  {
    "id": 1,
    "joke": "I am good boy",
    "Author": "Saikat Das",
  },
  {
    "id":2,
    "joke": "Sumon is good boy",
    "Author": "Sumon Mitra",
  },
  {
    "id": 3,
    "joke": "Sunny is good boy",
    "Author": "Sunny Mishra",
  }
]

const corsOption = {
  origin: 'http://127.0.0.1:5500/',
  optionsSuccessStatus: 200
}

app.get("/", (req, res) => {
  res.send("<h2>Hello</h2>");
});

app.get("/hi", (req, res) => {
  res.send("<h1>Kya hi likh rha hai..pdhai kr</h1>");
});

app.get("/hii", (req, res) => {
  res.send("<h1>dekho firse hii likh rha hai....pdhai kr bhai</h1>");
});

app.get('/jokes', cors(corsOption), (req, res) => {
  res.json(jokedata);
})

app.listen(process.env.PORT, () => {
  console.log(`server is live at ${process.env.PORT}`);
});
