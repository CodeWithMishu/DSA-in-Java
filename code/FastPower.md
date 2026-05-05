# Fast Power — Binary Exponentiation

## Overview
Efficiently compute `x^y` using **Binary Exponentiation** (also called Exponentiation by Squaring).

## Problem Statement
Calculate `x` raised to the power of `y` in logarithmic time without using built-in `Math.pow()`.

**Input:** `x = 2, y = 6`  
**Output:** `64` (2^6)

## Algorithm Explanation

Instead of multiplying `x` by itself `y` times (naive O(y) approach), we use the binary representation of `y`:

### Key Insight
- If `y` is **even**: `x^y = (x^2)^(y/2)`
- If `y` is **odd**: `x^y = x * x^(y-1)` = `x * (x^2)^((y-1)/2)`

### Example: 2^6
```
y = 6 = 110 (binary)

Step 1: y=6 (even)  → x=2*2=4, y=3
Step 2: y=3 (odd)   → result=1*2=2, x=4*4=16, y=1
Step 3: y=1 (odd)   → result=2*16=32, x=256, y=0
Output: 32 ✗ (Wrong! Let me recalculate...)

Actually:
x=2, y=6, result=1
Loop 1: y%2!=0 (6%2=0, no change), y=3, x=4
Loop 2: y%2!=0 (3%2=1, yes), result=1*4=4, y=1, x=16
Loop 3: y%2!=0 (1%2=1, yes), result=4*16=64, y=0, x=256
Output: 64 ✓
```

## Code Walkthrough

```java
public class FastPower {
    public static void main(String[] args) {
        int x = 2;       // Base
        int y = 6;       // Exponent
        int result = 1;  // Accumulator
        
        while(y >= 1) {
            // If y is odd, multiply result by current x
            if(y % 2 != 0) {
                result *= x;
            }
            // Square the base
            y = y / 2;      // y >> 1 (right shift)
            x *= x;         // x = x * x
        }
        System.out.println(result);  // Output: 64
    }
}
```

## Complexity Analysis

| Metric | Value |
|--------|-------|
| **Time** | **O(log y)** |
| **Space** | **O(1)** |

**Why O(log y)?**
- Each iteration halves `y`: 6 → 3 → 1 → 0
- Total iterations = ⌊log₂(y)⌋ + 1

## Real-World Applications

✅ Modular exponentiation (cryptography: RSA, ECDSA)  
✅ Matrix exponentiation (Fibonacci in O(log n))  
✅ Fast computation of powers with large exponents  
✅ Used in competitive programming for constraints up to 10^18

## Variations

### Modular Exponentiation
```java
// Compute (x^y) % mod efficiently
public static long modPow(long x, long y, long mod) {
    long result = 1;
    x %= mod;
    while (y > 0) {
        if (y % 2 == 1) {
            result = (result * x) % mod;
        }
        x = (x * x) % mod;
        y /= 2;
    }
    return result;
}
```

### Negative Exponents
```java
// Handle x^(-y)
public static double powerWithNegative(double x, int y) {
    if (y < 0) {
        x = 1.0 / x;
        y = -y;
    }
    return fastPowerHelper(x, y);
}
```

## Practice Problems

- [LeetCode 50: Pow(x, n)](https://leetcode.com/problems/powx-n/)
- [LeetCode 372: Super Pow](https://leetcode.com/problems/super-pow/)
- [LeetCode 2950: Number of Divisible Subsequences](https://leetcode.com/problems/number-of-divisible-subsequences/)

## Key Takeaways

🔑 **Binary representation** is your friend for optimization  
🔑 Works by halving the exponent each iteration  
🔑 Critical for competitive programming and cryptography  
🔑 Extension: handles modular arithmetic, negative exponents
