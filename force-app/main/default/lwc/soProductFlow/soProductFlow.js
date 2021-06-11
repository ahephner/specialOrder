import { LightningElement, api, track } from 'lwc';
const columns = [
    {label:'Product', fieldName:'name'},
    {label:'Description', fieldName:'Product_Description__c'},
    {label:'QTY', fieldName:'Quantity_Requested__c'},
    {type: 'button', 
    initialWidth: 75,typeAttributes:{
       label: 'Remove',
       name: 'Remove',
       title: 'Remove',
       disabled: false,
       value: 'Remove',
       variant: 'destructive'
   }, 
   cellAttributes: {
       style: 'transform: scale(0.85)'}
   },
] 
export default class SoProductFlow extends LightningElement {
    @api selection; 
    @track data = [];
    columns = columns; 

    handleRowAction(x){
       const rowAction = x.detail.action.name;
       const rowId = x.detail.row.id; 
       console.log('rowAction '+ rowAction + ' rowId '+ rowId);
        if(rowAction === 'Remove'){
            this.dispatchEvent(new CustomEvent('update',{
                detail: rowId
            }));
        }
    }
            removeProd(x){
            let xId = x.target.id; 
            this.dispatchEvent(new CustomEvent('update', {
                detail: xId
            })); 
            console.log('selected id '+ xId);
            
        }
}