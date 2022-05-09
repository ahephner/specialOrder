public class specialOrderCreateCPQ {
    //expose method to flow
    //https://www.greytrix.com/blogs/salesforce/2021/12/30/how-to-call-an-apex-class-from-a-screen-flow/
        @InvocableMethod 
        public static void specialOrderCreateCPQ(list<string> recordId){
            //Rollback point
            Savepoint sp = Database.setSavepoint();
            id recId = recordId[0];
            Date cd = System.today() +14;
            //map to put order lines on 
            Map<String,Order_Request_Detail__c> ordMap = new Map<String, Order_Request_Detail__c>();
            Map<String,PriceBookEntry> pbeMap = new Map<String, PriceBookEntry>();
    
            List<OpportunityLineItem> oppLines; 
            try{
            List<Order_Request__c> header = [select name, Customer__c, Customer__r.Name, Customer__r.Ship_Method__c,
                                             Sales_Rep__c, Freight__c, Purchase_Order__c,Location__c, ATS_Shipping__c
                                             from Order_Request__c where id =: recId limit 1];
            //recordtype in full:  01275000000CgcYAAS
            //recordtype for prod: 0122M000001ElAYQA0
            Opportunity newOp = new Opportunity(Name = header[0].Customer__r.name + ' '+ cd, CloseDate=cd, StageName='Working', RecordtypeId='01275000000CgcYAAS',
                                                PriceBook2Id='01s410000077vSKAAY', Warehouse__c = header[0].Location__c,Freight__c = header[0].Freight__c,
                                                Sales_Rep__c = header[0].Sales_Rep__c, Special_Order__c=true, AccountId = header[0].Customer__c, Expiration_Date_Editable__c = cd,
                                               Ship_Type__c = header[0].Customer__r.Ship_Method__c);
            insert newOp; 
            
            List<Order_Request_Detail__c> details =  [select product__c, Product_Number__c, Product_Description__c ,Unit_Price__c,
                                                          Cost__c, Quantity_Requested__c, Minimum_Margin__c,Sales_Margin__c
                                                          from  Order_Request_Detail__c where Order_Request__c =:recId];
           
            
            for(Order_Request_Detail__c y:details){
                ordMap.put(y.Product_Number__c, y); 
            }
            
            list<PriceBookEntry> pbe = [select id, productCode from pricebookentry where productcode in: ordMap.keySet() and pricebook2Id = '01s410000077vSKAAY' ];
            system.debug(pbe);
            for(PriceBookEntry a : pbe){
                system.debug('code '+a.ProductCode);
                pbeMap.put(a.ProductCode,a); 
            }
        List<OpportunityLineItem> oppLineItems = new List<OpportunityLineItem>();
            for(Order_Request_Detail__c li:details){
                OpportunityLineItem newLine = new OpportunityLineItem();
                if(li.Product_Number__c != 'MANUAL CHARGE'){
                    newLine.PricebookEntryId = pbeMap.get(li.Product_Number__c).Id;
                    newLine.Cost__c = li.Cost__c;
                    newLine.UnitPrice = li.Unit_Price__c;
                    newLine.CPQ_Unit_Price__c = li.Unit_Price__c; 
                    newline.Product2Id = li.Product__c;
                    newLine.Quantity = li.Quantity_Requested__c;
                    newLine.OpportunityId = newOp.Id;
                    oppLineItems.add(newLine);
                }else{
                    newLine.PricebookEntryId = '01u75000004xmuzAAA';
                    newLine.Cost__c = li.Cost__c;
                    newLine.UnitPrice = li.Unit_Price__c;
                    newLine.CPQ_Unit_Price__c = li.Unit_Price__c; 
                    newline.Product2Id = li.Product__c;
                    newLine.Quantity = li.Quantity_Requested__c;
                    newLine.OpportunityId = newOp.Id;
                    oppLineItems.add(newLine);   
                }
    
                
            }
            
            insert oppLineItems; 
    
     
        }catch(exception e){
             Database.rollback(sp);
             ApexPages.addMessages(e); 
               
        }
      }
    }    