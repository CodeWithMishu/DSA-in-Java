
import java.util.Scanner;
class PrimeNumber {
    public static void main(String[] args) {
        boolean prime=true;
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter any number:");
int num = sc.nextInt();
if(num<2){
    System.out.println("not a Prime number");
}
else{
for(int i=2;i*i<=num;i++)
{
    if(num%i==0){
        prime=false;
        break;
    }
}
if (prime==true){
    System.out.println(num+" is a prime number.");
}
else{
    System.out.println(num+" is not a prime number.");
}
    }
}
}