const { Schema, model } = require("mongoose");

const responseSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    wolframFormatQuestion: {
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
    },
  },
  { timestamps: true }
);

const Response = model("Response", responseSchema);

module.exports = Response;
