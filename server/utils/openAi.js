require("dotenv").config();

const wolfram = require("wolfram-alpha-api");
// const waApi = wolfram(WOLFRAM_APPID);

const { OpenAI } = require("langchain/llms/openai");
const { PromptTemplate } = require("langchain/prompts");
const { StructuredOutputParser } = require("langchain/output_parsers");
console.log(process.env.OPENAI_API_KEY);
//if this doesnt work resort to "gpt-3.5-turbo"
const model = new OpenAI({
  openAIApiKey: "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",
  temperature: 0,
  model: "gpt-4",
});

const generateProblem = async (
  area,
  include,
  amountOfProblems,
  difficulty,
  isWorded
) => {
  try {
    let resultFormat = "You need to return the result in a mathematical format";
    if (isWorded) {
      resultFormat = "You need to return the result as a worded problem";
    }
    if (area.length == 0) {
      return "no mathematical area supplied";
    }
    const parser = StructuredOutputParser.fromNamesAndDescriptions({
      response: "response",

      //   error:
      //     "if the variables inside the brackets does not make sense in a mathematical context or are not mathematical concepts, set error as this string 'error'",
    });
    //stored as a string in a javascript array format, It needs to be able to be converted after JSON.parse is called
    //THIS IS MOST IMPORTANT if either of the following variables inside the square brackets [{mathArea}, {mustInclude}] do not make sense in a mathematical context or are not mathematical concepts, add --error-- to the end of each generated problem.
    const formatInstructions = parser.getFormatInstructions();
    const prompt = new PromptTemplate({
      template: `you are a maths teacher generating problems for people to solve.
        FIRSTLY you need to check they are asking correct questions. If {mathArea} OR {mustInclude} are not mathematical concepts, then ignore the rest of the question and just respond with the word error.
      if {mathArea} AND {mustInclude} ARE mathematical concepts, you are to generate {amountOfProblems} math problems, each with a difficulty {difficultyLevel}, with 1 being the easiest (primary school level) and 10 being the most challenging (graduate mathmatician).
        Each problem must strictly be under the the mathematical concept of {mathArea} and must strictly include {mustInclude}.
        DO NOT answer the problems.
       Have each problem be different from the rest and slightly varying in difficulty, but not exceeding the overall difficulty.
      {resultFormat} \n{format_instructions},
        `,
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

    const res = await model.call(promptInput);
    console.log(await parser.parse(res));
  } catch (err) {
    console.log(err);
  }
};

generateProblem("pot", "", "3", "1", false);
