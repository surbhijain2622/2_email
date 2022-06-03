const bodyparser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();
const mimetype = require("mime-types");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
    files: 3,
  },
});
module.exports.upload = upload;

const app = express();
const cors = require("cors");
const register = require("./authorization/register.js");
const login = require("./authorization/login");
const oauthloginroutes = require("./authorization/oauthlogin.js");
const logoutroutes = require("./authorization/logout.js");
const { Chain } = require("./chains/model");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyparser.json());
app.use(upload.any());
const emailGroupRouter = require("./email-group/routes");
const ChainRouter = require("./chains/routes.js");
const UserRouter = require("./users/routes.js");
const MessageRouter = require("./messages/routes.js");
const MailRouter = require("./users/mailcredentials.js");
// const MailerRouter = require("././Mailer/routes");

mongoose.connect(
  "mongodb+srv://admin-naman:" +
    process.env.CLUSTER_PASSWORD +
    "@cluster0.3djy5.mongodb.net/FliperDB?retryWrites=true&w=majority",
  { useNewUrlParser: true },
  () => {
    console.log("Database connected.");
  }
);
app.use(
  cors({
    origin: process.env.SITE_URL,
    optionsSuccessStatus: 200,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));

app.post("/register", register);
app.post("/login", login);
app.use("/", oauthloginroutes);
app.use("/", logoutroutes);

// Handles all the routes related to email groups
app.use("/email-group/", emailGroupRouter);

app.use("/chains", ChainRouter, (error, req, res, next) => {
  return res.status(400).json({ error: error.message });
});

app.use("/users", UserRouter);
app.use("/messages", MessageRouter);
app.use("/", MailRouter);
// app.use("/", MailerRouter);
app.get("/", function (req, res) {
  res.send("Hello");
});
app.listen(process.env.PORT || 8000, function (req, res) {
  console.log("Running");
});
