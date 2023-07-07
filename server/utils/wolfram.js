const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const fetch = require("node-fetch");

// const wolfram = require("wolfram-alpha-api");
// const waApi = wolfram(WOLFRAM_APPID);

const appID = process.env.WOLFRAM_APPID; // Replace with your AppID
const query = encodeURIComponent("Solve the equation x^2 + 4x + 3 = 0"); // URL encode your query

async function fetchSolution() {
  try {
    const response = await fetch(
      `http://api.wolframalpha.com/v2/query?input=${query}&appid=${appID}&output=json&format=image`
    );
    const data = await response.json();
    console.log(data);
    for (const iterator of data.queryresult.pods) {
      console.log(iterator);
    }
    // Handle the data here
  } catch (error) {
    console.error("Error:", error);
    // Handle the error here
  }
}

fetchSolution();
