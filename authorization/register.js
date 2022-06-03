const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const jwt = require("jsonwebtoken");
const { userSchema, tokenSchema } = require("../model");

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Token = new mongoose.model("Token", tokenSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

const register = (req, res) => {
  User.register(
    {
      username: req.body.username,
      email: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    },
    req.body.password,
    function (err, user) {
      if (err) {
        return res.status(400).json({ error: "Internal Server Error " });
      } else {
        passport.authenticate("local")(req, res, function () {
          const token = jwt.sign(
            {
              userId: user.username,
            },
            process.env.SECRET
          );
          var tokendata = new Token({
            token: token,
            userid: user._id,
          });

          tokendata.save(function (err, auth) {
            if (err) {
              Token.findOne({ userid: user._id }, function (error, resp) {
                if (resp) {
                  return res
                    .status(400)
                    .json({ error: "User Already Logged In " });
                } else {
                  return res
                    .status(400)
                    .json({ error: "Internal Server Error " });
                }
              });
            } else {
              return res.status(200).json({
                success: "Logged In Successfully.",
                token: auth.token,
                profile: user,
              });
            }
          });
        });
      }
    }
  );
};

//jshint esversion:6
module.exports = register;
