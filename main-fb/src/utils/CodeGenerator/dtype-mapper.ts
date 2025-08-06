// Import the IInputVariable interface from the problem model
import { IInputVariable } from '../../models/problem.model';

// Type definitions for different programming languages
export type Language = 'cpp' | 'java' | 'python' | 'javascript';

// Java-style datatypes that can be mapped
export type JavaStyleType = 
  | 'int' 
  | 'long' 
  | 'float' 
  | 'double' 
  | 'char' 
  | 'boolean' 
  | 'String' 
  | 'int[]' 
  | 'long[]' 
  | 'float[]' 
  | 'double[]' 
  | 'char[]' 
  | 'boolean[]' 
  | 'String[]'
  | 'List<Integer>'
  | 'List<Long>'
  | 'List<Float>'
  | 'List<Double>'
  | 'List<Character>'
  | 'List<Boolean>'
  | 'List<String>'
  | 'ArrayList<Integer>'
  | 'ArrayList<Long>'
  | 'ArrayList<Float>'
  | 'ArrayList<Double>'
  | 'ArrayList<Character>'
  | 'ArrayList<Boolean>'
  | 'ArrayList<String>'
  // JavaScript-style types (for database compatibility)
  | 'number'
  | 'string'
  | 'boolean'
  | 'number[]'
  | 'string[]'
  | 'boolean[]';

// Mapped input variable interface
export interface IMappedInputVariable {
  name: string;
  type: string;
  description?: string;
  originalType: string; // Keep track of the original Java-style type
}

// Type mapping interface
interface TypeMapping {
  cpp: string;
  java: string;
  python: string;
  javascript: string;
}

// Comprehensive type mapping object
const TYPE_MAPPINGS: Record<JavaStyleType, TypeMapping> = {
  // Primitive types
  'int': {
    cpp: 'int',
    java: 'int',
    python: 'int',
    javascript: 'number'
  },
  'long': {
    cpp: 'long long',
    java: 'long',
    python: 'int',
    javascript: 'number'
  },
  'float': {
    cpp: 'float',
    java: 'float',
    python: 'float',
    javascript: 'number'
  },
  'double': {
    cpp: 'double',
    java: 'double',
    python: 'float',
    javascript: 'number'
  },
  'char': {
    cpp: 'char',
    java: 'char',
    python: 'str',
    javascript: 'string'
  },
  'boolean': {
    cpp: 'bool',
    java: 'boolean',
    python: 'bool',
    javascript: 'boolean'
  },
  'String': {
    cpp: 'string',
    java: 'String',
    python: 'str',
    javascript: 'string'
  },

  // Array types
  'int[]': {
    cpp: 'vector<int>',
    java: 'int[]',
    python: 'List[int]',
    javascript: 'number[]'
  },
  'long[]': {
    cpp: 'vector<long long>',
    java: 'long[]',
    python: 'List[int]',
    javascript: 'number[]'
  },
  'float[]': {
    cpp: 'vector<float>',
    java: 'float[]',
    python: 'List[float]',
    javascript: 'number[]'
  },
  'double[]': {
    cpp: 'vector<double>',
    java: 'double[]',
    python: 'List[float]',
    javascript: 'number[]'
  },
  'char[]': {
    cpp: 'vector<char>',
    java: 'char[]',
    python: 'List[str]',
    javascript: 'string[]'
  },
  'boolean[]': {
    cpp: 'vector<bool>',
    java: 'boolean[]',
    python: 'List[bool]',
    javascript: 'boolean[]'
  },
  'String[]': {
    cpp: 'vector<string>',
    java: 'String[]',
    python: 'List[str]',
    javascript: 'string[]'
  },

  // List types
  'List<Integer>': {
    cpp: 'vector<int>',
    java: 'List<Integer>',
    python: 'List[int]',
    javascript: 'number[]'
  },
  'List<Long>': {
    cpp: 'vector<long long>',
    java: 'List<Long>',
    python: 'List[int]',
    javascript: 'number[]'
  },
  'List<Float>': {
    cpp: 'vector<float>',
    java: 'List<Float>',
    python: 'List[float]',
    javascript: 'number[]'
  },
  'List<Double>': {
    cpp: 'vector<double>',
    java: 'List<Double>',
    python: 'List[float]',
    javascript: 'number[]'
  },
  'List<Character>': {
    cpp: 'vector<char>',
    java: 'List<Character>',
    python: 'List[str]',
    javascript: 'string[]'
  },
  'List<Boolean>': {
    cpp: 'vector<bool>',
    java: 'List<Boolean>',
    python: 'List[bool]',
    javascript: 'boolean[]'
  },
  'List<String>': {
    cpp: 'vector<string>',
    java: 'List<String>',
    python: 'List[str]',
    javascript: 'string[]'
  },

  // ArrayList types
  'ArrayList<Integer>': {
    cpp: 'vector<int>',
    java: 'ArrayList<Integer>',
    python: 'List[int]',
    javascript: 'number[]'
  },
  'ArrayList<Long>': {
    cpp: 'vector<long long>',
    java: 'ArrayList<Long>',
    python: 'List[int]',
    javascript: 'number[]'
  },
  'ArrayList<Float>': {
    cpp: 'vector<float>',
    java: 'ArrayList<Float>',
    python: 'List[float]',
    javascript: 'number[]'
  },
  'ArrayList<Double>': {
    cpp: 'vector<double>',
    java: 'ArrayList<Double>',
    python: 'List[float]',
    javascript: 'number[]'
  },
  'ArrayList<Character>': {
    cpp: 'vector<char>',
    java: 'ArrayList<Character>',
    python: 'List[str]',
    javascript: 'string[]'
  },
  'ArrayList<Boolean>': {
    cpp: 'vector<bool>',
    java: 'ArrayList<Boolean>',
    python: 'List[bool]',
    javascript: 'boolean[]'
  },
  'ArrayList<String>': {
    cpp: 'vector<string>',
    java: 'ArrayList<String>',
    python: 'List[str]',
    javascript: 'string[]'
  },
  
  // JavaScript-style types (for database compatibility)
  'number': {
    cpp: 'int',
    java: 'int',
    python: 'int',
    javascript: 'number'
  },
  'string': {
    cpp: 'string',
    java: 'String',
    python: 'str',
    javascript: 'string'
  },
  'number[]': {
    cpp: 'vector<int>',
    java: 'int[]',
    python: 'List[int]',
    javascript: 'number[]'
  },
  'string[]': {
    cpp: 'vector<string>',
    java: 'String[]',
    python: 'List[str]',
    javascript: 'string[]'
  }
};

