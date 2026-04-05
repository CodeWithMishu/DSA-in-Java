# DSA Notes — Primes and Sieve

## Problem
Find all prime numbers from 1 to N (inclusive).

## Logic
Use the Sieve of Eratosthenes: iteratively mark multiples of each prime starting from its square, leaving unmarked numbers as primes.

## Algorithm (high-level)
1. Create a boolean array `isPrime[0..N]` and set all entries to `true`.
2. Set `isPrime[0] = false` and `isPrime[1] = false` (if those indices exist).
3. For `p` from 2 while `p * p <= N`:
   - If `isPrime[p]` is `true`, mark every multiple `j` from `p*p` to `N` (step `p`) as `false`.
4. Remaining indices `i` with `isPrime[i] == true` are primes.

## Pseudocode

for i = 0..N:
  isPrime[i] = true
isPrime[0] = false
isPrime[1] = false
for p = 2; p * p <= N; p++:
  if isPrime[p]:
    for j = p * p; j <= N; j += p:
      isPrime[j] = false

## Complexity
- Time: O(N log log N) (Sieve complexity)
- Space: O(N) for the boolean array

## Java implementation notes
- See `Primes1ToN.java` for a working example: [Primes1ToN.java](Primes1ToN.java#L1-L200)
- Input validation: handle `N < 0`, `N == 0`, and extreme values. Avoid silently accepting `Integer.MIN_VALUE` with `Math.abs` (it overflows).
- Use `p <= N / p` instead of `p * p <= N` to avoid overflow on very large `N`.
- Close the `Scanner` when done to free resources.

## Edge cases and tests
- `N = 0` → no primes
- `N = 1` → no primes
- `N = 2` → output: `2`
- `N = 10` → output: `2 3 5 7`
- `N = -5` → treat as invalid input or take absolute with care
- `N = Integer.MIN_VALUE` → `Math.abs` is unsafe

Try these commands to compile and run the example:

```bash
javac Primes1ToN.java
printf "10\n" | java Primes1ToN
```

Expected output for input `10`:
```
2 3 5 7 
```