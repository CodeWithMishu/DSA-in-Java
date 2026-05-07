// Calculate NCR value for given N and R
class NCR {
    public static void main(String[] args) {
        int n=5;
        int r=3;
        if(n<r){
            System.out.println("Value of n should be larger than r");
        }
        r=Math.min(r,n-r);
        int result=1;
        for(int i=1;i<=r;i++){
            result=result*(n-i+1)/i;
        }
        System.out.println(result);
    }
}