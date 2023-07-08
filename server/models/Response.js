const { Schema, model } = require("mongoose");

const responseSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    steps: [
      {
        type: String,
      },
    ],
    solution: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Response = model("Response", responseSchema);

module.exports = Response;
