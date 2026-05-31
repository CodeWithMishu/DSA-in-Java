class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = prices[0];
        int maxProfit = 0;
        
        for (int i = 0; i < prices.length; i++) {
            minPrice = Math.min(minPrice, prices[i]);
            maxProfit = Math.max(maxProfit, prices[i] - minPrice);
        }
        
        return maxProfit;
    }
}
public class StockProfit {
    public static void main(String[] args) {
        int[] arr = new int[] {7,1,5,3,6,4};
        Solution S = new Solution();
        int profit =S.maxProfit(arr);
        System.out.println(profit);
    }
}
