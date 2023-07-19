const { Schema, model } = require("mongoose");
const Response = require("./Response");
const sessionSchema = new Schema(
  {
    area: {
      type: String,
      required: true,
    },
    include: {
      type: String,
    },
    worded: {
      type: Boolean,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
    },
    responses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Response",
      },
    ],
  },
  { timestamps: true }
);

const Session = model("Session", sessionSchema);

module.exports = Session;
