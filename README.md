# DSA in Java

A curated collection of Data Structures and Algorithms (DSA) implementations in Java. This repository contains simple, well-organized example solutions intended for learning, practice, and reference.

## Repository Structure

- Bit Manipulation/: bitwise algorithm examples (e.g. `HammingDistance.java`).
- Maths/: mathematical algorithms and number theory helpers.
- Sorting/: classic sorting algorithm implementations (Easy/ folder contains straightforward examples).

Each subfolder may contain further difficulty-based organization (e.g. `Easy/`).

## How to compile and run

Open a terminal at the repository root and navigate to the example folder you want to run. Example:

```bash
cd Sorting/Easy
javac CountingSort.java
java CountingSort
```

To compile all Java files in the repository (from root):

```bash
find . -name "*.java" -print | xargs javac
```

Notes:
- Examples are written using the default package (no package declaration). Run classes from their directories or adjust classpaths accordingly.

## Contributing

Contributions, fixes, and improvements are welcome. Please:

1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request with a clear description of changes.

## License

This repository is provided for educational purposes. No license specified — contact the maintainer if you need one.
