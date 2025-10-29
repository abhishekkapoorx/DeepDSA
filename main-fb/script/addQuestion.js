const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Note: These imports work in Next.js environment
// For standalone script, we need to import them differently

/**
 * Script to add problems and test cases from a JSON file
 * 
 * Usage: 
 *   node script/addQuestion.js path/to/questions.json
 * 
 * JSON Format:
 * [
 *   {
 *     "title": "Two Sum",
 *     "description": "Given an array of integers...",
 *     "difficulty": "EASY",
 *     "tags": ["array", "hash-table"],
 *     "starterCode": "function twoSum(nums, target) {\n  // Your code here\n}",
 *     "functionName": "twoSum",
 *     "hints": ["Hint 1", "Hint 2"],
 *     "inputVariables": [
 *       { "name": "nums", "type": "number[]", "description": "Array of integers" },
 *       { "name": "target", "type": "number", "description": "Target sum" }
 *     ],
 *     "outputVariable": {
 *       "type": "number[]",
 *       "description": "Indices of two numbers"
 *     },
 *     "companyTags": ["Google", "Amazon"],
 *     "testCases": [
 *       {
 *         "name": "Example 1",
 *         "input": "[2,7,11,15]\n9",
 *         "output": "[0,1]",
 *         "isExample": true,
 *         "isHidden": false
 *       }
 *     ]
 *   }
 * ]
 */

async function addQuestionsFromFile(filePath) {
  try {
    // Connect to database
    await connectToDB();
    
    // Read and parse JSON file
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const problems = JSON.parse(jsonData);

    if (!Array.isArray(problems)) {
      throw new Error('JSON file must contain an array of problems');
    }

    console.log(`\n📝 Processing ${problems.length} problem(s)...\n`);

    // Process each problem
    for (const [index, problemData] of problems.entries()) {
      try {
        console.log(`\n[${index + 1}/${problems.length}] Adding: ${problemData.title}`);
        
        // Validate required fields
        if (!problemData.title || !problemData.description || !problemData.difficulty) {
          throw new Error('Missing required fields: title, description, or difficulty');
        }

        // Generate slug
        const slug = generateSlug(problemData.title);

        // Check if problem already exists
        const existingProblem = await Problem.findOne({ slug });
        if (existingProblem) {
          console.log(`⚠️  Problem "${slug}" already exists. Skipping...`);
          continue;
        }

        // Get next question number if not provided
        let questionNumber = problemData.questionNumber;
        if (!questionNumber) {
          questionNumber = await Problem.getNextQuestionNumber();
          console.log(`   Auto-assigned question number: ${questionNumber}`);
        }

        // Create problem
        const problem = new Problem({
          title: problemData.title,
          slug,
          description: problemData.description,
          difficulty: problemData.difficulty,
          tags: problemData.tags || [],
          starterCode: problemData.starterCode,
          functionName: problemData.functionName,
          hints: problemData.hints || [],
          inputVariables: problemData.inputVariables,
          outputVariable: problemData.outputVariable,
          companyTags: problemData.companyTags || [],
          questionNumber,
        });

        await problem.save();
        console.log(`✅ Problem saved: ${problem.title} (ID: ${problem._id})`);

        // Add test cases
        if (problemData.testCases && problemData.testCases.length > 0) {
          console.log(`   Adding ${problemData.testCases.length} test case(s)...`);
          
          for (const testCaseData of problemData.testCases) {
            const testCase = new TestCase({
              name: testCaseData.name || 'Test Case',
              description: testCaseData.description,
              input: testCaseData.input,
              output: testCaseData.output,
              isHidden: testCaseData.isHidden ?? false,
              isExample: testCaseData.isExample ?? false,
              problemId: problem._id,
            });

            await testCase.save();
            console.log(`   ✅ Test case added: ${testCase.name}`);
          }
        } else {
          console.log(`   ⚠️  No test cases provided for this problem`);
        }

      } catch (error) {
        console.error(`❌ Error processing problem "${problemData.title}":`, error instanceof Error ? error.message : error);
        continue; // Continue with next problem
      }
    }

    console.log(`\n✨ Successfully processed ${problems.length} problem(s)\n`);
    
  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Main execution
const filePath = "script/sample-questions.json";

if (!filePath) {
  console.error('❌ Error: Please provide a JSON file path');
  console.error('Usage: node script/addQuestion.js path/to/questions.json');
  process.exit(1);
}

const resolvedPath = path.resolve(filePath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ Error: File not found: ${resolvedPath}`);
  process.exit(1);
}

addQuestionsFromFile(resolvedPath);