/**
 * Maps a Java-style datatype to the corresponding type in the target language
 * @param javaType - The Java-style datatype to map
 * @param targetLanguage - The target programming language
 * @returns The corresponding datatype in the target language
 */
export function mapDataType(javaType: JavaStyleType, targetLanguage: Language): string {
  // Handle case where javaType might be a number or other type
  if (typeof javaType !== 'string') {
    // Try to convert number to string type
    if (typeof javaType === 'number') {
      const typeMap: Record<number, string> = {
        1: 'int',
        2: 'long',
        3: 'float',
        4: 'double',
        5: 'char',
        6: 'boolean',
        7: 'String',
        8: 'int[]',
        9: 'long[]',
        10: 'float[]',
        11: 'double[]',
        12: 'char[]',
        13: 'boolean[]',
        14: 'String[]'
      };
      
      const convertedType = typeMap[javaType];
      if (convertedType) {
        javaType = convertedType as JavaStyleType;
      } else {
        throw new Error(`Invalid Java-style type: ${javaType} (expected string, got ${typeof javaType})`);
      }
    } else {
      throw new Error(`Invalid Java-style type: ${javaType} (expected string, got ${typeof javaType})`);
    }
  }
  
  const mapping = TYPE_MAPPINGS[javaType];
  if (!mapping) {
    throw new Error(`Unsupported Java-style type: ${javaType}`);
  }
  return mapping[targetLanguage];
}

/**
 * Maps a list of Java-style datatypes to the corresponding types in the target language
 * @param javaTypes - Array of Java-style datatypes to map
 * @param targetLanguage - The target programming language
 * @returns Array of corresponding datatypes in the target language
 */
export function mapDataTypes(javaTypes: JavaStyleType[], targetLanguage: Language): string[] {
  return javaTypes.map(type => mapDataType(type, targetLanguage));
}

/**
 * Gets all available Java-style datatypes that can be mapped
 * @returns Array of all supported Java-style datatypes
 */
export function getAvailableJavaTypes(): JavaStyleType[] {
  return Object.keys(TYPE_MAPPINGS) as JavaStyleType[];
}

/**
 * Gets all supported target languages
 * @returns Array of supported programming languages
 */
export function getSupportedLanguages(): Language[] {
  return ['cpp', 'java', 'python', 'javascript'];
}

/**
 * Validates if a Java-style datatype is supported
 * @param javaType - The Java-style datatype to validate
 * @returns True if the type is supported, false otherwise
 */
export function isValidJavaType(javaType: string): javaType is JavaStyleType {
  return javaType in TYPE_MAPPINGS;
}

