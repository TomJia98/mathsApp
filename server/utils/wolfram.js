const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const fetch = require("node-fetch");

const appID = process.env.WOLFRAM_APPID;

// function fetchSolution(inputProblem) {
//   //given a problem, return a solution object.
//   const query = encodeURIComponent(inputProblem);
//   return fetch(
//     `http://api.wolframalpha.com/v2/query?input=${query}&appid=${appID}&output=json&format=plaintext`
//   )
//     .then((response) => response.json())
//     .then((data) => {
//       let results;
//       if (data.queryresult.error) {
//         console.error("Error:", results);
//         throw new Error("cound not find results");
//       }
//       console.log(data.queryresult.didyoumeans);
//       for (const pod of data.queryresult.pods) {
//         //filter through the results and return the one that matches "Results"
//         if (pod.title === "Results") {
//           results = pod;
//         }
//         return results;
//       }
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//     });
// }

async function fetchSolution(inputProblem) {
  //given a problem, return a solution object.
  try {
    console.log(inputProblem);
    const query = encodeURIComponent(inputProblem);
    const response = await fetch(
      `http://api.wolframalpha.com/v2/query?input=${query}&appid=${appID}&output=json&format=plaintext`
    );
    const data = await response.json();
    let results;
    console.log(data, "44, wf");
    // console.log("-------------------result from wolfram start ------------------------------")
    // console.log(data)
    // console.log("-------------------result from wolfram end ------------------------------")
    if (data.queryresult.error === true) {
      console.error("Error:", results);
      return new Error("cound not find results");
    }
    // console.log(data.queryresult.didyoumeans);
    for (const pod of data.queryresult.pods) {
      console.log(pod, "pod");
      //filter through the results and return the one that matches "Results"
      if (pod.title === "Result") {
        return pod;
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = { fetchSolution };
