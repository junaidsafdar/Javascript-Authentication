require('dotenv').config(); 
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://127.0.0.1:27017/userDb", {useNewUrlParser: true});
//for encrption



const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("user", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
    const newUser = new User({
        email:req.body.username,
        password:md5(req.body.password),
    });
    newUser.save(function (err){
        if(err) {console.log(err)}
        else{res.render("secrets")}
    })
});
//check database if user exists
app.post("/login", function (req, res){

  const username = req.body.username;
  const password = md5(req.body.password);

  User.findOne({username: username},function (err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        if(foundUser.password === password){
          res.render('secrets');
        }
      }
    }
  }); 

});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});