//Find all primes from 1 to N (Sieve of Eratosthenes)
import java.util.Scanner;
import java.util.Arrays;
public class Primes1ToN {
    public static void main (String[] args){
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter the value of N(primes 1 to N ): ");
        int n=Math.abs(sc.nextInt());
        boolean[] isPrime = new boolean[n+1];
        Arrays.fill(isPrime,true);
        isPrime[0]=false;
        isPrime[1]=false;
        // Outer loop from 2 to underroot N
        for(int p=2;p*p<=n;p++){
            //inner loop seive of erastothenes
            if(isPrime[p]==true){
                for(int j=p*p;j<=n;j+=p){
                    isPrime[j]=false;
                }
            }
        }
        // Print the indices primes from 1 to N
        for(int i=0;i<=isPrime.length-1;i++){
            if(isPrime[i]==true)
            System.out.print(i+" ");
        }
        sc.close();
    }
}