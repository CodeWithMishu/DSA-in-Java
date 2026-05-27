DSA-in-Java
===========

A small collection of Data Structures & Algorithms implementations in Java, organized by topic and difficulty. The examples are simple, self-contained Java classes intended for learning and practice.

Project structure
-----------------
- Bit Manipulation/: implementations and problems related to bit operations.
- Maths/: math-related algorithms and utilities.
- Sorting/: sorting algorithms organized by difficulty.

Each folder contains standalone Java source files. Most files include a `main` method so you can compile and run them directly.

Quick start
-----------
Compile a single example (run from the repository root):

```
javac Sorting/Easy/InsertionSort.java
```

Run the compiled class (note the package-like path uses dots for nested folders):

```
java Sorting.Easy.InsertionSort
```

Tips
----
- Files are top-level classes with names that match their file name (e.g., `InsertionSort.java` contains `public class InsertionSort`).
- There are no Java packages used; run classes from the repository root so the JVM finds them by folder structure.
- Most examples are O(n^2) simple implementations for teaching — expect small inputs.

Contributing
------------
- Add new algorithms under the appropriate folder and keep each file focused with a single `main` demo.
- Follow the existing naming convention: `Category/Difficulty/AlgorithmName.java` and ensure the class name matches the file name.

License
-------
This repository is provided for learning and practice. No license specified.
