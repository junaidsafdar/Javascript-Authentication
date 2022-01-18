require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "Thisismylongsentence.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://127.0.0.1:27017/userDb", { useNewUrlParser: true });
//for encrption

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("user", userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/secrets",function (req, res){
  
  //check user authentication
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }

});

app.get("/logout", function (req, res){
req.logout();
res.redirect("/")
})

app.post("/register", function (req, res) {
//user model 
  User.register({username: req.body.username},req.body.password,function(err,user)
  {
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
        //save cookie if
        res.redirect("/secrets");
      })
    }
  });

});

//check database if user exists
app.post("/login", function (req, res) {

  const user  = new User({
    username:req.body.username,
    password:req.body.password,
  });

  req.login(user,function(err,){
    if (err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  })

});
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
