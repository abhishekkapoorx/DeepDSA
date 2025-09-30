export enum ApproachType {
  BRUTE_FORCE = "BRUTE_FORCE",
  OPTIMIZED = "OPTIMIZED",
  GREEDY = "GREEDY",
  DYNAMIC_PROGRAMMING = "DYNAMIC_PROGRAMMING",
  TWO_POINTERS = "TWO_POINTERS",
  SLIDING_WINDOW = "SLIDING_WINDOW",
  BINARY_SEARCH = "BINARY_SEARCH",
  GRAPH = "GRAPH",
  TREE = "TREE",
  BACKTRACKING = "BACKTRACKING",
  OTHER = "OTHER",
}

export interface ICodeSolutionLite {
  language: string;
  code: string;
  explanation?: string;
}

export interface IApproachLite {
  type: ApproachType;
  title: string;
  description: string;
  algorithm: string;
  codeSolutions: ICodeSolutionLite[];
  timeComplexity: string;
  spaceComplexity: string;
  pros?: string[];
  cons?: string[];
}

