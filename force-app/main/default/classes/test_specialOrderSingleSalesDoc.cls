@isTest
public class test_specialOrderClone {
@isTest
    static void test_specialOrderClone(){
        //account
       
        Account cust = new Account();
        cust.Name = 'Test123456';
        cust.RecordTypeId = '01241000001Dy64AAC';
        cust.Customer_Name__c = 'Test Customer 123456';
        	insert cust;
    	//Sales Rep
    	Sales_Rep__c sr = new Sales_Rep__c(Name='Rep', Sales_Rep_Num__c='12');
    	insert sr; 
        //contact
        contact person = new contact(lastname = 'test', AccountId = cust.Id);
        insert person; 
        //date and pricebook don't know if you need it just incase 
        Date myDate = Date.newInstance(2040, 1, 4);
        Date startdate = Date.newInstance(2040, 1, 3);
        Id pricebookId = Test.getStandardPricebookId();
        
        //order request
        Order_Request__c head = new Order_Request__c(Request_Date__c = mydate);
        insert head;
        
                //insert products 
        product__c p = new product__c(Name='xyz', Product_Name__c = 'product', Active__c=True);
        //product__c pr = new product__c(Name='jdt-12', ProductCode =  'xyz');
        insert p;
        
        Order_Request_Detail__c detail = new Order_Request_Detail__c (Order_Request__c = head.Id, Ats_product__c = p.id, Quantity_Requested__c = 2, 
                                                                      sales_margin__c = 45, minimum_margin__c= 30 );
        insert detail; 
        
         //construct standard controller
        ApexPages.StandardController con = new ApexPages.StandardController(head);
        //create the controller
        specialOrderCloneWProducts clone = new specialOrderCloneWProducts(con);
        
        Test.startTest();
        	PageReference method = clone.cloneSO();
        	id clonedOR = [select id from order_request__c where id = :clone.newOrdID].id;
        	system.assertNotEquals(clonedOr, null);
        	list<Order_Request_Detail__c> prod = [select quantity_requested__c from Order_Request_Detail__c where order_request__c =: clonedOR];
        	system.assertEquals(1, prod.size());
        Test.stopTest(); 

    }
}