const express = require("express");
const connectToDb = require("./config/connectToDb")
require("dotenv").config(); //to learn from .env file
const {errorHandler,notFound}=require("./middlewares/error");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiting = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require('hpp');
//connect to db
connectToDb();

//init App
const app = express();

//Middlewares
app.use(express.json()); //to know json file comming from client
//app.use(express.urlencoded({ extended: true })); //to know url encoded file comming from client


//cors Policy
app.use(cors({
    origin:"https://blog-pro-abdiabderraouf.vercel.app",
})); //
//security Headers ( helmet):
app.use(helmet());
//Prevent Http Param Pollution:
app.use(hpp());
// Prevent XSS (Cross Site Scripting)Attacks security contre xss Attack with express-rate-limit
app.use(xss()); 
//Rate Limiting : empecher user denvoyer plusieurs requests limit envoi 200 requetes
app.use(rateLimiting({
    windowMs:10 * 60 * 1000,// cad chaque 10 minutes utilisateur peut evoyer 200 requetes au max
    max:200,
}));
//Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/posts", require("./routes/postsRoute"));
app.use("/api/comments", require("./routes/commentsRoute"));
app.use("/api/categories", require("./routes/categoriesRoute"));
app.use("/api/password", require("./routes/passwordRoute"));

//Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

//running the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log("server run in port", PORT));
