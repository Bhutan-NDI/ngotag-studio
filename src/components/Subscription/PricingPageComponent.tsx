import { Card } from 'flowbite-react';
import * as React from 'react';
import FreePlan from './FreePlan';
import BreadCrumbs from '../BreadCrumbs';

function PricingPage() {
  // Paste the stripe-pricing-table snippet in your React component
  return (
    <>
     <BreadCrumbs />
    <div className='grid grid-cols-2'>
   
<div>
  <Card>
  <FreePlan />
  </Card>

</div>
<div>
  <Card>
  <stripe-pricing-table
      pricing-table-id="prctbl_1OcOPsSB7FApM4hJHsZmU7z5"
      publishable-key="pk_test_51N57uSSB7FApM4hJ03qRv4rRM3LpTn6O763dAkAnAv4FqugDv7OAS1VosbnkY9VLJNeZnAVN4JLskqKO4UfM1N1m00fgxGHsUL"
      client-reference-id="{{CLIENT_REFERENCE_ID}}"
    >
    </stripe-pricing-table>
  </Card>

</div>
    </div>
    
    </>
    
    
  );
}

export default PricingPage;