/**
 * Gets the complete type mapping for a specific Java-style datatype
 * @param javaType - The Java-style datatype
 * @returns Complete type mapping object for all supported languages
 */
export function getCompleteTypeMapping(javaType: JavaStyleType): TypeMapping {
  const mapping = TYPE_MAPPINGS[javaType];
  if (!mapping) {
    throw new Error(`Unsupported Java-style type: ${javaType}`);
  }
  return mapping;
}

/**
 * Maps a single IInputVariable to the target language
 * @param inputVariable - The input variable with Java-style type
 * @param targetLanguage - The target programming language
 * @returns The mapped input variable with the appropriate type for the target language
 */
export function mapInputVariable(inputVariable: IInputVariable, targetLanguage: Language): IMappedInputVariable {
  // Ensure type is a string
  if (typeof inputVariable.type !== 'string') {
    // Try to convert number to string type
    if (typeof inputVariable.type === 'number') {
      const typeMap: Record<number, string> = {
        1: 'int',
        2: 'long',
        3: 'float',
        4: 'double',
        5: 'char',
        6: 'boolean',
        7: 'String',
        8: 'int[]',
        9: 'long[]',
        10: 'float[]',
        11: 'double[]',
        12: 'char[]',
        13: 'boolean[]',
        14: 'String[]'
      };
      
      const convertedType = typeMap[inputVariable.type];
      if (convertedType) {
        inputVariable.type = convertedType;
      } else {
        throw new Error(`Invalid input variable type: ${inputVariable.type} (expected string, got ${typeof inputVariable.type})`);
      }
    } else {
      throw new Error(`Invalid input variable type: ${inputVariable.type} (expected string, got ${typeof inputVariable.type})`);
    }
  }
  
  const mappedType = mapDataType(inputVariable.type as JavaStyleType, targetLanguage);
  
  return {
    name: inputVariable.name,
    type: mappedType,
    description: inputVariable.description,
    originalType: inputVariable.type
  };
}

/**
 * Maps an array of IInputVariable to the target language
 * @param inputVariables - Array of input variables with Java-style types
 * @param targetLanguage - The target programming language
 * @returns Array of mapped input variables with appropriate types for the target language
 */
export function mapInputVariables(inputVariables: IInputVariable[], targetLanguage: Language): IMappedInputVariable[] {
  return inputVariables.map(inputVar => mapInputVariable(inputVar, targetLanguage));
}

/**
 * Maps input variables to all supported languages at once
 * @param inputVariables - Array of input variables with Java-style types
 * @returns Object with mapped input variables for each supported language
 */
export function mapInputVariablesToAllLanguages(inputVariables: IInputVariable[]): Record<Language, IMappedInputVariable[]> {
  const result: Record<Language, IMappedInputVariable[]> = {} as Record<Language, IMappedInputVariable[]>;
  
  for (const language of getSupportedLanguages()) {
    result[language] = mapInputVariables(inputVariables, language);
  }
  
  return result;
}

/**
 * Validates if all input variables have supported Java-style types
 * @param inputVariables - Array of input variables to validate
 * @returns Object with validation result and any unsupported types
 */
export function validateInputVariables(inputVariables: IInputVariable[]): {
  isValid: boolean;
  unsupportedTypes: string[];
} {
  const unsupportedTypes: string[] = [];
  
  for (const inputVar of inputVariables) {
    if (!isValidJavaType(inputVar.type)) {
      unsupportedTypes.push(inputVar.type);
    }
  }
  
  return {
    isValid: unsupportedTypes.length === 0,
    unsupportedTypes
  };
}

/**
 * Example usage function that demonstrates how to use the mapper
 */
export function exampleUsage(): void {
  const javaTypes: JavaStyleType[] = ['int', 'String', 'int[]', 'List<Integer>'];
  
  console.log('Mapping examples:');
  console.log('Java types:', javaTypes);
  
  for (const language of getSupportedLanguages()) {
    const mappedTypes = mapDataTypes(javaTypes, language);
    console.log(`${language}:`, mappedTypes);
  }
  
  // Example with IInputVariable interface
  const inputVariables: IInputVariable[] = [
    { name: 'nums', type: 'int[]', description: 'Array of integers' },
    { name: 'target', type: 'int', description: 'Target sum' },
    { name: 'str', type: 'String', description: 'Input string' }
  ];
  
  console.log('\nInput Variables Mapping:');
  console.log('Original:', inputVariables);
  
  const allMappings = mapInputVariablesToAllLanguages(inputVariables);
  for (const [language, mappedVars] of Object.entries(allMappings)) {
    console.log(`${language}:`, mappedVars);
  }
}
