import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent} from 'lightning/flowSupport';
import searchProd from '@salesforce/apex/lookUpFlow.searchProd';

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
    
    handleQty(e){
        this.qty = e.detail.value;

        const attributeChange = new FlowAttributeChangeEvent('qty', this.qty);
        this.dispatchEvent(attributeChange); 
    }

    newDescription(e){
        window.clearTimeout(this.delayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(()=>{
            this.prodDesc = n.detail.value; 
            const attributeChange = new FlowAttributeChangeEvent('prodDesc', this.prodDesc);
             this.dispatchEvent(attributeChange); 
        },400); 
    }
//search for product



//drop down class
    get getListBoxClass(){
        return 'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid';
    }
}