import { IInputVariable, IOutputVariable } from '../../models/problem.model';
import { mapInputVariables, mapDataType, JavaStyleType } from './dtype-mapper';

// Placeholder constant that can be replaced at runtime
export const HALF_BOILERPLATE_PLACEHOLDER = '{{HALF_BOILERPLATE}}';

class FullBoilerplateGenerator {
  private inputVariables: IInputVariable[];
  private outputVariable: IOutputVariable;
  private functionName: string;

  constructor(
    inputVariables: IInputVariable[], 
    outputVariable: IOutputVariable, 
    functionName: string
  ) {
    this.inputVariables = inputVariables;
    this.outputVariable = outputVariable;
    this.functionName = functionName;
  }

  generateAll(): Record<string, string> {
    return {
      cpp: this.generateCPP(),
      python: this.generatePython(),
      java: this.generateJava(),
      javascript: this.generateJavaScript()
    };
  }

  generateCPP(): string {
    const mappedInputs = mapInputVariables(this.inputVariables, 'cpp');
    const mappedOutputType = mapDataType(this.outputVariable.type as JavaStyleType, 'cpp');
    
    const inputReadingCode = mappedInputs.map(input => {
      if (input.type.includes('vector')) {
        return `    // Read ${input.name} (${input.originalType})
    int ${input.name}_size;
    cin >> ${input.name}_size;
    ${input.type} ${input.name}(${input.name}_size);
    for (int i = 0; i < ${input.name}_size; i++) {
        cin >> ${input.name}[i];
    }`;
      } else if (input.type === 'string') {
        return `    string ${input.name};
    cin >> ${input.name};`;
      } else if (input.type === 'char') {
        return `    char ${input.name};
    cin >> ${input.name};`;
      } else {
        return `    ${input.type} ${input.name};
    cin >> ${input.name};`;
      }
    }).join('\n\n');

    return `#include <bits/stdc++.h>
using namespace std;

${HALF_BOILERPLATE_PLACEHOLDER}

int main() {
${inputReadingCode}

    Solution solution;
    ${mappedOutputType} result = solution.${this.functionName}(${mappedInputs.map(input => input.name).join(', ')});
    cout << result << endl;
    
    return 0;
}`;
  }

  generateJava(): string {
    const mappedInputs = mapInputVariables(this.inputVariables, 'java');
    const mappedOutputType = mapDataType(this.outputVariable.type as JavaStyleType, 'java');
    
    const inputReadingCode = mappedInputs.map((input, index) => {
      const isLastInput = index === mappedInputs.length - 1;
      
      if (input.type.includes('[]')) {
        return `        // Read ${input.name} (${input.originalType})
        String ${input.name}_line = scanner.nextLine().trim();
        // Remove brackets and split by comma
        ${input.name}_line = ${input.name}_line.substring(1, ${input.name}_line.length() - 1);
        String[] ${input.name}_parts = ${input.name}_line.split(",");
        ${input.type} ${input.name} = new ${input.type.replace('[]', '[').replace('[', '[')}${input.name}_parts.length];
        for (int i = 0; i < ${input.name}_parts.length; i++) {
            ${input.name}[i] = Integer.parseInt(${input.name}_parts[i].trim());
        }`;
      } else if (input.type === 'String') {
        return `        String ${input.name} = scanner.nextLine();`;
      } else if (input.type === 'char') {
        return `        char ${input.name} = scanner.next().charAt(0);`;
      } else if (input.type === 'boolean') {
        return `        boolean ${input.name} = scanner.nextBoolean();`;
      } else if (input.type === 'int') {
        return `        int ${input.name} = scanner.nextInt();`;
      } else if (input.type === 'long') {
        return `        long ${input.name} = scanner.nextLong();`;
      } else if (input.type === 'double') {
        return `        double ${input.name} = scanner.nextDouble();`;
      } else {
        return `        ${input.type} ${input.name} = scanner.nextInt();`;
      }
    }).join('\n\n');

    // Helper method for formatting List<List<Integer>> output
    const outputFormatter = this.outputVariable.type.includes('[][]') || this.outputVariable.type.includes('List') ? `
    // Helper method to format List<List<Integer>> output without spaces
    private static String formatListList(List<List<Integer>> list) {
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(list.get(i));
        }
        sb.append(']');
        String result = sb.toString();
        // Remove spaces
        return result.replaceAll(" ", "");
    }` : '';

    return `import java.util.*;

${HALF_BOILERPLATE_PLACEHOLDER}

class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
${inputReadingCode}
        
        Solution solution = new Solution();
        ${mappedOutputType} result = solution.${this.functionName}(${mappedInputs.map(input => input.name).join(', ')});
        ${this.outputVariable.type.includes('List<List<Integer>>') ? 'System.out.println(formatListList(result));' : 'System.out.println(result);'}
        
        scanner.close();
    }${outputFormatter}
}`;
  }

