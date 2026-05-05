# Prime Factorization

## Overview
Find and list all **prime factors** of a given number using **Trial Division**.

## Problem Statement
Given a number `n`, find all prime numbers whose product equals `n`.

**Input:** `24`  
**Output:** `2 2 2 3` (since 24 = 2³ × 3)

## Algorithm Explanation

### Approach: Trial Division

1. Start with divisor `i = 2`
2. While `i² ≤ n`:
   - While `n` is divisible by `i`:
     - Add `i` to factors
     - Divide `n` by `i`
   - Move to next `i`
3. If `n > 1` after loop, `n` itself is a prime factor

### Key Insight
- Only check divisors up to √n (all factors come in pairs)
- If `n` has a factor > √n, it must also have a factor < √n

### Example: 24
```
n=24, factors=[]
i=2: 24%2=0 → factors=[2], n=12
     12%2=0 → factors=[2,2], n=6
     6%2=0  → factors=[2,2,2], n=3
     3%2!=0 → move to i=3
i=3: 3*3=9 > 3, exit loop
n=3 > 1 → factors=[2,2,2,3]
Output: 2 2 2 3 ✓
```

## Code Walkthrough

```java
import java.util.ArrayList;
import java.util.Scanner;

public class PrimeFactor {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter the number: ");
        long num = sc.nextLong();
        
        ArrayList<Long> factors = new ArrayList<>();

        if (num < 2) {
            System.out.println("No prime factors for " + num);
            return;
        }

        // Trial division: only check up to sqrt(n)
        for (long i = 2; i * i <= num; i++) {
            while (num % i == 0) {
                factors.add(i);  // Collect prime factor
                num /= i;        // Reduce n
            }
        }

        // Remaining num (if > 1) is a prime factor
        if (num > 1) {
            factors.add(num);
        }

        System.out.print("Prime factors: ");
        for (long f : factors) {
            System.out.print(f + " ");
        }
        System.out.println();
        sc.close();
    }
}
```

## Complexity Analysis

| Metric | Value |
|--------|-------|
| **Time** | **O(√n)** |
| **Space** | **O(log n)** |

**Time Justification:**
- We check divisors only up to √n
- Worst case: n is prime, we check all i from 2 to √n

**Space Justification:**
- At most O(log n) prime factors (each factor ≥ 2)

## Real-World Applications

✅ Number theory (GCD, LCM computation)  
✅ Cryptography (RSA security depends on factorization difficulty)  
✅ Integer factorization problems  
✅ Competitive programming and coding interviews

## Key Optimizations

### Skip Even Numbers After 2
```java
factors.add(2L);
while (num % 2 == 0) {
    factors.add(2L);
    num /= 2;
}
// Now start from i=3, increment by 2
for (long i = 3; i * i <= num; i += 2) {
    while (num % i == 0) {
        factors.add(i);
        num /= i;
    }
}
```

### Use Long for Large Numbers
```java
// Handles numbers up to 2^63 - 1 (long range)
// If using int, limited to 2^31 - 1
```

## Practice Problems

- [LeetCode 254: Factor Combinations](https://leetcode.com/problems/factor-combinations/)
- [LeetCode 1930: Unique Length-3 Palindromic Subsequences](https://leetcode.com/problems/unique-length-3-palindromic-subsequences/)

## Edge Cases

| Input | Output | Notes |
|-------|--------|-------|
| `1` | No factors | Special case (not prime) |
| `2` | `2` | Smallest prime |
| `-5` | Error/No factors | Handle negative numbers |
| `97` | `97` | Prime number |

## Key Takeaways

🔑 Trial division is **O(√n)**, not O(n)  
🔑 Only check divisors up to √n (mathematical insight!)  
🔑 Handles large numbers using `long` data type  
🔑 Foundation for understanding RSA encryption  
🔑 Greedy approach: always extract smallest factors first
