public with sharing class lookUpFlow {
    @AuraEnabled(Cacheable=true)
    public static List<Product__c> searchProd(String searchTerm){
        string x; 
        x = '%'+searchTerm+'%';
        List<Product__c> prods = [select id, name, product_name__c
                                 from Product__c where name like:x OR product_name__c like:x];
        //System.debug(prods);
                                 return prods; 
    }
        
    @AuraEnabled
        public static List<Order_Request_Detail__c> addProducts(string products, string orderId){
             List<Order_Request_Detail__c> prodList = new List<Order_Request_Detail__c>(); 
            JSONParser parser = JSON.createParser(products); 
            while(parser.nextToken() != null){
                if(parser.getCurrentToken() == JSONToken.START_ARRAY){
                    while(parser.nextToken() != null){
                        //system.debug('current name' + parser.getCurrentName() + ' current token' + parser.getCurrentToken());
                        if(parser.getCurrentToken() == JSONToken.START_OBJECT){
                            Order_Request_Detail__c ap = new Order_Request_Detail__c();
                            Order_Request_Detail__c temp = (Order_Request_Detail__c)parser.readValueAs(Order_Request_Detail__c.class);
                            system.debug('temp ' + temp);
                            if(temp.Order_Request__c == null){
                               //ap.Id = temp.Id;
                               ap.Order_Request__c = orderId;
                               ap.ATS_Product__c = temp.ATS_Product__c; 	
                               ap.Product_Description__c = temp.Product_Description__c;
                               ap.Quantity_Requested__c = temp.Quantity_Requested__c; 
                                //system.debug('product id '+ ap.Product__c);
                                prodList.add(ap);
                            }
                           
                            parser.skipChildren();
                        }
                    }
                }   
            } 
            if(!prodList.isempty()){
                insert prodList; 
            }
            return null;  
        }
    }