  generatePython(): string {
    const mappedInputs = mapInputVariables(this.inputVariables, 'python');
    
    // If there are multiple inputs, read them all from one line
    if (mappedInputs.length > 1) {
      const inputReadingCode = `# Read all input values from one line
input_values = input().strip().split()
${mappedInputs.map((input, index) => {
        if (input.type.includes('List')) {
          return `${input.name} = list(map(int, input_values[${index}].split()))`;
        } else if (input.type === 'str') {
          return `${input.name} = input_values[${index}]`;
        } else {
          return `${input.name} = ${input.type}(input_values[${index}])`;
        }
      }).join('\n')}`;

      return `${HALF_BOILERPLATE_PLACEHOLDER}

${inputReadingCode}

# Create solution instance and call method
solution = Solution()
result = solution.${this.functionName}(${mappedInputs.map(input => input.name).join(', ')})
print(result)`;
    } else {
      // Single input - read normally
      const inputReadingCode = mappedInputs.map(input => {
        if (input.type.includes('List')) {
          return `# Read ${input.name} (${input.originalType})
${input.name} = list(map(int, input().split()))`;
        } else if (input.type === 'str') {
          return `${input.name} = input()`;
        } else {
          return `${input.name} = ${input.type}(input().strip())`;
        }
      }).join('\n');

      return `${HALF_BOILERPLATE_PLACEHOLDER}

# Read input
${inputReadingCode}

# Create solution instance and call method
solution = Solution()
result = solution.${this.functionName}(${mappedInputs.map(input => input.name).join(', ')})
print(result)`;
    }
  }

  generateJavaScript(): string {
    const mappedInputs = mapInputVariables(this.inputVariables, 'javascript');
    
    // If there are multiple inputs, read them all from one line
    if (mappedInputs.length > 1) {
      const inputReadingCode = `// Read all input values from one line
const fs = require('fs');
const inputLine = fs.readFileSync(0, 'utf8').trim();
const inputValues = inputLine.split(' ');

${mappedInputs.map((input, index) => {
        if (input.type.includes('[]')) {
          return `const ${input.name} = inputValues[${index}].split(' ').map(x => parseInt(x));`;
        } else if (input.type === 'string') {
          return `const ${input.name} = inputValues[${index}];`;
        } else {
          return `const ${input.name} = parseInt(inputValues[${index}]);`;
        }
      }).join('\n')}`;

      return `${HALF_BOILERPLATE_PLACEHOLDER}

${inputReadingCode}

// Call function and print result
const result = ${this.functionName}(${mappedInputs.map(input => input.name).join(', ')});
console.log(result);`;
    } else {
      // Single input - use the original approach
      const inputSetup = `// Read all input at once
const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim().split('\\n');
let inputIndex = 0;

// Helper function to read next line
function readline() {
    return input[inputIndex++];
}`;

      const inputReadingCodeWithHelpers = mappedInputs.map(input => {
        if (input.type.includes('[]')) {
          return `// Read ${input.name} (${input.originalType})
const ${input.name} = readline().split(' ').map(x => parseInt(x));`;
        } else if (input.type === 'string') {
          return `const ${input.name} = readline();`;
        } else {
          return `const ${input.name} = parseInt(readline());`;
        }
      }).join('\n');

      return `${HALF_BOILERPLATE_PLACEHOLDER}

${inputSetup}

// Read input
${inputReadingCodeWithHelpers}

// Call function and print result
const result = ${this.functionName}(${mappedInputs.map(input => input.name).join(', ')});
console.log(result);`;
    }
  }
}

