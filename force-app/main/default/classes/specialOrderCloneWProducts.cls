public class specialOrderCloneWProducts {
	public ID newOrdID {get; set;}
    private ApexPages.StandardController controller {get; set;}
    private Order_Request__c ord {get; set;}
    
        //start the controller
    public specialOrderCloneWProducts(ApexPages.StandardController controller){
        
        this.controller = controller;
        //grab this record
        ord = (Order_Request__c)controller.getRecord();
    }
    public PageReference cloneSO(){
        //Rollback point
        Savepoint sp = Database.setSavepoint();
        Date today = date.today();
        Order_Request__C newOrder;
        List<Order_Request_Detail__c> li = new List<Order_Request_Detail__c>();
        
        try{
        Order_Request__c head = [Select Name, Approval_Status__c, Notes__c, Freight__c, Requested_By__c, Sales_Manager__c,
                                  ATS_Shipping__c, Sales_Rep__c, Sent_For_Approval__c,Request_Date__c from Order_Request__c where id = :ord.Id];
            
            newOrder = head.clone(false, false, false, false);
            newOrder.Approval_Status__c = 'Not Submitted';
            newOrder.Notes__c += ' Cloned from '+' '+head.Name; 
            newOrder.Request_Date__c = today;
            newOrder.Sent_for_Approval__c = false; 
            insert newOrder;
            system.debug('neworder '+newOrder);
            //Test
            newOrdID = newOrder.Id; 
            
                    List<Order_Request_Detail__c> lineItems = [Select  ATS_Product__c, Minimum_Margin__c, 
                                                       Product_Description__c,Quantity_Requested__c, Sales_Margin__c,
                                                       Cost__c, Unit_Price__c, Unit_Size__c, Order_Request__c
                                                       from Order_Request_Detail__c where Order_Request__c =:ord.Id ];
            for(Order_Request_Detail__c x:lineItems){
                Order_Request_Detail__c nli = x.clone(false, false,false,false);
                nli.Order_Request__c = newOrder.Id;
                system.debug('id '+nli);
                li.add(nli);
            }
			//system.debug('li '+li);
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
    
}