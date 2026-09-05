import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import connectToDB from "../src/lib/mongoose";
import Problem, { generateSlug } from "../src/models/problem.model";
import TestCase from "../src/models/testCase.model";

type QuestionData = {
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags?: string[];
  starterCode: string;
  functionName: string;
  hints?: string[];
  inputVariables?: unknown[];
  outputVariable?: unknown;
  companyTags?: string[];
  questionNumber?: number;
  testCases?: Array<{
    name?: string;
    description?: string;
    input: string;
    output: string;
    isHidden?: boolean;
    isExample?: boolean;
  }>;
};

const ProblemWithStatics = Problem as typeof Problem & {
  getNextQuestionNumber(): Promise<number>;
};

async function addQuestionsFromFile(filePath: string): Promise<void> {
  let connected = false;

  try {
    await connectToDB();
    connected = true;

    console.log(`🔎 Problem collection: ${Problem.collection.name}`);
    console.log(`🔎 Existing problem count: ${await Problem.countDocuments()}`);

    const problems = JSON.parse(fs.readFileSync(filePath, "utf8")) as QuestionData[];
    if (!Array.isArray(problems)) {
      throw new Error("JSON file must contain an array of problems");
    }

    console.log(`\n📝 Processing ${problems.length} problem(s)...\n`);

    for (const [index, problemData] of problems.entries()) {
      try {
        console.log(`\n[${index + 1}/${problems.length}] Adding: ${problemData.title}`);

        if (!problemData.title || !problemData.description || !problemData.difficulty) {
          throw new Error("Missing required fields: title, description, or difficulty");
        }

        const slug = generateSlug(problemData.title);
        const existingProblem = await Problem.findOne({ slug }).select("_id title questionNumber").lean();
        if (existingProblem) {
          console.log(`⚠️ Problem "${slug}" already exists. Skipping...`);
          console.log(`   Existing document: ${existingProblem._id} (${existingProblem.title})`);
          continue;
        }

        const questionNumber = problemData.questionNumber ?? await ProblemWithStatics.getNextQuestionNumber();
        if (!problemData.questionNumber) {
          console.log(`   Auto-assigned question number: ${questionNumber}`);
        }

        const problem = await Problem.create({
          title: problemData.title,
          slug,
          description: problemData.description,
          difficulty: problemData.difficulty,
          tags: problemData.tags ?? [],
          starterCode: problemData.starterCode,
          functionName: problemData.functionName,
          hints: problemData.hints ?? [],
          inputVariables: problemData.inputVariables,
          outputVariable: problemData.outputVariable,
          companyTags: problemData.companyTags ?? [],
          questionNumber,
        });
        console.log(`✅ Problem saved: ${problem.title} (ID: ${problem._id})`);

        if (problemData.testCases?.length) {
          console.log(`   Adding ${problemData.testCases.length} test case(s)...`);
          for (const testCaseData of problemData.testCases) {
            const testCase = await TestCase.create({
              ...testCaseData,
              name: testCaseData.name ?? "Test Case",
              isHidden: testCaseData.isHidden ?? false,
              isExample: testCaseData.isExample ?? false,
              problemId: problem._id,
            });
            console.log(`   ✅ Test case added: ${testCase.name}`);
          }
        } else {
          console.log("   ⚠️ No test cases provided for this problem");
        }
      } catch (error) {
        console.error(`❌ Error processing problem "${problemData.title}":`, error instanceof Error ? error.message : error);
      }
    }

    console.log(`\n✨ Successfully processed ${problems.length} problem(s)\n`);
  } catch (error) {
    console.error("❌ Script error:", error);
    process.exitCode = 1;
  } finally {
    if (connected) {
      await mongoose.connection.close();
      console.log("🔌 Database connection closed");
    }
  }
}

async function main(): Promise<void> {
  process.loadEnvFile(path.resolve(process.cwd(), ".env"));

  const filePath = process.argv[2];
  if (!filePath) {
    console.error("❌ Error: Please provide a JSON file path");
    console.error("Usage: npx tsx script/addQuestion.ts path/to/questions.json");
    process.exitCode = 1;
    return;
  }

  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Error: File not found: ${resolvedPath}`);
    process.exitCode = 1;
    return;
  }

  await addQuestionsFromFile(resolvedPath);
}

main().catch((error) => {
  console.error("❌ Unexpected script error:", error);
  process.exitCode = 1;
});
