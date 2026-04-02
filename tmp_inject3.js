import fs from 'fs';

const filepath = 'e:/meenakshy/Curemist_New/curemist-website/client/pages/checkout.tsx';
let content = fs.readFileSync(filepath, 'utf-8');

function addErrorText(currentContent, identifier, conditionVar, text) {
    // Look for `<input ... <identifier> ... />` and replace the whole block
    // We can just find the placeholder since it's unique
    const regex = new RegExp(`(<input[^>]*placeholder="${identifier}"[^>]*/>)`, 'g');
    return currentContent.replace(regex, `$1\n                      {showErrors && !${conditionVar} && <p className="text-red-500 text-xs mt-1 font-medium">${text}</p>}`);
}

content = addErrorText(content, 'First Name', 'customerInfo.firstName', 'First Name is required');
content = addErrorText(content, 'Last Name', 'customerInfo.lastName', 'Last Name is required');
content = addErrorText(content, 'Email Address', 'customerInfo.email', 'Email Address is required');
content = addErrorText(content, 'Phone Number', 'customerInfo.phone', 'Phone Number is required');

content = content.replace(/(max="2009-12-31"[^>]*\/>)/g, '$1\n                      {showErrors && !customerInfo.dob && <p className="text-red-500 text-xs mt-1 font-medium">Date of Birth is required</p>}');

// Shipping
content = content.replace(/(<input[^>]*value=\{shippingAddress\.street\}[^>]*\/>)/g, '$1\n                      {showErrors && !shippingAddress.street && <p className="text-red-500 text-xs mt-1 font-medium">Street Address is required</p>}');
content = content.replace(/(<input[^>]*value=\{shippingAddress\.city\}[^>]*\/>)/g, '$1\n                      {showErrors && !shippingAddress.city && <p className="text-red-500 text-xs mt-1 font-medium">City/Town is required</p>}');
content = content.replace(/(<input[^>]*value=\{shippingAddress\.state\}[^>]*\/>)/g, '$1\n                      {showErrors && !shippingAddress.state && <p className="text-red-500 text-xs mt-1 font-medium">State/Province is required</p>}');
content = content.replace(/(<input[^>]*value=\{shippingAddress\.zip\}[^>]*\/>)/g, '$1\n                      {showErrors && !shippingAddress.zip && <p className="text-red-500 text-xs mt-1 font-medium">ZIP/Postal Code is required</p>}');
content = content.replace(/(<input[^>]*value=\{shippingAddress\.country\}[^>]*\/>)/g, '$1\n                      {showErrors && !shippingAddress.country && <p className="text-red-500 text-xs mt-1 font-medium">Country is required</p>}');

// Billing
content = content.replace(/(<input[^>]*value=\{billingAddress\.street\}[^>]*\/>)/g, '$1\n                          {showErrors && !billingAddress.street && <p className="text-red-500 text-xs mt-1 font-medium">Street Address is required</p>}');
content = content.replace(/(<input[^>]*value=\{billingAddress\.city\}[^>]*\/>)/g, '$1\n                          {showErrors && !billingAddress.city && <p className="text-red-500 text-xs mt-1 font-medium">City/Town is required</p>}');
content = content.replace(/(<input[^>]*value=\{billingAddress\.state\}[^>]*\/>)/g, '$1\n                          {showErrors && !billingAddress.state && <p className="text-red-500 text-xs mt-1 font-medium">State/Province is required</p>}');
content = content.replace(/(<input[^>]*value=\{billingAddress\.zip\}[^>]*\/>)/g, '$1\n                          {showErrors && !billingAddress.zip && <p className="text-red-500 text-xs mt-1 font-medium">ZIP/Postal Code is required</p>}');
content = content.replace(/(<input[^>]*value=\{billingAddress\.country\}[^>]*\/>)/g, '$1\n                          {showErrors && !billingAddress.country && <p className="text-red-500 text-xs mt-1 font-medium">Country is required</p>}');


fs.writeFileSync(filepath, content);
console.log('Successfully injected error messages using plain strings');
