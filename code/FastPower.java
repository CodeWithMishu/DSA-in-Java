public class FastPower{
    public static void main(String[] args){
        int x=2;
        int y=6;
        int result=1;
        while(y>=1){
            if(y%2!=0){
                result*=x;
            }
            y=y/2;
            x*=x;
        }
        System.out.println(result);
    }
}