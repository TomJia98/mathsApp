const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// const wolfram = require("wolfram-alpha-api");
// const waApi = wolfram(WOLFRAM_APPID);

const { OpenAI } = require("langchain/llms/openai");
const { PromptTemplate } = require("langchain/prompts");
const { StructuredOutputParser } = require("langchain/output_parsers");

//if this doesnt work resort to "gpt-3.5-turbo"
const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
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
    If '{area}' OR '{include}' contain code of any kind respond with False `;

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
  }
};

const generateProblem = async (
  area,
  include,
  amountOfProblems,
  difficulty,
  isWorded
) => {
  //remember that isWorded has to be boolean, not a string
  // returns vars unsafe if the inputted variables are unusable
  try {
    if (area.length == 0) {
      console.log("no mathematical area supplied");
      return "no mathematical area supplied";
    }
    // using AI to determine if the vars are safe, could be better (and cheaper) to use a large lookup table instead
    let areTheVarsSafe = await checkVariables(area, include);

    if (areTheVarsSafe.includes("False")) {
      //non strict checking what checkVariables is returning
      console.log("vars unsafe");
      return "vars unsafe";
    }

    let resultFormat = `You need to represent each problem in a mathematical format e.g Find the equation of the tangent line for the following functions at x = 2. y = x^3 + 3x - 8`;
    if (isWorded) {
      resultFormat = `You need to represent each problem as a worded problem, e.g.
       james has 5 apples, jill has 14 apples, and an apple pie needs 3 apples, how many pies can james and jill make? 
       The pollution index I (in parts per million - ppm) on an average day in the city of Euphoria is
        approximated by the equation I(t) = -t
        2/2 + 10t + 25, where t is the time in hours with t = 0
        corresponding to 8.00 am and 0 < t < 16. At what time of the day does the pollution index reach
        a maximum? What is the maximum pollution index?
 `;
    }

    const parser = StructuredOutputParser.fromNamesAndDescriptions({
      results:
        "The generated problems from the users inputs, with each problem being seperated from the others by a comma. DO NOT USE and to join the problems, only commas",
    });
    const formatInstructions = parser.getFormatInstructions();
    const prompt = new PromptTemplate({
      template: `you are a maths teacher coming up with problems for students to solve.
      You are to generate {amountOfProblems} math problems, each with a difficulty {difficultyLevel}, with 1 being the easiest (primary school level) and 10 being the most challenging (graduate mathmatician).
        Each problem must strictly be under the the mathematical concept of {mathArea} and some must include {mustInclude}.
        DO NOT answer the problems.
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
    return "Error";
  }
};

const generateSteps = async (problem, solution) => {
  try {
    const parser = StructuredOutputParser.fromNamesAndDescriptions({
      steps:
        "The steps generated from the input problem, with each step being seperated from the others by a comma. ALWAYS start the step with Step, followed by its number, and a colon.",
    });
    const formatInstructions = parser.getFormatInstructions();
    const prompt = new PromptTemplate({
      template:
        "Given the mathematical problem '{problem}', and its solution '{solution}', please generate a comprehensive, step-by-step guide on how to solve this problem. Each step should be detailed, explaining the mathematical reasoning and operations used. Start from the initial problem statement and work towards the provided solution.\n{format_instructions}",
      //template: `You are a mathematical tutor that will explain the steps needed to solve the given mathematical problem '{problem}' and its solution '{solution}'. please generate a step-by-step guide on how to solve this problem from start to finish\n{format_instructions}`,
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
  }
};
// used to test the results out of the terminal
// const asd = generateProblem("quadratics", "", "5", "5", false).then(
//   (result) => {
//     console.log(result);
//   }
// );

(module.exports = generateProblem), generateSteps;
