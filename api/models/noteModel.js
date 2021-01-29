const mongoose = require("mongoose");
const User = require("./userModel");

const schema = mongoose.Schema({
  // userId: mongoose.Types.ObjectId,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: String,
  content: String,
  color: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Note", schema);
