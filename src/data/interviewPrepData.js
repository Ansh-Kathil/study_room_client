// Curated high-frequency Blind 75 / FAANG interview problems with multi-language starter templates
export const CURATED_PROBLEMS = [
  // Arrays & Hashing
  {
    id: 1,
    frontendId: 1,
    title: "Two Sum",
    titleSlug: "two-sum",
    difficulty: "Easy",
    pattern: "Arrays & Hashing",
    frequency: "99%",
    companies: ["Google", "Meta", "Amazon", "Apple"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "Use a Hash Map to store each number and its index. For every element x, check if (target - x) already exists in the map in O(1) time.",
    pitfalls: "Do not use the same element twice. Watch out for negative values and duplicate entries.",
    codeSnippets: [
      {
        lang: "JavaScript",
        langSlug: "javascript",
        code: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      },
      {
        lang: "Python",
        langSlug: "python3",
        code: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in seen:
                return [seen[diff], i]
            seen[num] = i
        return []`,
      },
      {
        lang: "C++",
        langSlug: "cpp",
        code: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int diff = target - nums[i];
            if (seen.find(diff) != seen.end()) {
                return {seen[diff], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
      },
      {
        lang: "Java",
        langSlug: "java",
        code: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                return new int[] { map.get(diff), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
      },
      {
        lang: "TypeScript",
        langSlug: "typescript",
        code: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      },
    ],
  },
  {
    id: 217,
    frontendId: 217,
    title: "Contains Duplicate",
    titleSlug: "contains-duplicate",
    difficulty: "Easy",
    pattern: "Arrays & Hashing",
    frequency: "92%",
    companies: ["Amazon", "Apple", "Microsoft"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "Insert elements into a Hash Set. If set.has(val) returns true, an immediate duplicate exists.",
    pitfalls: "Sorting takes O(N log N) time and O(1) space if memory is strictly constrained.",
    codeSnippets: [
      {
        lang: "JavaScript",
        langSlug: "javascript",
        code: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}`,
      },
      {
        lang: "Python",
        langSlug: "python3",
        code: `class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        return len(nums) != len(set(nums))`,
      },
      {
        lang: "C++",
        langSlug: "cpp",
        code: `#include <vector>
#include <unordered_set>
using namespace std;

class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int n : nums) {
            if (seen.count(n)) return true;
            seen.insert(n);
        }
        return false;
    }
};`,
      },
      {
        lang: "Java",
        langSlug: "java",
        code: `import java.util.HashSet;
import java.util.Set;

class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int n : nums) {
            if (!set.add(n)) return true;
        }
        return false;
    }
}`,
      },
      {
        lang: "TypeScript",
        langSlug: "typescript",
        code: `function containsDuplicate(nums: number[]): boolean {
  return new Set(nums).size !== nums.length;
}`,
      },
    ],
  },
  {
    id: 242,
    frontendId: 242,
    title: "Valid Anagram",
    titleSlug: "valid-anagram",
    difficulty: "Easy",
    pattern: "Arrays & Hashing",
    frequency: "88%",
    companies: ["Meta", "Bloomberg", "Amazon"],
    timeComp: "O(N)",
    spaceComp: "O(1) [26 alphabet letters]",
    intuition: "Count character frequencies using an array of size 26 or a hash map. Both strings must have matching counts.",
    pitfalls: "Verify whether inputs contain non-ASCII Unicode characters before fixing buffer size to 26.",
    codeSnippets: [
      {
        lang: "JavaScript",
        langSlug: "javascript",
        code: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (const c of s) count[c] = (count[c] || 0) + 1;
  for (const c of t) {
    if (!count[c]) return false;
    count[c]--;
  }
  return true;
}`,
      },
      {
        lang: "Python",
        langSlug: "python3",
        code: `from collections import Counter

class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return Counter(s) == Counter(t)`,
      },
      {
        lang: "C++",
        langSlug: "cpp",
        code: `#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.length() != t.length()) return false;
        vector<int> counts(26, 0);
        for (char c : s) counts[c - 'a']++;
        for (char c : t) {
            if (--counts[c - 'a'] < 0) return false;
        }
        return true;
    }
};`,
      },
      {
        lang: "Java",
        langSlug: "java",
        code: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] counts = new int[26];
        for (char c : s.toCharArray()) counts[c - 'a']++;
        for (char c : t.toCharArray()) {
            if (--counts[c - 'a'] < 0) return false;
        }
        return true;
    }
}`,
      },
      {
        lang: "TypeScript",
        langSlug: "typescript",
        code: `function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const count: Record<string, number> = {};
  for (const c of s) count[c] = (count[c] || 0) + 1;
  for (const c of t) {
    if (!count[c]) return false;
    count[c]--;
  }
  return true;
}`,
      },
    ],
  },
  {
    id: 49,
    frontendId: 49,
    title: "Group Anagrams",
    titleSlug: "group-anagrams",
    difficulty: "Medium",
    pattern: "Arrays & Hashing",
    frequency: "95%",
    companies: ["Amazon", "Meta", "Google"],
    timeComp: "O(N * K log K) or O(N * K)",
    spaceComp: "O(N * K)",
    intuition: "Use sorted string representation or a 26-char frequency tuple as the dictionary key to group words.",
    pitfalls: "Creating string keys must be consistent across differing languages.",
  },
  {
    id: 238,
    frontendId: 238,
    title: "Product of Array Except Self",
    titleSlug: "product-of-array-except-self",
    difficulty: "Medium",
    pattern: "Arrays & Hashing",
    frequency: "96%",
    companies: ["Amazon", "Meta", "Apple", "Microsoft"],
    timeComp: "O(N)",
    spaceComp: "O(1) [excluding output array]",
    intuition: "Calculate prefix products in a forward pass, then multiply by suffix products in a backward pass without using the division operator.",
    pitfalls: "Division by zero traps if using total product / nums[i]. Follow problem constraint: division is forbidden.",
  },
  {
    id: 128,
    frontendId: 128,
    title: "Longest Consecutive Sequence",
    titleSlug: "longest-consecutive-sequence",
    difficulty: "Medium",
    pattern: "Arrays & Hashing",
    frequency: "90%",
    companies: ["Google", "Amazon", "Spotify"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "Insert all elements into a Set. Only initiate a sequence check if (num - 1) is NOT in the set (identifies sequence starts).",
    pitfalls: "Checking from every element without the start condition degrades performance to O(N²).",
  },

  // Two Pointers
  {
    id: 125,
    frontendId: 125,
    title: "Valid Palindrome",
    titleSlug: "valid-palindrome",
    difficulty: "Easy",
    pattern: "Two Pointers",
    frequency: "89%",
    companies: ["Meta", "Microsoft", "Uber"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Use left and right pointers moving inward, skipping non-alphanumeric characters and comparing lowercase chars.",
    pitfalls: "Ignoring non-alphanumeric punctuation and case-sensitivity.",
    codeSnippets: [
      {
        lang: "JavaScript",
        langSlug: "javascript",
        code: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let l = 0, r = clean.length - 1;
  while (l < r) {
    if (clean[l] !== clean[r]) return false;
    l++;
    r--;
  }
  return true;
}`,
      },
      {
        lang: "Python",
        langSlug: "python3",
        code: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        clean = [c.lower() for c in s if c.isalnum()]
        return clean == clean[::-1]`,
      },
      {
        lang: "C++",
        langSlug: "cpp",
        code: `#include <string>
#include <cctype>
using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        int l = 0, r = s.size() - 1;
        while (l < r) {
            while (l < r && !isalnum(s[l])) l++;
            while (l < r && !isalnum(s[r])) r--;
            if (tolower(s[l]) != tolower(s[r])) return false;
            l++;
            r--;
        }
        return true;
    }
};`,
      },
      {
        lang: "Java",
        langSlug: "java",
        code: `class Solution {
    public boolean isPalindrome(String s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;
            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;
            l++;
            r--;
        }
        return true;
    }
}`,
      },
      {
        lang: "TypeScript",
        langSlug: "typescript",
        code: `function isPalindrome(s: string): boolean {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let l = 0, r = clean.length - 1;
  while (l < r) {
    if (clean[l] !== clean[r]) return false;
    l++;
    r--;
  }
  return true;
}`,
      },
    ],
  },
  {
    id: 15,
    frontendId: 15,
    title: "3Sum",
    titleSlug: "3sum",
    difficulty: "Medium",
    pattern: "Two Pointers",
    frequency: "98%",
    companies: ["Meta", "Amazon", "Apple", "Google"],
    timeComp: "O(N²)",
    spaceComp: "O(1) or O(N)",
    intuition: "Sort array first. Fix element i, then use two pointers (left & right) to find pairs summing to -nums[i]. Skip duplicates.",
    pitfalls: "Duplicate triplets! Ensure you skip identical values after advancing both pointers.",
  },
  {
    id: 11,
    frontendId: 11,
    title: "Container With Most Water",
    titleSlug: "container-with-most-water",
    difficulty: "Medium",
    pattern: "Two Pointers",
    frequency: "94%",
    companies: ["Google", "Amazon", "Meta"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Start pointers at both ends. Compute area = min(h[l], h[r]) * (r - l). Always advance the pointer pointing to the shorter vertical bar.",
    pitfalls: "Moving the taller pointer cannot possibly produce a larger area since width shrinks.",
  },
  {
    id: 42,
    frontendId: 42,
    title: "Trapping Rain Water",
    titleSlug: "trapping-rain-water",
    difficulty: "Hard",
    pattern: "Two Pointers",
    frequency: "97%",
    companies: ["Google", "Meta", "Amazon", "Goldman Sachs"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Two pointers keeping track of maxLeft and maxRight boundaries. Water at current index is determined by min(maxL, maxR) - height.",
    pitfalls: "Ensure pointers move strictly according to which boundary is smaller.",
  },

  // Sliding Window
  {
    id: 121,
    frontendId: 121,
    title: "Best Time to Buy and Sell Stock",
    titleSlug: "best-time-to-buy-and-sell-stock",
    difficulty: "Easy",
    pattern: "Sliding Window",
    frequency: "99%",
    companies: ["Amazon", "Meta", "Google", "Bloomberg"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Track minimum buying price seen so far. At each step, calculate potential profit and update maxProfit.",
    pitfalls: "Do not sell before buying. A simple single-pass scan suffices.",
  },
  {
    id: 3,
    frontendId: 3,
    title: "Longest Substring Without Repeating Characters",
    titleSlug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    pattern: "Sliding Window",
    frequency: "98%",
    companies: ["Amazon", "Microsoft", "Meta", "Google"],
    timeComp: "O(N)",
    spaceComp: "O(min(N, M))",
    intuition: "Sliding window with two pointers [l, r]. Use a Map of char -> lastIndex. If duplicate seen at or after l, jump l to lastIndex + 1.",
    pitfalls: "Updating left pointer to an old index behind current left window position.",
  },
  {
    id: 424,
    frontendId: 424,
    title: "Longest Repeating Character Replacement",
    titleSlug: "longest-repeating-character-replacement",
    difficulty: "Medium",
    pattern: "Sliding Window",
    frequency: "87%",
    companies: ["Google", "Uber", "Amazon"],
    timeComp: "O(N)",
    spaceComp: "O(26)",
    intuition: "Window is valid if (windowLength - maxCharFrequency) <= k. If invalid, shrink from left.",
    pitfalls: "Do not recompute maxCharFrequency from scratch on every shrink; maintaining historical max works.",
  },
  {
    id: 76,
    frontendId: 76,
    title: "Minimum Window Substring",
    titleSlug: "minimum-window-substring",
    difficulty: "Hard",
    pattern: "Sliding Window",
    frequency: "93%",
    companies: ["Meta", "Amazon", "LinkedIn", "Google"],
    timeComp: "O(N + M)",
    spaceComp: "O(1) [ASCII]",
    intuition: "Expand right until window contains all target characters. Then shrink from left while maintaining validity to find minimum window.",
    pitfalls: "Comparing frequency maps vs maintaining a 'matched count' counter variable for O(1) checks.",
  },

  // Stack & Binary Search
  {
    id: 20,
    frontendId: 20,
    title: "Valid Parentheses",
    titleSlug: "valid-parentheses",
    difficulty: "Easy",
    pattern: "Stack & Binary Search",
    frequency: "98%",
    companies: ["Meta", "Amazon", "Google", "Microsoft"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "Push opening brackets to stack. For closing brackets, pop and verify matching opening bracket type. Stack must be empty at end.",
    pitfalls: "Popping from an empty stack or ending with leftover unmatched opening brackets.",
  },
  {
    id: 155,
    frontendId: 155,
    title: "Min Stack",
    titleSlug: "min-stack",
    difficulty: "Medium",
    pattern: "Stack & Binary Search",
    frequency: "91%",
    companies: ["Amazon", "Bloomberg", "Microsoft"],
    timeComp: "O(1) all operations",
    spaceComp: "O(N)",
    intuition: "Maintain a companion minStack or store pairs [value, currentMin] in the primary stack.",
    pitfalls: "Popping minimum element without updating current min tracking.",
  },
  {
    id: 704,
    frontendId: 704,
    title: "Binary Search",
    titleSlug: "binary-search",
    difficulty: "Easy",
    pattern: "Stack & Binary Search",
    frequency: "95%",
    companies: ["Apple", "Microsoft", "Google"],
    timeComp: "O(log N)",
    spaceComp: "O(1)",
    intuition: "Divide and conquer: mid = low + Math.floor((high - low) / 2). Eliminate half the remaining search space on every comparison.",
    pitfalls: "Integer overflow on (low + high) / 2 in languages with fixed integer sizes.",
  },
  {
    id: 33,
    frontendId: 33,
    title: "Search in Rotated Sorted Array",
    titleSlug: "search-in-rotated-sorted-array",
    difficulty: "Medium",
    pattern: "Stack & Binary Search",
    frequency: "97%",
    companies: ["Meta", "Amazon", "Microsoft", "Google"],
    timeComp: "O(log N)",
    spaceComp: "O(1)",
    intuition: "In any rotated sorted array, at least one half [low..mid] or [mid..high] is always strictly sorted. Determine which half is sorted and check if target lies within it.",
    pitfalls: "Off-by-one errors with <= versus < when checking bounds.",
  },

  // Trees & Graphs
  {
    id: 226,
    frontendId: 226,
    title: "Invert Binary Tree",
    titleSlug: "invert-binary-tree",
    difficulty: "Easy",
    pattern: "Trees & Graphs",
    frequency: "94%",
    companies: ["Google", "Amazon", "Meta"],
    timeComp: "O(N)",
    spaceComp: "O(H) recursion stack",
    intuition: "Recursively swap root.left and root.right, then recurse on left and right children.",
    pitfalls: "Base case: return null if node is null.",
  },
  {
    id: 104,
    frontendId: 104,
    title: "Maximum Depth of Binary Tree",
    titleSlug: "maximum-depth-of-binary-tree",
    difficulty: "Easy",
    pattern: "Trees & Graphs",
    frequency: "93%",
    companies: ["Amazon", "LinkedIn", "Apple"],
    timeComp: "O(N)",
    spaceComp: "O(H)",
    intuition: "Depth = 1 + max(maxDepth(root.left), maxDepth(root.right)).",
    pitfalls: "Empty tree depth is 0.",
  },
  {
    id: 200,
    frontendId: 200,
    title: "Number of Islands",
    titleSlug: "number-of-islands",
    difficulty: "Medium",
    pattern: "Trees & Graphs",
    frequency: "99%",
    companies: ["Amazon", "Google", "Meta", "Bloomberg"],
    timeComp: "O(R * C)",
    spaceComp: "O(R * C)",
    intuition: "Iterate through 2D grid. When encountering '1', increment island count and trigger DFS/BFS to sink/visit all connected '1' cells to '0'.",
    pitfalls: "Stack overflow on huge grids if using deep recursion without visiting tracking.",
  },
  {
    id: 207,
    frontendId: 207,
    title: "Course Schedule",
    titleSlug: "course-schedule",
    difficulty: "Medium",
    pattern: "Trees & Graphs",
    frequency: "95%",
    companies: ["Amazon", "Google", "Meta"],
    timeComp: "O(V + E)",
    spaceComp: "O(V + E)",
    intuition: "Topological Sort using Kahn's algorithm (indegrees + BFS) or DFS cycle detection using 3 states (unvisited, visiting, visited).",
    pitfalls: "Disconnected graph components must all be checked.",
  },

  // Dynamic Programming
  {
    id: 70,
    frontendId: 70,
    title: "Climbing Stairs",
    titleSlug: "climbing-stairs",
    difficulty: "Easy",
    pattern: "Dynamic Programming",
    frequency: "96%",
    companies: ["Amazon", "Google", "Apple"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Fibonacci recurrence: dp[i] = dp[i-1] + dp[i-2]. Keep only the last two values.",
    pitfalls: "Base cases n=1 and n=2.",
  },
  {
    id: 322,
    frontendId: 322,
    title: "Coin Change",
    titleSlug: "coin-change",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    frequency: "97%",
    companies: ["Amazon", "Google", "Meta", "Microsoft"],
    timeComp: "O(amount * coins.length)",
    spaceComp: "O(amount)",
    intuition: "Bottom-up 1D DP: dp[i] = min(dp[i], 1 + dp[i - coin]) for each coin <= i. Initialize with Infinity.",
    pitfalls: "Handling impossible amounts (return -1 if dp[amount] === Infinity).",
  },
  {
    id: 300,
    frontendId: 300,
    title: "Longest Increasing Subsequence",
    titleSlug: "longest-increasing-subsequence",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    frequency: "92%",
    companies: ["Google", "Meta", "Amazon"],
    timeComp: "O(N log N) with Binary Search Patience Sort, O(N²) standard DP",
    spaceComp: "O(N)",
    intuition: "Maintain array 'tails'. For each num, binary search insertion index in tails. If at end, append; else overwrite.",
    pitfalls: "Subsequence elements do not have to be contiguous.",
  },
  // Linked Lists
  {
    id: 206,
    frontendId: 206,
    title: "Reverse Linked List",
    titleSlug: "reverse-linked-list",
    difficulty: "Easy",
    pattern: "Linked Lists",
    frequency: "99%",
    companies: ["Amazon", "Google", "Apple", "Meta"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Maintain prev (null) and curr (head). In a loop, save next = curr.next, invert pointer curr.next = prev, advance prev = curr and curr = next.",
    pitfalls: "Losing reference to the remaining list before reversing the forward pointer.",
    codeSnippets: [
      {
        lang: "JavaScript",
        langSlug: "javascript",
        code: `function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
      },
      {
        lang: "Python",
        langSlug: "python3",
        code: `class Solution:
    def reverseList(self, head):
        prev, curr = None, head
        while curr:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt
        return prev`,
      },
    ],
  },
  {
    id: 21,
    frontendId: 21,
    title: "Merge Two Sorted Lists",
    titleSlug: "merge-two-sorted-lists",
    difficulty: "Easy",
    pattern: "Linked Lists",
    frequency: "98%",
    companies: ["Amazon", "Microsoft", "Meta", "Google"],
    timeComp: "O(N + M)",
    spaceComp: "O(1)",
    intuition: "Use a dummy head sentinel node. Compare values at list1 and list2, appending the smaller node to tail, and advance that pointer.",
    pitfalls: "Forgetting to attach the remainder of the non-empty list when the other is exhausted.",
  },
  {
    id: 141,
    frontendId: 141,
    title: "Linked List Cycle",
    titleSlug: "linked-list-cycle",
    difficulty: "Easy",
    pattern: "Linked Lists",
    frequency: "97%",
    companies: ["Amazon", "Microsoft", "Spotify"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Floyd's Tortoise and Hare: slow pointer advances 1 step, fast advances 2. If they ever intersect, a cycle exists.",
    pitfalls: "Accessing fast.next.next without verifying fast and fast.next are non-null.",
  },
  {
    id: 19,
    frontendId: 19,
    title: "Remove Nth Node From End of List",
    titleSlug: "remove-nth-node-from-end-of-list",
    difficulty: "Medium",
    pattern: "Linked Lists",
    frequency: "93%",
    companies: ["Meta", "Amazon", "Apple"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Advance fast pointer n steps ahead. Then move slow and fast simultaneously until fast hits the end. Remove slow.next.",
    pitfalls: "Handling edge cases where the node to remove is the original head of the list.",
  },
  {
    id: 143,
    frontendId: 143,
    title: "Reorder List",
    titleSlug: "reorder-list",
    difficulty: "Medium",
    pattern: "Linked Lists",
    frequency: "90%",
    companies: ["Amazon", "Meta"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Find the middle using slow/fast pointers, reverse the second half, and merge the two halves alternately.",
    pitfalls: "Not severing the end of the first half (creating infinite cycle).",
  },

  // Intervals
  {
    id: 56,
    frontendId: 56,
    title: "Merge Intervals",
    titleSlug: "merge-intervals",
    difficulty: "Medium",
    pattern: "Intervals",
    frequency: "99%",
    companies: ["Meta", "Google", "Amazon", "Bloomberg"],
    timeComp: "O(N log N)",
    spaceComp: "O(N)",
    intuition: "Sort intervals by start time. Iterate through: if curr.start <= lastMerged.end, merge by updating end = max(last.end, curr.end). Else push new interval.",
    pitfalls: "Failing to sort intervals first, or forgetting Math.max when merging ends.",
  },
  {
    id: 57,
    frontendId: 57,
    title: "Insert Interval",
    titleSlug: "insert-interval",
    difficulty: "Medium",
    pattern: "Intervals",
    frequency: "95%",
    companies: ["Google", "Meta", "LinkedIn"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "Linear scan: add all intervals ending before newInterval starts. Then merge all overlapping intervals into newInterval. Finally add remaining.",
    pitfalls: "Re-sorting array needlessly when linear O(N) pass is optimal.",
  },
  {
    id: 435,
    frontendId: 435,
    title: "Non-overlapping Intervals",
    titleSlug: "non-overlapping-intervals",
    difficulty: "Medium",
    pattern: "Intervals",
    frequency: "88%",
    companies: ["Meta", "Amazon"],
    timeComp: "O(N log N)",
    spaceComp: "O(1)",
    intuition: "Greedy choice: sort by end times. Keep intervals that finish earliest to leave maximum room for future intervals.",
    pitfalls: "Sorting by start times requires tracking min of end times on collision.",
  },

  // Heap & Priority Queue
  {
    id: 215,
    frontendId: 215,
    title: "Kth Largest Element in an Array",
    titleSlug: "kth-largest-element-in-an-array",
    difficulty: "Medium",
    pattern: "Heap & Priority Queue",
    frequency: "98%",
    companies: ["Meta", "Amazon", "Google", "Microsoft"],
    timeComp: "O(N log K) or O(N) QuickSelect",
    spaceComp: "O(K)",
    intuition: "Maintain a Min-Heap of size K. For each element, insert and if size exceeds K, pop smallest. The root is the Kth largest.",
    pitfalls: "Using Max-Heap with size N requires O(N + K log N) space and time.",
  },
  {
    id: 347,
    frontendId: 347,
    title: "Top K Frequent Elements",
    titleSlug: "top-k-frequent-elements",
    difficulty: "Medium",
    pattern: "Heap & Priority Queue",
    frequency: "96%",
    companies: ["Amazon", "Meta", "Uber"],
    timeComp: "O(N) with Bucket Sort, O(N log K) with Min-Heap",
    spaceComp: "O(N)",
    intuition: "Build frequency map. Group elements into an array of buckets where index is frequency. Traverse buckets backwards from N down to 1.",
    pitfalls: "Sorting the frequency map costs O(U log U) instead of O(N) bucket sort.",
  },
  {
    id: 295,
    frontendId: 295,
    title: "Find Median from Data Stream",
    titleSlug: "find-median-from-data-stream",
    difficulty: "Hard",
    pattern: "Heap & Priority Queue",
    frequency: "95%",
    companies: ["Google", "Amazon", "Apple"],
    timeComp: "O(log N) insert, O(1) find",
    spaceComp: "O(N)",
    intuition: "Two heaps: Max-Heap for lower half of numbers, Min-Heap for upper half. Balance sizes so size diff <= 1.",
    pitfalls: "Maintaining the invariant that all elements in lower half <= all in upper half.",
  },

  // Matrix
  {
    id: 73,
    frontendId: 73,
    title: "Set Matrix Zeroes",
    titleSlug: "set-matrix-zeroes",
    difficulty: "Medium",
    pattern: "Matrix",
    frequency: "94%",
    companies: ["Amazon", "Microsoft", "Meta"],
    timeComp: "O(M * N)",
    spaceComp: "O(1) in-place",
    intuition: "Use the first row and first column as markers. Track whether the first row/col originally contained zero with two boolean flags.",
    pitfalls: "Overwriting the first row/col before processing inner cells.",
  },
  {
    id: 54,
    frontendId: 54,
    title: "Spiral Matrix",
    titleSlug: "spiral-matrix",
    difficulty: "Medium",
    pattern: "Matrix",
    frequency: "96%",
    companies: ["Amazon", "Microsoft", "Apple", "Google"],
    timeComp: "O(M * N)",
    spaceComp: "O(1) excluding output",
    intuition: "Maintain 4 boundaries: top, bottom, left, right. Traverse right, shrink top; traverse down, shrink right; traverse left, shrink bottom; traverse up, shrink left.",
    pitfalls: "Duplicate traversal on single-row or single-column matrices if boundaries cross mid-loop.",
  },
  {
    id: 48,
    frontendId: 48,
    title: "Rotate Image",
    titleSlug: "rotate-image",
    difficulty: "Medium",
    pattern: "Matrix",
    frequency: "93%",
    companies: ["Amazon", "Google", "Microsoft"],
    timeComp: "O(N²)",
    spaceComp: "O(1) in-place",
    intuition: "Rotate 90 degrees clockwise = Transpose matrix (swap matrix[i][j] with matrix[j][i]) then reverse each row horizontally.",
    pitfalls: "Swapping during transpose twice, which cancels out the transposition.",
  },

  // Trees & Advanced Graphs
  {
    id: 98,
    frontendId: 98,
    title: "Validate Binary Search Tree",
    titleSlug: "validate-binary-search-tree",
    difficulty: "Medium",
    pattern: "Trees & Graphs",
    frequency: "97%",
    companies: ["Amazon", "Meta", "Bloomberg"],
    timeComp: "O(N)",
    spaceComp: "O(H)",
    intuition: "Pass valid ranges (minVal, maxVal) recursively. Left child must be strictly < node.val, right child must be strictly > node.val.",
    pitfalls: "Only comparing parent to immediate children instead of entire subtree ancestors.",
  },
  {
    id: 235,
    frontendId: 235,
    title: "Lowest Common Ancestor of a BST",
    titleSlug: "lowest-common-ancestor-of-a-binary-search-tree",
    difficulty: "Medium",
    pattern: "Trees & Graphs",
    frequency: "94%",
    companies: ["Amazon", "Meta", "Microsoft"],
    timeComp: "O(H)",
    spaceComp: "O(1)",
    intuition: "In BST, if both p and q are smaller than root, LCA is in left subtree. If both greater, right subtree. The first split point is the LCA.",
    pitfalls: "Applying general binary tree DFS when BST ordering allows O(1) space iterative search.",
  },
  {
    id: 133,
    frontendId: 133,
    title: "Clone Graph",
    titleSlug: "clone-graph",
    difficulty: "Medium",
    pattern: "Trees & Graphs",
    frequency: "92%",
    companies: ["Meta", "Amazon", "Google"],
    timeComp: "O(V + E)",
    spaceComp: "O(V)",
    intuition: "Use a Hash Map of original node -> cloned node. Perform DFS/BFS: if neighbor already cloned, reuse reference; otherwise create and recurse.",
    pitfalls: "Infinite loop in cyclic graphs if visiting tracking is missing.",
  },

  // Backtracking
  {
    id: 78,
    frontendId: 78,
    title: "Subsets",
    titleSlug: "subsets",
    difficulty: "Medium",
    pattern: "Backtracking",
    frequency: "96%",
    companies: ["Meta", "Amazon", "Google"],
    timeComp: "O(N * 2^N)",
    spaceComp: "O(N)",
    intuition: "Backtracking tree: at each index, candidate has two choices: include nums[i] or exclude. Add current path copy to result on each step.",
    pitfalls: "Pushing reference to mutable path array instead of a cloned copy [...path].",
  },
  {
    id: 39,
    frontendId: 39,
    title: "Combination Sum",
    titleSlug: "combination-sum",
    difficulty: "Medium",
    pattern: "Backtracking",
    frequency: "95%",
    companies: ["Amazon", "Meta", "Airbnb"],
    timeComp: "O(2^Target)",
    spaceComp: "O(Target)",
    intuition: "Backtrack with start index and remaining target. Since elements can be reused, recursive step remains on index i instead of advancing to i + 1.",
    pitfalls: "Duplicate combinations if starting index loop from 0 instead of currIndex.",
  },
  {
    id: 79,
    frontendId: 79,
    title: "Word Search",
    titleSlug: "word-search",
    difficulty: "Medium",
    pattern: "Backtracking",
    frequency: "94%",
    companies: ["Amazon", "Microsoft", "Bloomberg"],
    timeComp: "O(M * N * 3^L)",
    spaceComp: "O(L)",
    intuition: "DFS with backtracking. Temporarily mark board[r][c] = '#' while exploring 4 directions, then restore character before backtracking.",
    pitfalls: "Forgetting to restore cell character upon return (corrupting board state).",
  },

  // Bit Manipulation
  {
    id: 191,
    frontendId: 191,
    title: "Number of 1 Bits",
    titleSlug: "number-of-1-bits",
    difficulty: "Easy",
    pattern: "Bit Manipulation",
    frequency: "93%",
    companies: ["Apple", "Microsoft", "Amazon"],
    timeComp: "O(k) where k is set bits",
    spaceComp: "O(1)",
    intuition: "Brian Kernighan's Algorithm: n = n & (n - 1) flips the lowest set bit to 0. Repeat until n reaches 0.",
    pitfalls: "Iterating through all 32 bits when only counting set bits.",
  },
  {
    id: 136,
    frontendId: 136,
    title: "Single Number",
    titleSlug: "single-number",
    difficulty: "Easy",
    pattern: "Bit Manipulation",
    frequency: "95%",
    companies: ["Amazon", "Google", "Meta"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "XOR all numbers together: a ^ a = 0 and a ^ 0 = a. Duplicate numbers cancel each other out, leaving only the unique number.",
    pitfalls: "Using a hash set which consumes O(N) memory violating the constant space constraint.",
  },
];

// Helper to provide starter code template for any problem and language
export const getProblemStarterSnippet = (problem, languageId) => {
  if (!problem) return getDefaultStarterTemplate(languageId);

  // If explicit codeSnippets exist
  if (problem.codeSnippets && problem.codeSnippets.length > 0) {
    const match = problem.codeSnippets.find(
      (s) =>
        s.langSlug === languageId ||
        s.lang?.toLowerCase().includes(languageId.toLowerCase()) ||
        (languageId === "python" && s.langSlug === "python3") ||
        (languageId === "cpp" && s.langSlug === "cpp")
    );
    if (match?.code) return match.code;
  }

  // Fallback function generator based on title and language
  const camelName = problem.titleSlug
    ? problem.titleSlug
        .split("-")
        .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
        .join("")
    : "solution";

  switch (languageId) {
    case "python":
      return `class Solution:
    def ${camelName}(self, *args):
        # LeetCode #${problem.frontendId || ""}: ${problem.title}
        # Time: ${problem.timeComp || "O(N)"} | Space: ${problem.spaceComp || "O(1)"}
        pass
`;
    case "cpp":
      return `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    // LeetCode #${problem.frontendId || ""}: ${problem.title}
    // Time: ${problem.timeComp || "O(N)"} | Space: ${problem.spaceComp || "O(1)"}
};
`;
    case "java":
      return `class Solution {
    // LeetCode #${problem.frontendId || ""}: ${problem.title}
    // Time: ${problem.timeComp || "O(N)"} | Space: ${problem.spaceComp || "O(1)"}
}
`;
    case "typescript":
      return `// LeetCode #${problem.frontendId || ""}: ${problem.title}
// Time: ${problem.timeComp || "O(N)"} | Space: ${problem.spaceComp || "O(1)"}
function ${camelName}(...args: any[]): any {
  // Your code here
}
`;
    case "javascript":
    default:
      return `// LeetCode #${problem.frontendId || ""}: ${problem.title}
// Time: ${problem.timeComp || "O(N)"} | Space: ${problem.spaceComp || "O(1)"}
function ${camelName}(...args) {
  // Your code here
}
`;
  }
};

export const getDefaultStarterTemplate = (languageId) => {
  switch (languageId) {
    case "python":
      return `# Personal Interview Practice
def solution():
    print("Write optimal solution here")

if __name__ == "__main__":
    solution()
`;
    case "cpp":
      return `#include <iostream>
using namespace std;

int main() {
    // Personal Interview Practice
    cout << "Write optimal solution here" << endl;
    return 0;
}
`;
    case "java":
      return `public class Main {
    public static void main(String[] args) {
        // Personal Interview Practice
        System.out.println("Write optimal solution here");
    }
}
`;
    case "typescript":
      return `// Personal Interview Practice
function solve(): void {
  console.log("Write optimal solution here");
}

solve();
`;
    case "javascript":
    default:
      return `// Personal Interview Practice
function solve() {
  console.log("Write optimal solution here");
}

solve();
`;
  }
};

// High-Yield Behavioral Questions (STAR Method)
export const BEHAVIORAL_QUESTIONS = [
  {
    id: "b1",
    question: "Tell me about a time you faced a severe production bug or technical emergency.",
    competency: "Ownership & Crisis Management",
    why: "Interviewers want to see how you respond under pressure: triage, blameless post-mortem, and preventing recurrence.",
    starBlueprint: {
      situation: "A high-traffic release caused latency spikes or 500 errors right before peak hours.",
      task: "Quickly mitigate customer impact, isolate root cause, and roll back or deploy hotfix.",
      action: "Checked telemetry/logs, rolled back to stable commit in 4 minutes, ran stress tests, identified missing DB index, and added regression tests.",
      result: "Restored uptime to 99.99%, documented blameless post-mortem, and instituted pre-deployment load tests.",
    },
    topTip: "Never blame teammates or third-party vendors. Focus on proactive monitoring, clear communication, and systemic long-term fixes.",
  },
  {
    id: "b2",
    question: "Describe a technical disagreement you had with a teammate or lead. How did you resolve it?",
    competency: "Collaboration & Influence",
    why: "Tests maturity, ability to disagree and commit, and basing decisions on engineering data rather than ego.",
    starBlueprint: {
      situation: "Debate between choosing WebSockets vs long polling / Server-Sent Events for a real-time feature.",
      task: "Align team on scalable architecture without stalling sprint deadlines.",
      action: "Built quick benchmarks measuring server memory and network overhead for 500 concurrent connections. Shared findings objectively in an RFC document.",
      result: "Team unanimously agreed on the benchmark-backed choice; delivered feature 2 days ahead of schedule.",
    },
    topTip: "Show that you listened to their perspective with empathy, used objective prototypes/data, and supported the consensus once decided.",
  },
  {
    id: "b3",
    question: "Tell me about a time you had to make a technical trade-off with a tight deadline.",
    competency: "Pragmatism & Prioritization",
    why: "Real engineering is managing trade-offs: speed vs perfection, technical debt vs feature velocity.",
    starBlueprint: {
      situation: "Needed to launch MVP user authentication and room permissions in 10 days for customer demo.",
      task: "Deliver secure, working product on schedule without getting bogged down building an entire custom OAuth provider.",
      action: "Used Battle-tested JWT + Bcrypt flow with strict cookie security, deferring SSO/OAuth to Phase 2.",
      result: "Shipped fully compliant auth on time with zero security holes, signed pilot customers, and scheduled SSO for next milestone.",
    },
    topTip: "Explicitly mention how you tracked technical debt in the backlog so shortcuts were intentionally planned and paid back.",
  },
  {
    id: "b4",
    question: "Tell me about a project you led or initiated from conception to delivery.",
    competency: "Leadership & Initiative",
    why: "Demonstrates drive, architectural ownership, and cross-functional leadership.",
    starBlueprint: {
      situation: "Noticed study group members were struggling to collaborate on live code while simultaneously video calling.",
      task: "Architect an all-in-one collaborative environment with WebRTC peer mesh, real-time Monaco editor, and synced compiler.",
      action: "Designed Socket.IO synchronization protocol, integrated WebRTC signaling, built responsive split layouts, and integrated Gemini AI coach.",
      result: "Built a fully functioning real-time study suite supporting thousands of simultaneous peer interactions.",
    },
    topTip: "Highlight the user problem first before describing the technical stack. Tech is a means to solve user pain.",
  },
];

// System Design High-Yield Primer
export const SYSTEM_DESIGN_TOPICS = [
  {
    title: "1. The 4-Step System Design Interview Framework",
    desc: "How to structure any 45-minute architectural interview seamlessly",
    points: [
      "Step 1 (0-5 min): Scope Requirements. Clarify Functional vs Non-Functional requirements (DAU, Read:Write ratio, Latency, Availability vs Consistency).",
      "Step 2 (5-15 min): High-Level Architecture. Draw core services, API contracts, database schema, and primary client-server data flow.",
      "Step 3 (15-35 min): Deep Dive into Bottlenecks. Address Caching (Redis), Load Balancing (Nginx), DB Sharding/Replication, Message Queues (Kafka).",
      "Step 4 (35-45 min): Wrap Up & Failure Modes. Discuss Single Point of Failure (SPOF), rate limiting, monitoring, and future scaling.",
    ],
  },
  {
    title: "2. Caching Strategies (Redis / Memcached)",
    desc: "Cache-Aside vs Write-Through vs Write-Back",
    points: [
      "Cache-Aside (Lazy Loading): App checks cache first; on miss, queries DB and populates cache. Best for read-heavy workloads.",
      "Write-Through: Data written to cache and DB simultaneously. Prevents stale data but increases write latency.",
      "Write-Back: App writes to cache immediately; cache asynchronously writes to DB in batches. High performance, risk of data loss on crash.",
      "Eviction Policies: LRU (Least Recently Used) is the gold standard for web APIs. LFU for frequency-based patterns.",
    ],
  },
  {
    title: "3. CAP Theorem & Database Selection",
    desc: "Relational (PostgreSQL/MySQL) vs NoSQL (MongoDB/Cassandra/DynamoDB)",
    points: [
      "Consistency vs Availability: Under network partition (P), you must pick CP (e.g. Banking, MongoDB) or AP (e.g. Social Feeds, Cassandra).",
      "Choose SQL (RDBMS) when: Structured schema, ACID transactions required, complex multi-table joins.",
      "Choose NoSQL when: High write throughput, horizontal scaling needed, flexible unstructured schema, geo-distributed nodes.",
    ],
  },
  {
    title: "4. Scaling to Millions of Users",
    desc: "Load balancing, horizontal scaling, asynchronous message brokers",
    points: [
      "Stateless Application Servers: Store session state in distributed Redis or JWT tokens so any server can handle any request.",
      "Database Sharding: Partition tables horizontally by shard key (e.g., hash(userId) % N) to distribute read/write load.",
      "Asynchronous Queues (Kafka/RabbitMQ): Decouple slow background operations (email notifications, heavy video/AI processing) from the critical request path.",
    ],
  },
];
