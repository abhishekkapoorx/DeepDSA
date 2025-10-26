export interface VisualizationStep {
  step: number;
  description: string;
  code: string;
  variables: Record<string, any>;
  highlightedLines?: number[];
  visualizationType?: 'array' | 'stack' | 'queue' | 'linkedlist' | 'pointer' | 'standard';
  visualData?: any; // Enhanced visual representation data
}

/**
 * Parses code and generates visualization steps
 * This is a simplified parser that identifies basic patterns
 */
export function parseCode(code: string, language: string, testCase?: { input: string; output: string }): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  
  if (!code || code.trim().length === 0) {
    return steps;
  }

  // Extract just the function logic (remove boilerplate)
  const cleanCode = extractFunctionBody(code, language);
  
  // Identify variables and their types
  const variables = identifyVariables(cleanCode, language);
  
  // Generate visualization steps based on code structure
  const codeLines = cleanCode.split('\n').filter(line => line.trim());
  
  if (codeLines.length === 0) {
    return [{
      step: 1,
      description: "Empty function body",
      code: cleanCode,
      variables: {},
      visualizationType: 'standard'
    }];
  }

  // Parse test case if provided
  const testData = testCase ? parseTestCase(testCase.input) : null;
  
  // Create a step for each significant line of code
  let stepCounter = 1;
  const trackedVariables: Record<string, any> = {};
  
  // Initialize with test case data if available
  if (testData) {
    Object.assign(trackedVariables, testData);
  }
  
  for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('//') || line.startsWith('/*')) {
      continue;
    }

    const step = createStepFromLine(line, i, stepCounter++, trackedVariables, language, testData);
    if (step) {
      steps.push(step);
    }
  }

  // If no meaningful steps were created, create a default one
  if (steps.length === 0) {
    steps.push({
      step: 1,
      description: "Analyzing code structure",
      code: cleanCode,
      variables: {},
      visualizationType: 'standard'
    });
  }

  return steps;
}

/**
 * Parse test case input into usable data
 */
function parseTestCase(input: string): Record<string, any> | null {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(input);
    return parsed;
  } catch {
    // Try to parse space-separated values
    const parts = input.trim().split(/\s+/);
    if (parts.length > 0) {
      const result: Record<string, any> = {};
      parts.forEach((part, index) => {
        result[`param${index + 1}`] = parseValue(part);
      });
      return result;
    }
  }
  return null;
}

/**
 * Parse a single value from string
 */
function parseValue(value: string): any {
  // Try array
  if (value.startsWith('[') && value.endsWith(']')) {
    return JSON.parse(value);
  }
  // Try number
  if (/^-?\d+$/.test(value)) {
    return parseInt(value);
  }
  // Try boolean
  if (value === 'true' || value === 'false') {
    return value === 'true';
  }
  // Return as string
  return value;
}

/**
 * Extracts the function body from boilerplate code
 */
function extractFunctionBody(code: string, language: string): string {
  // Try to find the main function body
  const patterns = {
    java: /(?:public|private|protected)?\s*(?:static)?\s*\w+\s+\w+\s*\([^)]*\)\s*\{([\s\S]*)\}\s*$/,
    python: /def\s+\w+\s*\([^)]*\):([\s\S]*)$/,
    javascript: /(?:function\s+\w+\s*\([^)]*\)|const\s+\w+\s*=\s*\([^)]*\)\s*=>)\s*\{([\s\S]*)\}\s*$/,
    cpp: /(?:int|void|string|vector<.*>)\s+\w+\s*\([^)]*\)\s*\{([\s\S]*)\}\s*$/
  };

  const pattern = patterns[language as keyof typeof patterns] || patterns.java;
  const match = code.match(pattern);
  
  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback: return everything after the first brace or colon
  const braceIndex = code.indexOf('{');
  const colonIndex = code.indexOf(':');
  
  if (braceIndex !== -1) {
    return code.substring(braceIndex + 1, code.lastIndexOf('}')).trim();
  }
  
  if (colonIndex !== -1) {
    return code.substring(colonIndex + 1).trim();
  }

  return code;
}

/**
 * Identifies variables in the code
 */
function identifyVariables(code: string, language: string): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Match variable declarations
  const patterns = {
    java: /(?:int|String|boolean|double|float|long|short|byte|char|var)\s+(\w+)\s*(?:=\s*([^;]+))?/g,
    python: /(\w+)\s*=\s*([^\n]+)/g,
    javascript: /(?:let|const|var)\s+(\w+)\s*(?:=\s*([^;]+))?/g,
    cpp: /(?:int|string|bool|double|float|long|char|auto)\s+(\w+)\s*(?:=\s*([^;]+))?/g
  };

  const pattern = patterns[language as keyof typeof patterns] || patterns.java;
  let match;
  
  while ((match = pattern.exec(code)) !== null) {
    const varName = match[1];
    const value = match[2] ? match[2].trim() : undefined;
    variables[varName] = inferType(value, language);
  }

  return variables;
}

/**
 * Infers the type/value of a variable
 */
function inferType(value: string | undefined, language: string): string {
  if (!value) return 'unknown';
  
  // Remove quotes for strings
  if (value.startsWith('"') || value.startsWith("'")) {
    return 'string';
  }
  
  // Check for numbers
  if (/^\d+$/.test(value)) {
    return 'number';
  }
  
  // Check for arrays
  if (value.startsWith('[') || value.startsWith('{')) {
    return 'array';
  }
  
  return 'unknown';
}

