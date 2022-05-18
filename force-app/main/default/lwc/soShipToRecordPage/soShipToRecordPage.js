import { LightningElement, api, wire, track } from 'lwc';
import {getRecord, getFieldValue, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ACCID from '@salesforce/schema/Order_Request__c.Customer__c';
import SHIPID from '@salesforce/schema/Order_Request__c.Shipping_Address__c';
import ID_FIELD from '@salesforce/schema/Order_Request__c.Id';
import STAGE from '@salesforce/schema/Order_Request__c.Approval_Status__c'
import getAddress from '@salesforce/apex/cpqApex.getAddress';
import hasPermission from '@salesforce/customPermission/Special_Order_Mobile_Manager';
/* https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_salesforce_modules */
export default class SoShipToRecordPage extends LightningElement {
    @api recordId; 
    recId; 
    customer;
    selected; 
   // @track selectObj;
    @track options;
    isRendered = false;   
    error;
    showAddresses = true; 
    stage; 
    stageIsEditable; 
    nonEditableLabel

//get context of the current order. Get the customerid to pass the function that gets avaliable address
//check and see if there is already a saved ship to 
    @wire(getRecord, {recordId: '$recordId', fields:[ACCID, SHIPID,ID_FIELD,STAGE]})
        custFields({data, error}){
            if(data){
                this.customer = getFieldValue(data,ACCID);
                this.recId = getFieldValue(data, ID_FIELD)
                this.findAddress(this.customer)
                this.selected = getFieldValue(data, SHIPID);
                this.stage = getFieldValue(data, STAGE); 
                this.checkStage(this.stage, hasPermission); 
            }else if(error){
                this.error = error;
            }
        }
//get the avaliable ship to options
    findAddress(rec){
         getAddress({accID: rec})
            .then((res)=>{
                this.options = res.map(item=>({
                                    ...item,
                                    label: item.Street +' ('+item.Name+') - '+item.City,
                                    value: item.Id
                }))
                
                // console.log('type of options '+typeof this.options);
                // console.log(JSON.stringify(this.options))
            }).catch((error)=>{
                this.error = JSON.stringify(error)
                console.log('error  '+this.error);
                
            }).finally(()=>{
                this.nonEditableLabel = this.options.find((x)=>x.value===this.selected).label;
            })
    }
//if a ship to has already been selected set that value
//note as of now it puts the same option twice in the drop downs. 
        get selectedObj(){
            let label;
                if(this.options && this.selected){
                    label = this.options.find((x)=>x.value===this.selected);
                }
                
                return label;   
        }

//this event runs on change of the address. If it's new it opens the new address. 
//otherwise send to the order this is the ship to
    selectChange(event){
        let newValue = this.template.querySelector('.slds-select').value;
        if(newValue === "new"){
            this.template.querySelector('c-new-ship-address').openAddress(); 
        }else{
            const fields = {}
            fields[ID_FIELD.fieldApiName] = this.recordId;
            fields[SHIPID.fieldApiName] = newValue;
            const fieldsToUpdate = {fields}
            updateRecord(fieldsToUpdate).then((back)=>{
                const success = new ShowToastEvent({
                    title:'Success',
                    message:'Ship To Successfully Changed',
                    variant:'success' 
                })
                this.dispatchEvent(success);
            }).catch((error)=>{
                let msg = JSON.stringify(error);
                const err = new ShowToastEvent({
                    title:'Error',
                    message:msg,
                    variant:'error' 
                })
                this.dispatchEvent(err);
            })
            
        }
    }
//listens for the new ship to address then pushs it to the avaliable array
    updateAddress(event){
        //console.log(this.options);
        
        let value = event.detail.value;
        
        let label = event.detail.label;
        let x = {value, label}
        this.options.push(x); 
        //console.log(typeof this.options);
        
    }

    checkStage(stage, perm){
        if(stage != 'Approved' && perm){
           this.stageIsEditable = true; 
        }else{
            this.stageIsEditable = false; 
        }
    } 

}