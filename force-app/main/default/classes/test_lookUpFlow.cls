@isTest
public class test_lookUpFlow {
	@isTest
    static void testSeach(){
        Product__c prod = new Product__c(name='123', product_name__c='Product');
        insert prod; 
        string x = 'prod';
        Test.startTest();
        	List<Product__c> y = lookUpFlow.searchProd(x);
        	system.assertNotEquals(null, y);
        Test.stopTest(); 
    }
    @isTest
    static void testInsert(){
        Date myDate = Date.newInstance(2040, 1, 4);
        //Account for Order_Request__c
        Account acc = new Account(name = 'Test', RecordTypeId ='01241000001Dy64AAC', Customer_Name__c = 'Test Cust 123' );
        insert acc;
        //Order_Request__c
        Order_Request__c head = new Order_Request__c(Request_Date__c = myDate, Customer__c = acc.id);
        insert head;
        //Product
        Product__c prod = new Product__c(name='123', product_name__c='Product');
        insert prod;
        //List Order_Request_Detail__c
        List<Order_Request_Detail__c> orList = new List<Order_Request_Detail__c>();
        
        Order_Request_Detail__c ord1 = new Order_Request_Detail__c(Quantity_Requested__c=1, ATS_Product__c = prod.Id);
        Order_Request_Detail__c ord2 = new Order_Request_Detail__c(Quantity_Requested__c=1, Product_Description__c='Rocks');
        
        orList.add(ord1);
        orList.add(ord2);
        //JSON the list
        String myProd = JSON.serialize(orList);
        
        Test.startTest(); 
        	list<Order_Request_Detail__c> ord = lookUpFlow.addProducts(myProd, head.id); 
        Test.stopTest();
        system.assertEquals(2, ord.size());

    }
}