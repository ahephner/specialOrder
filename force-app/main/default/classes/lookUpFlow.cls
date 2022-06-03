public with sharing class lookUpFlow {
//ATS Products Lookup
@AuraEnabled(Cacheable=true)
public static List<Product__c> searchProd(String searchTerm){
    string x; 
    x = '%'+searchTerm+'%';
    List<Product__c> prods = [select id, name, product_name__c
                             from Product__c where Active__c = true and (name like:x OR product_name__c like:x) limit 10];
    //System.debug(prods);
                             return prods; 
}
//search product2
@AuraEnabled(Cacheable=true)
public static List<Product2> searchProducts2(string searchTerm){
    string term;
    term = '%' + searchTerm + '%';
    
    list<Product2> prods = [select id, name, ProductCode from product2 where isActive = true and (name like :term OR productcode like :term)];
    
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
                        //system.debug('temp ' + temp);
                        if(temp.Order_Request__c == null){
                           //ap.Id = temp.Id;
                           ap.Order_Request__c = orderId;
                            system.debug('orderId '+orderId);
                           ap.ATS_Product__c = temp.ATS_Product__c; 	
                           ap.Product_Description__c = temp.Product_Description__c;
                           ap.Quantity_Requested__c = temp.Quantity_Requested__c; 
                           ap.Minimum_Margin__c = temp.Minimum_Margin__c;
                           ap.Sales_Margin__c = temp.Minimum_Margin__c; 
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

        @AuraEnabled(cacheable=true)
public static list<Order_Request_Detail__c> getOrderRequestItems(id recordId){
    return [select id,ATS_Product__c, ATS_Product__r.Product_Name__c, Line_Total__c,
            Minimum_Margin__c, Product_Description__c, Quantity_Requested__c, Sales_Margin__c,
            Cost__c, Unit_Price__c from  Order_Request_Detail__c where  Order_Request__c =: recordId ];
}

@AuraEnabled
public static list<Order_Request_Detail__c> insertProd(List<Order_Request_Detail__c> products, string orderId){
           list<Order_Request_Detail__c> toInsert = new List<Order_Request_Detail__c>();
        
    if(products.size()>0){
        for(Order_Request_Detail__c x :products){
            Order_Request_Detail__c li = new Order_Request_Detail__c();
            
            li.Order_Request__c = orderId;
            li.Product__c = x.Product__c; 	
            li.Product_Description__c = x.Product_Description__c;
            li.Quantity_Requested__c = x.Quantity_Requested__c; 
            li.Minimum_Margin__c = x.Minimum_Margin__c;
            li.Sales_Margin__c = x.Minimum_Margin__c;
            
            toInsert.add(li);
        }
    }
    if(toInsert.size()>0){
        insert toInsert; 
    }
    return null;
}

//when using Product2 
@AuraEnabled(cacheable=true)
public static list<Order_Request_Detail__c> getOrderRequestProducts(id recordId){
    return [select id, Product__c, Product__r.Name, Line_Total__c,
            Minimum_Margin__c, Product_Description__c, Quantity_Requested__c, Sales_Margin__c,
            Cost__c, Unit_Price__c from  Order_Request_Detail__c where  Order_Request__c =: recordId ];
}
    }