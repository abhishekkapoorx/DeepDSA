// Predefined tags for discussions
export const DISCUSSION_TAGS = {
  // Problem Categories
  ARRAYS: 'arrays',
  STRINGS: 'strings',
  LINKED_LISTS: 'linked-lists',
  TREES: 'trees',
  GRAPHS: 'graphs',
  DYNAMIC_PROGRAMMING: 'dynamic-programming',
  GREEDY: 'greedy',
  BACKTRACKING: 'backtracking',
  SORTING: 'sorting',
  SEARCHING: 'searching',
  MATH: 'math',
  BIT_MANIPULATION: 'bit-manipulation',
  
  // Difficulty Levels
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  
  // Discussion Types
  SOLUTION: 'solution',
  HINT: 'hint',
  OPTIMIZATION: 'optimization',
  TIME_COMPLEXITY: 'time-complexity',
  SPACE_COMPLEXITY: 'space-complexity',
  EDGE_CASES: 'edge-cases',
  TEST_CASES: 'test-cases',
  
  // General Topics
  ALGORITHM: 'algorithm',
  DATA_STRUCTURES: 'data-structures',
  INTERVIEW: 'interview',
  COMPANY: 'company',
  LEARNING: 'learning',
  RESOURCES: 'resources',
  STUDY_TIPS: 'study-tips',
  
  // Programming Languages
  CPP: 'cpp',
  JAVA: 'java',
  PYTHON: 'python',
  JAVASCRIPT: 'javascript',
  
  // Companies
  GOOGLE: 'google',
  AMAZON: 'amazon',
  MICROSOFT: 'microsoft',
  FACEBOOK: 'facebook',
  APPLE: 'apple',
  NETFLIX: 'netflix',
  UBER: 'uber',
  AIRBNB: 'airbnb'
} as const;

// Tag categories for better organization
export const TAG_CATEGORIES = {
  PROBLEM_CATEGORIES: {
    label: 'Problem Categories',
    tags: [
      DISCUSSION_TAGS.ARRAYS,
      DISCUSSION_TAGS.STRINGS,
      DISCUSSION_TAGS.LINKED_LISTS,
      DISCUSSION_TAGS.TREES,
      DISCUSSION_TAGS.GRAPHS,
      DISCUSSION_TAGS.DYNAMIC_PROGRAMMING,
      DISCUSSION_TAGS.GREEDY,
      DISCUSSION_TAGS.BACKTRACKING,
      DISCUSSION_TAGS.SORTING,
      DISCUSSION_TAGS.SEARCHING,
      DISCUSSION_TAGS.MATH,
      DISCUSSION_TAGS.BIT_MANIPULATION
    ]
  },
  DIFFICULTY: {
    label: 'Difficulty',
    tags: [
      DISCUSSION_TAGS.EASY,
      DISCUSSION_TAGS.MEDIUM,
      DISCUSSION_TAGS.HARD
    ]
  },
  DISCUSSION_TYPES: {
    label: 'Discussion Types',
    tags: [
      DISCUSSION_TAGS.SOLUTION,
      DISCUSSION_TAGS.HINT,
      DISCUSSION_TAGS.OPTIMIZATION,
      DISCUSSION_TAGS.TIME_COMPLEXITY,
      DISCUSSION_TAGS.SPACE_COMPLEXITY,
      DISCUSSION_TAGS.EDGE_CASES,
      DISCUSSION_TAGS.TEST_CASES
    ]
  },
  GENERAL: {
    label: 'General Topics',
    tags: [
      DISCUSSION_TAGS.ALGORITHM,
      DISCUSSION_TAGS.DATA_STRUCTURES,
      DISCUSSION_TAGS.INTERVIEW,
      DISCUSSION_TAGS.COMPANY,
      DISCUSSION_TAGS.LEARNING,
      DISCUSSION_TAGS.RESOURCES,
      DISCUSSION_TAGS.STUDY_TIPS
    ]
  },
  LANGUAGES: {
    label: 'Programming Languages',
    tags: [
      DISCUSSION_TAGS.CPP,
      DISCUSSION_TAGS.JAVA,
      DISCUSSION_TAGS.PYTHON,
      DISCUSSION_TAGS.JAVASCRIPT
    ]
  },
  COMPANIES: {
    label: 'Companies',
    tags: [
      DISCUSSION_TAGS.GOOGLE,
      DISCUSSION_TAGS.AMAZON,
      DISCUSSION_TAGS.MICROSOFT,
      DISCUSSION_TAGS.FACEBOOK,
      DISCUSSION_TAGS.APPLE,
      DISCUSSION_TAGS.NETFLIX,
      DISCUSSION_TAGS.UBER,
      DISCUSSION_TAGS.AIRBNB
    ]
  }
} as const;

