# Code Generator System

This system provides code generation capabilities for competitive programming problems, similar to LeetCode's approach.

## Overview

The system consists of two main components:
1. **Half Boilerplate**: What users see (clean function signatures)
2. **Full Boilerplate**: Complete programs with input/output handling for backend execution

## API Endpoints

### 1. Get Boilerplate Code
**GET** `/api/problems/{slug}/boilerplate?language={language}`

Generates half boilerplate code for a specific problem and language.

**Parameters:**
- `slug` (path): Problem slug
- `language` (query): Programming language (`cpp`, `java`, `python`, `javascript`)

**Response:**
```json
{
  "success": true,
  "data": {
    "boilerplate": "class Solution {\npublic:\n    int twoSum(vector<int> nums, int target) {\n        // TODO: Implement your solution here\n        \n        return result;\n    }\n};",
    "language": "cpp",
    "problemSlug": "two-sum",
    "functionName": "twoSum"
  }
}
```

### 2. Submit Code
**POST** `/api/problems/{slug}/submit`

Submits user code for judging against test cases.

**Request Body:**
```json
{
  "code": "class Solution {\npublic:\n    int twoSum(vector<int>& nums, int target) {\n        // User implementation\n        return result;\n    }\n};",
  "language": "cpp"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "problemSlug": "two-sum",
    "language": "cpp",
    "results": [
      {
        "testCaseId": "1",
        "testCaseNumber": 1,
        "status": "Accepted",
        "time": 0.002,
        "memory": 1024,
        "stdout": "1",
        "stderr": "",
        "compile_output": "",
        "expectedOutput": "1",
        "actualOutput": "1",
        "passed": true
      }
    ],
    "summary": {
      "passed": 1,
      "total": 1,
      "allPassed": true,
      "successRate": 100
    }
  }
}
```

## Supported Languages

- **C++**: Uses `vector<T>` for collections, `string` for strings
- **Java**: Uses arrays and `List<T>` for collections
- **Python**: Uses `List[T]` for collections, `str` for strings
- **JavaScript**: Uses arrays and functions

## Code Generation Process

1. **Half Boilerplate Generation**: Creates clean function signatures for users
2. **Full Boilerplate Generation**: Creates complete programs with input/output handling
3. **Code Merging**: Combines user code with full boilerplate at runtime
4. **Judge0 Integration**: Submits merged code to Judge0 for execution

## Environment Variables

- `JUDGE0_API_URL`: Judge0 API endpoint (default: `http://localhost:2358`)
- `JUDGE0_API_KEY`: Judge0 API key (optional)

## Usage Examples

### Frontend Integration

```typescript
// Fetch boilerplate for a language
const response = await fetch(`/api/problems/two-sum/boilerplate?language=cpp`);
const { boilerplate } = await response.json();

// Submit code for judging
const submitResponse = await fetch(`/api/problems/two-sum/submit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: userCode, language: 'cpp' })
});
const results = await submitResponse.json();
```

### Backend Usage

```typescript
import { HalfBoilerplateGenerator } from './generate-half-boilerplate';
import { FullBoilerplateGenerator, mergeBoilerplateCode } from './generate-full-boilerplate';

// Generate half boilerplate
const halfGenerator = new HalfBoilerplateGenerator(inputVariables, outputVariable, functionName);
const boilerplate = halfGenerator.generateAll()[language];

// Generate full boilerplate and merge with user code
const fullGenerator = new FullBoilerplateGenerator(inputVariables, outputVariable, functionName);
const fullBoilerplate = fullGenerator.generateAll()[language];
const completeCode = mergeBoilerplateCode(fullBoilerplate, userCode);
```

## Judge0 Integration

The system integrates with Judge0 for code execution:

- **Batch Submissions**: Submits all test cases at once
- **Language Mapping**: Maps internal language codes to Judge0 language IDs
- **Result Processing**: Processes Judge0 responses and formats results

## Error Handling

- Invalid language parameters return 400 errors
- Missing problems return 404 errors
- Judge0 failures return 500 errors with details
- All errors include descriptive messages

## Testing

Use the test file to verify functionality:

```typescript
import { testBoilerplateGeneration, testAPIEndpoints } from './test-apis';

// Test boilerplate generation
testBoilerplateGeneration();

// Test API endpoints (mock)
testAPIEndpoints();
``` 