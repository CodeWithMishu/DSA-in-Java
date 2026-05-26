// implement bubble sort
public class BubbleSort {
    public static void main(String[] args) {
        int[] arr=new int[] {3,2,5,3,7,2};
        int len = arr.length;
        for(int i=len-1;i>0;--i){
            for(int j=0;j<i;j++){
                if (arr[j]>arr[j+1]) {
                    int temp =0;
                    temp=arr[j];
                    arr[j]=arr[j+1];
                    arr[j+1]=temp;
                }
            }
        }
        for(int k=0;k<len;k++){
            System.out.println(arr[k]);
        }
    }
}
