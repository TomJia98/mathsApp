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

// create a new set of problems based on the users inputs, return the array of problems and save the wolfram version to the db
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
    // console.log(problems, "problems 28 dr");
    // const clean = problems.resultsHuman.split('Output:\n')[1]
    const problemsArray = problems.resultsHuman.split("@");
    const wolframProblems = await generateWolframProblems(
      problems.resultsHuman
    );
    // console.log(wolframProblems, "wolframProblems 34 dr");
    const wolframProblemsArray = wolframProblems.split("@");

    let problemsArrayTrimmed = [];
    let problemsArrayWolframTrimmed = [];
    const respArrObjs = [];
    for (const problem of problemsArray) {
      problemsArrayTrimmed.push(problem.trim());
    }
    for (const problem of wolframProblemsArray) {
      problemsArrayWolframTrimmed.push(problem.trim());
    }
    // console.log(problemsArrayWolframTrimmed, "DR 46");
    for (let i = 0; i < problemsArray.length; i++) {
      respArrObjs.push({
        question: problemsArrayTrimmed[i],
        wolframFormatQuestion: problemsArrayWolframTrimmed[i],
      });
    }
    const responses = await Response.insertMany(respArrObjs);
    const responsesIds = responses.map((resp) => resp._id);
    const session = await Session.create({
      area: req.body.area,
      include: req.body.include,
      worded: req.body.isWorded,
      amount: req.body.amountOfProblems,
      difficulty: req.body.difficulty,
      responses: responsesIds,
    });
    const updateUser = await User.findOneAndUpdate(
      { _id: req.session.user_id },
      {
        $push: {
          sessions: session._id,
        },
      },
      { new: true, rawResult: true }
    );

    res.status(200).json({
      session: session,
    });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

router.post("/solve", withAuth, async (req, res) => {
  //solve a question with wolfram, then generate a response with steps
  try {
    const getSol = await Response.findOne({ _id: req.body._id });
    if (getSol.solution) {
      res.status(200).json({ result: getSol });
    } else {
      let solution = "";
      console.log(req.body.problem);
      let solutionFromWolfram = await fetchSolution(req.body.problem);
      console.log(solutionFromWolfram, "line 70 dr");

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
      const problemSteps = await generateSteps(req.body.problem, solution);
      const problemsStepsArray = problemSteps.steps.split("@");
      problemsStepsArray.map((problem) => problem.trim());

      const updateResponse = await Response.findOneAndUpdate(
        {
          _id: req.body._id,
        },
        {
          solution: solution,
          steps: problemsStepsArray,
        },
        { new: true }
      );
      if (!updateResponse) {
        res.status(404).send({ err: " could not find reponse " });
      }

      res.status(200).json({ result: updateResponse });
    }
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

//get a single session from the params
router.get("/session:_id", withAuth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.user_id });

    if (user.sessions.includes(req.params._id)) {
      const selectedSession = await Session.findOne({
        _id: req.params._id,
      }).populate({ path: "responses", strictPopulate: false });
      if (!selectedSession) {
        res.status(404).json({ err: "Session not found" });
      }
      res.status(200).json({ session: selectedSession });
    } else {
      res.status(404).json({ err: "user does not have that session" });
    }
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
