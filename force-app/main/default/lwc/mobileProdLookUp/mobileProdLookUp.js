import { LightningElement, api, wire } from 'lwc';
import { FlowAttributeChangeEvent} from 'lightning/flowSupport';
import searchProd from '@salesforce/apex/lookUpFlow.searchProd';
const REGEX_SOSL_RESERVED = /(\?|&|\||!|\{|\}|\[|\]|\(|\)|\^|~|\*|:|"|\+|-|\\)/g;
const SEARCH_DELAY = 500; 
export default class MobileProdLookUp extends LightningElement {
    //vars to flow
    @api prodDesc;
    @api qty; 
    @api prodId; 
    loading = false; 
    //search varss
    minSearchTerm = 3;
    queryTerm;
    searchTimeOut;
    productName;
    prodsId;
    showResult = false; 
    
    //validate a product is entered
    // @api validate(){
    //     if(this.prodId === undefinded && this.prodDesc === undefined){
    //         console.log(this.prodId + '  '+this.prodDesc);
            
    //         return {isValid: false,
    //         errorMessage: 'You must enter a description or select a product'}
    //     }else{
    //         return {isValid: true}
    //     }
    // }
    handleQty(e){
        this.qty = e.detail.value;

        const attributeChange = new FlowAttributeChangeEvent('qty', this.qty);
        this.dispatchEvent(attributeChange); 
    }

    newDescription(e){
        window.clearTimeout(this.delayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(()=>{
            this.prodDesc = e.detail.value; 
            const attributeChange = new FlowAttributeChangeEvent('prodDesc', this.prodDesc);
             this.dispatchEvent(attributeChange); 
        },300); 
    }
//search for product
//function handles the actual typing
handleKeyUp(searchTerm) {
    console.log('searchTerm leng ' +searchTerm.target.value.length );
    
    if(this.minSearchTerm > searchTerm.target.value.length){
        this.showResult = false;
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
//handles the query to apex
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
        //select the item
        itemSelect(evt){
            this.showResult = false;
            this.productName = evt.target.value;
            this.prodId = evt.currentTarget.dataset.recordid

            const attributeChange = new FlowAttributeChangeEvent('prodId', this.prodId);
            this.dispatchEvent(attributeChange); 
        }
//drop down class
    get getListBoxClass(){
        return 'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid';
    }
}