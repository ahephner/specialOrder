public class specialOrderCloneWProducts {
	public ID newOrdID {get; set;}
    public PageReference cloneSO(String recId, string accountId){
        //Rollback point
        Savepoint sp = Database.setSavepoint();
        
        Order_Request__C newOrder;
        List<Order_Request_Detail__c> li = new List<Order_Request_Detail__c>();
        
        try{
        Order_Request__c head = [Select Name, Approval_Status__c, Notes__c, Freight__c, Requested_By__c, Sales_Manager__c,
                                 CreatedById, Sales_Rep__c, Sent_For_Approval__c from Order_Request__c where id = :recId];
            newOrder = head.clone(false);
            newOrder.Approval_Status__c = 'Not Submitted';
            newOrder.Notes__c += ' Cloned from '+' '+head.Name; 
            
            insert newOrder;
            //Test
            newOrdID = newOrder.Id; 
            
            List<Order_Request_Detail__c> lineItems = [Select ATS_Product__c, Minimum_Margin__c, PDF_Field__c,
                                                       Product_Description__c,Quantity_Requested__c, Sales_Margin__c,
                                                       Cost__c, Unit_Price__c, Unit_Size__c
                                                       from Order_Request_Detail__c where Order_Request__c =:recID ];
            for(Order_Request_Detail__c x:lineItems){
                Order_Request_Detail__c nli = x.clone(false);
                nli.Order_Request__c = newOrder.id;
                li.add(x);
            }
			
            if(!li.isempty()){
                insert li; 
            }            
            
        }catch(exception i){
            Database.rollback(sp);
            ApexPages.addMessages(i);
            return null; 
        }
        return new PageReference('/lightning/r/Order_Request__c/'+newOrder.id+'/view');  
    }
    
        @AuraEnabled(cacheable=true)
    public static list<Order_Request_Detail__c> getOrderRequestItems(id recordId){
        return [select id,ATS_Product__c, ATS_Product__r.Product_Name__c, Line_Total__c,
                Minimum_Margin__c, Product_Description__c, Quantity_Requested__c, Sales_Margin__c,
                Cost__c, Unit_Price__c from  Order_Request_Detail__c where  Order_Request__c =: recordId ];
    }
    
    
}