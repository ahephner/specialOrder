import { LightningElement, api } from 'lwc';
import getAddress from '@salesforce/apex/cpqApex.getAddress'
import { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationBackEvent } from 'lightning/flowSupport';
export default class ShipAddress extends LightningElement {
    @api accountId;
    @api shipToId; 
    options;
    info = true;
    msg = 'New address added!'
    connectedCallback(){
        this.loadAddress();
    }

    loadAddress(){
        getAddress({accID: this.accountId})
           .then((res)=>{
               this.options = res.map(item=>({
                                   ...item,
                                   label: item.Street +' ('+item.Name+') - '+item.City,
                                   value: item.Id
               }))
               // console.log('type of options '+typeof this.options);
               // console.log(JSON.stringify(this.options))
           }).catch((error)=>{
               this.error = error;
               console.log('error  '+this.error);
               
           }).finally(()=>{
           
           })
   }
   
   get selectedObj(){
        let label;
            if(this.options && this.shipTo){
                label = this.options.find((x)=>x.value===this.shipTo)
            }
            
            return label;   
    }

    selectChange(event){
        let newValue = this.template.querySelector('.slds-select').value;
        if(newValue === "new"){ 
            this.info = false;
        //console.log('new address please');
        }else{
            this.shipToId = newValue; 
            console.log(this.shipToId);
            
            const shipChange = new FlowAttributeChangeEvent('shipToId', this.shipToId);
            this.dispatchEvent(shipChange);
        }   
    }
    updateAddress(event){
        let value = event.detail.value;
        console.log('evt detail '+value);
        let label = event.detail.label;
        let x = {value, label}
        this.options.push(x);
        console.log(2, this.options);
        
        this.info = true;
        const evt = new ShowToastEvent({
            title: 'Address Added',
            message: this.msg,
            variant: 'success'
        });
        this.dispatchEvent(evt);  
    }
    cancelNewAddress(){
        this.info = true; 
    }
    handleNext(){
        if(this.shipToId === null || this.shipToId === undefined){
            alert('Please select a ship to address');
        }else{
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent); 
        }

    }

    handleBack(){
        const navBackEvent = FlowNavigationBackEvent();
        this.dispatchEvent(navBackEvent);  
    }
}