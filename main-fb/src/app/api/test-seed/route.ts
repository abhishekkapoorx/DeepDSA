import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Problem, TestCase } from '@/models';

/**
 * POST /api/test-seed - Seed database with sample problems
 * Creates sample problems (Two Sum, Add Two Numbers, Longest Substring) with test cases.
 * Clears existing problems before seeding. Used for development/testing.
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Sample problems data
    const sampleProblems = [
      {
        title: "Two Sum",
        slug: "two-sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "EASY",
        tags: ["Array", "Hash Table"],
        starterCode: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
        functionName: "twoSum",
        hints: ["Try using a hash table to store complements"],
        inputVariables: [
          { name: "nums", type: "int[]", description: "Array of integers" },
          { name: "target", type: "int", description: "Target sum" }
        ],
        outputVariable: {
          type: "int[]",
          description: "Indices of the two numbers that add up to target"
        }
      },
      {
        title: "Add Two Numbers",
        slug: "add-two-numbers",
        description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit.",
        difficulty: "MEDIUM",
        tags: ["Linked List", "Math"],
        starterCode: "class Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        \n    }\n};",
        functionName: "addTwoNumbers",
        hints: ["Keep track of the carry"],
        inputVariables: [
          { name: "l1", type: "ListNode*", description: "First linked list" },
          { name: "l2", type: "ListNode*", description: "Second linked list" }
        ],
        outputVariable: {
          type: "ListNode*",
          description: "Sum of the two numbers as a linked list"
        }
      },
      {
        title: "Longest Substring Without Repeating Characters",
        slug: "longest-substring-without-repeating-characters",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        difficulty: "MEDIUM",
        tags: ["String", "Sliding Window"],
        starterCode: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};",
        functionName: "lengthOfLongestSubstring",
        hints: ["Use a sliding window approach"],
        inputVariables: [
          { name: "s", type: "string", description: "Input string" }
        ],
        outputVariable: {
          type: "int",
          description: "Length of the longest substring without repeating characters"
        }
      }
    ];

    // Clear existing problems (for testing)
    await Problem.deleteMany({});
    await TestCase.deleteMany({});

    // Insert sample problems
    const createdProblems = await Problem.insertMany(sampleProblems);

    // Add sample test cases for the first problem
    const twoSumTestCases = [
      {
        problemId: createdProblems[0]._id,
        input: "[2,7,11,15]\n9",
        output: "[0,1]",
        isHidden: false,
        isExample: true
      },
      {
        problemId: createdProblems[0]._id,
        input: "[3,2,4]\n6",
        output: "[1,2]",
        isHidden: false,
        isExample: true
      }
    ];

    await TestCase.insertMany(twoSumTestCases);

    return NextResponse.json({
      success: true,
      message: `Created ${createdProblems.length} sample problems`,
      problems: createdProblems
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 