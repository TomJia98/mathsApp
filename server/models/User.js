const { Schema, model } = require("mongoose");
const Session = require("./Session");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  sessions: [
    {
      //insert reference to sessions here
      type: Schema.Types.ObjectId,
      ref: "Session",
    },
  ],
});
