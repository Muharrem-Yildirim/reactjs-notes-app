const mongoose = require("mongoose"),
  bcrypt = require("bcrypt");

const schema = mongoose.Schema({
  username: { type: String, unique: true, required: true },
  hash_password: { type: String, required: true },
  created: {
    type: Date,
    default: Date.now,
  },
});

schema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.hash_password);
};

module.exports = mongoose.model("User", schema);
