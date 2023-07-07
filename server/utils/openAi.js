require("dotenv").config();

const wolfram = require("wolfram-alpha-api");
const waApi = wolfram(WOLFRAM_APPID);

const { OpenAI } = require("langchain/llms/openai");
const { PromptTemplate } = require("langchain/prompts");
const { StructuredOutputParser } = require("langchain/output_parsers");

//if this doesnt work resort to "gpt-3.5-turbo"
const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
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
    const parser = StructuredOutputParser.fromNamesAndDescriptions({
      Generatedproblems:
        "The generated problems, with each problem being stored as a different element of a javascript array,",
    });

    const formatInstructions = parser.getFormatInstructions();
    const prompt = new PromptTemplate({
      template: `You are to generate {amountOfProblems} math problems, each with a difficulty {difficultyLevel} out of 10, with 1 being the easiest (primary school level) and 10 being the most challenging (graduate mathmatician ).
     Each problem must be under the the mathematical area of {mathArea} and must include {mustInclude}.
     If either of the following things inside the brackets do not make sense in a mathematical context, return the string "error" ({mathArea}, {mustInclude})
      Try to have each problem be different from the rest and slightly varying in difficulty, but not exceeding the overall difficulty.
      {resultFormat} \n{format_instructions},
        `,
      inputVariables: [
        "mathArea",
        "mustInclude",
        "amountOfProblems",
        "difficultyLevel",
        "resultFormat",
      ],
    });

    const promptInput = await prompt.format({
      question: input,
    });
  } catch (err) {
    console.log(err);
  }
};
