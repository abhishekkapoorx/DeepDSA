// Export all models
export { default as User, Role } from './user.model';
export { default as Problem, Difficulty } from './problem.model';
export { default as TestCase } from './testCase.model';
export { default as Submission, SubmissionStatus } from './submission.model';
export { default as TestResult } from './testResult.model';
export { default as UserProgress } from './userProgress.model';

// Export types
export type { IUser } from './user.model';
export type { IProblem } from './problem.model';
export type { ITestCase } from './testCase.model';
export type { ISubmission } from './submission.model';
export type { ITestResult } from './testResult.model';
export type { IUserProgress } from './userProgress.model'; 