// This is not the best or optimized solution the complexity is O(n log n) and we want O(n)
import java.util.Arrays;
class CountingBits {
    public int[] countBits(int n) {
        int[] ans = new int[n+1];
        for(int i = 0; i <= n; i++){
            int count = 0;
            int j = i;
            while(j > 0){
                if((j & 1) == 1){
                    count++;
                }
                j = j >> 1;
            }
            ans[i] = count;
        }   
        return ans;
    }

    public static void main(String[] args) {
        CountingBits cb = new CountingBits();
        int[] result = cb.countBits(5);

        // 2. Print it using Arrays.toString() so it looks like [0, 1, 1, 2, 1, 2]
        System.out.println(Arrays.toString(result));
    }
}