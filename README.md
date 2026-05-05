# 🚀 DSA Prep — 3-Iteration Mastery Plan

A comprehensive **207-problem** DSA preparation roadmap covering **15 core topics** across **3 difficulty levels**.

---

## 📊 Overview

### Strategy
**Complete ALL topics at Easy level → repeat ALL topics at Medium → repeat ALL topics at Hard**

This ensures you build intuition before pattern recognition, then master each concept.

### Timeline & Statistics

| Iteration | Difficulty | Problems | Est. Duration | Time/Problem | Pace |
|-----------|-----------|----------|---------------|--------------|------|
| **1** 🟢 | Easy | 38 | ~6 weeks | 30–45 min | 1 prob/day |
| **2** 🟡 | Medium | 131 | ~19 weeks | 45–75 min | 1 prob/day |
| **3** 🔴 | Hard | 38 | ~6 weeks | 60–120 min | 1 prob/day |
| **TOTAL** | All | **207** | **~30 weeks** | — | — |

### Topic Order (Same Across All 3 Iterations)
1. **Math** → 2. **Bit Manipulation** → 3. **Sorting** → 4. **Array** → 5. **Stack & Queue** → 6. **Matrix** → 7. **HashMap** → 8. **Heap** → 9. **Linked List** → 10. **Backtracking** → 11. **Tree** → 12. **Trie** → 13. **Segment Tree** → 14. **Graph** → 15. **DP**

## 📌 Key Tips

✅ **Solve problems in topic order** — don't skip  
🔄 **Review weak topics** after each iteration  
⏱ **Stuck >45 min (Easy) / >90 min (Hard)?** Read editorial  
📝 **Keep a pattern journal** to log insights  
🎯 **Don't memorise** — aim to recognise patterns  
🌊 **Work at YOUR pace** — 1, 3, 5+ problems per session  

## 🔗 Interactive Tools

- **[📊 Dashboard](dashboard.html)** ← Open this for visual progress tracking!
- **[📋 Full Problem List](#all-problems)** ← See all 207 problems below

## 🌐 Next.js Dashboard (Vercel Ready)

This repo now includes a production-ready Next.js app with:

- JSON database file: `data/problems.json` (all 207 problems)
- Admin-locked progress updates (viewer mode for others)
- Topic-wise analytics chart
- Weekly streak + study velocity metrics
- Notes/algorithm/solution viewer that reads from:
  - `README.md`
  - your local `.md` and `.java` files via API routes
- Import/Export progress as JSON backup (portable database snapshot)

### Run locally

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

### Build for production

```bash
npm run build
npm run start
```

### Deploy on Vercel (with Custom Domain)

#### Option 1: Auto-Deploy from GitHub (Recommended)

1. **Connect your repo:**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New → Project"
   - Select GitHub repository: `CodeWithMishu/DSA-in-Java`
   - Framework preset: `Next.js`
   - Click "Deploy"

2. **Configure custom domain (codewithmishu.in subdomain):**
   - In Vercel dashboard → Project Settings → Domains
   - Click "Add Domain"
   - Enter: `dsa.codewithmishu.in` (or your preferred subdomain)
   - Vercel shows DNS records to add

3. **Update your domain's DNS:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add DNS records from Vercel:
     - **CNAME record:** `dsa.codewithmishu.in` → points to Vercel
     - Or **A record** if Vercel provides IP
   - Wait 5-30 minutes for DNS propagation

4. **Verify in Vercel:**
   - DNS should auto-verify
   - Your app is now live at `https://dsa.codewithmishu.in`

#### Option 2: Manual Deployment (if needed)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Note:** `vercel.json` keeps Vercel on the Next.js framework preset.

### Database design used

#### Master Dataset
- File: `data/problems.json`
- Contains all 207 DSA problems with metadata (topic, difficulty, platform, etc.)
- Static reference, auto-generated from problem definitions

#### Progress Sync (Supabase)
- **Storage**: `user_progress` and `completion_log` tables in Supabase
- **Per-user state**: Every signed-in learner gets private progress, notes, code, bookmarks, attempts, and revision dates
- **Cross-device sync**: Any device using the same login sees the same workspace
- **Leaderboard**: Users can opt in from the dashboard profile card

**How it works:**
1. User marks a problem as "done" on Device A
2. Dashboard upserts that row into Supabase for the current user
3. Completion is recorded in `completion_log` for streaks and activity stats
4. User switches to Device B (different browser/machine)
5. Dashboard loads the same user's rows from Supabase
6. All devices stay in sync through the logged-in account

**Features:**
- ✅ Private per-user progress
- ✅ Personal notes and code solution editor
- ✅ Bookmarks and revision scheduler
- ✅ Mistake journal and attempt counts
- ✅ Profile analytics and opt-in leaderboard

#### Backup & Export
- Click "Export Progress" in dashboard to download JSON snapshot
- Re-import to restore all progress across sync

---

## Quick Navigation

- [Primes — Sieve of Eratosthenes](#primes--sieve-of-eratosthenes)
- [Fast Power — Binary Exponentiation](#fast-power--binary-exponentiation)
- [How to run examples](#how-to-run-examples)

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

## Fast Power — Binary Exponentiation

### Problem
Calculate X raised to power Y (X^Y) efficiently without computing X * X * X... (Y times).

### Logic
Use binary representation of the exponent Y. Instead of multiplying X by itself Y times, decompose Y into powers of 2 and compute exponentiations more efficiently.

### Algorithm (high-level)
1. Start with `result = 1`, `base = X`, `exp = Y`.
2. While `exp > 0`:
   - If `exp` is odd, multiply `result` by current `base`.
   - Square the `base` and halve the `exp` (integer division).
3. Return `result`.

### Pseudocode

result = 1
base = X
exp = Y
while exp > 0:
  if exp % 2 == 1:      // if exp is odd
    result *= base
  base = base * base    // square the base
  exp = exp / 2         // halve the exponent
return result

### Complexity
- Time: O(log Y) – we halve the exponent in each iteration
- Space: O(1) – constant extra space

### Java implementation notes
- See `FastPower.java` for the implementation: [FastPower.java](FastPower.java)
- Can be extended with modular exponentiation (compute X^Y mod M) for cryptography and competitive programming.
- Works for integer bases; can be adapted for floating-point bases with slight modifications.

### Example walkthrough
For X=2, Y=6:
- Binary of 6 is `110`
- Iteration 1: exp=6 (even), base becomes 4, exp becomes 3
- Iteration 2: exp=3 (odd), result becomes 1×4=4, base becomes 16, exp becomes 1  
- Iteration 3: exp=1 (odd), result becomes 4×16=64, base becomes 256, exp becomes 0
- Final result: 64 = 2^6 ✓

### Edge cases and tests
- `X = 2, Y = 0` → result: `1` (any number to power 0 is 1)
- `X = 2, Y = 1` → result: `2`
- `X = 2, Y = 10` → result: `1024`
- `X = 5, Y = 3` → result: `125`

---

## How to run examples

**Sieve of Eratosthenes example:**

```bash
javac Primes1ToN.java
printf "10\n" | java Primes1ToN
```

Expected for input `10`:

```
2 3 5 7 
```

**Fast Power example:**

```bash
javac FastPower.java
java FastPower
```

Expected output:

```
64
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
