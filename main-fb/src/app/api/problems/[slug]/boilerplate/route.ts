import { NextRequest, NextResponse } from 'next/server';
import { HalfBoilerplateGenerator } from '@/utils/CodeGenerator/generate-half-boilerplate';
import { Language } from '@/utils/CodeGenerator/dtype-mapper';
import Problem from '@/models/problem.model';
import connectToDB from '@/lib/mongoose';

/**
 * GET /api/problems/[slug]/boilerplate - Get code boilerplate for a problem
 * Generates language-specific starter code based on problem's input/output variables
 * and function name. Supports cpp, java, python, and javascript.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('Boilerplate API called with slug:', slug);
    
    // Connect to database
    await connectToDB();
    console.log('Database connected successfully');
    
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') as Language;
    console.log('Language requested:', language);
    
    if (!language) {
      return NextResponse.json(
        { error: 'Language parameter is required' },
        { status: 400 }
      );
    }

    // Validate language
    const validLanguages: Language[] = ['cpp', 'java', 'python', 'javascript'];
    if (!validLanguages.includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Supported languages: cpp, java, python, javascript' },
        { status: 400 }
      );
    }

    // Find problem by slug
    console.log('Searching for problem with slug:', slug);
    const problem = await Problem.findOne({ slug });
    console.log('Problem found:', problem ? 'Yes' : 'No');
    
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Generate half boilerplate
    const generator = new HalfBoilerplateGenerator(
      problem.inputVariables,
      problem.outputVariable,
      problem.functionName
    );

    const boilerplate = generator.generateAll()[language];

    return NextResponse.json({
      success: true,
      data: {
        boilerplate,
        language,
        problemSlug: slug,
        functionName: problem.functionName
      }
    });

  } catch (error) {
    console.error('Error in boilerplate generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 