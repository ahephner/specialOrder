import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FORM_FACTOR from '@salesforce/client/formFactor';
import getItems from '@salesforce/apex/lookUpFlow.getOrderRequestItems';
import { updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';

const actions = [
    {label: 'Delete', name:'delete'},
]
const columns = [
    {label:'Product Requested', 'fieldName':'nameURL', type:'url', typeAttributes:{label:{fieldName:'product'}},target:'_blank' },
    {label:'QTY', 'fieldName':'Quantity_Requested__c', type:'number', cellAttributes:{alignment: 'center'} },
    {label:'Unit Cost', 'fieldName':'Cost__c', type:'currency', editable:true, cellAttributes:{alignment: 'center'}},    
    {label:'Min Margin', 'fieldName':'Minimum_Margin__c', type:'percent-fixed', editable:true, cellAttributes:{alignment: 'center'} },
    {label:'Sales Margin', 'fieldName':'Sales_Margin__c', type:'percent-fixed',  editable:true, cellAttributes:{alignment: 'center'}},
    {label:'Unit Price', 'fieldName':'Unit_Price__c', type:'currency', editable:true, cellAttributes:{alignment: 'center'}},
    {
        type:'action',
        typeAttributes: {rowActions:actions}
    }
]

export default class SpecialOrderProductMP extends NavigationMixin(LightningElement) {
    isLoading; 
    @api recordId;
    //make component aware of size
    @api flexipageRegionWidth;
    @api prop1; 
    columns = columns;
    requestItems;
    @track items; 
    formSize; 
    connectedCallback(){
        this.formSize= this.screenSize(FORM_FACTOR);
        console.log('formSize '+this.formSize);
    }
    //check screen size to show table on desktop and cards on mobile
    screenSize = (screen) => {
        return screen === 'Large'? true: false 
    }
    //get the items
    @wire(getItems, {recordId: '$recordId'})
        wiredResult(result){
            this.requestItems = result;
            if(result.data){
                let product; 
                let nameURL
                this.items = result.data.map(row =>{
                    product = row.ATS_Product__c ? row.ATS_Product__r.Product_Name__c : row.Product_Description__c;
                    nameURL = `/${row.Id}`;
                    return {...row, nameURL, product}
                })
                console.log(this.items);
                
                
            }else if(result.error){
                this.items = undefined;
                console.log(result.error);
            }
        }
//Refresh
        @api
        async refresh(){
            this.isLoading = true;
            console.log('refresh');
            await refreshApex(this.requestItems);
            this.isLoading = false;
        }
     
//DESKTOP VERSION
//This save is basically only taking the table values that we actually want to update. If there are other fields we want then pass them in 
//by adding another let then draft.whatEverValue. Make sure it's NOT A FORMULA or Cross Item like __r.Name 
//Then pass to the updateFunction and refresh apex.
//Note we then are using system validation on margin's. If the margin is too low the error tag is rasied. Note that it's cached with the bad values. Need to refresh!  
        handleSave(){
            this.isLoading = true;
                const recordInputs = this.items.slice().map(draft =>{
                    let Id = draft.Id;
                    let Sales_Margin__c = draft.Sales_Margin__c
                    let Unit_Price__c = draft.Unit_Price__c;
                    let Cost__c = draft.Cost__c;
                    let Minimum_Margin__c = draft.Minimum_Margin__c;
                    const fields = {Id, Sales_Margin__c, Unit_Price__c, Cost__c, Minimum_Margin__c}
                    
                return { fields };
            });
            console.log(recordInputs);
            const promises = recordInputs.map(recordInput => updateRecord(recordInput));
            console.log(promises);
            
            Promise.all(promises).then(prod => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Ship It!',
                        variant: 'success'
                    })
                );
                    
                
                 // Display fresh data in the datatable
               return this.refresh();
            }).catch(error => {
                console.log(error);
                
                // Handle error
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Margin Error',
                        message: error.body.output.errors[0].message,
                        variant: 'error'
                    })
                )
            }).finally(() => {
                console.log('finally');
                
                this.draftValues = []; 
                this.isLoading = false
                
            });  
        } 
//helper function accepts the values from handleCell. Then updates the table values based on type 
//Possible types: Cost__c, Minimum_Margin__c, Sales_Margin__c , Unit_Price__c
//Have to set the actual field update as the number value passed in
        tableUpdate =(id, type, num) =>{
            let index = this.items.findIndex(prod => prod.Id === id);
            window.clearTimeout(this.delay)
            this.delay = setTimeout(()=>{
                if (type === 'Cost__c'){
                    this.items[index].Cost__c = num;
                    if(this.items[index].Minimum_Margin__c < 0.01 || this.items[index].Minimum_Margin__c === undefined){
                        return;
                    }else{
                        this.items[index].Unit_Price__c = Number(this.items[index].Cost__c /(1 - this.items[index].Minimum_Margin__c/100)).toFixed(2);
                    }
                    this.items = [...this.items];
                    return; 
                }
                else if(type === 'Minimum_Margin__c'){
                    this.items[index].Minimum_Margin__c = num;
                    this.items[index].Sales_Margin__c = num;
                    if(this.items[index].Cost__c === 0.00 || this.items[index].Cost__c ===undefined){
                        return;
                    }else{
                        this.items[index].Unit_Price__c = Number(this.items[index].Cost__c /(1 - num/100)).toFixed(2);
                    }
                    
                    this.items = [...this.items];
                    return; 
                }
                else if(type === 'Sales_Margin__c'){
                    
                    this.items[index].Unit_Price__c = Number(this.items[index].Cost__c /(1 - num/100)).toFixed(2);
                    this.items[index].Sales_Margin__c = num; 
                    this.items = [...this.items]
                    return; 
                }else if(type === 'Unit_Price__c'){
                    this.items[index].Sales_Margin__c = Number((1 - (this.items[index].Cost__c /num))*100).toFixed(2)
                    this.items[index].Unit_Price__c = num; 
                    this.items = [...this.items];
                    return; 
                }
            }, 300)

        }
        //handle table cell updates. Extract the cell values pass to helper function
        handleCell(e){
            let tempId;  
            let tempType; 
            let value; 
            e.detail.draftValues.map(x =>{
                tempId = x.Id;
                tempType = Object.keys(x)[0];
                value = Number(Object.values(x)[0])
            });

            this.tableUpdate(tempId, tempType, value);
        }
