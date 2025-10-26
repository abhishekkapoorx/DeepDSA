export interface ExecutionFrame {
  name: string;
  line: number;
  locals: Record<string, any>;
}

export interface HeapObject {
  id: string;
  type: string;
  value: any;
  properties?: Record<string, any>;
}

export interface ExecutionState {
  frames: ExecutionFrame[];
  heap: HeapObject[];
  output: string[];
  currentLine: number;
  step: number;
}

export interface ExecutionStep {
  step: number;
  state: ExecutionState;
  description: string;
  highlightedLine: number;
}

/**
 * Execute code and generate step-by-step visualization
 * This simulates Python Tutor-like execution
 */
export function executeCode(code: string, language: string, testCase?: { input: string; output: string }): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  
  if (!code || code.trim().length === 0) {
    return [];
  }

  // Parse code into lines
  const lines = code.split('\n');
  
  // Track state
  const frames: ExecutionFrame[] = [{
    name: 'main',
    line: 0,
    locals: {}
  }];
  
  const heap: HeapObject[] = [];
  const output: string[] = [];
  let stepCounter = 0;
  let currentLine = 0;
  
  // Parse test case inputs
  const inputs = testCase ? parseInputs(testCase.input) : {};
  
  // Initialize with inputs
  Object.assign(frames[0].locals, inputs);
  
  // Create initial step
  steps.push({
    step: stepCounter++,
    state: {
      frames: JSON.parse(JSON.stringify(frames)),
      heap: JSON.parse(JSON.stringify(heap)),
      output: [...output],
      currentLine: 0,
      step: stepCounter
    },
    description: "Initial state with inputs",
    highlightedLine: 0
  });
  
  // Simulate execution line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('#')) {
      continue;
    }
    
    currentLine = i;
    
    // Process the line
    const result = processLine(line, frames[0].locals, heap, output, language);
    
    // Update frames
    frames[0].line = i;
    frames[0].locals = result.locals;
    
    // Add output if any
    if (result.output) {
      output.push(result.output);
    }
    
    // Create step
    steps.push({
      step: stepCounter++,
      state: {
        frames: JSON.parse(JSON.stringify(frames)),
        heap: JSON.parse(JSON.stringify(heap)),
        output: [...output],
        currentLine: i,
        step: stepCounter
      },
      description: result.description || `Line ${i + 1}: ${line}`,
      highlightedLine: i
    });
  }
  
  return steps;
}

interface LineResult {
  locals: Record<string, any>;
  output?: string;
  description: string;
}

function processLine(line: string, locals: Record<string, any>, heap: HeapObject[], output: string[], language: string): LineResult {
  const result: LineResult = {
    locals: { ...locals },
    description: ''
  };
  
  // Variable assignment
  if (line.includes('=')) {
    const match = line.match(/(\w+)\s*=\s*(.+)/);
    if (match) {
      const varName = match[1];
      const valueExpr = match[2].replace(/;$/, '').trim();
      
      let value = evaluateExpression(valueExpr, result.locals);
      
      // Check if it's an array/list
      if (Array.isArray(value)) {
        // Create heap object for array
        const heapId = `obj_${heap.length}`;
        const heapObj: HeapObject = {
          id: heapId,
          type: 'array',
          value: value
        };
        heap.push(heapObj);
        value = heapId; // Store reference to heap object
      }
      
      result.locals[varName] = value;
      result.description = `Assign ${varName} = ${valueExpr}`;
    }
  }
  // Print statement
  else if (line.includes('print') || line.includes('console.log') || line.includes('System.out.print')) {
    const match = line.match(/print\((.+)\)|console\.log\((.+)\)|System\.out\.print[ln]*\((.+)\)/);
    if (match) {
      const expr = match[1] || match[2] || match[3];
      const value = evaluateExpression(expr, result.locals);
      result.output = String(value);
      result.description = `Print: ${value}`;
    }
  }
  // Return statement
  else if (line.includes('return')) {
    const match = line.match(/return\s+(.+)/);
    if (match) {
      const expr = match[1].replace(/;$/, '').trim();
      const value = evaluateExpression(expr, result.locals);
      result.locals['__return__'] = value;
      result.description = `Return ${value}`;
    }
  }
  // Increment/decrement
  else if (line.includes('++') || line.includes('--')) {
    const match = line.match(/(\w+)\s*([+-]{2})/);
    if (match) {
      const varName = match[1];
      const op = match[2];
      if (result.locals[varName] !== undefined) {
        result.locals[varName] = op === '++' 
          ? result.locals[varName] + 1
          : result.locals[varName] - 1;
        result.description = `${op === '++' ? 'Increment' : 'Decrement'} ${varName}`;
      }
    }
  }
  else {
    result.description = `Execute: ${line}`;
  }
  
  return result;
}

function evaluateExpression(expr: string, locals: Record<string, any>): any {
  expr = expr.trim();
  
  // Try to evaluate as an existing variable
  if (locals[expr] !== undefined) {
    return locals[expr];
  }
  
  // Try to parse as array literal
  if (expr.startsWith('[') && expr.endsWith(']')) {
    const content = expr.slice(1, -1);
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
  
  // Try to parse as number
  if (/^-?\d+$/.test(expr)) {
    return parseInt(expr);
  }
  
  // Try to parse as boolean
  if (expr === 'true' || expr === 'false') {
    return expr === 'true';
  }
  
  // Try to parse as string
  if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
    return expr.slice(1, -1);
  }
  
  // Try simple arithmetic
  if (expr.includes('+')) {
    const parts = expr.split('+').map(p => p.trim());
    return parts.reduce((sum, part) => sum + (parseInt(part) || 0), 0);
  }
  
  return expr;
}

function parseInputs(input: string): Record<string, any> {
  try {
    // Try JSON
    const parsed = JSON.parse(input);
    return parsed;
  } catch {
    // Try space-separated
    const parts = input.trim().split(/\s+/);
    const result: Record<string, any> = {};
    parts.forEach((part, index) => {
      result[`param${index + 1}`] = parseValue(part);
    });
    return result;
  }
}

function parseValue(value: string): any {
  if (value.startsWith('[') && value.endsWith(']')) {
    return JSON.parse(value);
  }
  if (/^-?\d+$/.test(value)) {
    return parseInt(value);
  }
  if (value === 'true' || value === 'false') {
    return value === 'true';
  }
  return value;
}

