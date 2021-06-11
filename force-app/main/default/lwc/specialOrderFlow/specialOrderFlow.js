import { LightningElement, api, track, wire } from 'lwc';
import { FlowNavigationBackEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
//wait 300 ms after user stops typing
const SEARCH_DELAY = 1000; 
import searchProd from '@salesforce/apex/lookUpFlow.searchProd';
import addProducts from '@salesforce/apex/lookUpFlow.addProducts';
const REGEX_SOSL_RESERVED = /(\?|&|\||!|\{|\}|\[|\]|\(|\)|\^|~|\*|:|"|\+|-|\\)/g;
export default class SpecialOrderFlow extends LightningElement {
    //tracking Importing
    @api orderId; 
    @api orderproducts;
    @track results; 
    @track selectedIds=[]; 
    //control what is shown
    loading = false; 
//local vars
    minSearchTerm = 3; 
    arrId = 0 
    queryTerm; 
    searchTimeOut; 
    productName; 
    prodsId
    showResult = false; 
    @wire(searchProd,{searchTerm:'$queryTerm'})
        wiredList(result){
            if(result.data){
                this.results = result.data;
                this.loading = false;
                this.showResult = true;  
            }else if(result.error){
                console.log(result.error); 
            }
        }
//handle search
    handleKeyUp(searchTerm) {
         if(this.minSearchTerm > searchTerm.target.value.length){
             return; 
           }
        if(this.searchTimeOut){
            clearTimeout(this.searchTimeOut);
        }
            const key = searchTerm.target.value.trim().replace(REGEX_SOSL_RESERVED, '?').toLowerCase();;
        this.searchTimeOut = setTimeout(() =>{
            this.loading = true; 
            this.queryTerm = key; 
            
            this.searchTimeOut = null; 
         
        }, SEARCH_DELAY);          
        
    }
    //item selected from dropdown
    itemSelect(evt){
        this.showResult = false;
        this.productName = evt.target.value;
        this.prodsId = evt.currentTarget.dataset.recordid
    }

    handleQty(e){
        this.qty = e.target.value; 
    }
    handleClick(){
       const desc = this.template.querySelector('lightning-input[data-my-id=in3]').value
       
       //no show toast in flows so throw a old fashion screen alert 
        if(this.qty ===undefined || this.qty <1){
            alert('Please make sure there is qty'); 
            return; 
        } 
        // if((this.productName === undefined || this.productName.length<0) && (desc === undefined || desc.length<5)){
        //     alert('Please make sure your are selecting a product');
        //     return; 
        // }
               // this will be used to pass the values back out to the flow. 
               this.arrId = this.arrId +1
        this.selectedIds = [
            ...this.selectedIds, {
                id: this.arrId,
                name: this.productName,
                Product_Description__c: desc,
                Quantity_Requested__c: this.qty,
                ATS_Product__c: this.prodsId
            }
        ]
        //desc field
        this.template.querySelector('lightning-input[data-my-id=in3]').value = '';
        this.productName = '';
        this.qty = '';
        this.prodsId = '';
        //qty field
        this.template.querySelector('lightning-input[data-my-id=in4]').value = '';
    }

//remove product from id
        handleRemove(x){
            const index = this.selectedIds.findIndex(item => item.id === x.detail);
            console.log('index '+ index);
            this.selectedIds.splice(index, 1);
            //for some reason to pass to child this needs done
            this.selectedIds = [...this.selectedIds];
        }
        //save products go to the next screen
        goNext(){
            let products = JSON.stringify(this.selectedIds);
            console.log('products'+products);
            let order = this.orderId;
            console.log(order)
            addProducts({products:products, orderId: order})
             .then(()=>{
            // check if NEXT is allowed on this screen
            // navigate to the next screen
            console.log('flow move!')
                const navigateNextEvent = new FlowNavigationNextEvent();
                this.dispatchEvent(navigateNextEvent);
             }).catch((error)=>{
                console.log(JSON.stringify(error))
                let message = 'Unknown error';
                if (Array.isArray(error.body)) {
                    message = error.body.map(e => e.message).join(', ');
                } else if (typeof error.body.message === 'string') {
                    message = error.body.message;
                }
        });
    }
    goBack(){
         const backNav = new FlowNavigationBackEvent();
         this.dispatchEvent(backNav);
    }
    get getListBoxClass(){
        return 'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid';
    }
}