// Helper function to get all available tags
export const getAllTags = () => {
  return Object.values(DISCUSSION_TAGS);
};

// Helper function to get tag display name
export const getTagDisplayName = (tag: string) => {
  const tagMap: Record<string, string> = {
    [DISCUSSION_TAGS.ARRAYS]: 'Arrays',
    [DISCUSSION_TAGS.STRINGS]: 'Strings',
    [DISCUSSION_TAGS.LINKED_LISTS]: 'Linked Lists',
    [DISCUSSION_TAGS.TREES]: 'Trees',
    [DISCUSSION_TAGS.GRAPHS]: 'Graphs',
    [DISCUSSION_TAGS.DYNAMIC_PROGRAMMING]: 'Dynamic Programming',
    [DISCUSSION_TAGS.GREEDY]: 'Greedy',
    [DISCUSSION_TAGS.BACKTRACKING]: 'Backtracking',
    [DISCUSSION_TAGS.SORTING]: 'Sorting',
    [DISCUSSION_TAGS.SEARCHING]: 'Searching',
    [DISCUSSION_TAGS.MATH]: 'Math',
    [DISCUSSION_TAGS.BIT_MANIPULATION]: 'Bit Manipulation',
    [DISCUSSION_TAGS.EASY]: 'Easy',
    [DISCUSSION_TAGS.MEDIUM]: 'Medium',
    [DISCUSSION_TAGS.HARD]: 'Hard',
    [DISCUSSION_TAGS.SOLUTION]: 'Solution',
    [DISCUSSION_TAGS.HINT]: 'Hint',
    [DISCUSSION_TAGS.OPTIMIZATION]: 'Optimization',
    [DISCUSSION_TAGS.TIME_COMPLEXITY]: 'Time Complexity',
    [DISCUSSION_TAGS.SPACE_COMPLEXITY]: 'Space Complexity',
    [DISCUSSION_TAGS.EDGE_CASES]: 'Edge Cases',
    [DISCUSSION_TAGS.TEST_CASES]: 'Test Cases',
    [DISCUSSION_TAGS.ALGORITHM]: 'Algorithm',
    [DISCUSSION_TAGS.DATA_STRUCTURES]: 'Data Structures',
    [DISCUSSION_TAGS.INTERVIEW]: 'Interview',
    [DISCUSSION_TAGS.COMPANY]: 'Company',
    [DISCUSSION_TAGS.LEARNING]: 'Learning',
    [DISCUSSION_TAGS.RESOURCES]: 'Resources',
    [DISCUSSION_TAGS.STUDY_TIPS]: 'Study Tips',
    [DISCUSSION_TAGS.CPP]: 'C++',
    [DISCUSSION_TAGS.JAVA]: 'Java',
    [DISCUSSION_TAGS.PYTHON]: 'Python',
    [DISCUSSION_TAGS.JAVASCRIPT]: 'JavaScript',
    [DISCUSSION_TAGS.GOOGLE]: 'Google',
    [DISCUSSION_TAGS.AMAZON]: 'Amazon',
    [DISCUSSION_TAGS.MICROSOFT]: 'Microsoft',
    [DISCUSSION_TAGS.FACEBOOK]: 'Facebook',
    [DISCUSSION_TAGS.APPLE]: 'Apple',
    [DISCUSSION_TAGS.NETFLIX]: 'Netflix',
    [DISCUSSION_TAGS.UBER]: 'Uber',
    [DISCUSSION_TAGS.AIRBNB]: 'Airbnb'
  };
  
  return tagMap[tag] || tag;
};

// Helper function to validate tags
export const validateTags = (tags: string[]) => {
  const validTags = getAllTags();
  return tags.every(tag => validTags.includes(tag));
};
