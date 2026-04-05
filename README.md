# DSA Notes — Index

This file is a single-file index of short DSA problem notes. We'll add and organize problems here gradually — first entry is the Sieve (primes from 1 to N).

## Table of contents

- [Primes — Sieve of Eratosthenes](#primes--sieve-of-eratosthenes)
- [How to run examples](#how-to-run-examples)
- [Project organization & next steps](#project-organization--next-steps)

---

## Primes — Sieve of Eratosthenes

### Problem
Find all prime numbers from 1 to N (inclusive).

### Logic
Use the Sieve of Eratosthenes: iteratively mark multiples of each prime starting from its square, leaving unmarked numbers as primes.

### Algorithm (high-level)
1. Create a boolean array `isPrime[0..N]` and set all entries to `true`.
2. Set `isPrime[0] = false` and `isPrime[1] = false` (if those indices exist).
3. For `p` from 2 while `p * p <= N`:
   - If `isPrime[p]` is `true`, mark every multiple `j` from `p*p` to `N` (step `p`) as `false`.
4. Remaining indices `i` with `isPrime[i] == true` are primes.

### Pseudocode

for i = 0..N:
  isPrime[i] = true
isPrime[0] = false
isPrime[1] = false
for p = 2; p * p <= N; p++:
  if isPrime[p]:
    for j = p * p; j <= N; j += p:
      isPrime[j] = false

### Complexity
- Time: O(N log log N)
- Space: O(N)

### Java implementation notes
- See `Primes1ToN.java` for the implementation: [Primes1ToN.java](Primes1ToN.java#L1-L200)
- Input validation: handle `N < 0`, `N == 0`, and extreme values. Avoid silently accepting `Integer.MIN_VALUE` with `Math.abs` (it overflows).
- Use `p <= N / p` instead of `p * p <= N` to avoid overflow on very large `N`.
- Close the `Scanner` when done to free resources.

### Edge cases and tests
- `N = 0` → no primes
- `N = 1` → no primes
- `N = 2` → output: `2`
- `N = 10` → output: `2 3 5 7`

---

## How to run examples

Compile and run the example program:

```bash
javac Primes1ToN.java
printf "10\n" | java Primes1ToN
```

Expected for input `10`:

```
2 3 5 7 
```

---

## Project organization & next steps

- Current approach: one Java file per problem (easy to compile/run individually).
- This single `README.md` will serve as the index and notes file for multiple problems.
- Next additions I can make:
  - Add more problems to this file and link each to its source.
  - Create `notes/` for deeper per-algorithm writeups (optional).
  - Add `run_all.sh` to compile and run sample inputs automatically.

If you prefer a per-problem markdown file under `notes/`, I can create `notes/Primes1ToN.md` and move details there while keeping this index.