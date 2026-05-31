import java.util.Arrays;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        for(int i=0;i<nums.length;i++){
            for(int j=i+1;j<nums.length;j++){
                if(nums[i]+nums[j]==target){
                    return new int[] {i,j};
                }
            }
        }
        return new int[] {0};
    }
}
public class TwoSum {
    public static void main(String[] args) {
        int[] arr = new int[] {2,7,11,15};
        Solution S = new Solution();
        int[] Sum = S.twoSum(arr, 9);
        System.out.println(Arrays.toString(Sum));
    }
}
