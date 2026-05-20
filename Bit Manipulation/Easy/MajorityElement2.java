// Majority Element (Moore's Voting / Bit) - second solution for this problem 
public class MajorityElement2 {
    public static void main(String[] args) {
        int[] nums = new int[]  {3,3,2,2,2,2,3};
        int candidate = -1;
        int count = 0;
        
        for (int i = 0; i < nums.length; i++) {
            if (count == 0) {
                candidate = nums[i];
                count = 1;
            } else if (candidate == nums[i]) {
                count++;
            } else {
                count--;
            }
        }
        
        // Because a majority is guaranteed to exist, 
        // the candidate is definitely the answer.
        System.out.print(candidate);
    }
}


