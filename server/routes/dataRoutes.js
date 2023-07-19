const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const router = require("express").Router();
const { User, Session, Response } = require("../models");
const withAuth = require("../utils/auth");

const {
  generateProblems,
  generateSteps,
  generateWolframProblems,
} = require("../utils/openAi");
const { fetchSolution } = require("../utils/wolfram");

router.post("/create", withAuth, async (req, res) => {
  try {
    if (req.body.include.includes("@")) {
      req.body.include = "";
    }
    const problems = await generateProblems(
      req.body.area,
      req.body.include,
      req.body.amountOfProblems,
      req.body.difficulty,
      req.body.isWorded
    );
    console.log(problems);
    // console.log(problems + " problems");
    const problemsArray = problems.resultsHuman.split("@");
    const wolframProblems = await generateWolframProblems(
      problems.resultsHuman
    );
    console.log(wolframProblems);
    //const problemsArrayWolfram = wolframProblems.split("@");
    let problemsArrayTrimmed = [];
    let problemsArrayWolframTrimmed = [];
    for (const problem of problemsArray) {
      problemsArrayTrimmed.push(problem.trim());
    }
    // for (const problem of problemsArrayWolfram) {
    //   problemsArrayWolframTrimmed.push(problem.trim());
    // }
    // console.log(problemsArray);
    // console.log(problemsArrayWolfram);
    res.status(200).json({
      problems: problemsArrayTrimmed,
      //wolfram: problemsArrayWolframTrimmed,
    });
    // instead of doing all at once, should just do the ones the user wants
    // res.send(problems.results);
    // let resultsArray = [];
    // for (const problem of problemsArrayWolfram) {
    //   const wolframResultObj = await fetchSolution(problem);
    //   console.log(wolframResultObj, "results wolfram");
    //   let solution = "";
    //   for (const subpod of wolframResultObj.subpods) {
    //     if (solution === "") {
    //       solution = subpod.plaintext + ", ";
    //     } else {
    //       solution += subpod.plaintext + ", ";
    //     }
    //   }
    //   solution = solution.slice(0, -2);
    //   resultsArray.push(solution);
    // }
    // res.status(200).json({ problems: problemsArray, results: resultsArray });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

router.post("/solve", withAuth, async (req, res) => {
  //solve a question with wolfram, then generate a response with steps
  try {
    let solution = "";
    console.log(req.body.problem);
    let solutionFromWolfram = await fetchSolution(req.body.problem);
    console.log(await solutionFromWolfram, "line 70 dr");
    if ((await solutionFromWolfram.subpods.length) > 0) {
      for (const subpod of solutionFromWolfram.subpods) {
        if (solution === "") {
          solution = subpod.plaintext + ", ";
        } else {
          solution += subpod.plaintext + ", ";
        }
      }
      solution = solution.slice(0, -2);
    } else {
      solution = solutionFromWolfram.subpods.plaintext;
    }
    console.log(solution, "solution");
    res.status(200).json({ solution: solution });
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
