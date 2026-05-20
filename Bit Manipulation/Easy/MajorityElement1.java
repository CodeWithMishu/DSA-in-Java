// Majority Element (Moore's Voting / Bit)
public class MajorityElement1 {
    public static void main(String[] args) {
        int[] nums = new int[]  {3,3,2,2,2,2,3};
        int n= nums.length;
        int count=0;
        int candidate=-1;
        // lets find out the candiate first for which we will check majority
        for(int i=0;i<n;i++){
            if(count==0){
                candidate=nums[i];
                count=1;
            }
            else{
                if (candidate==nums[i]) {
                    count++;
                }
                else{
                    count--;
                }
            }
        }
        
        // making counter 0 and findind the count of candiate.
        count=0;
        for(int i=0;i<n;i++){
            if (nums[i]==candidate) {
                count++;
            }
        }
        if (count>(n/2)) {
            System.out.println(candidate);
        }
        else{
            System.out.println("No Majority element found");
            
        }
        // Using inbuilt method:
    //     int arr[] = { 1, 1, 1, 1, 2, 3, 5 };
    // int majority = findMajority(arr);
    // System.out.println(" The majority element is : "
    //                    + majority);
    }
}
