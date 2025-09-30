import { NextRequest, NextResponse } from 'next/server';
import { HalfBoilerplateGenerator } from '@/utils/CodeGenerator/generate-half-boilerplate';
import { IInputVariable, IOutputVariable } from '@/models/problem.model';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'cpp';
    
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

    // Generate boilerplate
    const generator = new HalfBoilerplateGenerator(
      testInputVariables,
      testOutputVariable,
      testFunctionName
    );

    const allBoilerplates = generator.generateAll();
    let boilerplate = '';
    
    if (language === 'cpp') {
      boilerplate = allBoilerplates.cpp;
    } else if (language === 'java') {
      boilerplate = allBoilerplates.java;
    } else if (language === 'python') {
      boilerplate = allBoilerplates.python;
    } else if (language === 'javascript') {
      boilerplate = allBoilerplates.javascript;
    } else {
      boilerplate = allBoilerplates.cpp; // default
    }

    return NextResponse.json({
      success: true,
      data: {
        boilerplate,
        language,
        functionName: testFunctionName
      }
    });

  } catch (error) {
    console.error('Error in test boilerplate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 