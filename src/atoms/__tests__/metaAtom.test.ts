import { metaAtom, type MetaState } from '../metaAtom';

describe('metaAtom', () => {
 it('should initialize with null values', () => {
   const initialValue = metaAtom.init;
   
   expect(initialValue).toEqual({
     downpayment: null,
     closingAndTax: null,
     cmhc: null,
     expenses: null,
     payment: null
   });
 });

 it('should match MetaState interface structure', () => {
   const sampleData: MetaState = {
     downpayment: 50000,
     closingAndTax: 8000,
     cmhc: 12000,
     expenses: 500,
     payment: 2000
   };

   // Verify each property exists and accepts number type
   expect(Object.keys(sampleData)).toHaveLength(5);
   Object.values(sampleData).forEach(value => {
     expect(typeof value).toBe('number');
   });

   // Verify specific properties
   expect(sampleData).toHaveProperty('downpayment');
   expect(sampleData).toHaveProperty('closingAndTax');
   expect(sampleData).toHaveProperty('cmhc');
   expect(sampleData).toHaveProperty('expenses');
   expect(sampleData).toHaveProperty('payment');
 });
});
