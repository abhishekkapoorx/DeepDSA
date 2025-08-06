import { NextRequest, NextResponse } from 'next/server';
import { HalfBoilerplateGenerator } from '@/utils/CodeGenerator/generate-half-boilerplate';
import { Language } from '@/utils/CodeGenerator/dtype-mapper';
import Problem from '@/models/problem.model';
import connectToDB from '@/lib/mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('Boilerplate API called with slug:', params.slug);
    
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
    console.log('Searching for problem with slug:', params.slug);
    const problem = await Problem.findOne({ slug: params.slug });
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
        problemSlug: params.slug,
        functionName: problem.functionName
      }
    });

  } catch (error) {
    console.error('Error generating boilerplate:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 