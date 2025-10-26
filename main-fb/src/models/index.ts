// Export all models
export { default as User, Role } from './user.model';
export { default as Problem, Difficulty, generateSlug } from './problem.model';
export { default as Editorial } from './editorial.model';
export { default as TestCase } from './testCase.model';
export { default as Submission, SubmissionStatus } from './submission.model';
export { default as TestResult } from './testResult.model';
export { default as UserProgress } from './userProgress.model';
export { default as Interview } from './interview.model';
export { default as Solution } from './solution.model';
export { Discussion } from './discussion.model';
export { Comment } from './comment.model';
export { Vote } from './vote.model';
export { VoteType } from './vote.model';
export { Contest } from './contest.model';
export { ContestTemplate } from './contestTemplate.model';

// Export types
export type { IUser } from './user.model';
export type { IProblem, IInputVariable, IOutputVariable } from './problem.model';
export type { IEditorial, IApproach, ICodeSolution } from './editorial.model';
export type { ITestCase } from './testCase.model';
export type { ISubmission } from './submission.model';
export type { ITestResult } from './testResult.model';
export type { IUserProgress } from './userProgress.model'; 
export type { IInterview, IInterviewMessage, IInterviewScoreBreakdown } from './interview.model';
export type { ISolution } from './solution.model';
export type { IDiscussion } from './discussion.model';
export type { IComment } from './comment.model';
export type { IVote } from './vote.model';
export type { IContest, IContestProblem, IContestRegistration } from './contest.model';
export type { IContestTemplate } from './contestTemplate.model';