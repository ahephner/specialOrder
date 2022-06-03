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
    static void testsearchProducts2(){
        Product2 prod = new Product2(name='shovel', ProductCode='at23');
        insert prod; 
        string term = 'shovel';
        Test.startTest();
        	List<Product2> z = lookUpFlow.searchProducts2(term);
        system.assertNotEquals(null, z);
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
        
        Order_Request_Detail__c ord1 = new Order_Request_Detail__c(Quantity_Requested__c=1, ATS_Product__c = prod.Id,Minimum_Margin__c =1, Sales_Margin__c=39 );
        Order_Request_Detail__c ord2 = new Order_Request_Detail__c(Quantity_Requested__c=1, Product_Description__c='Rocks', Minimum_Margin__c =1, Sales_Margin__c=39 );
        
        orList.add(ord1);
        orList.add(ord2);
        //JSON the list
        String myProd = JSON.serialize(orList);
        
        Test.startTest(); 
        	list<Order_Request_Detail__c> ord = lookUpFlow.addProducts(myProd, head.id); 
            //test they went in
            list<Order_Request_Detail__c> finish = [select id from order_request_detail__c where order_request__c =:head.id];
        Test.stopTest();
        system.assertEquals(2, finish.size());

    }
    
    @isTest
    static void test_insertProd(){
        Date myDate = Date.newInstance(2040, 1, 4);
        Account acc = new Account(name = 'Test', RecordTypeId ='01241000001Dy64AAC', Customer_Name__c = 'Test Cust 123' );
        insert acc; 
        
         
        Order_Request__c order = new Order_Request__c(Request_Date__c = myDate, Customer__c = acc.id);
        insert order;
        //Product
        Product2 prod = new Product2(name='shovel', ProductCode='at23');
        insert prod;
        //List Order_Request_Detail__c
        List<Order_Request_Detail__c> orList = new List<Order_Request_Detail__c>();
        
        Order_Request_Detail__c ord1 = new Order_Request_Detail__c(Quantity_Requested__c=1, Product__c = prod.Id, Minimum_Margin__c =1, Sales_Margin__c=39, Order_Request__c = order.Id );
        Order_Request_Detail__c ord2 = new Order_Request_Detail__c(Quantity_Requested__c=1, Product_Description__c='Rocks', Minimum_Margin__c =1, Sales_Margin__c=39, Order_Request__c = order.Id );
        
        orList.add(ord1);
        orList.add(ord2);
        insert orList;
        
        Test.startTest();
        	lookUpFlow.insertProd(orList, order.id);
        	list<Order_Request_Detail__c> prods = [select id from Order_Request_Detail__c where Order_Request__c =: order.Id];
        	system.debug(orList);
        	system.assertEquals(2, orList.size()); 
        Test.stopTest();
    }
    
    @isTest
    static void getItems(){
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
        
        Order_Request_Detail__c ord1 = new Order_Request_Detail__c(Quantity_Requested__c=1, ATS_Product__c = prod.Id,Minimum_Margin__c =1, Sales_Margin__c=39, Order_Request__c = head.Id );
        Order_Request_Detail__c ord2 = new Order_Request_Detail__c(Quantity_Requested__c=1, Product_Description__c='Rocks', Minimum_Margin__c =1, Sales_Margin__c=39, Order_Request__c = head.Id );
        
        orList.add(ord1);
        orList.add(ord2);
        insert orList;
        
        test.startTest();
        	list<Order_Request_Detail__c> finish = lookUpFlow.getOrderRequestItems(head.Id);
        test.stopTest();
        system.assertEquals(2, finish.size());
    }
    
    @isTest
    static void test_getOrderRequestProducts(){
        Date myDate = Date.newInstance(2040, 1, 4);
        Account acc = new Account(name = 'Test', RecordTypeId ='01241000001Dy64AAC', Customer_Name__c = 'Test Cust 123' );
        insert acc; 
        
         
        Order_Request__c head = new Order_Request__c(Request_Date__c = myDate, Customer__c = acc.id);
        insert head;
        //Product
        Product2 prod = new Product2(name='shovel', ProductCode='at23');
        insert prod;
        //List Order_Request_Detail__c
        List<Order_Request_Detail__c> orList = new List<Order_Request_Detail__c>();
        
        Order_Request_Detail__c ord1 = new Order_Request_Detail__c(Quantity_Requested__c=1, Product__c = prod.Id, Minimum_Margin__c =1, Sales_Margin__c=39, Order_Request__c = head.Id );
        Order_Request_Detail__c ord2 = new Order_Request_Detail__c(Quantity_Requested__c=1, Product_Description__c='Rocks', Minimum_Margin__c =1, Sales_Margin__c=39, Order_Request__c = head.Id );
        
        orList.add(ord1);
        orList.add(ord2);
        insert orList;
        
        test.startTest();
        	list<Order_Request_Detail__c> finish = lookUpFlow.getOrderRequestProducts(head.Id);
        test.stopTest();
        system.assertEquals(2, finish.size());
    }
}