const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const fetch = require("node-fetch");

const appID = process.env.WOLFRAM_APPID;

async function fetchSolution(inputProblem) {
  //given a problem, return a solution object.
  try {
    const query = encodeURIComponent(inputProblem);
    const response = await fetch(
      `http://api.wolframalpha.com/v2/query?input=${query}&appid=${appID}&output=json&format=plaintext`
    );
    const data = await response.json();
    let results;
    if (data.queryresult.error) {
      console.error("Error:", results);
      return new Error("cound not find results");
    }
    for (const pod of data.queryresult.pods) {
      //filter through the results and return the one that matches "Results"
      if (pod.title === "Results") {
        results = pod;
      }
      return results;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = { fetchSolution };
