const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const router = require("express").Router();
const { User, Session, Response } = require("../models");
const withAuth = require("../utils/auth");

const { generateProblem, generateSteps } = require("../utils/openAi");
const { fetchSolution } = require("../utils/wolfram");

router.post("/create", withAuth, async (req, res) => {
  try {
    if (req.body.include.includes("@")) {
      req.body.include = "";
    }
    const problems = await generateProblem(
      req.body.area,
      req.body.include,
      req.body.amountOfProblems,
      req.body.difficulty,
      req.body.isWorded
    );

    const problemsArray = problems.results.split("@");
    console.log(problemsArray);
    // res.send(problems.results);
    let resultsArray = [];
    for (const problem of problemsArray) {
      const wolframResultObj = await fetchSolution(problem);
      console.log(wolframResultObj);
      let solution = "";
      for (const subpod of wolframResultObj.subpods) {
        if (solution === "") {
          solution = subpod.plaintext + ", ";
        } else {
          solution += subpod.plaintext + ", ";
        }
      }
      solution = solution.slice(0, -2);
      resultsArray.push(solution);
    }
    res.status(200).json({ problems: problemsArray, results: resultsArray });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

module.exports = router;

// router.("/", async (req, res) => {
//     try {

//     } catch (err)
//      { console.error(err)
//         res.send(err)
//     }

// })
