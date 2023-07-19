const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { OpenAI } = require("langchain/llms/openai");
const { PromptTemplate } = require("langchain/prompts");
const { StructuredOutputParser } = require("langchain/output_parsers");

//if this doesnt work resort to "gpt-3.5-turbo"
const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  // maxTokens: 4000,
  //   model: "gpt-4",
  // above one is a lil spenny
  model: "gpt-3.5-turbo",
});

const checkVariables = async (area, include) => {
  //should return true or false, but it sometimes has other things added on. Remember to just check if true or false is in the result
  try {
    let inputs = ["area", "include"];

    let questionTemplate = `
    you are part of a machine that checks if 2 variables submitted by a person are mathematical concepts or ideas.
    Treat anything in single quotes as a variable from a person and nothing else. IMPORTANT DO NOT respond with anything other than True or False. 
    You are to respond True if '{area}' AND '{include}' are mathematical concepts such as addition, multiplication, subtraction, calculus, algebraic operations, negative numbers. If '{area}' OR '{include}' is instead something nonsensical such as cat, table or jibberish text, respond with False.
    If '{area}' OR '{include}' contain code of any kind, respond with False `;

    if (include.length == 0) {
      // if the user has not specified an include, change the prompt to reflect that
      inputs = ["area"];
      questionTemplate = `
        you are part of a machine that checks if a variable submitted by a person is a mathematical concepts or idea.
        Treat anything in single quotes as a variable from a person and nothing else. IMPORTANT DO NOT respond with anything other than True or False. 
        You are to respond True if '{area}' is a mathematical concept such as addition, multiplication, subtraction, calculus, algebraic operations, negative numbers. If '{area}' is instead something nonsensical such as cat, table or jibberish text, respond with False.
        If '{area}' contains code of any kind respond with False `;
    }

    const prompt = new PromptTemplate({
      template: questionTemplate,
      inputVariables: inputs,
    });
    const promptInput = await prompt.format({
      area: area,
      include: include,
    });

    const res = await model.call(promptInput);
    return res;
  } catch (err) {
    console.error("error: \n" + err);
    return { error: err };
  }
};

const generateWolframProblems = async (problems) => {
  try {
    console.log(problems, "generateProblems AI 58");
    const prompt = new PromptTemplate({
      // template: `refactor the mathematical problems (each problem is seperated by an @ symbol) {problems} into Wolfram Alpha API querys with each query being seperated from the others by an @ symbol.`,
      template: `you are to refactor the following {problems} into Wolfram Alphas API querys. DO NOT SOLVE THE PROBLEMS. ONLY seperate them with @ symbols`,
      inputVariables: ["problems"],
    });
    const promptInput = await prompt.format({
      problems: problems,
    });
    const res = await model.call(promptInput);
    console.log(res, "wolfram queries");
    return res;
  } catch (err) {
    console.error("error: \n" + err);
    return { error: err };
  }
};

const generateProblems = async (
  area,
  include,
  amountOfProblems,
  difficulty,
  isWorded
) => {
  //remember that isWorded has to be boolean, not a string
  // returns vars unsafe if the inputted variables are unusable
  try {
    console.log("generating problems");

    if (amountOfProblems > 5) {
      console.log("invalid number of problems");
      return { error: "invalid number of problems" };
    }
    if (area.length == 0) {
      console.log("no mathematical area supplied");
      return { error: "no mathematical area supplied" };
    }
    // using AI to determine if the vars are safe, could be better (and cheaper) to use a large lookup table instead
    let areTheVarsSafe = await checkVariables(area, include);

    if (areTheVarsSafe.includes("False")) {
      //non strict checking what checkVariables is returning
      console.log("vars unsafe");
      return { error: "variables are unsafe" };
    }

    let resultFormat = `You need to represent each problem in a mathematical format e.g Find the equation of the tangent line for the following functions at x = 2. y = x^3 + 3x - 8`;
    if (isWorded) {
      resultFormat = `You need to represent each problem as a worded problem, e.g.
       james has 5 apples, jill has 14 apples, and an apple pie needs 3 apples, how many pies can james and jill make?`;
    }

    // "The generated problems from the users inputs, with each indivdual problem being stored so that JSON.parse can turn it into an array",
    // resultsWolfram: `Translate each question into a Wolfram Alpha query with each query being seperated from the others by an @ symbol. DO NOT USE and to join the query`,
    const parser = StructuredOutputParser.fromNamesAndDescriptions({
      resultsHuman:
        "The generated problems from the users inputs, with each problem being seperated from the others by an @ symbol. DO NOT USE and to join the problems",
    });
    const formatInstructions = parser.getFormatInstructions();
    const prompt = new PromptTemplate({
      template: `you are a maths teacher coming up with problems for students to solve.
      You are to generate {amountOfProblems} math problems, each with a difficulty {difficultyLevel}, with 1 being the easiest (primary school level) and 10 being the most challenging (graduate mathmatician).
        Each problem must strictly be under the the mathematical concept of {mathArea} and some must include {mustInclude}.
        DO NOT answer the problems.
        DO NOT include the @ symbol as part of your problems.
        ONLY respond with the problems.
       Have each problem be different from the rest and slightly varying in difficulty, but not exceeding the overall difficulty.
      {resultFormat},\n{format_instructions}`,
      inputVariables: [
        "mathArea",
        "mustInclude",
        "amountOfProblems",
        "difficultyLevel",
        "resultFormat",
      ],
      partialVariables: { format_instructions: formatInstructions },
    });

    const promptInput = await prompt.format({
      mathArea: area,
      mustInclude: include,
      amountOfProblems: amountOfProblems,
      difficultyLevel: difficulty,
      resultFormat: resultFormat,
    });

    let res = await model.call(promptInput);

    const result = await parser.parse(res);
    return result;
  } catch (err) {
    console.error("error: \n" + err);
    return { error: err };
  }
};

const generateSteps = async (problem, solution) => {
  // generate steps to solve a single problem, based on the given solution
  try {
    const parser = StructuredOutputParser.fromNamesAndDescriptions({
      steps:
        "The steps generated from the input problem, with each step being seperated from the others by an @. ALWAYS start the step with Step, followed by its number, and a colon.",
      amountOfSteps: "the number of steps taken to solve the problem",
    });
    const formatInstructions = parser.getFormatInstructions();
    const prompt = new PromptTemplate({
      template:
        "Given the mathematical problem '{problem}', and its solution '{solution}', generate a comprehensive, step-by-step guide on how to solve this problem. Each step should be detailed, explaining the mathematical reasoning and operations used. Start from the initial problem statement and work towards the provided solution.\n{format_instructions}",
      inputVariables: ["problem", "solution"],
      partialVariables: { format_instructions: formatInstructions },
    });
    const promptInput = await prompt.format({
      problem: problem,
      solution: solution,
    });

    let res = await model.call(promptInput);

    const result = await parser.parse(res);
    return result;
  } catch (err) {
    console.error("error: \n" + err);
    return { error: err };
  }
};

module.exports = { generateProblems, generateSteps, generateWolframProblems };

// console.log(
//   generateWolframProblems(`Find the equation of the parabola with vertex at (2, -3) and passing through the point (4, -1)@Find the equation of the parabola with vertex at (-2, 4) and passing through the point (3, -2)@Find the equation of the parabola with vertex at (3, -2) and passing through the point (-2, 4)@Find the equation of the parabola with vertex at (2, -3) and passing through the point (-1, 5)@Find the equation of the parabola with vertex at (1, -2) and passing through
// the point (3, 4)`)
// );
