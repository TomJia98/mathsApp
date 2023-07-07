const { Schema, model } = require("mongoose");

const sessionSchema = new Schema({});

const Session = model("Session", sessionSchema);

module.exports = Session;
