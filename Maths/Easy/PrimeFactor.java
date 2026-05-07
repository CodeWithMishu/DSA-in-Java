// Find all prime factors of a number N
import java.util.Scanner;
import java.util.ArrayList; // Step 1: Import the ArrayList class

public class PrimeFactor {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter the number: ");
        
        // Using long allows for much larger numbers than int
        long num = sc.nextLong(); 
        
        // Step 2: Create a dynamic list to store factors
        ArrayList<Long> factors = new ArrayList<>();

        // Handle edge case for numbers less than 2
        if (num < 2) {
            System.out.println("No prime factors for " + num);
            return;
        }

        // Step 3: Factorization logic
        for (long i = 2; i * i <= num; i++) {
            while (num % i == 0) {
                factors.add(i); // Add to list (no index tracking needed!)
                num /= i;
            }
        }

        if (num > 1) {
            factors.add(num);
        }

        // Step 4: Print using a "for-each" loop
        System.out.print("Prime factors: ");
        for (long f : factors) {
            System.out.print(f + " ");
        }
        System.out.println();
        
        sc.close(); // Good practice to close the scanner
    }
}