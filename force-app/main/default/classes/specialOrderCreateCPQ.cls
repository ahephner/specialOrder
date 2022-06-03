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
                                               Ship_Type__c = header[0].Customer__r.Ship_Method__c, Internal_Order_Comments__c = 'From: '+header[0].name);
            insert newOp; 
            
            List<Order_Request_Detail__c> details =  [select product__c, Product_Number__c, Product_Description__c ,Unit_Price__c,
                                                          Cost__c, Quantity_Requested__c, Minimum_Margin__c,Sales_Margin__c
                                                          from  Order_Request_Detail__c where Order_Request__c =:recId];
           
            
            for(Order_Request_Detail__c y:details){
                ordMap.put(y.Product_Number__c, y); 
            }
            
            list<PriceBookEntry> pbe = [select id, productCode from pricebookentry where productcode in: ordMap.keySet() and pricebook2Id = '01s410000077vSKAAY' ];
            //put it in a map so you can pull the id on creating opp line item
            for(PriceBookEntry a : pbe){
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
                    newLine.CPQ_Margin__c = li.Sales_Margin__c; 
                    newline.Product2Id = li.Product__c;
                    newLine.Quantity = li.Quantity_Requested__c;
                    newLine.OpportunityId = newOp.Id;
                    oppLineItems.add(newLine);
                }else{
                    //manual line item price book entry id 
                    newLine.PricebookEntryId = '01u75000004xmuzAAA';
                    newLine.Cost__c = li.Cost__c;
                    newLine.UnitPrice = li.Unit_Price__c;
                    newLine.CPQ_Unit_Price__c = li.Unit_Price__c; 
                    newline.Product2Id = li.Product__c;
                    newLine.Quantity = li.Quantity_Requested__c;
                    newLine.Description = li.Product_Description__c;
                    newLine.OpportunityId = newOp.Id;
                    oppLineItems.add(newLine);   
                }
    
                
            }
                //if there is ats shipping on the request create a opp line item for w/ats shipping
                if(header[0].ATS_Shipping__c>0){
                    //system.debug('shipping');
                    PricebookEntry ship = [select id, Product2Id from pricebookentry where ProductCode = 'ATS SHIPPING' limit 1];
                    //system.debug(ship);
                    OpportunityLineItem shipCharge = new OpportunityLineItem(PricebookEntryId = ship.Id,
                                                                             Cost__c = 0.00,
                                                                             UnitPrice = header[0].ATS_Shipping__c,
                                                                             CPQ_Unit_Price__c = header[0].ATS_Shipping__c,
                                                                             Product2Id = ship.Product2Id,
                                                                             Quantity = 1,
                                                                             OpportunityId = newOp.Id);
                    system.debug(shipCharge);
                    oppLineItems.add(shipCharge);
                }
            insert oppLineItems; 
    
     
        }catch(exception e){
             Database.rollback(sp);
             ApexPages.addMessages(e); 
               
        }
      }
    }