import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongoose';
import { Discussion, Comment, Vote, VoteType, User, Problem } from '@/models';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Check if user is admin
    const user = await User.findOne({ clerkId: userId });
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get some problems for linking discussions
    const problems = await Problem.find().limit(3).lean();
    
    // Create sample users if they don't exist
    const sampleUsers = [
      {
        clerkId: 'user_sample_1',
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Johnson',
        username: 'alice_j',
        imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        role: 'USER'
      },
      {
        clerkId: 'user_sample_2',
        email: 'bob@example.com',
        firstName: 'Bob',
        lastName: 'Smith',
        username: 'bob_smith',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        role: 'USER'
      },
      {
        clerkId: 'user_sample_3',
        email: 'charlie@example.com',
        firstName: 'Charlie',
        lastName: 'Brown',
        username: 'charlie_b',
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        role: 'USER'
      }
    ];

    const createdUsers = [];
    for (const userData of sampleUsers) {
      let user = await User.findOne({ clerkId: userData.clerkId });
      if (!user) {
        user = new User(userData);
        await user.save();
      }
      createdUsers.push(user);
    }

    // Sample discussions
    const sampleDiscussions = [
      {
        title: "Two Sum - Optimal Solution Explanation",
        content: `I've been working on the Two Sum problem and wanted to share my approach using a hash map for O(n) time complexity.

\`\`\`python
def twoSum(nums, target):
    hashmap = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hashmap:
            return [hashmap[complement], i]
        hashmap[num] = i
    return []
\`\`\`

The key insight is to store the complement of each number as we iterate. This way, we can check if the complement exists in constant time.

**Time Complexity:** O(n)
**Space Complexity:** O(n)

What do you think about this approach? Any improvements or alternative solutions?`,
        author: createdUsers[0]._id,
        authorClerkId: createdUsers[0].clerkId,
        problemId: problems[0]?._id || null,
        problemSlug: problems[0]?.slug || null,
        tags: ['two-sum', 'hash-map', 'array', 'leetcode'],
        upvotes: 15,
        downvotes: 2,
        commentCount: 8
      },
      {
        title: "Binary Tree Traversal - Iterative vs Recursive",
        content: `I'm confused about when to use iterative vs recursive approaches for binary tree traversal. Let me share both approaches:

**Recursive Approach:**
\`\`\`python
def inorderTraversal(root):
    result = []
    def inorder(node):
        if node:
            inorder(node.left)
            result.append(node.val)
            inorder(node.right)
    inorder(root)
    return result
\`\`\`

**Iterative Approach:**
\`\`\`python
def inorderTraversal(root):
    result = []
    stack = []
    current = root
    
    while stack or current:
        while current:
            stack.append(current)
            current = current.left
        current = stack.pop()
        result.append(current.val)
        current = current.right
    
    return result
\`\`\`

When should I use each approach? What are the trade-offs?`,
        author: createdUsers[1]._id,
        authorClerkId: createdUsers[1].clerkId,
        problemId: problems[1]?._id || null,
        problemSlug: problems[1]?.slug || null,
        tags: ['binary-tree', 'traversal', 'recursion', 'iteration'],
        upvotes: 12,
        downvotes: 1,
        commentCount: 6
      },
      {
        title: "Dynamic Programming - Memoization vs Tabulation",
        content: `I'm learning dynamic programming and struggling to understand when to use memoization vs tabulation. Here's my understanding:

**Memoization (Top-down):**
- Start from the problem and break it down
- Use recursion with caching
- More intuitive for some problems

**Tabulation (Bottom-up):**
- Start from base cases and build up
- Use iteration with a table
- Often more space-efficient

For example, Fibonacci:

**Memoization:**
\`\`\`python
def fib(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]
\`\`\`

**Tabulation:**
\`\`\`python
def fib(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
\`\`\`

What are your thoughts? When do you prefer each approach?`,
        author: createdUsers[2]._id,
        authorClerkId: createdUsers[2].clerkId,
        problemId: problems[2]?._id || null,
        problemSlug: problems[2]?.slug || null,
        tags: ['dynamic-programming', 'memoization', 'tabulation', 'fibonacci'],
        upvotes: 20,
        downvotes: 3,
        commentCount: 12
      },
      {
        title: "General Discussion: Best Resources for Learning Algorithms",
        content: `Hey everyone! I'm looking for recommendations on the best resources for learning algorithms and data structures. 

I've been using:
- LeetCode for practice
- Cracking the Coding Interview book
- Some YouTube channels

What resources have you found most helpful? Any specific courses, books, or platforms you'd recommend?

I'm particularly interested in:
- Graph algorithms
- Advanced data structures
- System design concepts

Thanks in advance for your suggestions!`,
        author: createdUsers[0]._id,
        authorClerkId: createdUsers[0].clerkId,
        tags: ['learning', 'resources', 'algorithms', 'data-structures', 'study-tips'],
        upvotes: 8,
        downvotes: 0,
        commentCount: 15
      },
      {
        title: "Time Complexity Analysis - Big O Notation",
        content: `I'm working on improving my time complexity analysis skills. Let me share some common patterns:

**O(1) - Constant Time:**
- Array access by index
- Hash map operations

**O(log n) - Logarithmic:**
- Binary search
- Balanced tree operations

**O(n) - Linear:**
- Single loop through array
- Linear search

**O(n log n) - Linearithmic:**
- Merge sort
- Heap sort

**O(n²) - Quadratic:**
- Nested loops
- Bubble sort

**O(2ⁿ) - Exponential:**
- Recursive Fibonacci (naive)
- Subset generation

How do you approach analyzing time complexity? Any tips for identifying the dominant operation?`,
        author: createdUsers[1]._id,
        authorClerkId: createdUsers[1].clerkId,
        tags: ['time-complexity', 'big-o', 'analysis', 'algorithms'],
        upvotes: 18,
        downvotes: 1,
        commentCount: 9
      }
    ];

    // Create discussions
    const createdDiscussions = [];
    for (const discussionData of sampleDiscussions) {
      const discussion = new Discussion(discussionData);
      await discussion.save();
      createdDiscussions.push(discussion);
    }

    // Sample comments
    const sampleComments = [
      {
        content: "Great explanation! I was struggling with the hash map approach. This makes it much clearer.",
        author: createdUsers[1]._id,
        authorClerkId: createdUsers[1].clerkId,
        discussion: createdDiscussions[0]._id,
        upvotes: 5,
        downvotes: 0
      },
      {
        content: "You can also optimize space by using a two-pointer approach if the array is sorted:",
        author: createdUsers[2]._id,
        authorClerkId: createdUsers[2].clerkId,
        discussion: createdDiscussions[0]._id,
        upvotes: 3,
        downvotes: 0
      },
      {
        content: "For recursive vs iterative, I usually prefer iterative for production code to avoid stack overflow issues.",
        author: createdUsers[0]._id,
        authorClerkId: createdUsers[0].clerkId,
        discussion: createdDiscussions[1]._id,
        upvotes: 4,
        downvotes: 1
      },
      {
        content: "Recursive is more readable and easier to understand for complex tree operations.",
        author: createdUsers[2]._id,
        authorClerkId: createdUsers[2].clerkId,
        discussion: createdDiscussions[1]._id,
        upvotes: 2,
        downvotes: 0
      },
      {
        content: "I recommend 'Introduction to Algorithms' by Cormen et al. It's comprehensive but dense.",
        author: createdUsers[1]._id,
        authorClerkId: createdUsers[1].clerkId,
        discussion: createdDiscussions[3]._id,
        upvotes: 6,
        downvotes: 0
      },
      {
        content: "MIT OpenCourseWare has excellent algorithm courses available for free!",
        author: createdUsers[2]._id,
        authorClerkId: createdUsers[2].clerkId,
        discussion: createdDiscussions[3]._id,
        upvotes: 8,
        downvotes: 0
      }
    ];

    // Create comments
    const createdComments = [];
    for (const commentData of sampleComments) {
      const comment = new Comment(commentData);
      await comment.save();
      createdComments.push(comment);
    }

    // Sample votes
    const sampleVotes = [
      // Discussion votes
      { user: createdUsers[1]._id, userClerkId: createdUsers[1].clerkId, targetType: 'discussion', targetId: createdDiscussions[0]._id, voteType: VoteType.UPVOTE },
      { user: createdUsers[2]._id, userClerkId: createdUsers[2].clerkId, targetType: 'discussion', targetId: createdDiscussions[0]._id, voteType: VoteType.UPVOTE },
      { user: createdUsers[0]._id, userClerkId: createdUsers[0].clerkId, targetType: 'discussion', targetId: createdDiscussions[1]._id, voteType: VoteType.UPVOTE },
      { user: createdUsers[2]._id, userClerkId: createdUsers[2].clerkId, targetType: 'discussion', targetId: createdDiscussions[1]._id, voteType: VoteType.UPVOTE },
      
      // Comment votes
      { user: createdUsers[0]._id, userClerkId: createdUsers[0].clerkId, targetType: 'comment', targetId: createdComments[0]._id, voteType: VoteType.UPVOTE },
      { user: createdUsers[2]._id, userClerkId: createdUsers[2].clerkId, targetType: 'comment', targetId: createdComments[0]._id, voteType: VoteType.UPVOTE },
      { user: createdUsers[1]._id, userClerkId: createdUsers[1].clerkId, targetType: 'comment', targetId: createdComments[1]._id, voteType: VoteType.UPVOTE },
    ];

    // Create votes
    for (const voteData of sampleVotes) {
      const vote = new Vote(voteData);
      await vote.save();
    }

    return NextResponse.json({
      message: 'Seed data created successfully',
      data: {
        users: createdUsers.length,
        discussions: createdDiscussions.length,
        comments: createdComments.length,
        votes: sampleVotes.length
      }
    });

  } catch (error) {
    console.error('Error creating seed data:', error);
    return NextResponse.json(
      { error: 'Failed to create seed data' },
      { status: 500 }
    );
  }
}