const express = require("express");
const app = express();
const path = require('path'); // ✅ Add this line

const userModel = require("./module/user");
const postModel = require("./module/post");
const cookieParser = require('cookie-parser');

app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());


// const multerconfig=require("./config/multerconfig")


const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const upload = require("./config/multerconfig");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());



app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/profile/upload", (req, res) => {
  res.render("profileupload.ejs");
});
app.post("/upload", isLoggedin, upload.single("image"), async (req, res) => {
 let user=await userModel.findOne({email:req.user.email});
 user.profilepic=req.file.filename;
 await user.save();
 res.redirect("/profile")
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/test", (req, res) => {
  res.render("test");
});

app.get("/profile",isLoggedin, async (req, res) => {
// let user=await userModel.findOne({email:req.user.email}).populate("Posts");
let user = await userModel.findOne({ email: req.user.email }).populate("posts",); // ✅ match with schema

// console.log(user)
  res.render("profile", {user});
});

app.get("/edit/:id", isLoggedin, async (req, res) => {
    req.params.id = req.params.id.trim();
let post = await postModel.findOne({ _id: req.params.id }).populate("user");

 
  res.render("edit",{post});
});
app.post("/update/:id", isLoggedin, async (req, res) => {
    req.params.id = req.params.id.trim();
let post = await postModel.findOneAndUpdate({ _id: req.params.id },{content:req.body.content});

 
  res.redirect("/profile",);
});
app.get("/like/:id", isLoggedin, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");

  if (!post) {
    return res.status(404).send("Post not found");
  }

  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }

  await post.save();
  res.redirect("/profile");
});


app.post("/post",isLoggedin, async (req, res) => {
let user=await userModel.findOne({email:req.user.email});
let {content}=req.body

let post =await postModel.create({
   user: user._id,
  content
})
user.posts.push(post._id);  
await user.save()
res.redirect("/profile")

});


app.post("/register", async (req, res) => {
  let { email, password, username, name, age } = req.body;

  let user = await userModel.findOne({ email });
  if (user) return res.status(500).send("User is already register");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        email,
        age,
        name,
        password: hash,
      });
      let token = jwt.sign({ email: email, userid: user._id }, "shshsh");
      res.cookie("token", token);
      res.redirect("/login");
    });
  });
});


app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("something is worg");

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
       let token = jwt.sign({ email: email, userid: user._id }, "shshsh");
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    }
    else res.redirect("/login");
  });

});

app.get("/logout", (req, res) => {
res.cookie("token","");
  res.redirect("/login");
});
function isLoggedin (req,res,next){
if(req.cookies.token==="") res.redirect("/login")
  else{
let date=jwt.verify(req.cookies.token,"shshsh");
req.user =date;
  next();
  }

}




app.listen(8000, () => console.log("serwer is ok"));