/**
 * Merges half boilerplate code into full boilerplate code by replacing the placeholder
 * @param fullBoilerplate - The full boilerplate code with placeholder
 * @param halfBoilerplate - The half boilerplate code to insert
 * @returns The merged code
 */
export function mergeBoilerplateCode(fullBoilerplate: string, halfBoilerplate: string): string {
  return fullBoilerplate.replace(HALF_BOILERPLATE_PLACEHOLDER, halfBoilerplate);
}

/**
 * Merges half boilerplate code into full boilerplate code for all languages
 * @param fullBoilerplates - Object containing full boilerplate code for each language
 * @param halfBoilerplates - Object containing half boilerplate code for each language
 * @returns Object containing merged code for each language
 */
export function mergeAllBoilerplateCode(
  fullBoilerplates: Record<string, string>, 
  halfBoilerplates: Record<string, string>
): Record<string, string> {
  const merged: Record<string, string> = {};
  
  for (const language in fullBoilerplates) {
    if (halfBoilerplates[language]) {
      merged[language] = mergeBoilerplateCode(fullBoilerplates[language], halfBoilerplates[language]);
    }
  }
  
  return merged;
}

// Legacy function for backward compatibility
const generateFullBoilerplate = (
  inputVariables: IInputVariable[], 
  outputVariable: IOutputVariable, 
  functionName: string,
  halfBoilerplate: string,
  language: 'cpp' | 'java' | 'python' | 'javascript'
) => {
  const generator = new FullBoilerplateGenerator(inputVariables, outputVariable, functionName);
  const fullBoilerplate = generator.generateAll()[language];
  return mergeBoilerplateCode(fullBoilerplate, halfBoilerplate);
};

const generateCPPFullBoilerplate = (
  inputVariables: IInputVariable[], 
  outputVariable: IOutputVariable, 
  functionName: string,
  halfBoilerplate: string
) => {
  const generator = new FullBoilerplateGenerator(inputVariables, outputVariable, functionName);
  const fullBoilerplate = generator.generateCPP();
  return mergeBoilerplateCode(fullBoilerplate, halfBoilerplate);
};

const generateJavaFullBoilerplate = (
  inputVariables: IInputVariable[], 
  outputVariable: IOutputVariable, 
  functionName: string,
  halfBoilerplate: string
) => {
  const generator = new FullBoilerplateGenerator(inputVariables, outputVariable, functionName);
  const fullBoilerplate = generator.generateJava();
  return mergeBoilerplateCode(fullBoilerplate, halfBoilerplate);
};

const generatePythonFullBoilerplate = (
  inputVariables: IInputVariable[], 
  outputVariable: IOutputVariable, 
  functionName: string,
  halfBoilerplate: string
) => {
  const generator = new FullBoilerplateGenerator(inputVariables, outputVariable, functionName);
  const fullBoilerplate = generator.generatePython();
  return mergeBoilerplateCode(fullBoilerplate, halfBoilerplate);
};

const generateJavaScriptFullBoilerplate = (
  inputVariables: IInputVariable[], 
  outputVariable: IOutputVariable, 
  functionName: string,
  halfBoilerplate: string
) => {
  const generator = new FullBoilerplateGenerator(inputVariables, outputVariable, functionName);
  const fullBoilerplate = generator.generateJavaScript();
  return mergeBoilerplateCode(fullBoilerplate, halfBoilerplate);
};

export { 
  FullBoilerplateGenerator,
  generateFullBoilerplate,
  generateCPPFullBoilerplate,
  generateJavaFullBoilerplate,
  generatePythonFullBoilerplate,
  generateJavaScriptFullBoilerplate
};