import java.util.Arrays;

public class CountingSort {

    public static void countingSort(int[] array) {
        if (array == null || array.length <= 1) {
            return;
        }

        int max = array[0];
        for (int i = 1; i < array.length; i++) {
            if (array[i] > max) {
                max = array[i];
            }
        }

        int[] countArray = new int[max + 1];

        for (int i = 0; i < array.length; i++) {
            countArray[array[i]]++;
        }

        for (int i = 1; i <= max; i++) {
            countArray[i] += countArray[i - 1];
        }

        int[] outputArray = new int[array.length];
        for (int i = array.length - 1; i >= 0; i--) {
            int currentNumber = array[i];
            int position = countArray[currentNumber] - 1; 
            
            outputArray[position] = currentNumber;
            countArray[currentNumber]--;
        }

        for (int i = 0; i < array.length; i++) {
            array[i] = outputArray[i];
        }
    }

    public static void main(String[] args) {
        int[] data = {4, 2, 2, 8, 3, 3, 1};
        countingSort(data);
        System.out.println(Arrays.toString(data));
    }
}