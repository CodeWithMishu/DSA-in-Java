public class HammingDistance {
    public static void main(String[] args) {
        int x=1;
        int y=4;
        int result;
        int count=0;
        result=x^y;
        while (result!=0) {
            result=result & (result-1);
            count++;
        }
        System.out.println(count);

    }
}