# Sieve of Eratosthenes — Find All Primes from 1 to N

## Overview
Find **all prime numbers** up to `n` efficiently using the **Sieve of Eratosthenes** algorithm.

## Problem Statement
Given a number `N`, find all prime numbers in the range [1, N].

**Input:** `N = 20`  
**Output:** `2 3 5 7 11 13 17 19`

## Algorithm Explanation

### Approach: Sieve of Eratosthenes

1. Create a boolean array `isPrime[0...n]`, initialize all to `true`
2. Mark `isPrime[0]` and `isPrime[1]` as `false` (not prime by definition)
3. For each `p` from 2 to √n:
   - If `isPrime[p]` is `true`:
     - Mark all multiples of `p` starting from `p²` as `false`
4. All indices still marked `true` are prime

### Key Insight
- We don't check each number individually for primality
- Instead, we **eliminate multiples** of each prime
- Much faster than checking each number: O(n log log n) vs O(n√n)

### Example: Find Primes from 1 to 20

```
Initial: [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T]
         [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]

Step 1: Mark 0 and 1 as false
        [F,F,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T]

Step 2: p=2 (prime), mark multiples starting from 4
        [F,F,T,T,F,T,F,T,F,T,F,T,F,T,F,T,F,T,F,T,F]

Step 3: p=3 (prime), mark multiples starting from 9
        [F,F,T,T,F,T,F,T,F,F,F,T,F,T,F,F,F,T,F,T,F]

Step 4: p=4 (p*p=16 > 20), but 4 is not prime, skip

Step 5: p=5 (p*p=25 > 20), exit loop

Result: Indices with true: 2, 3, 5, 7, 11, 13, 17, 19 ✓
```

## Code Walkthrough

```java
import java.util.Scanner;
import java.util.Arrays;

public class Primes1ToN {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter the value of N (primes 1 to N): ");
        int n = Math.abs(sc.nextInt());
        
        // Create sieve array
        boolean[] isPrime = new boolean[n + 1];
        Arrays.fill(isPrime, true);
        
        // 0 and 1 are not prime
        isPrime[0] = false;
        isPrime[1] = false;
        
        // Sieve: mark multiples of each prime as composite
        for (int p = 2; p * p <= n; p++) {
            if (isPrime[p]) {
                // Mark multiples starting from p²
                for (int j = p * p; j <= n; j += p) {
                    isPrime[j] = false;
                }
            }
        }
        
        // Print all primes
        for (int i = 0; i <= isPrime.length - 1; i++) {
            if (isPrime[i]) {
                System.out.print(i + " ");
            }
        }
        sc.close();
    }
}
```

## Complexity Analysis

| Metric | Value |
|--------|-------|
| **Time** | **O(n log log n)** |
| **Space** | **O(n)** |

**Time Justification:**
- Outer loop: O(√n)
- Inner loops mark multiples: roughly n/2 + n/3 + n/5 + ... = O(n log log n)
- Total: O(n log log n)

**Comparison with Trial Division:**
- Trial Division (individual check): O(n√n)
- Sieve: O(n log log n)
- **Sieve is ~1000x faster for n=1,000,000**

## Real-World Applications

✅ Generate first N primes efficiently  
✅ Competitive programming problems  
✅ Prime-based cryptography  
✅ Distribution analysis of primes

## Optimizations

### Optimization 1: Skip Even Numbers
```java
// Only store odd numbers (save 50% space)
public static int[] sieveOptimized(int n) {
    if (n < 2) return new int[0];
    
    boolean[] isPrime = new boolean[(n / 2)];
    Arrays.fill(isPrime, true);
    
    for (int i = 1; i * i < n; i++) {
        if (isPrime[i]) {
            int p = 2 * i + 1;
            for (int j = i + p; j < isPrime.length; j += p) {
                isPrime[j] = false;
            }
        }
    }
    
    // Reconstruct primes from odd indices
    ArrayList<Integer> primes = new ArrayList<>();
    primes.add(2);
    for (int i = 1; i < isPrime.length; i++) {
        if (isPrime[i]) {
            primes.add(2 * i + 1);
        }
    }
    return primes.stream().mapToInt(Integer::intValue).toArray();
}
```

### Optimization 2: Segmented Sieve (For Large Ranges)
```java
// Find primes in range [L, R] without storing all primes up to L
// Useful when R - L is small but L is very large
```

## Performance Comparison

| Algorithm | Time | Space | Best For |
|-----------|------|-------|----------|
| **Trial Division** | O(n√n) | O(1) | Single number checks |
| **Sieve** | O(n log log n) | O(n) | Find all primes ≤ N |
| **Segmented Sieve** | O((R-L) log log R) | O(√R) | Large range [L,R] |

## Related Problems

- [LeetCode 204: Count Primes](https://leetcode.com/problems/count-primes/)
- [LeetCode 2523: Closest Prime Numbers](https://leetcode.com/problems/closest-prime-numbers-in-range/)
- [Codeforces: Prime Grid](https://codeforces.com/problemset/problem/538/D)

## Edge Cases

| Input | Output | Notes |
|-------|--------|-------|
| `0` | Empty | No primes ≤ 0 |
| `1` | Empty | No primes ≤ 1 |
| `2` | `2` | Smallest prime |
| `-5` | Handled by `Math.abs()` | Converts to positive |
| `1000000` | ~78,498 primes | Demonstrates efficiency |

## Key Takeaways

🔑 O(n log log n) is **much faster** than checking each number individually  
🔑 Mark multiples, not numbers themselves  
🔑 Start marking from `p²` (smaller multiples already marked)  
🔑 Space-time trade-off: use O(n) space to get O(n log log n) time  
🔑 Foundation for number theory problems

## Interview Tips

- **Time:** Explain why O(n log log n) is better than O(n√n)
- **Space:** Discuss memory usage for large N (1 billion)
- **Extension:** Ask about segmented sieve for massive ranges
- **Pattern:** "Mark multiples, not individual checks" is key insight
