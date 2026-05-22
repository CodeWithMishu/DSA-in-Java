public class SelectionSort {
    public static void main(String[] args) {
        int arr[] = {7, 4, 10, 8, 3, 1};
        for(int i=0;i<arr.length;i++){
            int min_index=i;
            for(int j=i+1;j<arr.length;j++){
                int temp=0;
                if(arr[j]<arr[min_index]){
                    temp=arr[j];
                    arr[j]=arr[min_index];
                    arr[min_index]=temp;
                }
            }
            System.out.println(arr[i]+" ");
        }
    }
}
