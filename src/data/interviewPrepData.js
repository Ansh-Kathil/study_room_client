// Curated high-frequency Blind 75 / FAANG interview problems with multi-language starter templates
export const CURATED_PROBLEMS = [
  {
    id: 1,
    frontendId: 1,
    title: "Two Sum",
    titleSlug: "two-sum",
    difficulty: "Easy",
    pattern: "Arrays & Hashing",
    frequency: "99%",
    companies: ["Google","Meta","Amazon","Apple"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "Use a Hash Map to store each number and its index. For every element x, check if (target - x) already exists in the map in O(1) time.",
    pitfalls: "Do not use the same element twice. Watch out for negative values and duplicate entries.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}"
    },
    {
        "lang": "Python",
        "langSlug": "python3",
        "code": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in seen:\n                return [seen[diff], i]\n            seen[num] = i\n        return []"
    },
    {
        "lang": "C++",
        "langSlug": "cpp",
        "code": "#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            int diff = target - nums[i];\n            if (seen.find(diff) != seen.end()) {\n                return {seen[diff], i};\n            }\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};"
    },
    {
        "lang": "Java",
        "langSlug": "java",
        "code": "import java.util.HashMap;\nimport java.util.Map;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[] { map.get(diff), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}"
    },
    {
        "lang": "TypeScript",
        "langSlug": "typescript",
        "code": "function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff)!, i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}"
    }
]
  },
  {
    id: 2,
    frontendId: 121,
    title: "Best Time to Buy and Sell Stock",
    titleSlug: "best-time-to-buy-and-sell-stock",
    difficulty: "Easy",
    pattern: "Sliding Window",
    frequency: "99%",
    companies: ["Amazon","Meta","Google","Bloomberg"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Track minimum buying price seen so far. At each step, calculate potential profit and update maxProfit.",
    pitfalls: "Do not sell before buying. A simple single-pass scan suffices.",
    codeSnippets: []
  },
  {
    id: 3,
    frontendId: 217,
    title: "Contains Duplicate",
    titleSlug: "contains-duplicate",
    difficulty: "Easy",
    pattern: "Arrays & Hashing",
    frequency: "92%",
    companies: ["Amazon","Apple","Microsoft"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "Insert elements into a Hash Set. If set.has(val) returns true, an immediate duplicate exists.",
    pitfalls: "Sorting takes O(N log N) time and O(1) space if memory is strictly constrained.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function containsDuplicate(nums) {\n  const seen = new Set();\n  for (const n of nums) {\n    if (seen.has(n)) return true;\n    seen.add(n);\n  }\n  return false;\n}"
    },
    {
        "lang": "Python",
        "langSlug": "python3",
        "code": "class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        return len(nums) != len(set(nums))"
    },
    {
        "lang": "C++",
        "langSlug": "cpp",
        "code": "#include <vector>\n#include <unordered_set>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        unordered_set<int> seen;\n        for (int n : nums) {\n            if (seen.count(n)) return true;\n            seen.insert(n);\n        }\n        return false;\n    }\n};"
    },
    {
        "lang": "Java",
        "langSlug": "java",
        "code": "import java.util.HashSet;\nimport java.util.Set;\n\nclass Solution {\n    public boolean containsDuplicate(int[] nums) {\n        Set<Integer> set = new HashSet<>();\n        for (int n : nums) {\n            if (!set.add(n)) return true;\n        }\n        return false;\n    }\n}"
    },
    {
        "lang": "TypeScript",
        "langSlug": "typescript",
        "code": "function containsDuplicate(nums: number[]): boolean {\n  return new Set(nums).size !== nums.length;\n}"
    }
]
  },
  {
    id: 4,
    frontendId: 238,
    title: "Product of Array Except Self",
    titleSlug: "product-of-array-except-self",
    difficulty: "Medium",
    pattern: "Arrays & Hashing",
    frequency: "96%",
    companies: ["Amazon","Meta","Apple","Microsoft"],
    timeComp: "O(N)",
    spaceComp: "O(1) [excluding output array]",
    intuition: "Calculate prefix products in a forward pass, then multiply by suffix products in a backward pass without using the division operator.",
    pitfalls: "Division by zero traps if using total product / nums[i]. Follow problem constraint: division is forbidden.",
    codeSnippets: []
  },
  {
    id: 5,
    frontendId: 53,
    title: "Maximum Subarray",
    titleSlug: "maximum-subarray",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    frequency: "98%",
    companies: ["Amazon","Microsoft","Apple","Google"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Kadane's Algorithm: Maintain current_sum = max(num, current_sum + num) and update max_sum. Reset running sum whenever it drops below zero.",
    pitfalls: "All negative numbers: Initializing max_sum to 0 instead of -Infinity or nums[0] will fail.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function maxSubArray(nums) {\n  let currentSum = nums[0];\n  let maxSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}"
    },
    {
        "lang": "Python",
        "langSlug": "python3",
        "code": "class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        cur_sum = max_sum = nums[0]\n        for x in nums[1:]:\n            cur_sum = max(x, cur_sum + x)\n            max_sum = max(max_sum, cur_sum)\n        return max_sum"
    }
]
  },
  {
    id: 6,
    frontendId: 152,
    title: "Maximum Product Subarray",
    titleSlug: "maximum-product-subarray",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    frequency: "90%",
    companies: ["Amazon","Google","LinkedIn"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Track both maximum and minimum product at each step because multiplying a negative number by a minimum negative product produces a new maximum.",
    pitfalls: "Forgetting to store current max before updating when calculating min product.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function maxProduct(nums) {\n  let maxProd = nums[0], minProd = nums[0], res = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    if (nums[i] < 0) [maxProd, minProd] = [minProd, maxProd];\n    maxProd = Math.max(nums[i], maxProd * nums[i]);\n    minProd = Math.min(nums[i], minProd * nums[i]);\n    res = Math.max(res, maxProd);\n  }\n  return res;\n}"
    }
]
  },
  {
    id: 7,
    frontendId: 153,
    title: "Find Minimum in Rotated Sorted Array",
    titleSlug: "find-minimum-in-rotated-sorted-array",
    difficulty: "Medium",
    pattern: "Binary Search",
    frequency: "92%",
    companies: ["Microsoft","Amazon","Facebook"],
    timeComp: "O(log N)",
    spaceComp: "O(1)",
    intuition: "Compare mid with right. If nums[mid] > nums[right], the inflection point and minimum are in the right half (left = mid + 1). Otherwise, right = mid.",
    pitfalls: "Using right = mid - 1 may eliminate the minimum itself when nums[mid] < nums[right].",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function findMin(nums) {\n  let left = 0, right = nums.length - 1;\n  while (left < right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] > nums[right]) left = mid + 1;\n    else right = mid;\n  }\n  return nums[left];\n}"
    }
]
  },
  {
    id: 8,
    frontendId: 33,
    title: "Search in Rotated Sorted Array",
    titleSlug: "search-in-rotated-sorted-array",
    difficulty: "Medium",
    pattern: "Binary Search",
    frequency: "97%",
    companies: ["Meta","Amazon","Microsoft","Google"],
    timeComp: "O(log N)",
    spaceComp: "O(1)",
    intuition: "In any rotated sorted array, at least one half [low..mid] or [mid..high] is always strictly sorted. Determine which half is sorted and check if target lies within it.",
    pitfalls: "Off-by-one errors with <= versus < when checking bounds.",
    codeSnippets: []
  },
  {
    id: 9,
    frontendId: 15,
    title: "3Sum",
    titleSlug: "3sum",
    difficulty: "Medium",
    pattern: "Two Pointers",
    frequency: "98%",
    companies: ["Meta","Amazon","Apple","Google"],
    timeComp: "O(N²)",
    spaceComp: "O(1) or O(N)",
    intuition: "Sort array first. Fix element i, then use two pointers (left & right) to find pairs summing to -nums[i]. Skip duplicates.",
    pitfalls: "Duplicate triplets! Ensure you skip identical values after advancing both pointers.",
    codeSnippets: []
  },
  {
    id: 10,
    frontendId: 11,
    title: "Container With Most Water",
    titleSlug: "container-with-most-water",
    difficulty: "Medium",
    pattern: "Two Pointers",
    frequency: "94%",
    companies: ["Google","Amazon","Meta"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Start pointers at both ends. Compute area = min(h[l], h[r]) * (r - l). Always advance the pointer pointing to the shorter vertical bar.",
    pitfalls: "Moving the taller pointer cannot possibly produce a larger area since width shrinks.",
    codeSnippets: []
  },
  {
    id: 11,
    frontendId: 3,
    title: "Longest Substring Without Repeating Characters",
    titleSlug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    pattern: "Sliding Window",
    frequency: "98%",
    companies: ["Amazon","Microsoft","Meta","Google"],
    timeComp: "O(N)",
    spaceComp: "O(min(N, M))",
    intuition: "Sliding window with two pointers [l, r]. Use a Map of char -> lastIndex. If duplicate seen at or after l, jump l to lastIndex + 1.",
    pitfalls: "Updating left pointer to an old index behind current left window position.",
    codeSnippets: []
  },
  {
    id: 12,
    frontendId: 424,
    title: "Longest Repeating Character Replacement",
    titleSlug: "longest-repeating-character-replacement",
    difficulty: "Medium",
    pattern: "Sliding Window",
    frequency: "87%",
    companies: ["Google","Uber","Amazon"],
    timeComp: "O(N)",
    spaceComp: "O(26)",
    intuition: "Window is valid if (windowLength - maxCharFrequency) <= k. If invalid, shrink from left.",
    pitfalls: "Do not recompute maxCharFrequency from scratch on every shrink; maintaining historical max works.",
    codeSnippets: []
  },
  {
    id: 13,
    frontendId: 76,
    title: "Minimum Window Substring",
    titleSlug: "minimum-window-substring",
    difficulty: "Hard",
    pattern: "Sliding Window",
    frequency: "93%",
    companies: ["Meta","Amazon","LinkedIn","Google"],
    timeComp: "O(N + M)",
    spaceComp: "O(1) [ASCII]",
    intuition: "Expand right until window contains all target characters. Then shrink from left while maintaining validity to find minimum window.",
    pitfalls: "Comparing frequency maps vs maintaining a 'matched count' counter variable for O(1) checks.",
    codeSnippets: []
  },
  {
    id: 14,
    frontendId: 242,
    title: "Valid Anagram",
    titleSlug: "valid-anagram",
    difficulty: "Easy",
    pattern: "Arrays & Hashing",
    frequency: "88%",
    companies: ["Meta","Bloomberg","Amazon"],
    timeComp: "O(N)",
    spaceComp: "O(1) [26 alphabet letters]",
    intuition: "Count character frequencies using an array of size 26 or a hash map. Both strings must have matching counts.",
    pitfalls: "Verify whether inputs contain non-ASCII Unicode characters before fixing buffer size to 26.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (const c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}"
    },
    {
        "lang": "Python",
        "langSlug": "python3",
        "code": "from collections import Counter\n\nclass Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        return Counter(s) == Counter(t)"
    },
    {
        "lang": "C++",
        "langSlug": "cpp",
        "code": "#include <string>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        if (s.length() != t.length()) return false;\n        vector<int> counts(26, 0);\n        for (char c : s) counts[c - 'a']++;\n        for (char c : t) {\n            if (--counts[c - 'a'] < 0) return false;\n        }\n        return true;\n    }\n};"
    },
    {
        "lang": "Java",
        "langSlug": "java",
        "code": "class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] counts = new int[26];\n        for (char c : s.toCharArray()) counts[c - 'a']++;\n        for (char c : t.toCharArray()) {\n            if (--counts[c - 'a'] < 0) return false;\n        }\n        return true;\n    }\n}"
    },
    {
        "lang": "TypeScript",
        "langSlug": "typescript",
        "code": "function isAnagram(s: string, t: string): boolean {\n  if (s.length !== t.length) return false;\n  const count: Record<string, number> = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (const c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}"
    }
]
  },
  {
    id: 15,
    frontendId: 49,
    title: "Group Anagrams",
    titleSlug: "group-anagrams",
    difficulty: "Medium",
    pattern: "Arrays & Hashing",
    frequency: "95%",
    companies: ["Amazon","Meta","Google"],
    timeComp: "O(N * K log K) or O(N * K)",
    spaceComp: "O(N * K)",
    intuition: "Use sorted string representation or a 26-char frequency tuple as the dictionary key to group words.",
    pitfalls: "Creating string keys must be consistent across differing languages.",
    codeSnippets: []
  },
  {
    id: 16,
    frontendId: 20,
    title: "Valid Parentheses",
    titleSlug: "valid-parentheses",
    difficulty: "Easy",
    pattern: "Stack",
    frequency: "98%",
    companies: ["Meta","Amazon","Google","Microsoft"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "Push opening brackets to stack. For closing brackets, pop and verify matching opening bracket type. Stack must be empty at end.",
    pitfalls: "Popping from an empty stack or ending with leftover unmatched opening brackets.",
    codeSnippets: []
  },
  {
    id: 17,
    frontendId: 125,
    title: "Valid Palindrome",
    titleSlug: "valid-palindrome",
    difficulty: "Easy",
    pattern: "Two Pointers",
    frequency: "89%",
    companies: ["Meta","Microsoft","Uber"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Use left and right pointers moving inward, skipping non-alphanumeric characters and comparing lowercase chars.",
    pitfalls: "Ignoring non-alphanumeric punctuation and case-sensitivity.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, \"\");\n  let l = 0, r = clean.length - 1;\n  while (l < r) {\n    if (clean[l] !== clean[r]) return false;\n    l++;\n    r--;\n  }\n  return true;\n}"
    },
    {
        "lang": "Python",
        "langSlug": "python3",
        "code": "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        clean = [c.lower() for c in s if c.isalnum()]\n        return clean == clean[::-1]"
    },
    {
        "lang": "C++",
        "langSlug": "cpp",
        "code": "#include <string>\n#include <cctype>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n        int l = 0, r = s.size() - 1;\n        while (l < r) {\n            while (l < r && !isalnum(s[l])) l++;\n            while (l < r && !isalnum(s[r])) r--;\n            if (tolower(s[l]) != tolower(s[r])) return false;\n            l++;\n            r--;\n        }\n        return true;\n    }\n};"
    },
    {
        "lang": "Java",
        "langSlug": "java",
        "code": "class Solution {\n    public boolean isPalindrome(String s) {\n        int l = 0, r = s.length() - 1;\n        while (l < r) {\n            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;\n            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;\n            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;\n            l++;\n            r--;\n        }\n        return true;\n    }\n}"
    },
    {
        "lang": "TypeScript",
        "langSlug": "typescript",
        "code": "function isPalindrome(s: string): boolean {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, \"\");\n  let l = 0, r = clean.length - 1;\n  while (l < r) {\n    if (clean[l] !== clean[r]) return false;\n    l++;\n    r--;\n  }\n  return true;\n}"
    }
]
  },
  {
    id: 18,
    frontendId: 5,
    title: "Longest Palindromic Substring",
    titleSlug: "longest-palindromic-substring",
    difficulty: "Medium",
    pattern: "Two Pointers",
    frequency: "96%",
    companies: ["Amazon","Microsoft","Google"],
    timeComp: "O(N^2)",
    spaceComp: "O(1)",
    intuition: "Expand around center for each index: both odd length palindromes (center at i) and even length palindromes (center between i and i+1).",
    pitfalls: "Off-by-one errors when substring slicing after expansion stops.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function longestPalindrome(s) {\n  let start = 0, maxLen = 0;\n  const expand = (left, right) => {\n    while (left >= 0 && right < s.length && s[left] === s[right]) {\n      left--;\n      right++;\n    }\n    const len = right - left - 1;\n    if (len > maxLen) {\n      maxLen = len;\n      start = left + 1;\n    }\n  };\n  for (let i = 0; i < s.length; i++) {\n    expand(i, i);\n    expand(i, i + 1);\n  }\n  return s.substring(start, start + maxLen);\n}"
    }
]
  },
  {
    id: 19,
    frontendId: 647,
    title: "Palindromic Substrings",
    titleSlug: "palindromic-substrings",
    difficulty: "Medium",
    pattern: "Two Pointers",
    frequency: "90%",
    companies: ["Facebook","LinkedIn"],
    timeComp: "O(N^2)",
    spaceComp: "O(1)",
    intuition: "Expand around all 2N - 1 possible centers (odd and even) and increment count for each matching symmetric character pair.",
    pitfalls: "Constructing substrings in memory consumes excessive time and space.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function countSubstrings(s) {\n  let count = 0;\n  const expand = (l, r) => {\n    while (l >= 0 && r < s.length && s[l] === s[r]) {\n      count++;\n      l--;\n      r++;\n    }\n  };\n  for (let i = 0; i < s.length; i++) {\n    expand(i, i);\n    expand(i, i + 1);\n  }\n  return count;\n}"
    }
]
  },
  {
    id: 20,
    frontendId: 271,
    title: "Encode and Decode Strings",
    titleSlug: "encode-and-decode-strings",
    difficulty: "Medium",
    pattern: "Arrays & Hashing",
    frequency: "88%",
    companies: ["Google","Meta"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Chunk transfer encoding: Prepend each string with its length and a delimiter (e.g. '4#lint4#code'). Decoding reads length, skips delimiter, and extracts exact slice.",
    pitfalls: "Using special delimiter characters without length prefix will fail if the strings themselves contain that delimiter.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function encode(strs) {\n  return strs.map(s => `${s.length}#${s}`).join('');\n}\n\nfunction decode(s) {\n  const res = [];\n  let i = 0;\n  while (i < s.length) {\n    const hashIdx = s.indexOf('#', i);\n    const len = parseInt(s.substring(i, hashIdx), 10);\n    res.push(s.substring(hashIdx + 1, hashIdx + 1 + len));\n    i = hashIdx + 1 + len;\n  }\n  return res;\n}"
    }
]
  },
  {
    id: 21,
    frontendId: 206,
    title: "Reverse Linked List",
    titleSlug: "reverse-linked-list",
    difficulty: "Easy",
    pattern: "Linked List",
    frequency: "99%",
    companies: ["Amazon","Google","Apple","Meta"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Maintain prev (null) and curr (head). In a loop, save next = curr.next, invert pointer curr.next = prev, advance prev = curr and curr = next.",
    pitfalls: "Losing reference to the remaining list before reversing the forward pointer.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}"
    },
    {
        "lang": "Python",
        "langSlug": "python3",
        "code": "class Solution:\n    def reverseList(self, head):\n        prev, curr = None, head\n        while curr:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        return prev"
    }
]
  },
  {
    id: 22,
    frontendId: 141,
    title: "Linked List Cycle",
    titleSlug: "linked-list-cycle",
    difficulty: "Easy",
    pattern: "Linked List",
    frequency: "97%",
    companies: ["Amazon","Microsoft","Spotify"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Floyd's Tortoise and Hare: slow pointer advances 1 step, fast advances 2. If they ever intersect, a cycle exists.",
    pitfalls: "Accessing fast.next.next without verifying fast and fast.next are non-null.",
    codeSnippets: []
  },
  {
    id: 23,
    frontendId: 21,
    title: "Merge Two Sorted Lists",
    titleSlug: "merge-two-sorted-lists",
    difficulty: "Easy",
    pattern: "Linked List",
    frequency: "98%",
    companies: ["Amazon","Microsoft","Meta","Google"],
    timeComp: "O(N + M)",
    spaceComp: "O(1)",
    intuition: "Use a dummy head sentinel node. Compare values at list1 and list2, appending the smaller node to tail, and advance that pointer.",
    pitfalls: "Forgetting to attach the remainder of the non-empty list when the other is exhausted.",
    codeSnippets: []
  },
  {
    id: 24,
    frontendId: 23,
    title: "Merge k Sorted Lists",
    titleSlug: "merge-k-sorted-lists",
    difficulty: "Hard",
    pattern: "Linked List",
    frequency: "97%",
    companies: ["Amazon","Meta","Google","Microsoft"],
    timeComp: "O(N log K)",
    spaceComp: "O(1)",
    intuition: "Divide and Conquer: Pairwise merge lists like merge sort until only 1 list remains, or use a Min-Heap of size K.",
    pitfalls: "Merging lists one-by-one sequentially is slow: O(K * N) instead of O(N log K).",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function mergeKLists(lists) {\n  if (!lists || lists.length === 0) return null;\n  const mergeTwo = (l1, l2) => {\n    const dummy = { next: null };\n    let cur = dummy;\n    while (l1 && l2) {\n      if (l1.val <= l2.val) { cur.next = l1; l1 = l1.next; }\n      else { cur.next = l2; l2 = l2.next; }\n      cur = cur.next;\n    }\n    cur.next = l1 || l2;\n    return dummy.next;\n  };\n  while (lists.length > 1) {\n    const merged = [];\n    for (let i = 0; i < lists.length; i += 2) {\n      merged.push(i + 1 < lists.length ? mergeTwo(lists[i], lists[i + 1]) : lists[i]);\n    }\n    lists = merged;\n  }\n  return lists[0];\n}"
    }
]
  },
  {
    id: 25,
    frontendId: 19,
    title: "Remove Nth Node From End of List",
    titleSlug: "remove-nth-node-from-end-of-list",
    difficulty: "Medium",
    pattern: "Linked List",
    frequency: "93%",
    companies: ["Meta","Amazon","Apple"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Advance fast pointer n steps ahead. Then move slow and fast simultaneously until fast hits the end. Remove slow.next.",
    pitfalls: "Handling edge cases where the node to remove is the original head of the list.",
    codeSnippets: []
  },
  {
    id: 26,
    frontendId: 143,
    title: "Reorder List",
    titleSlug: "reorder-list",
    difficulty: "Medium",
    pattern: "Linked List",
    frequency: "90%",
    companies: ["Amazon","Meta"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Find the middle using slow/fast pointers, reverse the second half, and merge the two halves alternately.",
    pitfalls: "Not severing the end of the first half (creating infinite cycle).",
    codeSnippets: []
  },
  {
    id: 27,
    frontendId: 104,
    title: "Maximum Depth of Binary Tree",
    titleSlug: "maximum-depth-of-binary-tree",
    difficulty: "Easy",
    pattern: "Trees",
    frequency: "93%",
    companies: ["Amazon","LinkedIn","Apple"],
    timeComp: "O(N)",
    spaceComp: "O(H)",
    intuition: "Depth = 1 + max(maxDepth(root.left), maxDepth(root.right)).",
    pitfalls: "Empty tree depth is 0.",
    codeSnippets: []
  },
  {
    id: 28,
    frontendId: 100,
    title: "Same Tree",
    titleSlug: "same-tree",
    difficulty: "Easy",
    pattern: "Trees",
    frequency: "92%",
    companies: ["Amazon","Google"],
    timeComp: "O(N)",
    spaceComp: "O(H)",
    intuition: "Recursive check: If both null, true. If one is null or values differ, false. Recursively check left and right subtrees.",
    pitfalls: "Missing null checks before accessing node.val.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function isSameTree(p, q) {\n  if (!p && !q) return true;\n  if (!p || !q || p.val !== q.val) return false;\n  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);\n}"
    }
]
  },
  {
    id: 29,
    frontendId: 226,
    title: "Invert Binary Tree",
    titleSlug: "invert-binary-tree",
    difficulty: "Easy",
    pattern: "Trees",
    frequency: "94%",
    companies: ["Google","Amazon","Meta"],
    timeComp: "O(N)",
    spaceComp: "O(H) recursion stack",
    intuition: "Recursively swap root.left and root.right, then recurse on left and right children.",
    pitfalls: "Base case: return null if node is null.",
    codeSnippets: []
  },
  {
    id: 30,
    frontendId: 124,
    title: "Binary Tree Maximum Path Sum",
    titleSlug: "binary-tree-maximum-path-sum",
    difficulty: "Hard",
    pattern: "Trees",
    frequency: "95%",
    companies: ["Meta","Amazon","Google","ByteDance"],
    timeComp: "O(N)",
    spaceComp: "O(H)",
    intuition: "DFS: At each node, compute max gain from left and right child (clamped to 0). Path sum with current node as peak is node.val + left + right. Return node.val + max(left, right) to parent.",
    pitfalls: "Forgetting to clamp negative child returns to 0 (don't include branches that decrease total sum).",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function maxPathSum(root) {\n  let maxSum = -Infinity;\n  const dfs = (node) => {\n    if (!node) return 0;\n    const left = Math.max(0, dfs(node.left));\n    const right = Math.max(0, dfs(node.right));\n    maxSum = Math.max(maxSum, node.val + left + right);\n    return node.val + Math.max(left, right);\n  };\n  dfs(root);\n  return maxSum;\n}"
    }
]
  },
  {
    id: 31,
    frontendId: 102,
    title: "Binary Tree Level Order Traversal",
    titleSlug: "binary-tree-level-order-traversal",
    difficulty: "Medium",
    pattern: "Trees",
    frequency: "96%",
    companies: ["Amazon","Meta","Bloomberg"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "Queue BFS: Loop while queue is non-empty. For each level, capture queue length, pop that many nodes, and push their children.",
    pitfalls: "Not capturing queue length before the inner level loop, causing next level nodes to be processed within the current level.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function levelOrder(root) {\n  if (!root) return [];\n  const res = [];\n  const queue = [root];\n  while (queue.length > 0) {\n    const levelSize = queue.length;\n    const currentLevel = [];\n    for (let i = 0; i < levelSize; i++) {\n      const node = queue.shift();\n      currentLevel.push(node.val);\n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    res.push(currentLevel);\n  }\n  return res;\n}"
    }
]
  },
  {
    id: 32,
    frontendId: 297,
    title: "Serialize and Deserialize Binary Tree",
    titleSlug: "serialize-and-deserialize-binary-tree",
    difficulty: "Hard",
    pattern: "Trees",
    frequency: "91%",
    companies: ["Meta","Amazon","Microsoft"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "Preorder traversal DFS: Serialize by outputting val + ',' and '#' for null nodes. Deserialize by splitting into tokens and rebuilding recursively.",
    pitfalls: "Splitting strings by comma produces extra tokens if not careful with trailing characters.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function serialize(root) {\n  if (!root) return '#';\n  return `${root.val},${serialize(root.left)},${serialize(root.right)}`;\n}\n\nfunction deserialize(data) {\n  const tokens = data.split(',');\n  let index = 0;\n  const build = () => {\n    if (tokens[index] === '#') {\n      index++;\n      return null;\n    }\n    const node = { val: parseInt(tokens[index++], 10), left: null, right: null };\n    node.left = build();\n    node.right = build();\n    return node;\n  };\n  return build();\n}"
    }
]
  },
  {
    id: 33,
    frontendId: 572,
    title: "Subtree of Another Tree",
    titleSlug: "subtree-of-another-tree",
    difficulty: "Easy",
    pattern: "Trees",
    frequency: "89%",
    companies: ["Amazon","Facebook"],
    timeComp: "O(M * N)",
    spaceComp: "O(H)",
    intuition: "For each node in main tree, check if isSameTree(node, subRoot). If not, recurse on left and right subtrees.",
    pitfalls: "Assuming equal values at root is sufficient without verifying the entire tree structure.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function isSubtree(root, subRoot) {\n  if (!root) return false;\n  const isSame = (p, q) => {\n    if (!p && !q) return true;\n    if (!p || !q || p.val !== q.val) return false;\n    return isSame(p.left, q.left) && isSame(p.right, q.right);\n  };\n  if (isSame(root, subRoot)) return true;\n  return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);\n}"
    }
]
  },
  {
    id: 34,
    frontendId: 105,
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    titleSlug: "construct-binary-tree-from-preorder-and-inorder-traversal",
    difficulty: "Medium",
    pattern: "Trees",
    frequency: "90%",
    companies: ["Amazon","Microsoft"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "First element of preorder is root. Lookup root in inorder map: elements to left belong to left subtree, elements to right belong to right subtree.",
    pitfalls: "Using indexOf on inorder array repeatedly degrades performance to O(N^2); build index map beforehand.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function buildTree(preorder, inorder) {\n  const inMap = new Map();\n  inorder.forEach((val, idx) => inMap.set(val, idx));\n  let preIdx = 0;\n  const helper = (left, right) => {\n    if (left > right) return null;\n    const rootVal = preorder[preIdx++];\n    const root = { val: rootVal, left: null, right: null };\n    const mid = inMap.get(rootVal);\n    root.left = helper(left, mid - 1);\n    root.right = helper(mid + 1, right);\n    return root;\n  };\n  return helper(0, inorder.length - 1);\n}"
    }
]
  },
  {
    id: 35,
    frontendId: 98,
    title: "Validate Binary Search Tree",
    titleSlug: "validate-binary-search-tree",
    difficulty: "Medium",
    pattern: "Trees",
    frequency: "97%",
    companies: ["Amazon","Meta","Bloomberg"],
    timeComp: "O(N)",
    spaceComp: "O(H)",
    intuition: "Pass valid ranges (minVal, maxVal) recursively. Left child must be strictly < node.val, right child must be strictly > node.val.",
    pitfalls: "Only comparing parent to immediate children instead of entire subtree ancestors.",
    codeSnippets: []
  },
  {
    id: 36,
    frontendId: 230,
    title: "Kth Smallest Element in a BST",
    titleSlug: "kth-smallest-element-in-a-bst",
    difficulty: "Medium",
    pattern: "Trees",
    frequency: "93%",
    companies: ["Amazon","Facebook","Google"],
    timeComp: "O(H + K)",
    spaceComp: "O(H)",
    intuition: "Inorder traversal of a BST visits nodes in strictly ascending order. Traverse iteratively with a stack and stop at step k.",
    pitfalls: "Traversing the entire tree into an array when you can stop immediately at k.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function kthSmallest(root, k) {\n  const stack = [];\n  let cur = root;\n  while (cur || stack.length > 0) {\n    while (cur) {\n      stack.push(cur);\n      cur = cur.left;\n    }\n    cur = stack.pop();\n    k--;\n    if (k === 0) return cur.val;\n    cur = cur.right;\n  }\n  return -1;\n}"
    }
]
  },
  {
    id: 37,
    frontendId: 235,
    title: "Lowest Common Ancestor of a BST",
    titleSlug: "lowest-common-ancestor-of-a-binary-search-tree",
    difficulty: "Medium",
    pattern: "Trees",
    frequency: "94%",
    companies: ["Amazon","Meta","Microsoft"],
    timeComp: "O(H)",
    spaceComp: "O(1)",
    intuition: "In BST, if both p and q are smaller than root, LCA is in left subtree. If both greater, right subtree. The first split point is the LCA.",
    pitfalls: "Applying general binary tree DFS when BST ordering allows O(1) space iterative search.",
    codeSnippets: []
  },
  {
    id: 38,
    frontendId: 208,
    title: "Implement Trie (Prefix Tree)",
    titleSlug: "implement-trie-prefix-tree",
    difficulty: "Medium",
    pattern: "Tries",
    frequency: "95%",
    companies: ["Amazon","Twitter","Google"],
    timeComp: "O(L) per operation",
    spaceComp: "O(Total Characters)",
    intuition: "TrieNode has children map and isEndOfWord boolean. Insert and search traverse character nodes down the tree.",
    pitfalls: "Distinguishing between exact word match (search checks isEndOfWord) and prefix match (startsWith returns true once prefix exists).",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "class TrieNode {\n  constructor() {\n    this.children = {};\n    this.isEnd = false;\n  }\n}\nclass Trie {\n  constructor() { this.root = new TrieNode(); }\n  insert(word) {\n    let node = this.root;\n    for (const c of word) {\n      if (!node.children[c]) node.children[c] = new TrieNode();\n      node = node.children[c];\n    }\n    node.isEnd = true;\n  }\n  search(word) {\n    let node = this.root;\n    for (const c of word) {\n      if (!node.children[c]) return false;\n      node = node.children[c];\n    }\n    return node.isEnd;\n  }\n  startsWith(prefix) {\n    let node = this.root;\n    for (const c of prefix) {\n      if (!node.children[c]) return false;\n      node = node.children[c];\n    }\n    return true;\n  }\n}"
    }
]
  },
  {
    id: 39,
    frontendId: 211,
    title: "Design Add and Search Words Data Structure",
    titleSlug: "design-add-and-search-words-data-structure",
    difficulty: "Medium",
    pattern: "Tries",
    frequency: "89%",
    companies: ["Facebook","Amazon"],
    timeComp: "O(M) add, O(26^M) wildcard search",
    spaceComp: "O(Total characters)",
    intuition: "Trie with DFS search: When character is '.', branch recursively through all non-null child nodes of the current TrieNode.",
    pitfalls: "Wildcard '.' must check all children and return true if any path finds a match.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "class WordDictionary {\n  constructor() { this.root = {}; }\n  addWord(word) {\n    let node = this.root;\n    for (const c of word) {\n      if (!node[c]) node[c] = {};\n      node = node[c];\n    }\n    node.isEnd = true;\n  }\n  search(word) {\n    const dfs = (idx, node) => {\n      if (idx === word.length) return !!node.isEnd;\n      const c = word[idx];\n      if (c === '.') {\n        for (const key in node) {\n          if (key !== 'isEnd' && dfs(idx + 1, node[key])) return true;\n        }\n        return false;\n      }\n      if (!node[c]) return false;\n      return dfs(idx + 1, node[c]);\n    };\n    return dfs(0, this.root);\n  }\n}"
    }
]
  },
  {
    id: 40,
    frontendId: 212,
    title: "Word Search II",
    titleSlug: "word-search-ii",
    difficulty: "Hard",
    pattern: "Tries",
    frequency: "93%",
    companies: ["Amazon","Microsoft","Google"],
    timeComp: "O(M * N * 4^L)",
    spaceComp: "O(Total words characters)",
    intuition: "Insert all words into a Trie. Run 2D grid backtracking from each cell: walk Trie alongside grid to prune dead paths immediately.",
    pitfalls: "Visiting duplicate cells (use visited marker) and outputting duplicates (remove word from Trie upon finding it).",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function findWords(board, words) {\n  const root = {};\n  for (const w of words) {\n    let node = root;\n    for (const c of w) {\n      if (!node[c]) node[c] = {};\n      node = node[c];\n    }\n    node.word = w;\n  }\n  const res = [];\n  const m = board.length, n = board[0].length;\n  const dfs = (r, c, node) => {\n    if (r < 0 || c < 0 || r >= m || c >= n || !node[board[r][c]]) return;\n    const char = board[r][c];\n    const nextNode = node[char];\n    if (nextNode.word) {\n      res.push(nextNode.word);\n      nextNode.word = null;\n    }\n    board[r][c] = '#';\n    dfs(r + 1, c, nextNode);\n    dfs(r - 1, c, nextNode);\n    dfs(r, c + 1, nextNode);\n    dfs(r, c - 1, nextNode);\n    board[r][c] = char;\n  };\n  for (let i = 0; i < m; i++) {\n    for (let j = 0; j < n; j++) {\n      dfs(i, j, root);\n    }\n  }\n  return res;\n}"
    }
]
  },
  {
    id: 41,
    frontendId: 347,
    title: "Top K Frequent Elements",
    titleSlug: "top-k-frequent-elements",
    difficulty: "Medium",
    pattern: "Heap & Priority Queue",
    frequency: "96%",
    companies: ["Amazon","Meta","Uber"],
    timeComp: "O(N) with Bucket Sort, O(N log K) with Min-Heap",
    spaceComp: "O(N)",
    intuition: "Build frequency map. Group elements into an array of buckets where index is frequency. Traverse buckets backwards from N down to 1.",
    pitfalls: "Sorting the frequency map costs O(U log U) instead of O(N) bucket sort.",
    codeSnippets: []
  },
  {
    id: 42,
    frontendId: 295,
    title: "Find Median from Data Stream",
    titleSlug: "find-median-from-data-stream",
    difficulty: "Hard",
    pattern: "Heap & Priority Queue",
    frequency: "95%",
    companies: ["Google","Amazon","Apple"],
    timeComp: "O(log N) insert, O(1) find",
    spaceComp: "O(N)",
    intuition: "Two heaps: Max-Heap for lower half of numbers, Min-Heap for upper half. Balance sizes so size diff <= 1.",
    pitfalls: "Maintaining the invariant that all elements in lower half <= all in upper half.",
    codeSnippets: []
  },
  {
    id: 43,
    frontendId: 70,
    title: "Climbing Stairs",
    titleSlug: "climbing-stairs",
    difficulty: "Easy",
    pattern: "Dynamic Programming",
    frequency: "96%",
    companies: ["Amazon","Google","Apple"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Fibonacci recurrence: dp[i] = dp[i-1] + dp[i-2]. Keep only the last two values.",
    pitfalls: "Base cases n=1 and n=2.",
    codeSnippets: []
  },
  {
    id: 44,
    frontendId: 322,
    title: "Coin Change",
    titleSlug: "coin-change",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    frequency: "97%",
    companies: ["Amazon","Google","Meta","Microsoft"],
    timeComp: "O(amount * coins.length)",
    spaceComp: "O(amount)",
    intuition: "Bottom-up 1D DP: dp[i] = min(dp[i], 1 + dp[i - coin]) for each coin <= i. Initialize with Infinity.",
    pitfalls: "Handling impossible amounts (return -1 if dp[amount] === Infinity).",
    codeSnippets: []
  },
  {
    id: 45,
    frontendId: 300,
    title: "Longest Increasing Subsequence",
    titleSlug: "longest-increasing-subsequence",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    frequency: "92%",
    companies: ["Google","Meta","Amazon"],
    timeComp: "O(N log N) with Binary Search Patience Sort, O(N²) standard DP",
    spaceComp: "O(N)",
    intuition: "Maintain array 'tails'. For each num, binary search insertion index in tails. If at end, append; else overwrite.",
    pitfalls: "Subsequence elements do not have to be contiguous.",
    codeSnippets: []
  },
  {
    id: 46,
    frontendId: 1143,
    title: "Longest Common Subsequence",
    titleSlug: "longest-common-subsequence",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    frequency: "94%",
    companies: ["Amazon","Google","Meta"],
    timeComp: "O(M * N)",
    spaceComp: "O(M * N)",
    intuition: "2D DP grid: If text1[i] == text2[j], dp[i][j] = 1 + dp[i-1][j-1]. Otherwise, dp[i][j] = max(dp[i-1][j], dp[i][j-1]).",
    pitfalls: "Confusing common substring (contiguous) with common subsequence (non-contiguous).",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function longestCommonSubsequence(text1, text2) {\n  const m = text1.length, n = text2.length;\n  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (text1[i - 1] === text2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;\n      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n    }\n  }\n  return dp[m][n];\n}"
    }
]
  },
  {
    id: 47,
    frontendId: 139,
    title: "Word Break",
    titleSlug: "word-break",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    frequency: "92%",
    companies: ["Facebook","Amazon","Bloomberg"],
    timeComp: "O(N^2 * M)",
    spaceComp: "O(N)",
    intuition: "dp[i] is true if s[0...i] can be segmented into dictionary words. Check every split j < i where dp[j] is true and s[j...i] is in wordSet.",
    pitfalls: "Re-scanning wordDict as an array instead of converting to Set for O(1) lookup.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function wordBreak(s, wordDict) {\n  const wordSet = new Set(wordDict);\n  const dp = new Array(s.length + 1).fill(false);\n  dp[0] = true;\n  for (let i = 1; i <= s.length; i++) {\n    for (let j = 0; j < i; j++) {\n      if (dp[j] && wordSet.has(s.substring(j, i))) {\n        dp[i] = true;\n        break;\n      }\n    }\n  }\n  return dp[s.length];\n}"
    }
]
  },
  {
    id: 48,
    frontendId: 377,
    title: "Combination Sum IV",
    titleSlug: "combination-sum-iv",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    frequency: "84%",
    companies: ["Google","Facebook"],
    timeComp: "O(target * N)",
    spaceComp: "O(target)",
    intuition: "Permutations of coin change: dp[i] is number of combinations that add to i. dp[i] += dp[i - num] for num in nums if i >= num.",
    pitfalls: "Order matters here (unlike Coin Change II combinations). The outer loop must iterate targets and inner loop iterate nums.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function combinationSum4(nums, target) {\n  const dp = new Array(target + 1).fill(0);\n  dp[0] = 1;\n  for (let i = 1; i <= target; i++) {\n    for (const num of nums) {\n      if (i >= num) dp[i] += dp[i - num];\n    }\n  }\n  return dp[target];\n}"
    }
]
  },
  {
    id: 49,
    frontendId: 198,
    title: "House Robber",
    titleSlug: "house-robber",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    frequency: "95%",
    companies: ["Amazon","Google","Microsoft"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "At each house i, rob1 = max loot ending at i-2, rob2 = max loot ending at i-1. New loot = max(rob1 + nums[i], rob2).",
    pitfalls: "Allocating an O(N) array when only previous 2 values rob1 and rob2 are needed.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function rob(nums) {\n  let rob1 = 0, rob2 = 0;\n  for (const n of nums) {\n    const temp = Math.max(n + rob1, rob2);\n    rob1 = rob2;\n    rob2 = temp;\n  }\n  return rob2;\n}"
    }
]
  },
  {
    id: 50,
    frontendId: 213,
    title: "House Robber II",
    titleSlug: "house-robber-ii",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    frequency: "90%",
    companies: ["Microsoft","Google"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Since houses are in a circle, either rob houses 0 to n-2 OR rob houses 1 to n-1. Take the max of both runs.",
    pitfalls: "Edge case with only 1 house: must return nums[0] immediately.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function rob(nums) {\n  if (nums.length === 1) return nums[0];\n  const helper = (arr) => {\n    let r1 = 0, r2 = 0;\n    for (const n of arr) {\n      const temp = Math.max(n + r1, r2);\n      r1 = r2;\n      r2 = temp;\n    }\n    return r2;\n  };\n  return Math.max(helper(nums.slice(0, -1)), helper(nums.slice(1)));\n}"
    }
]
  },
  {
    id: 51,
    frontendId: 91,
    title: "Decode Ways",
    titleSlug: "decode-ways",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    frequency: "93%",
    companies: ["Facebook","Uber","Google"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "dp[i] represents valid decodings up to index i. Single digit s[i] != '0' contributes dp[i-1]. Two digits s[i-1..i] between 10 and 26 contribute dp[i-2].",
    pitfalls: "Leading zeros ('06' is invalid) and strings starting with '0'.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function numDecodings(s) {\n  if (!s || s[0] === '0') return 0;\n  let prev2 = 1, prev1 = 1;\n  for (let i = 1; i < s.length; i++) {\n    let cur = 0;\n    const one = parseInt(s[i], 10);\n    const two = parseInt(s.substring(i - 1, i + 1), 10);\n    if (one >= 1 && one <= 9) cur += prev1;\n    if (two >= 10 && two <= 26) cur += prev2;\n    prev2 = prev1;\n    prev1 = cur;\n  }\n  return prev1;\n}"
    }
]
  },
  {
    id: 52,
    frontendId: 62,
    title: "Unique Paths",
    titleSlug: "unique-paths",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    frequency: "92%",
    companies: ["Amazon","Google","Adobe"],
    timeComp: "O(M * N)",
    spaceComp: "O(N)",
    intuition: "Robot can only move down or right: dp[r][c] = dp[r-1][c] + dp[r][c-1]. Optimize to 1D row array.",
    pitfalls: "Grid bounds off-by-one errors; initial base case is dp[c] = 1 for all columns in the top row.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function uniquePaths(m, n) {\n  const row = new Array(n).fill(1);\n  for (let i = 1; i < m; i++) {\n    for (let j = 1; j < n; j++) {\n      row[j] += row[j - 1];\n    }\n  }\n  return row[n - 1];\n}"
    }
]
  },
  {
    id: 53,
    frontendId: 55,
    title: "Jump Game",
    titleSlug: "jump-game",
    difficulty: "Medium",
    pattern: "Greedy",
    frequency: "94%",
    companies: ["Amazon","Meta","Microsoft"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "Work backwards from the end: goal = n - 1. If i + nums[i] >= goal, update goal = i. If goal == 0 at the end, true.",
    pitfalls: "Using exponential or quadratic DP when a single backwards greedy scan solves it in O(N).",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function canJump(nums) {\n  let goal = nums.length - 1;\n  for (let i = nums.length - 2; i >= 0; i--) {\n    if (i + nums[i] >= goal) goal = i;\n  }\n  return goal === 0;\n}"
    }
]
  },
  {
    id: 54,
    frontendId: 133,
    title: "Clone Graph",
    titleSlug: "clone-graph",
    difficulty: "Medium",
    pattern: "Graphs",
    frequency: "92%",
    companies: ["Meta","Amazon","Google"],
    timeComp: "O(V + E)",
    spaceComp: "O(V)",
    intuition: "Use a Hash Map of original node -> cloned node. Perform DFS/BFS: if neighbor already cloned, reuse reference; otherwise create and recurse.",
    pitfalls: "Infinite loop in cyclic graphs if visiting tracking is missing.",
    codeSnippets: []
  },
  {
    id: 55,
    frontendId: 207,
    title: "Course Schedule",
    titleSlug: "course-schedule",
    difficulty: "Medium",
    pattern: "Graphs",
    frequency: "95%",
    companies: ["Amazon","Google","Meta"],
    timeComp: "O(V + E)",
    spaceComp: "O(V + E)",
    intuition: "Topological Sort using Kahn's algorithm (indegrees + BFS) or DFS cycle detection using 3 states (unvisited, visiting, visited).",
    pitfalls: "Disconnected graph components must all be checked.",
    codeSnippets: []
  },
  {
    id: 56,
    frontendId: 417,
    title: "Pacific Atlantic Water Flow",
    titleSlug: "pacific-atlantic-water-flow",
    difficulty: "Medium",
    pattern: "Graphs",
    frequency: "88%",
    companies: ["Google","Amazon"],
    timeComp: "O(M * N)",
    spaceComp: "O(M * N)",
    intuition: "Instead of flowing water down from each cell, flow water uphill from Pacific ocean borders and Atlantic borders using BFS/DFS. Return intersection of reachable sets.",
    pitfalls: "Re-running DFS from every cell causes TLE. Reverse thinking from ocean edges is required.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function pacificAtlantic(heights) {\n  const m = heights.length, n = heights[0].length;\n  const pac = Array.from({ length: m }, () => new Array(n).fill(false));\n  const atl = Array.from({ length: m }, () => new Array(n).fill(false));\n  const dfs = (r, c, visit, prev) => {\n    if (r < 0 || c < 0 || r >= m || c >= n || visit[r][c] || heights[r][c] < prev) return;\n    visit[r][c] = true;\n    dfs(r + 1, c, visit, heights[r][c]);\n    dfs(r - 1, c, visit, heights[r][c]);\n    dfs(r, c + 1, visit, heights[r][c]);\n    dfs(r, c - 1, visit, heights[r][c]);\n  };\n  for (let i = 0; i < m; i++) {\n    dfs(i, 0, pac, heights[i][0]);\n    dfs(i, n - 1, atl, heights[i][n - 1]);\n  }\n  for (let j = 0; j < n; j++) {\n    dfs(0, j, pac, heights[0][j]);\n    dfs(m - 1, j, atl, heights[m - 1][j]);\n  }\n  const res = [];\n  for (let i = 0; i < m; i++) {\n    for (let j = 0; j < n; j++) {\n      if (pac[i][j] && atl[i][j]) res.push([i, j]);\n    }\n  }\n  return res;\n}"
    }
]
  },
  {
    id: 57,
    frontendId: 200,
    title: "Number of Islands",
    titleSlug: "number-of-islands",
    difficulty: "Medium",
    pattern: "Graphs",
    frequency: "99%",
    companies: ["Amazon","Google","Meta","Bloomberg"],
    timeComp: "O(R * C)",
    spaceComp: "O(R * C)",
    intuition: "Iterate through 2D grid. When encountering '1', increment island count and trigger DFS/BFS to sink/visit all connected '1' cells to '0'.",
    pitfalls: "Stack overflow on huge grids if using deep recursion without visiting tracking.",
    codeSnippets: []
  },
  {
    id: 58,
    frontendId: 128,
    title: "Longest Consecutive Sequence",
    titleSlug: "longest-consecutive-sequence",
    difficulty: "Medium",
    pattern: "Arrays & Hashing",
    frequency: "90%",
    companies: ["Google","Amazon","Spotify"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "Insert all elements into a Set. Only initiate a sequence check if (num - 1) is NOT in the set (identifies sequence starts).",
    pitfalls: "Checking from every element without the start condition degrades performance to O(N²).",
    codeSnippets: []
  },
  {
    id: 59,
    frontendId: 269,
    title: "Alien Dictionary",
    titleSlug: "alien-dictionary",
    difficulty: "Hard",
    pattern: "Graphs",
    frequency: "85%",
    companies: ["Facebook","Airbnb","Pinterest"],
    timeComp: "O(C)",
    spaceComp: "O(1) (26 letters)",
    intuition: "Build a DAG by comparing adjacent words to find lexicographical ordering: character differing first gives directed edge u -> v. Run Topological Sort (Kahn's or DFS).",
    pitfalls: "Prefix invalid case: word1 is longer than word2 and word2 is a prefix of word1 (e.g. ['abc', 'ab']), which is illegal. Cycle in graph = impossible.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function alienOrder(words) {\n  const adj = new Map();\n  const inDegree = new Map();\n  for (const word of words) {\n    for (const c of word) {\n      if (!adj.has(c)) adj.set(c, new Set());\n      if (!inDegree.has(c)) inDegree.set(c, 0);\n    }\n  }\n  for (let i = 0; i < words.length - 1; i++) {\n    const w1 = words[i], w2 = words[i + 1];\n    const minLen = Math.min(w1.length, w2.length);\n    if (w1.length > w2.length && w1.startsWith(w2)) return \"\";\n    for (let j = 0; j < minLen; j++) {\n      if (w1[j] !== w2[j]) {\n        if (!adj.get(w1[j]).has(w2[j])) {\n          adj.get(w1[j]).add(w2[j]);\n          inDegree.set(w2[j], inDegree.get(w2[j]) + 1);\n        }\n        break;\n      }\n    }\n  }\n  const queue = [];\n  for (const [c, deg] of inDegree.entries()) {\n    if (deg === 0) queue.push(c);\n  }\n  let res = \"\";\n  while (queue.length > 0) {\n    const u = queue.shift();\n    res += u;\n    for (const v of adj.get(u)) {\n      inDegree.set(v, inDegree.get(v) - 1);\n      if (inDegree.get(v) === 0) queue.push(v);\n    }\n  }\n  return res.length === inDegree.size ? res : \"\";\n}"
    }
]
  },
  {
    id: 60,
    frontendId: 261,
    title: "Graph Valid Tree",
    titleSlug: "graph-valid-tree",
    difficulty: "Medium",
    pattern: "Graphs",
    frequency: "86%",
    companies: ["Google","Facebook"],
    timeComp: "O(V + E)",
    spaceComp: "O(V + E)",
    intuition: "A graph is a valid tree iff it has exactly n - 1 edges and is fully connected (no cycles). Check with Union-Find or BFS.",
    pitfalls: "If edges.length !== n - 1, it cannot be a tree (either has cycles or is disconnected).",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function validTree(n, edges) {\n  if (edges.length !== n - 1) return false;\n  const parent = Array.from({ length: n }, (_, i) => i);\n  const find = (i) => parent[i] === i ? i : (parent[i] = find(parent[i]));\n  for (const [u, v] of edges) {\n    const rootU = find(u), rootV = find(v);\n    if (rootU === rootV) return false;\n    parent[rootU] = rootV;\n  }\n  return true;\n}"
    }
]
  },
  {
    id: 61,
    frontendId: 323,
    title: "Number of Connected Components in an Undirected Graph",
    titleSlug: "number-of-connected-components-in-an-undirected-graph",
    difficulty: "Medium",
    pattern: "Graphs",
    frequency: "84%",
    companies: ["Amazon","Twitter","Google"],
    timeComp: "O(V + E)",
    spaceComp: "O(V)",
    intuition: "Start with n components. Use Disjoint Set Union (DSU): whenever an edge successfully merges two disjoint sets, decrement components count by 1.",
    pitfalls: "Not flattening trees via path compression can lead to degraded DSU runtime.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function countComponents(n, edges) {\n  const parent = Array.from({ length: n }, (_, i) => i);\n  let count = n;\n  const find = (i) => parent[i] === i ? i : (parent[i] = find(parent[i]));\n  for (const [u, v] of edges) {\n    const r1 = find(u), r2 = find(v);\n    if (r1 !== r2) {\n      parent[r1] = r2;\n      count--;\n    }\n  }\n  return count;\n}"
    }
]
  },
  {
    id: 62,
    frontendId: 73,
    title: "Set Matrix Zeroes",
    titleSlug: "set-matrix-zeroes",
    difficulty: "Medium",
    pattern: "Matrix",
    frequency: "94%",
    companies: ["Amazon","Microsoft","Meta"],
    timeComp: "O(M * N)",
    spaceComp: "O(1) in-place",
    intuition: "Use the first row and first column as markers. Track whether the first row/col originally contained zero with two boolean flags.",
    pitfalls: "Overwriting the first row/col before processing inner cells.",
    codeSnippets: []
  },
  {
    id: 63,
    frontendId: 54,
    title: "Spiral Matrix",
    titleSlug: "spiral-matrix",
    difficulty: "Medium",
    pattern: "Matrix",
    frequency: "96%",
    companies: ["Amazon","Microsoft","Apple","Google"],
    timeComp: "O(M * N)",
    spaceComp: "O(1) excluding output",
    intuition: "Maintain 4 boundaries: top, bottom, left, right. Traverse right, shrink top; traverse down, shrink right; traverse left, shrink bottom; traverse up, shrink left.",
    pitfalls: "Duplicate traversal on single-row or single-column matrices if boundaries cross mid-loop.",
    codeSnippets: []
  },
  {
    id: 64,
    frontendId: 48,
    title: "Rotate Image",
    titleSlug: "rotate-image",
    difficulty: "Medium",
    pattern: "Matrix",
    frequency: "93%",
    companies: ["Amazon","Google","Microsoft"],
    timeComp: "O(N²)",
    spaceComp: "O(1) in-place",
    intuition: "Rotate 90 degrees clockwise = Transpose matrix (swap matrix[i][j] with matrix[j][i]) then reverse each row horizontally.",
    pitfalls: "Swapping during transpose twice, which cancels out the transposition.",
    codeSnippets: []
  },
  {
    id: 65,
    frontendId: 79,
    title: "Word Search",
    titleSlug: "word-search",
    difficulty: "Medium",
    pattern: "Backtracking",
    frequency: "94%",
    companies: ["Amazon","Microsoft","Bloomberg"],
    timeComp: "O(M * N * 3^L)",
    spaceComp: "O(L)",
    intuition: "DFS with backtracking. Temporarily mark board[r][c] = '#' while exploring 4 directions, then restore character before backtracking.",
    pitfalls: "Forgetting to restore cell character upon return (corrupting board state).",
    codeSnippets: []
  },
  {
    id: 66,
    frontendId: 57,
    title: "Insert Interval",
    titleSlug: "insert-interval",
    difficulty: "Medium",
    pattern: "Intervals",
    frequency: "95%",
    companies: ["Google","Meta","LinkedIn"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "Linear scan: add all intervals ending before newInterval starts. Then merge all overlapping intervals into newInterval. Finally add remaining.",
    pitfalls: "Re-sorting array needlessly when linear O(N) pass is optimal.",
    codeSnippets: []
  },
  {
    id: 67,
    frontendId: 56,
    title: "Merge Intervals",
    titleSlug: "merge-intervals",
    difficulty: "Medium",
    pattern: "Intervals",
    frequency: "99%",
    companies: ["Meta","Google","Amazon","Bloomberg"],
    timeComp: "O(N log N)",
    spaceComp: "O(N)",
    intuition: "Sort intervals by start time. Iterate through: if curr.start <= lastMerged.end, merge by updating end = max(last.end, curr.end). Else push new interval.",
    pitfalls: "Failing to sort intervals first, or forgetting Math.max when merging ends.",
    codeSnippets: []
  },
  {
    id: 68,
    frontendId: 435,
    title: "Non-overlapping Intervals",
    titleSlug: "non-overlapping-intervals",
    difficulty: "Medium",
    pattern: "Intervals",
    frequency: "88%",
    companies: ["Meta","Amazon"],
    timeComp: "O(N log N)",
    spaceComp: "O(1)",
    intuition: "Greedy choice: sort by end times. Keep intervals that finish earliest to leave maximum room for future intervals.",
    pitfalls: "Sorting by start times requires tracking min of end times on collision.",
    codeSnippets: []
  },
  {
    id: 69,
    frontendId: 252,
    title: "Meeting Rooms",
    titleSlug: "meeting-rooms",
    difficulty: "Easy",
    pattern: "Intervals",
    frequency: "90%",
    companies: ["Facebook","Amazon","Google"],
    timeComp: "O(N log N)",
    spaceComp: "O(1)",
    intuition: "Sort meetings by start time. If intervals[i][0] < intervals[i - 1][1], there is an overlap so a person cannot attend all meetings.",
    pitfalls: "Touching endpoints (e.g. [0, 30] and [30, 40]) do not overlap.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function canAttendMeetings(intervals) {\n  intervals.sort((a, b) => a[0] - b[0]);\n  for (let i = 1; i < intervals.length; i++) {\n    if (intervals[i][0] < intervals[i - 1][1]) return false;\n  }\n  return true;\n}"
    }
]
  },
  {
    id: 70,
    frontendId: 253,
    title: "Meeting Rooms II",
    titleSlug: "meeting-rooms-ii",
    difficulty: "Medium",
    pattern: "Intervals",
    frequency: "96%",
    companies: ["Amazon","Bloomberg","Google","Facebook"],
    timeComp: "O(N log N)",
    spaceComp: "O(N)",
    intuition: "Chronological Ordering: Extract all start and end times into two sorted arrays. Iterate starts: if start < end, need new room. Else reuse room and advance end pointer.",
    pitfalls: "Attempting brute force O(N^2) interval comparisons instead of two-pointer sweep-line.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function minMeetingRooms(intervals) {\n  const starts = intervals.map(i => i[0]).sort((a, b) => a - b);\n  const ends = intervals.map(i => i[1]).sort((a, b) => a - b);\n  let rooms = 0, endIdx = 0;\n  for (let i = 0; i < starts.length; i++) {\n    if (starts[i] < ends[endIdx]) {\n      rooms++;\n    } else {\n      endIdx++;\n    }\n  }\n  return rooms;\n}"
    }
]
  },
  {
    id: 71,
    frontendId: 371,
    title: "Sum of Two Integers",
    titleSlug: "sum-of-two-integers",
    difficulty: "Medium",
    pattern: "Bit Manipulation",
    frequency: "85%",
    companies: ["Facebook","Google"],
    timeComp: "O(1)",
    spaceComp: "O(1)",
    intuition: "XOR (a ^ b) yields the sum without carry. AND shifted left ((a & b) << 1) produces the carry. Repeat until carry is zero.",
    pitfalls: "In Python/JavaScript, handling 32-bit signed integers and negative numbers with mask 0xFFFFFFFF.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function getSum(a, b) {\n  while (b !== 0) {\n    const carry = (a & b) << 1;\n    a = a ^ b;\n    b = carry;\n  }\n  return a;\n}"
    }
]
  },
  {
    id: 72,
    frontendId: 191,
    title: "Number of 1 Bits",
    titleSlug: "number-of-1-bits",
    difficulty: "Easy",
    pattern: "Bit Manipulation",
    frequency: "93%",
    companies: ["Apple","Microsoft","Amazon"],
    timeComp: "O(k) where k is set bits",
    spaceComp: "O(1)",
    intuition: "Brian Kernighan's Algorithm: n = n & (n - 1) flips the lowest set bit to 0. Repeat until n reaches 0.",
    pitfalls: "Iterating through all 32 bits when only counting set bits.",
    codeSnippets: []
  },
  {
    id: 73,
    frontendId: 338,
    title: "Counting Bits",
    titleSlug: "counting-bits",
    difficulty: "Easy",
    pattern: "Bit Manipulation",
    frequency: "88%",
    companies: ["Amazon","Apple"],
    timeComp: "O(N)",
    spaceComp: "O(N)",
    intuition: "DP recurrence: dp[i] = dp[i >> 1] + (i & 1). The number of 1 bits in i is the count in i/2 plus 1 if i is odd.",
    pitfalls: "Calculating bit counts naively for each number takes O(N log N) instead of linear O(N).",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function countBits(n) {\n  const ans = new Array(n + 1).fill(0);\n  for (let i = 1; i <= n; i++) {\n    ans[i] = ans[i >> 1] + (i & 1);\n  }\n  return ans;\n}"
    }
]
  },
  {
    id: 74,
    frontendId: 268,
    title: "Missing Number",
    titleSlug: "missing-number",
    difficulty: "Easy",
    pattern: "Bit Manipulation",
    frequency: "95%",
    companies: ["Amazon","Microsoft","Meta"],
    timeComp: "O(N)",
    spaceComp: "O(1)",
    intuition: "XOR index 0..n with all numbers in array, or use Gauss formula: expected = n*(n+1)/2 minus sum of nums.",
    pitfalls: "Integer overflow in Gauss formula if numbers are extremely large (though within 32-bit for LeetCode).",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function missingNumber(nums) {\n  let res = nums.length;\n  for (let i = 0; i < nums.length; i++) {\n    res ^= i ^ nums[i];\n  }\n  return res;\n}"
    }
]
  },
  {
    id: 75,
    frontendId: 190,
    title: "Reverse Bits",
    titleSlug: "reverse-bits",
    difficulty: "Easy",
    pattern: "Bit Manipulation",
    frequency: "82%",
    companies: ["Apple","Airbnb"],
    timeComp: "O(1)",
    spaceComp: "O(1)",
    intuition: "Loop 32 times: shift res left by 1, add (n & 1), and right-shift n by 1.",
    pitfalls: "JavaScript bitwise operators convert operands to 32-bit signed ints; use >>> 0 to treat result as unsigned.",
    codeSnippets: [
    {
        "lang": "JavaScript",
        "langSlug": "javascript",
        "code": "function reverseBits(n) {\n  let res = 0;\n  for (let i = 0; i < 32; i++) {\n    res = (res << 1) | (n & 1);\n    n >>>= 1;\n  }\n  return res >>> 0;\n}"
    }
]
  }
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
