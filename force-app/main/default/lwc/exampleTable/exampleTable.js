import { LightningElement } from 'lwc';
const columns = [
    { label: 'Label', fieldName: 'name' },
    { label: 'Website', fieldName: 'website', type: 'url' },
    { label: 'Phone', fieldName: 'phone', type: 'phone' },
    { label: 'Balance', fieldName: 'amount', type: 'currency' ,cellAttributes:{
        class:{fieldName:'balance'},}},
    { label: 'CloseAt', fieldName: 'closeAt', type: 'date',cellAttributes: {
        class: 'slds-text-color_success slds-text-title_caps',
    }, },
    
];
export default class ExampleTable extends LightningElement {
    columns=columns; 
    input = [{name:"Burley Block",email:"Anne75@yahoo.com",website:"https://xzavier.org",amount:"555.77",phone:"897.895.9349 x192",closeAt:"2022-06-17T09:28:39.283Z",id:"f7a1c47e-08c6-4e99-b78f-6445b57a8e31"},{name:"Sasha Gerlach",email:"Destany79@gmail.com",website:"https://zena.net",amount:"154.71",phone:"1-311-132-3246",closeAt:"2022-12-26T22:41:35.730Z",id:"52eb4b19-38d3-4f72-b3ec-566ff711f446"}]
    data
        connectedCallback(){
            this.data = this.input.map(item=>{
                let balance = item.amount < 500 ? 'slds-text-color_warn': 'slds-text-color_success';
                return {...item, balance}
            })
        }
}