/**
 * Creates a visualization step from a line of code
 */
function createStepFromLine(
  line: string, 
  lineIndex: number, 
  stepNumber: number,
  trackedVariables: Record<string, any>,
  language: string,
  testData?: Record<string, any> | null
): VisualizationStep | null {
  
  let description = '';
  let codeSnippet = line;
  let vizType: 'array' | 'stack' | 'queue' | 'linkedlist' | 'pointer' | 'standard' = 'standard';
  let visualData: any = {};
  
  // Detect patterns and create descriptions
  if (line.includes('=')) {
    // Variable assignment
    const match = line.match(/(\w+)\s*=\s*(.+)/);
    if (match) {
      const varName = match[1];
      const value = match[2].replace(/;$/, '').trim();
      
      // Try to parse the value
      let parsedValue: any = value;
      
      // Array initialization
      if (value.startsWith('[') || value.startsWith('new')) {
        parsedValue = parseArrayValue(value);
        if (Array.isArray(parsedValue)) {
          vizType = 'array';
          visualData = {
            arrayData: parsedValue,
            pointerIndices: detectPointers(trackedVariables, parsedValue.length)
          };
        }
      }
      // Number
      else if (/^\d+$/.test(value)) {
        parsedValue = parseInt(value);
      }
      // Boolean
      else if (value === 'true' || value === 'false') {
        parsedValue = value === 'true';
      }
      
      trackedVariables[varName] = parsedValue;
      
      description = `Assign ${varName} = ${value}`;
      codeSnippet = line;
    }
  } else if (line.includes('return')) {
    description = 'Return the result';
    codeSnippet = line;
  } else if (line.includes('if')) {
    description = 'Check condition';
    codeSnippet = line;
  } else if (line.includes('for') || line.includes('while')) {
    description = 'Loop iteration';
    codeSnippet = line;
    
    // Detect array iteration
    const arrayVar = detectArrayVariable(line, trackedVariables);
    if (arrayVar) {
      vizType = 'array';
      visualData = {
        arrayData: trackedVariables[arrayVar],
        pointerIndices: detectPointers(trackedVariables, trackedVariables[arrayVar]?.length || 0)
      };
    }
  } else if (line.includes('++') || line.includes('--')) {
    description = 'Increment/decrement variable';
    codeSnippet = line;
    // Try to track variable changes
    const match = line.match(/(\w+)\s*(.)/);
    if (match) {
      const varName = match[1];
      const op = match[2];
      if (trackedVariables[varName] !== undefined) {
        trackedVariables[varName] = op === '+' 
          ? (trackedVariables[varName] + 1)
          : (trackedVariables[varName] - 1);
      }
    }
  } else {
    description = 'Execute statement';
    codeSnippet = line;
  }

  // Detect visualization type from variables
  if (vizType === 'standard') {
    const arrayVars = Object.entries(trackedVariables).filter(([_, val]) => Array.isArray(val));
    if (arrayVars.length > 0) {
      vizType = 'array';
      const [name, arr] = arrayVars[0];
      visualData = {
        arrayData: arr,
        pointerIndices: detectPointers(trackedVariables, arr.length)
      };
    }
  }

  return {
    step: stepNumber,
    description,
    code: codeSnippet,
    variables: { ...trackedVariables },
    highlightedLines: [lineIndex],
    visualizationType: vizType,
    visualData
  };
}

/**
 * Detect array variables in tracked variables
 */
function detectArrayVariable(line: string, trackedVariables: Record<string, any>): string | null {
  for (const [name, value] of Object.entries(trackedVariables)) {
    if (Array.isArray(value) && line.includes(name)) {
      return name;
    }
  }
  return null;
}

/**
 * Detect pointer indices from variable names
 */
function detectPointers(trackedVariables: Record<string, any>, arrayLength: number): Record<string, number> {
  const pointers: Record<string, number> = {};
  
  // Common pointer names
  const pointerNames = ['i', 'j', 'k', 'left', 'right', 'start', 'end', 'low', 'high', 'p1', 'p2'];
  
  for (const name of pointerNames) {
    if (trackedVariables[name] !== undefined && typeof trackedVariables[name] === 'number') {
      const val = trackedVariables[name];
      if (val >= 0 && val < arrayLength) {
        pointers[name] = val;
      }
    }
  }
  
  return pointers;
}

/**
 * Parses array values from code
 */
function parseArrayValue(value: string): any[] {
  // Handle array literals like [1, 2, 3]
  const arrayMatch = value.match(/\[([^\]]*)\]/);
  if (arrayMatch) {
    const content = arrayMatch[1];
    if (!content.trim()) return [];
    
    return content.split(',').map(item => {
      const trimmed = item.trim();
      if (/^\d+$/.test(trimmed)) return parseInt(trimmed);
      if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
        return trimmed.slice(1, -1);
      }
      return trimmed;
    });
  }
  
  // Handle new array declarations (provide default values)
  if (value.includes('new')) {
    return [];
  }
  
  return [];
}

/**
 * Example test case visualization
 */
export function generateExampleVisualization(problemTitle: string): VisualizationStep[] {
  // This is a fallback for when code parsing isn't sufficient
  return [{
    step: 1,
    description: "Code visualization will appear here as you type",
    code: "// Start implementing your solution",
    variables: {}
  }];
}

