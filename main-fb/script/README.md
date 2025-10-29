# Add Questions Script

This script allows you to bulk-import problems and their test cases into the database from a JSON file.

## Usage

```bash
npx ts-node script/addQuestion.ts path/to/questions.json
```

## Environment Setup

Make sure you have `.env.local` file with `MONGO_URI` configured:

```env
MONGO_URI=mongodb://localhost:27017/your-database-name
```

## JSON File Format

The JSON file should contain an array of problem objects. Each problem object should have the following structure:

```json
{
  "title": "Problem Title",
  "description": "Problem description...",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "tags": ["tag1", "tag2"],
  "starterCode": "function solution() {\n  // Your code here\n}",
  "functionName": "solution",
  "hints": ["Hint 1", "Hint 2"],
  "inputVariables": [
    {
      "name": "param1",
      "type": "number[]",
      "description": "Description of parameter"
    }
  ],
  "outputVariable": {
    "type": "number",
    "description": "Description of output"
  },
  "companyTags": ["Google", "Amazon"],
  "questionNumber": 1,  // Optional, auto-assigned if not provided
  "testCases": [
    {
      "name": "Test Case Name",
      "description": "Test case description",
      "input": "input1\ninput2",
      "output": "expected output",
      "isExample": true,  // Optional, default: false
      "isHidden": false   // Optional, default: false
    }
  ]
}
```

## Required Fields

### Problem Level
- `title`: Problem title
- `description`: Full problem description
- `difficulty`: One of "EASY", "MEDIUM", "HARD"
- `tags`: Array of tags
- `starterCode`: Starter code for the function
- `functionName`: Name of the function to implement
- `inputVariables`: Array of input variable definitions
- `outputVariable`: Output variable definition
- `testCases`: Array of test cases

### Optional Fields
- `hints`: Array of hint strings
- `companyTags`: Array of company names
- `questionNumber`: Manual question number (auto-assigned if not provided)

### Test Case Fields
- `name`: Name of the test case
- `description`: Description (optional)
- `input`: Input values (multi-line supported with `\n`)
- `output`: Expected output
- `isExample`: Whether this is an example test case (default: false)
- `isHidden`: Whether this is a hidden test case (default: false)

## Features

- ✅ Auto-generates unique slugs from titles
- ✅ Auto-assigns question numbers (fills gaps intelligently)
- ✅ Prevents duplicate entries (checks slug uniqueness)
- ✅ Supports multiple test cases per problem
- ✅ Validates required fields
- ✅ Continues processing even if one problem fails
- ✅ Provides detailed console output

## Example

See `sample-questions.json` for a complete example with two problems.

```bash
# Run the script with sample file
npx ts-node script/addQuestion.ts script/sample-questions.json
```

## Output

The script will:
1. Connect to MongoDB
2. Process each problem in the JSON file
3. Show progress for each problem
4. Create problems and their test cases
5. Skip duplicates
6. Close the database connection when done

Example output:
```
📝 Processing 2 problem(s)...

[1/2] Adding: Two Sum
   Auto-assigned question number: 1
✅ Problem saved: Two Sum (ID: 60a123456789)
   Adding 4 test case(s)...
   ✅ Test case added: Example 1
   ✅ Test case added: Example 2
   ✅ Test case added: Example 3
   ✅ Test case added: Test Case 1

[2/2] Adding: Reverse Linked List
   Auto-assigned question number: 2
✅ Problem saved: Reverse Linked List (ID: 60a123456790)
   Adding 4 test case(s)...
   ✅ Test case added: Example 1
   ✅ Test case added: Example 2
   ✅ Test case added: Example 3
   ✅ Test case added: Test Case 1

✨ Successfully processed 2 problem(s)
🔌 Database connection closed
```

## Notes

- The script will skip problems that already exist (based on slug)
- Multi-line input/output in test cases should use `\n` for newlines
- Question numbers are auto-assigned to fill gaps first, then sequential
- All dates are automatically set by mongoose timestamps

