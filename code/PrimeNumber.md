# Check if a Number is Prime

## Overview
Determine whether a given number is **prime** using **Trial Division**.

## Problem Statement
Given a number `n`, check if it's a prime number (only divisible by 1 and itself).

**Input:** `17`  
**Output:** `17 is a prime number.`

**Input:** `20`  
**Output:** `20 is not a prime number.`

## Algorithm Explanation

### Approach: Trial Division

1. Handle edge cases: numbers < 2 are not prime
2. Check divisibility from 2 to √n
3. If any divisor found, it's **not prime**
4. If no divisor found, it's **prime**

### Key Insight
- Only check divisors up to √n
- If n has a divisor > √n, it must also have a divisor < √n
- So checking up to √n is sufficient

### Example: Is 17 Prime?
```
n = 17
Check: i=2: 17%2 != 0
       i=3: 17%3 != 0
       i=4: 4*4=16 <= 17, check: 17%4 != 0
Stop here (5*5=25 > 17)
No divisors found → 17 is PRIME ✓
```

### Example: Is 20 Prime?
```
n = 20
Check: i=2: 20%2 == 0 → DIVISOR FOUND!
Not prime ✓
```

## Code Walkthrough

```java
import java.util.Scanner;

class PrimeNumber {
    public static void main(String[] args) {
        boolean prime = true;
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter any number: ");
        int num = sc.nextInt();
        
        // Handle edge case
        if (num < 2) {
            System.out.println("not a Prime number");
        }
        else {
            // Check divisibility from 2 to sqrt(num)
            for (int i = 2; i * i <= num; i++) {
                if (num % i == 0) {
                    prime = false;
                    break;  // Optimization: exit early
                }
            }
            
            if (prime == true) {
                System.out.println(num + " is a prime number.");
            }
            else {
                System.out.println(num + " is not a prime number.");
            }
        }
    }
}
```

## Complexity Analysis

| Metric | Value |
|--------|-------|
| **Time** | **O(√n)** |
| **Space** | **O(1)** |

**Why O(√n)?**
- We check divisors from 2 to √n
- Maximum iterations = √n

## Real-World Applications

✅ Cryptography (RSA, prime number generation)  
✅ Hashing (hash table sizes often prime)  
✅ Number theory problems  
✅ Coding interviews and competitive programming

## Optimizations

### Optimization 1: Check Only Odd Numbers
```java
// After checking 2, only check odd numbers
if (num == 2) {
    return true;
}
if (num % 2 == 0) {
    return false;
}
for (int i = 3; i * i <= num; i += 2) {
    if (num % i == 0) {
        return false;
    }
}
return true;
```

### Optimization 2: Check Modulo 6
```java
// All primes > 3 are of form 6k±1
if (num <= 1) return false;
if (num <= 3) return true;
if (num % 2 == 0 || num % 3 == 0) return false;

for (int i = 5; i * i <= num; i += 6) {
    if (num % i == 0 || num % (i + 2) == 0) {
        return false;
    }
}
return true;
```

## Comparison: Different Approaches

| Approach | Time | Space | Use Case |
|----------|------|-------|----------|
| **Trial Division** | O(√n) | O(1) | Single check, interviews |
| **Sieve of Eratosthenes** | O(n log log n) | O(n) | Find all primes ≤ N |
| **Miller-Rabin** | O(k log³ n) | O(1) | Large numbers, probabilistic |
| **AKS Primality** | O(log⁶ n) | O(log n) | Deterministic (academic) |

## Edge Cases

| Input | Output | Notes |
|-------|--------|-------|
| `0` | Not prime | < 2 |
| `1` | Not prime | By definition |
| `2` | Prime | Smallest prime |
| `-5` | Not prime | Negative |
| `97` | Prime | Large single prime |

## Practice Problems

- [LeetCode 204: Count Primes](https://leetcode.com/problems/count-primes/)
- [LeetCode 1175: Prime Arrangements](https://leetcode.com/problems/prime-arrangements/)
- [LeetCode 2523: Closest Prime Numbers](https://leetcode.com/problems/closest-prime-numbers-in-range/)

## Key Takeaways

🔑 Check divisors only up to √n (huge optimization!)  
🔑 Break early when divisor found  
🔑 Handle edge cases (< 2 are not prime)  
🔑 Foundation for Sieve and primality testing  
🔑 Related: Prime factorization, Sieve of Eratosthenes
