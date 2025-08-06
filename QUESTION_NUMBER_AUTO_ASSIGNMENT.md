# Question Number Auto-Assignment

## Overview
The Problem model now includes automatic question number assignment with gap filling functionality. The UI has been updated to display question numbers throughout the application.

## How It Works

### Auto-Assignment Logic
1. **New Problem Creation**: When a problem is created without a `questionNumber`, the system automatically assigns the next available number
2. **Gap Filling**: If there are gaps in the sequence (e.g., problems 1, 2, 4 exist), the next problem will get number 3
3. **Sequential Assignment**: If no gaps exist, the next sequential number is assigned

### Example Scenarios

#### Scenario 1: First Problem
- Database: Empty
- New Problem: Gets `questionNumber: 1`

#### Scenario 2: Sequential Addition
- Database: Problems with numbers 1, 2, 3
- New Problem: Gets `questionNumber: 4`

#### Scenario 3: Gap Filling
- Database: Problems with numbers 1, 2, 4, 6
- New Problem: Gets `questionNumber: 3` (fills the first gap)

#### Scenario 4: After Deletion
- Database: Problems with numbers 1, 2, 4, 6
- Delete problem with number 2
- New Problem: Gets `questionNumber: 2` (fills the gap)

## Implementation Details

### API Route Assignment
The auto-assignment is handled directly in the API route (`/api/admin/problems`) before saving the problem:

```typescript
// Auto-assign question number if not provided
let questionNumber = body.questionNumber;
if (!questionNumber) {
  // Find all existing question numbers, sorted
  const existingNumbers = await Problem.find({}, 'questionNumber')
    .sort({ questionNumber: 1 })
    .lean();
  
  let nextNumber = 1;
  
  // Find the first gap or use the next number after the highest
  for (const problem of existingNumbers) {
    if (problem.questionNumber !== nextNumber) {
      break;
    }
    nextNumber++;
  }
  
  questionNumber = nextNumber;
}
```

### Static Method
A static method is also available for manual use:

```typescript
const nextNumber = await Problem.getNextQuestionNumber();
```

## UI Updates

### Admin Problems List
- Added "Question Number" column to the problems table
- Displays the auto-assigned question number for each problem

### Public Problems List
- Updated to fetch real data from the API
- Displays question numbers in the format "1.", "2.", etc.
- Shows tags and difficulty levels

### Individual Problem Page
- Question number displayed in the problem header
- Format: "1. Two Sum" with difficulty badge
- Uses real problem data from the API

### Admin Problem Edit Page
- Shows question number in the header: "Problem #1"
- Helps admins identify which problem they're editing

## Usage

### Automatic Assignment (Recommended)
Simply create a problem without specifying `questionNumber`:

```typescript
const problem = new Problem({
  title: "Two Sum",
  description: "...",
  difficulty: "EASY",
  // questionNumber will be auto-assigned
});
await problem.save();
```

### Manual Assignment
You can still manually assign question numbers if needed:

```typescript
const problem = new Problem({
  title: "Two Sum",
  description: "...",
  difficulty: "EASY",
  questionNumber: 42, // Manual assignment
});
await problem.save();
```

## Benefits

1. **No Manual Management**: No need to track question numbers manually
2. **Gap Filling**: Efficiently reuses deleted question numbers
3. **Consistent Sequence**: Maintains a logical sequence for users
4. **Backward Compatible**: Existing code continues to work
5. **Flexible**: Supports both automatic and manual assignment
6. **User-Friendly**: Question numbers are clearly displayed throughout the UI

## API Integration

The existing API routes work seamlessly with this feature:
- `POST /api/admin/problems` - Auto-assigns question numbers
- `PUT /api/admin/problems/[slug]` - Preserves existing question numbers
- `DELETE /api/admin/problems/[slug]` - Frees up question numbers for reuse
- `GET /api/problems` - Returns question numbers in the response
- `GET /api/problems/[slug]` - Returns question number for individual problems 