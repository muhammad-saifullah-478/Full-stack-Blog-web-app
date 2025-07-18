const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://saifkasana950:saif12345678@createprof.gp68tfb.mongodb.net/webali",
  console.log("DB contect")
);

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  age: Number,
  email: String,
  password: String,
  profilepic:{
    type:String,
    default:"sidbarpic.png"
  },

  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
});
module.exports = mongoose.model("user", userSchema);
