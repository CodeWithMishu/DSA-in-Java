import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class BucketSort {

    /**
     * Sorts an integer array using the Bucket Sort algorithm.
     * @param arr The array to be sorted
     * @param bucketCount The number of buckets to use
     */
    public static void bucketSort(int[] arr, int bucketCount) {
        // Edge case: Empty or single-element array does not need sorting
        if (arr == null || arr.length <= 1 || bucketCount <= 0) {
            return;
        }

        // Step 1: Find the minimum and maximum values in the array
        int minValue = arr[0];
        int maxValue = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] < minValue) {
                minValue = arr[i];
            } else if (arr[i] > maxValue) {
                maxValue = arr[i];
            }
        }

        // Step 2: Initialize the buckets using a List of Lists
        List<List<Integer>> buckets = new ArrayList<>(bucketCount);
        for (int i = 0; i < bucketCount; i++) {
            buckets.add(new ArrayList<>());
        }

        // Step 3: Calculate the range of each bucket. 
        // We add 1 to ensure that the maxValue maps to a valid bucket index instead of overflowing.
        double range = (double) (maxValue - minValue) / bucketCount;

        // Step 4: Scatter phase - Distribute elements into respective buckets
        for (int num : arr) {
            // Compute index dynamically based on number range
            int bucketIndex = (int) ((num - minValue) / range);
            
            // Safeguard against edge cases where calculation yields index exactly equal to bucketCount
            if (bucketIndex >= bucketCount) {
                bucketIndex = bucketCount - 1;
            }
            
            buckets.get(bucketIndex).add(num);
        }

        // Step 5: Gather phase - Sort each bucket and merge them back into the original array
        int currentIndex = 0;
        for (List<Integer> bucket : buckets) {
            // Sort individual bucket
            Collections.sort(bucket); 
            
            // Overwrite original array sequentially
            for (int num : bucket) {
                arr[currentIndex++] = num;
            }
        }
    }

    // Driver program to test the algorithm
    public static void main(String[] args) {
        int[] data = {42, 11, 9, 21, 8, 17, 19, 13, 1, 24, 75};
        int numberOfBuckets = 4;

        System.out.println("Original Array: " + Arrays.toString(data));
        
        // Execute sort
        bucketSort(data, numberOfBuckets);
        
        System.out.println("Sorted Array:   " + Arrays.toString(data));
    }
}
