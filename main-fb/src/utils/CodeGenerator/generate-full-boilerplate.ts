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
    
    const inputReadingCode = mappedInputs.map(input => {
      if (input.type.includes('[]')) {
        return `        // Read ${input.name} (${input.originalType})
        int ${input.name}_size = scanner.nextInt();
        ${input.type} ${input.name} = new ${input.type.replace('[]', '[').replace('[', '[')}${input.name}_size];
        for (int i = 0; i < ${input.name}_size; i++) {
            ${input.name}[i] = scanner.next${input.type.replace('[]', '').charAt(0).toUpperCase() + input.type.replace('[]', '').slice(1)}();
        }`;
      } else if (input.type === 'String') {
        return `        String ${input.name} = scanner.nextLine();`;
      } else if (input.type === 'char') {
        return `        char ${input.name} = scanner.next().charAt(0);`;
      } else {
        return `        ${input.type} ${input.name} = scanner.next${input.type.charAt(0).toUpperCase() + input.type.slice(1)}();`;
      }
    }).join('\n\n');

    return `import java.util.*;

${HALF_BOILERPLATE_PLACEHOLDER}

class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
${inputReadingCode}
        
        Solution solution = new Solution();
        ${mappedOutputType} result = solution.${this.functionName}(${mappedInputs.map(input => input.name).join(', ')});
        System.out.println(result);
        
        scanner.close();
    }
}`;
  }

  generatePython(): string {
    const mappedInputs = mapInputVariables(this.inputVariables, 'python');
    
    const inputReadingCode = mappedInputs.map(input => {
      if (input.type.includes('List')) {
        return `# Read ${input.name} (${input.originalType})
${input.name} = list(map(int, input().split()))`;
      } else if (input.type === 'str') {
        return `${input.name} = input()`;
      } else {
        return `${input.name} = ${input.type}(input())`;
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

  generateJavaScript(): string {
    const mappedInputs = mapInputVariables(this.inputVariables, 'javascript');
    
    const inputReadingCode = mappedInputs.map(input => {
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

// Read input
${inputReadingCode}

// Call function and print result
const result = ${this.functionName}(${mappedInputs.map(input => input.name).join(', ')});
print(result);`;
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
