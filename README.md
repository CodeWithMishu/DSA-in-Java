# DSA in Java - Problem Solutions & Notes

A comprehensive collection of Data Structures and Algorithms problems solved in Java, organized by topic and difficulty level with detailed explanations, algorithms, and optimization techniques.

---

## 📑 Table of Contents (Quick Navigation)

### 🔢 Maths
- **Easy**
  1. [Primes1ToN](#maths--easy--1-primes1ton---sieve-of-eratosthenes)
  2. [PrimeNumber](#maths--easy--2-primenumber---primality-test)
  3. [FastPower](#maths--easy--3-fastpower---exponentiation-by-squaring)
  4. [PrimeFactor](#maths--easy--4-primefactor---prime-factorization)
- **Medium** *(Coming Soon)*
- **Hard** *(Coming Soon)*

### 📚 Additional Resources
- [Key Patterns & Techniques](#key-patterns--techniques)
- [Complexity Analysis Cheatsheet](#complexity-analysis-cheatsheet)

---

## 🔢 MATHS

### 📊 EASY

---

## Maths › Easy › 1. Primes1ToN - Sieve of Eratosthenes

**📄 Source Code:** [Maths/Easy/Primes1ToN.java](Maths/Easy/Primes1ToN.java)

**📈 Difficulty:** Easy | **⏱️ Time Complexity:** O(N log log N) | **💾 Space Complexity:** O(N)

### 📋 Problem
Find all prime numbers from 1 to N efficiently.

### 🔍 Approach
**Sieve of Eratosthenes** - One of the most efficient algorithms for finding all primes up to N

1. Create a boolean array of size N+1, mark all as true (assume prime)
2. Mark 0 and 1 as false (not prime)
3. For each prime p from 2 to √N:
   - Mark all multiples of p (starting from p²) as false (not prime)
4. All remaining true values are primes

### 💡 Why it Works
- Marks composite numbers by eliminating multiples of each prime
- Only needs to check up to √N in outer loop
- Inner loop starts from p² (all smaller multiples already marked)

### 📊 Complexity Analysis
- **Time:** O(N log log N) - Much faster than checking each number individually
- **Space:** O(N) - Boolean array of size N+1

### 💎 Key Tips & Insights
- **Why start from p²?** All multiples of p less than p² have been marked by smaller primes
  - Example: For p=5, we skip 10 (marked by 2), 15 (marked by 3) and start from 25
- **Why √N in outer loop?** Any composite number ≤ N has a factor ≤ √N
- **Optimization:** `i * i <= n` avoids sqrt() calculation
- **Best use case:** When you need ALL primes up to N
- **Not ideal for:** Single primality test or very large sparse ranges
- **Memory efficient:** Boolean array is small compared to other approaches
- **Batch operation:** Much faster than checking N numbers individually with trial division

### 📝 Code Pattern
```java
boolean[] isPrime = new boolean[n+1];
Arrays.fill(isPrime, true);
isPrime[0] = isPrime[1] = false;

for(int p = 2; p * p <= n; p++) {
    if(isPrime[p]) {
        for(int j = p * p; j <= n; j += p) {
            isPrime[j] = false;  // Mark multiples as non-prime
        }
    }
}
```

### 🎯 Example Walkthrough (N = 30)
```
Initial: [F, F, T, T, T, T, T, T, T, T, T, T, ...]
p=2: Mark 4,6,8,10,12,14,16,18,20,22,24,26,28,30 as false
p=3: Mark 9,15,21,27 as false (6,12,18,24,30 already marked)
p=5: Mark 25 as false (10,15,20,30 already marked)
Result: Primes are [2,3,5,7,11,13,17,19,23,29]
```

---

## Maths › Easy › 2. PrimeNumber - Primality Test

**📄 Source Code:** [Maths/Easy/PrimeNumber.java](Maths/Easy/PrimeNumber.java)

**📈 Difficulty:** Easy | **⏱️ Time Complexity:** O(√N) | **💾 Space Complexity:** O(1)

### 📋 Problem
Check if a given number is prime or not.

### 🔍 Approach
**Trial Division up to √N**

- A prime number is only divisible by 1 and itself
- We only need to check divisors up to √N
- If no divisor found in range [2, √N], the number is prime

### 💡 Why √N?
- If N = a × b, then one of a or b must be ≤ √N
- So if no divisor ≤ √N exists, N is definitely prime
- Example: To check if 36 is prime, we only need to check up to 6

### 📊 Complexity Analysis
- **Time:** O(√N) - We iterate from 2 to √N
- **Space:** O(1) - Single boolean variable

### 💎 Key Tips & Insights
- **Edge cases:** Numbers < 2 are not prime
- **Optimization:** Use `i * i <= n` instead of `i <= sqrt(n)` to avoid floating-point calculations
- **Pattern:** This is the foundation for all prime-checking algorithms
- **Why O(√N)?** The most important optimization in basic number theory
- **Break early:** Once we find a divisor, we can immediately return false

### 📝 Code Pattern
```java
if(num < 2) return false;
for(int i = 2; i * i <= num; i++) {
    if(num % i == 0) return false;  // Found a divisor
}
return true;  // No divisor found, it's prime
```

---

## Maths › Easy › 3. FastPower - Exponentiation by Squaring

**📄 Source Code:** [Maths/Easy/FastPower.java](Maths/Easy/FastPower.java)

**📈 Difficulty:** Easy | **⏱️ Time Complexity:** O(log Y) | **💾 Space Complexity:** O(1)

### 📋 Problem
Calculate X^Y (X raised to power Y) efficiently.

### 🔍 Approach
**Exponentiation by Squaring (Binary Exponentiation)**

Instead of multiplying X by itself Y times, we use the binary representation of Y:
- If Y is odd: multiply result by current X
- Divide Y by 2 (shift right)
- Square X (x = x²)
- Repeat until Y becomes 0

### 💡 Algorithm Logic
```
result = 1
while Y >= 1:
    if Y is odd:
        result *= X
    Y = Y / 2
    X = X * X
return result
```

### 📊 Complexity Analysis
- **Time:** O(log Y) - We divide Y by 2 in each iteration
- **Space:** O(1) - Only a few variables used

### 💎 Key Tips & Insights
- **Why it works:** Uses binary decomposition of exponent
  - Example: 2^6 = 2^(4+2) = 2^4 × 2^2
- **Common pattern:** Check if number is odd using `n % 2 != 0` or `n & 1`
- **Optimization:** Use `y = y >> 1` (bit shift) instead of `y = y / 2` for faster execution
- **Use cases:** Large exponents, modular exponentiation, competitive programming
- **Overflow caution:** Watch for integer overflow with large X and Y values

### 📝 Code Pattern
```java
while(y >= 1) {
    if(y % 2 != 0) result *= x;  // If odd exponent, multiply
    y = y / 2;                     // Divide exponent
    x = x * x;                     // Square the base
}
```

---

## Maths › Easy › 4. PrimeFactor - Prime Factorization

**📄 Source Code:** [Maths/Easy/PrimeFactor.java](Maths/Easy/PrimeFactor.java)

**📈 Difficulty:** Easy | **⏱️ Time Complexity:** O(√N) | **💾 Space Complexity:** O(log N)

### 📋 Problem
Find all prime factors of a number N and return them in a list.

### 🔍 Approach
**Optimized Trial Division**

- Try dividing N by 2, 3, 5, ... up to √N
- For each divisor found, divide N repeatedly until it's no longer divisible
- If N > 1 after loop, N itself is a prime factor

### 💡 Algorithm Logic
```
for i = 2 to √N:
    while N % i == 0:
        add i to factors
        N = N / i
if N > 1:
    add N to factors
```

### 📊 Complexity Analysis
- **Time:** O(√N) in best case; O(log N) on average
- **Space:** O(log N) - For storing prime factors

### 💎 Key Tips & Insights
- **Unique optimization:** After dividing out a prime, we skip it automatically
  - Example: For 12 = 2² × 3, after dividing by 2 twice, N becomes 3
- **Why it works:** Uses the fact that we process divisors in increasing order
  - All non-prime factors get eliminated
  - Only prime factors remain
- **Data type matters:** Use `long` instead of `int` for larger numbers
- **Loop condition:** `i * i <= num` handles the division as num changes
- **ArrayList advantage:** Dynamic array stores factors without pre-knowing count
- **Important:** If N > 1 after loop, it's a prime factor itself

### 📝 Code Pattern
```java
for (long i = 2; i * i <= num; i++) {
    while (num % i == 0) {
        factors.add(i);           // Store the prime factor
        num /= i;                 // Reduce N
    }
}
if (num > 1) factors.add(num);    // Remaining is a prime factor
```

### 🎯 Example Walkthrough
```
N = 24
i = 2: 24 % 2 == 0 → factors = [2], N = 12
       12 % 2 == 0 → factors = [2,2], N = 6
       6 % 2 == 0 → factors = [2,2,2], N = 3
i = 3: 3 % 3 == 0 → factors = [2,2,2,3], N = 1
Result: [2, 2, 2, 3] (which is 2³ × 3)
```

---

## Key Patterns & Techniques

### 🎯 Pattern 1: Check Up to √N
Used in: PrimeNumber, PrimeFactor, Primes1ToN

```java
// Instead of checking up to n
for(int i = 2; i <= n; i++) { ... }

// Check only up to √n using i*i
for(int i = 2; i * i <= n; i++) { ... }
```

**Why?** Avoids expensive square root calculation and reduces iterations significantly.

---

### 🎯 Pattern 2: Check if Number is Odd
Used in: FastPower

```java
// Method 1: Using modulo
if(n % 2 != 0) { /* n is odd */ }

// Method 2: Using bitwise AND (faster)
if((n & 1) == 1) { /* n is odd */ }
```

**Why?** Odd numbers don't divide evenly by 2; bitwise is faster than modulo.

---

### 🎯 Pattern 3: Optimize with Early Break
Used in: PrimeNumber

```java
for(int i = 2; i * i <= num; i++) {
    if(num % i == 0) {
        prime = false;
        break;  // Exit immediately when condition found
    }
}
```

**Why?** Once a divisor is found, no need to check further - number is definitely not prime.

---

### 🎯 Pattern 4: Process Factor Until Done
Used in: PrimeFactor

```java
while(num % i == 0) {
    factors.add(i);
    num /= i;
}
```

**Why?** Handles repeated prime factors efficiently (e.g., 2² in 12).

---

### 🎯 Pattern 5: Handle Remaining Value
Used in: PrimeFactor

```java
// After loop
if(num > 1) {
    factors.add(num);  // Remaining value is a prime factor
}
```

**Why?** If N has a prime factor greater than √N, it remains after the loop.

---

### 🎯 Pattern 6: Sieve Marking from p²
Used in: Primes1ToN

```java
for(int j = p * p; j <= n; j += p) {
    isPrime[j] = false;
}
```

**Why?** Smaller multiples already marked; saves operations.

---

## Complexity Analysis Cheatsheet

| Algorithm | Time | Space | Best For | Limitations |
|-----------|------|-------|----------|-------------|
| **FastPower** | O(log Y) | O(1) | Large exponents | Only for exponentiation |
| **PrimeNumber** | O(√N) | O(1) | Single number test | Not efficient for multiple tests |
| **PrimeFactor** | O(√N) avg | O(log N) | Prime factorization | Slow for very large numbers |
| **Primes1ToN** | O(N log log N) | O(N) | All primes up to N | Memory usage for very large N |

---

## 📌 Important Takeaways

✅ **Always check √N** when dealing with divisibility problems - major optimization!

✅ **Edge cases matter** - Handle numbers < 2 separately in prime problems

✅ **Choose right algorithm:**
   - Single prime check? → O(√N) trial division
   - All primes up to N? → Sieve of Eratosthenes
   - Prime factors? → Trial division with repeated division

✅ **Use `i * i <= n`** instead of `i <= sqrt(n)` to avoid floating-point precision issues

✅ **Early termination** - Break/return as soon as you find what you're looking for

✅ **Data types matter** - Use `long` when dealing with potentially large numbers

---

## 🚀 Practice Extensions

Try solving these variations:

1. **FastPower:** Implement modular exponentiation: `(X^Y) % MOD`
2. **PrimeNumber:** Check primality using Fermat's theorem or Miller-Rabin
3. **PrimeFactor:** Count distinct prime factors, or find LCM/GCD
4. **Primes1ToN:** Find twin primes, cousin primes, sexy primes up to N

---

## 📁 Project Structure

```
DSA-in-Java/
├── Maths/
│   ├── Easy/
│   │   ├── FastPower.java
│   │   ├── PrimeFactor.java
│   │   ├── PrimeNumber.java
│   │   └── Primes1ToN.java
│   ├── Medium/
│   └── Hard/
└── README.md (this file)
```

---

*Last Updated: May 7, 2026*
*Organization: Topic > Difficulty > Problem*
