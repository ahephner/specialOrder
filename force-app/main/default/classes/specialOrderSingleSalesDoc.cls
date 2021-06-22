public with sharing class specialOrderSingleSalesDoc {
    public specialOrderSingleSalesDoc() {

    }
}
public class specialOrderSingleSalesDoc {
    public list<Order_Request__c> head;
      public List<Order_Request_Detail__c> detail;
      public object q;
      //public string feeLinkTotal {get;set;}
      //public string linkTotal {get;set;}
      //public string noShow {get;set;}
      //public string warning {get;set;}
      public string addrStreet {get;set;}
      public string addrCityState {get;set;}
      //public string prod {get;set;}
      public specialOrderSingleSalesDoc(ApexPages.StandardController controller ) {}
      //Used for testing. Grad an ID with products on it uncover/cover line below   
          //ID id = 'a2V7b000000oC40EAE'; 
          String id = apexpages.currentpage().getparameters().get('id');
          public list<Order_Request_Detail__c> getdetail(){ 
                      detail =   [select ATS_Product__c, ATS_Product__r.Product_Name__c,Quantity_Requested__c, Unit_Price__c,Line_Total__c,Sales_Margin__c,
                                  Minimum_Margin__c,ATS_Product__r.Name, Product_Description__c, PDF_Field__c from Order_Request_Detail__c where Order_Request__c = :id];
      
              //make sure the margin is high enough
              //or flag something
              //for(order_request_detail__c y:detail){
                  //if(y.sales_margin__c <= 0.00){
                   //   noShow = 'x';
                 //     warning = 'Sales Margin is too low. Please adjust and run again.';
                       
               //   }
              //system.debug(noShow);
            //  } 
              return detail;
          }
          //get the head document. Set the links address
      public list<Order_Request__c> gethead(){ 
                    head= [select Request_Date__c, Sales_Rep__r.name, Sales_Rep__r.Email__c, Sales_Rep__r.Mobile__c, name,Approval_Status__c , Freight__c,
                                   customer__r.S_Account__c, Total_Product_Price__c, Customer__r.Customer_Name__c, Customer__r.Class__c,Customer__r.BillingCity, Customer__r.BillingState, 
                                  Customer__r.BillingStreet, Customer__r.BillingPostalCode, Customer__r.Ship_Method__c, Customer__r.Customer__c, Purchase_Order__c, Total_Doc_Amount__c
                                   from Order_Request__c where id = :id limit 1]; 
          
          if(head.size()> 0){
                  //Corporate Address Illinois for Progro, Fishers for all others
                  if(head[0].Customer__r.Class__c == 'PROGRO'){
                       addrStreet = 'P.O. Box 678';
                      addrCityState = 'Mendota, IL  61342';               
                  } else {
                      addrStreet = '12955 Ford Drive';
                      addrCityState = 'Fishers, IN  46038';
                  }
                      
                  return head; 	
          } else{
              //ApexPages.addMessage(new ApexPages.message(ApexPages.severity.ERROR, 'An error occured please contact IT')); 
              return null; 
          }
                   
      }
      //get the summary of qty
      public object getq(){
          AggregateResult [] result = [select sum(Quantity_Requested__c)ttt from Order_Request_Detail__c where Order_Request__c = :id];
         q = result[0].get('ttt');   
         return q;
      }
  }