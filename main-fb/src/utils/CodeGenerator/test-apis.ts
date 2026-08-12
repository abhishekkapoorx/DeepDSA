import { HalfBoilerplateGenerator } from './generate-half-boilerplate';
import { FullBoilerplateGenerator, mergeBoilerplateCode } from './generate-full-boilerplate';
import { IInputVariable, IOutputVariable } from '../../models/problem.model';

// Test data
const testInputVariables: IInputVariable[] = [
  { name: 'nums', type: 'int[]', description: 'Array of integers' },
  { name: 'target', type: 'int', description: 'Target sum' }
];

const testOutputVariable: IOutputVariable = {
  type: 'int',
  description: 'Number of pairs that sum to target'
};

const testFunctionName = 'twoSum';

// Test user code
const testUserCode = `class Solution {
public:
    int twoSum(vector<int>& nums, int target) {
        // User's implementation
        for (int i = 0; i < nums.size(); i++) {
            for (int j = i + 1; j < nums.size(); j++) {
                if (nums[i] + nums[j] == target) {
                    return i + j;
                }
            }
        }
        return -1;
    }
};`;

export const testBoilerplateGeneration = () => {
  console.log('=== Testing Boilerplate Generation ===');
  
  // Test half boilerplate generation
  const halfGenerator = new HalfBoilerplateGenerator(testInputVariables, testOutputVariable, testFunctionName);
  const halfBoilerplates = halfGenerator.generateAll();
  
  console.log('Half Boilerplates:');
  Object.entries(halfBoilerplates).forEach(([lang, code]) => {
    console.log(`\n${lang.toUpperCase()}:`);
    console.log(code);
  });
  
  // Test full boilerplate generation
  const fullGenerator = new FullBoilerplateGenerator(testInputVariables, testOutputVariable, testFunctionName);
  const fullBoilerplates = fullGenerator.generateAll();
  
  console.log('\n=== Full Boilerplates with Placeholders ===');
  Object.entries(fullBoilerplates).forEach(([lang, code]) => {
    console.log(`\n${lang.toUpperCase()}:`);
    console.log(code);
  });
  
  // Test merging
  console.log('\n=== Testing Code Merging ===');
  const mergedCpp = mergeBoilerplateCode(fullBoilerplates.cpp, testUserCode);
  console.log('Merged C++ Code:');
  console.log(mergedCpp);
  
  return {
    halfBoilerplates,
    fullBoilerplates,
    mergedCode: mergedCpp
  };
};

export const testAPIEndpoints = async () => {
  console.log('=== Testing API Endpoints ===');
  
  // Test boilerplate API (mock)
  const halfBoilerplate = new HalfBoilerplateGenerator(testInputVariables, testOutputVariable, testFunctionName).generateAll();
  const mockBoilerplateResponse = {
    success: true,
    data: {
      boilerplate: halfBoilerplate.cpp,
      language: 'cpp',
      problemSlug: 'two-sum',
      functionName: testFunctionName
    }
  };
  
  console.log('Boilerplate API Response:', mockBoilerplateResponse);
  
  // Test submission API (mock)
  const mockSubmissionResponse = {
    success: true,
    data: {
      problemSlug: 'two-sum',
      language: 'cpp',
      results: [
        {
          testCaseId: '1',
          testCaseNumber: 1,
          status: 'Accepted',
          time: 0.002,
          memory: 1024,
          stdout: '1',
          stderr: '',
          compile_output: '',
          expectedOutput: '1',
          actualOutput: '1',
          passed: true
        }
      ],
      summary: {
        passed: 1,
        total: 1,
        allPassed: true,
        successRate: 100
      }
    }
  };
  
  console.log('Submission API Response:', mockSubmissionResponse);
  
  return {
    boilerplateResponse: mockBoilerplateResponse,
    submissionResponse: mockSubmissionResponse
  };
}; 