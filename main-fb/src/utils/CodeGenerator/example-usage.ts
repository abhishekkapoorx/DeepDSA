import { IInputVariable, IOutputVariable } from '../../models/problem.model';
import { HalfBoilerplateGenerator } from './generate-half-boilerplate';
import { FullBoilerplateGenerator, mergeAllBoilerplateCode, HALF_BOILERPLATE_PLACEHOLDER } from './generate-full-boilerplate';

// Example usage
const exampleUsage = () => {
  // Define problem inputs and outputs
  const inputVariables: IInputVariable[] = [
    { name: 'nums', type: 'int[]', description: 'Array of integers' },
    { name: 'target', type: 'int', description: 'Target sum' }
  ];

  const outputVariable: IOutputVariable = {
    type: 'int',
    description: 'Number of pairs that sum to target'
  };

  const functionName = 'twoSum';

  // Generate half boilerplate using class (what user sees - like LeetCode)
  const halfGenerator = new HalfBoilerplateGenerator(inputVariables, outputVariable, functionName);
  const halfBoilerplates = halfGenerator.generateAll();
  
  console.log('=== HALF BOILERPLATE (User sees this - LeetCode style) ===');
  console.log('C++:');
  console.log(halfBoilerplates.cpp);
  console.log('\nPython:');
  console.log(halfBoilerplates.python);
  console.log('\nJava:');
  console.log(halfBoilerplates.java);
  console.log('\nJavaScript:');
  console.log(halfBoilerplates.javascript);

  // Generate full boilerplate using class (for backend execution) with placeholders
  const fullGenerator = new FullBoilerplateGenerator(inputVariables, outputVariable, functionName);
  const fullBoilerplates = fullGenerator.generateAll();
  
  console.log('\n=== FULL BOILERPLATE WITH PLACEHOLDERS (Backend template) ===');
  console.log('C++:');
  console.log(fullBoilerplates.cpp);
  console.log('\nPython:');
  console.log(fullBoilerplates.python);
  console.log('\nJava:');
  console.log(fullBoilerplates.java);
  console.log('\nJavaScript:');
  console.log(fullBoilerplates.javascript);

  // Merge half and full boilerplates
  const mergedBoilerplates = mergeAllBoilerplateCode(fullBoilerplates, halfBoilerplates);
  
  console.log('\n=== MERGED BOILERPLATE (Ready for execution) ===');
  console.log('C++:');
  console.log(mergedBoilerplates.cpp);
  console.log('\nPython:');
  console.log(mergedBoilerplates.python);
  console.log('\nJava:');
  console.log(mergedBoilerplates.java);
  console.log('\nJavaScript:');
  console.log(mergedBoilerplates.javascript);

  // Example of runtime replacement with user's implementation
  console.log('\n=== RUNTIME REPLACEMENT EXAMPLE ===');
  const userCode = `class Solution {
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

  const runtimeMerged = fullBoilerplates.cpp.replace(HALF_BOILERPLATE_PLACEHOLDER, userCode);
  console.log('Runtime merged C++ (with user implementation):');
  console.log(runtimeMerged);

  return {
    halfBoilerplates,
    fullBoilerplates,
    mergedBoilerplates
  };
};

export { exampleUsage }; 