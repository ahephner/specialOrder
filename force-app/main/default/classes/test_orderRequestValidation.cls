@isTest
public class test_orderRequestVal {
	@isTest
    static void testTrigger(){
        Date myDate = Date.newInstance(2040, 1, 4);
        Account cust = new Account();
        cust.Name = 'Test123456';
        cust.RecordTypeId = '01241000001Dy64AAC';
        cust.Customer_Name__c = 'Test Customer 123456';
        	insert cust;
    	//Sales Rep
    	Sales_Rep__c sr = new Sales_Rep__c(Name='Rep', Sales_Rep_Num__c='12');
    	insert sr;   	
        
        Order_Request__c o = new Order_Request__c(Request_Date__c =myDate,
                                                 Sales_Rep__c = sr.id,
                                                 Customer__c = cust.id,
                                                 Approval_Status__c = 'Not Submitted');
        insert o; 
        
        test.startTest();
        	o.Approval_Status__c = 'Pending - Purchasing';
        	update o; 
        test.stopTest();

    }
}