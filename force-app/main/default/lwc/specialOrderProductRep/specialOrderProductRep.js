import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FORM_FACTOR from '@salesforce/client/formFactor';
import { NavigationMixin } from 'lightning/navigation';
import getItems from '@salesforce/apex/lookUpFlow.getOrderRequestItems';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

const columns = [
    {label:'Product Requested', 'fieldName':'nameURL', type:'url', typeAttributes:{label:{fieldName:'product'}},target:'_blank' },
    {label:'QTY', 'fieldName':'Quantity_Requested__c', type:'number', editable:true, cellAttributes:{alignment: 'center'}  },
    {label:'Unit Cost', 'fieldName':'Cost__c', type:'currency', cellAttributes:{alignment: 'center'} },    
    {label:'Min Margin', 'fieldName':'Minimum_Margin__c', type:'percent-fixed', cellAttributes:{alignment: 'center'}  },
    {label:'Sales Margin', 'fieldName':'Sales_Margin__c', type:'percent-fixed',  editable:true, cellAttributes:{alignment: 'center'} },
    {label:'Unit Price', 'fieldName':'Unit_Price__c', type:'currency', editable:true, cellAttributes:{alignment: 'center'} },
]

export default class SpecialOrderProductRep extends NavigationMixin(LightningElement) {
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
        return screen === 'Large'? true : false  
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
        handleSave(event){
            this.isLoading = true;
            
            const recordInputs = this.items.slice().map(draft =>{
                let Id = draft.Id;
                let Quantity_Requested__c = draft.Quantity_Requested__c;
                let Sales_Margin__c = draft.Sales_Margin__c
                let Unit_Price__c = draft.Unit_Price__c;
                const fields = {Id,Quantity_Requested__c, Sales_Margin__c, Unit_Price__c}
                
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
                    if(type=== 'Quantity_Requested__c'){
                        this.items[index].Quantity_Requested__c = num; 
                    }
                    else if(type === 'Sales_Margin__c'){
            
                        this.items[index].Unit_Price__c = Number(this.items[index].Cost__c /(1 - num/100)).toFixed(2);
                        this.items[index].Sales_Margin__c = num; 
                        this.items = [...this.items]
                    }else if(type === 'Unit_Price__c'){
                        this.items[index].Sales_Margin__c = Number((1 - (this.items[index].Cost__c /num))*100).toFixed(2)
                        this.items[index].Unit_Price__c = num; 
                        this.items = [...this.items]
                    }
        }, 800)

}
        //handle cell update. Grab values then pass to helper function
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
        addProduct(){
            if(this.stage != 'Not Submitted'){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: "You can't add products once submitted for approval",
                        variant: 'error'
                    })
                    );
                    return;  
                }
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
                        defaultFieldValues: setRec,
                        navigationLocation: 'RELATED_LIST'
                    }
                    
                });    
        }
//Mobile stuff//////
        handleQTY(qty){
            let index = this.items.findIndex(prod => prod.Id === qty.target.name);
            this.items[index].Quantity_Requested__c = Number(qty.detail.value);
        }
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

        //save mobile
        saveMobile(e){
            console.log('items');
            
            console.log(this.items);

            this.isLoading = true;
            const recordInputs =  this.items.slice().map(draft => {
                let Id = draft.Id;
                let Quantity_Requested__c = draft.Quantity_Requested__c
                let Sales_Margin__c = draft.Sales_Margin__c
                let Unit_Price__c = draft.Unit_Price__c;
                const fields = {Id,Quantity_Requested__c, Sales_Margin__c, Unit_Price__c}
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