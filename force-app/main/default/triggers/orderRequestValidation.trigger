trigger orderRequestValidation on Order_Request__c (before update) {
   
    for(Order_Request__c x: trigger.new){
        String sendToPurchase = x.Send_To_Purchasing__c;
        String appStatus = x.Approval_Status__c;
        
        if(sendToPurchase == null && appStatus == 'Pending - Purchasing'){
            
            x.addError('Please let us know if purchasing needs to get involved');
        }
    }
}