///Add new product to table
        addProduct(){
            const setRec = encodeDefaultFieldValues({
                Order_Request__c: this.recordId
            })
            
            this[NavigationMixin.Navigate]({
                type:'standard__objectPage',
                attributes: {
                    objectApiName: 'Order_Request_Detail__c',
                    actionName: 'new'
                },
                state: {
                    defaultFieldValues: setRec
                }

            });
        }
//Delete from the table
        handleAction(i){
            const actionName = i.detail.action.name;
            const row = i.detail.row.Id;
            //console.log('row '+row);
            
            switch (actionName) {
                case 'delete':{
                        // eslint-disable-next-line no-case-declarations
                        // eslint-disable-next-line no-alert
                        let cf = confirm('Do you want to delete this entry?')
                        if(cf===true){
                    deleteRecord(row)
                        .then(() => {
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Success', 
                                    message: 'Product Deleted', 
                                    variant: 'success'
                                }) 
                            );//this refreshes the table  
                            return refreshApex(this.requestItems)
                        })
                        .catch(error => {
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Error deleting record',
                                    message: JSON.stringify(error),
                                    variant: 'error'
                                })
                            )
                        })
                    }
                }
            }
        }
//Mobile stuff//////
        handleMargin(m){
            let index = this.items.findIndex(prod => prod.Id === m.target.name);
            window.clearTimeout(this.delay); 
           this.delay = setTimeout(()=>{
            this.items[index].Sales_Margin__c = Number(m.detail.value);
            if(100- this.items[index].Sales_Margin__c > 0){
                this.items[index].Unit_Price__c = Number(this.items[index].Cost__c /(1 - this.items[index].Sales_Margin__c/100)).toFixed(2);
            }else{
                this.items[index].Unit_Price__c = 0;
                this.items[index].Unit_Price__c = this.items[index].Unit_Price__c.toFixed(2);
                
            }
},800)
        }
        handlePrice(p){
            window.clearTimeout(this.delay);
            let index = this.items.findIndex(prod => prod.Id === p.target.name);
            // console.log('index '+ index);
            this.delay =  setTimeout(()=>{ 
                this.items[index].Unit_Price__c = Number(p.detail.value);
                console.log(this.items[index].Unit_Price__c);
                if(this.items[index].Unit_Price__c >0){
                    this.items[index].Sales_Margin__c = Number((1 - (this.items[index].Cost__c /this.items[index].Unit_Price__c))*100).toFixed(2)
                }else{
                    console.log('something is happening');
                    
                }
            },800)
        }

        handleCost(c){
            let index = this.items.findIndex(prod => prod.Id === c.target.name);
            this.items[index].Cost__c = Number(c.detail.value);
            if(this.items[index].Minimum_Margin__c ===0 || this.items[index].Minimum_Margin__c === undefined){
                return;
            }else{
                this.items[index].Unit_Price__c = Number(this.items[index].Cost__c /(1 - mm.detail.value/100)).toFixed(2);
            }
        }

        handleMinMargin(mm){
            let index = this.items.findIndex(prod => prod.Id === mm.target.name);
            this.items[index].Minimum_Margin__c = Number(mm.detail.value);
            this.items[index].Sales_Margin__c = Number(mm.detail.value);
            this.items[index].Unit_Price__c = Number(this.items[index].Cost__c /(1 - this.items[index].Minimum_Margin__c/100)).toFixed(2);
        }
        //save mobile
        saveMobile(e){
            console.log('items');
            
            console.log(this.items);

            this.isLoading = true;
            const recordInputs =  this.items.slice().map(draft => {
                let Id = draft.Id;
                let Sales_Margin__c = draft.Sales_Margin__c
                let Unit_Price__c = draft.Unit_Price__c;
                let Cost__c = draft.Cost__c;
                let Minimum_Margin__c = draft.Minimum_Margin__c;
                const fields = {Id, Sales_Margin__c, Unit_Price__c, Cost__c, Minimum_Margin__c}
                return { fields };
            });
            console.log(recordInputs)
            const promises = recordInputs.map(recordInput => updateRecord(recordInput));
            Promise.all(promises).then(x => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title:'Record Saved',
                        message:'Successfully pricing',
                        variant:'success'
                    })
                );
                return this.refresh();
            }).catch(error => {
                console.log(error);
                
                // Handle error
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Margin Error',
                        message: error.body.output.errors[0].message,
                        variant: 'error'
                    })
                )
            }).finally(() => {
                console.log('finally'); 
                this.isLoading = false
                
            });
            
            
        }

        cancel(e){
            this.refresh(); 
        }
}