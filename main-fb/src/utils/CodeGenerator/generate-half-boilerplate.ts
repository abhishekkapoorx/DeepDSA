import { IInputVariable, IOutputVariable } from '../../models/problem.model';
import { mapInputVariables, mapDataType, Language, JavaStyleType } from './dtype-mapper';

class HalfBoilerplateGenerator {
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

  generateAll(): Record<Language, string> {
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
    
    return `class Solution {
public:
    ${mappedOutputType} ${this.functionName}(${mappedInputs.map(input => `${input.type} ${input.name}`).join(', ')}) {
        // TODO: Implement your solution here
        
        return result;
    }
};`;
  }

  generatePython(): string {
    const mappedInputs = mapInputVariables(this.inputVariables, 'python');
    
    return `class Solution:
    def ${this.functionName}(self, ${mappedInputs.map(input => input.name).join(', ')}):
        # TODO: Implement your solution here
        
        return result`;
  }

  generateJava(): string {
    const mappedInputs = mapInputVariables(this.inputVariables, 'java');
    const mappedOutputType = mapDataType(this.outputVariable.type as JavaStyleType, 'java');
    
    return `class Solution {
    public ${mappedOutputType} ${this.functionName}(${mappedInputs.map(input => `${input.type} ${input.name}`).join(', ')}) {
        // TODO: Implement your solution here
        
        return result;
    }
}`;
  }

  generateJavaScript(): string {
    const mappedInputs = mapInputVariables(this.inputVariables, 'javascript');
    
    return `/**
 * @param {${mappedInputs.map(input => input.type).join(', ')}} ${mappedInputs.map(input => input.name).join(', ')}
 * @return {${mapDataType(this.outputVariable.type as JavaStyleType, 'javascript')}}
 */
var ${this.functionName} = function(${mappedInputs.map(input => input.name).join(', ')}) {
    // TODO: Implement your solution here
    
    return result;
};`;
  }
}

// Legacy function for backward compatibility
const generateHalfBoilerplate = (
  inputVariables: IInputVariable[], 
  outputVariable: IOutputVariable, 
  functionName: string
) => {
  const generator = new HalfBoilerplateGenerator(inputVariables, outputVariable, functionName);
  return generator.generateAll();
};

const generateCPPBoilerplate = (
  inputVariables: IInputVariable[], 
  outputVariable: IOutputVariable, 
  functionName: string
) => {
  const generator = new HalfBoilerplateGenerator(inputVariables, outputVariable, functionName);
  return generator.generateCPP();
};

const generatePythonBoilerplate = (
  inputVariables: IInputVariable[], 
  outputVariable: IOutputVariable, 
  functionName: string
) => {
  const generator = new HalfBoilerplateGenerator(inputVariables, outputVariable, functionName);
  return generator.generatePython();
};

const generateJavaBoilerplate = (
  inputVariables: IInputVariable[], 
  outputVariable: IOutputVariable, 
  functionName: string
) => {
  const generator = new HalfBoilerplateGenerator(inputVariables, outputVariable, functionName);
  return generator.generateJava();
};

const generateJavaScriptBoilerplate = (
  inputVariables: IInputVariable[], 
  outputVariable: IOutputVariable, 
  functionName: string
) => {
  const generator = new HalfBoilerplateGenerator(inputVariables, outputVariable, functionName);
  return generator.generateJavaScript();
};

export { 
  HalfBoilerplateGenerator,
  generateHalfBoilerplate, 
  generateCPPBoilerplate, 
  generatePythonBoilerplate, 
  generateJavaBoilerplate,
  generateJavaScriptBoilerplate 
};
