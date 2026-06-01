// Sort an Array in Wave Form
// this is not the best optimized solution
import java.util.Arrays;

public class WaveForm {
    public static void main(String[] args) {
        int[] arr=new int[] {20, 10, 8, 6, 4, 2};
        int len=arr.length;
       Arrays.sort(arr);
for(int i=0;i<len-1;i=i+2){
int temp=0;
temp=arr[i];
arr[i]=arr[i+1];
arr[i+1]=temp;
}
        System.out.println(Arrays.toString(arr));
    }
}
