import fs from 'fs';

const filepath = 'e:/meenakshy/Curemist_New/curemist-website/client/pages/checkout.tsx';
let content = fs.readFileSync(filepath, 'utf-8');

// 1. Add showErrors state
content = content.replace(/(const \[sameAsBilling, setSameAsBilling\] = useState\(true\);\s*const \[billingAddress, setBillingAddress\] = useState<Address>\(\{[\s\S]*?\}\);)/, '$1\n  const [showErrors, setShowErrors] = useState(false);');

// 2. Add onInvalidCapture
content = content.replace(/<form onSubmit=\{handlePlaceOrder\} className="space-y-8">/, `<form onSubmit={handlePlaceOrder} onInvalidCapture={(e) => {
                setShowErrors(true);
                const firstInvalid = e.currentTarget.querySelector(':invalid') as HTMLElement;
                if (e.target === firstInvalid && firstInvalid) {
                  const headerOffset = 180;
                  const elementPosition = firstInvalid.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.scrollY - headerOffset;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                  firstInvalid.focus({ preventScroll: true });
                  e.preventDefault();
                }
              }} className="space-y-8">`);

// 3. Add required to billing inputs
content = content.replace(/(value=\{billingAddress\.street\}[^>]*placeholder="Street Address"\s*)\/>/g, '$1required\n                        />');
content = content.replace(/(value=\{billingAddress\.city\}[^>]*placeholder="City\/Town"\s*)\/>/g, '$1required\n                          />');
content = content.replace(/(value=\{billingAddress\.state\}[^>]*placeholder="State\/Province"\s*)\/>/g, '$1required\n                          />');
content = content.replace(/(value=\{billingAddress\.zip\}[^>]*placeholder="ZIP\/Postal Code"\s*)\/>/g, '$1required\n                          />');
content = content.replace(/(value=\{billingAddress\.country\}[^>]*placeholder="Country"\s*)\/>/g, '$1required\n                          />');

// 4. Helper to inject error logic generically
function addErrorTextByPlaceholder(currentContent, identifier, conditionVar, text) {
    const regex = new RegExp(`(<input[\\s\\S]*?placeholder="${identifier}"[\\s\\S]*?/>)`, 'g');
    return currentContent.replace(regex, `$1\n                      {showErrors && !${conditionVar} && <p className="text-red-500 text-xs mt-1 font-medium">${text}</p>}`);
}

function addErrorTextByValue(currentContent, obj, field, text) {
    const rx = new RegExp(`(<input[\\s\\S]*?value=\\{${obj}\\.${field}\\}[\\s\\S]*?/>)`, 'g');
    return currentContent.replace(rx, `$1\n                      {showErrors && !${obj}.${field} && <p className="text-red-500 text-xs mt-1 font-medium">${text}</p>}`);
}

function addErrorTextToPhone(currentContent) {
    const replStr = `                      {showErrors && !customerInfo.phone && <p className="text-red-500 text-xs mt-1 font-medium">Phone Number is required</p>}
                      {customerInfo.phone.length > 0 && customerInfo.phone.length < 10 && (
                        <p className="text-red-500 text-xs mt-1 font-medium">Please enter a valid 10-digit mobile number.</p>
                      )}
                    </div>`;
    return currentContent.replace(/(<input[\s\S]*?placeholder="Phone Number"[\s\S]*?\/>\s*)\{customerInfo\.phone\.length > 0[\s\S]*?<\/div>/g, `$1${replStr}`);
}

// Just safely replace based on placeholder
content = addErrorTextByPlaceholder(content, 'First Name', 'customerInfo.firstName', 'First Name is required');
content = addErrorTextByPlaceholder(content, 'Last Name', 'customerInfo.lastName', 'Last Name is required');
content = addErrorTextByPlaceholder(content, 'Email Address', 'customerInfo.email', 'Email Address is required');

content = addErrorTextToPhone(content);

// Select Gender
content = content.replace(/(<select[\s\S]*?value=\{customerInfo\.sex\}[\s\S]*?<\/select>)/g, '$1\n                      {showErrors && !customerInfo.sex && <p className="text-red-500 text-xs mt-1 font-medium">Gender is required</p>}');

// Date of birth 
content = content.replace(/(max="2009-12-31"[^>]*\/>)/g, '$1\n                      {showErrors && !customerInfo.dob && <p className="text-red-500 text-xs mt-1 font-medium">Date of Birth is required</p>}');

// Shipping
content = addErrorTextByValue(content, 'shippingAddress', 'street', 'Street Address is required');
content = addErrorTextByValue(content, 'shippingAddress', 'city', 'City/Town is required');
content = addErrorTextByValue(content, 'shippingAddress', 'state', 'State/Province is required');
content = addErrorTextByValue(content, 'shippingAddress', 'zip', 'ZIP/Postal Code is required');
content = addErrorTextByValue(content, 'shippingAddress', 'country', 'Country is required');

// Billing
content = content.replace(/(<input[^>]*value=\{billingAddress\.street\}[^>]*\/>)/g, '$1\n                          {showErrors && !billingAddress.street && <p className="text-red-500 text-xs mt-1 font-medium">Street Address is required</p>}');
content = content.replace(/(<input[^>]*value=\{billingAddress\.city\}[^>]*\/>)/g, '$1\n                          {showErrors && !billingAddress.city && <p className="text-red-500 text-xs mt-1 font-medium">City/Town is required</p>}');
content = content.replace(/(<input[^>]*value=\{billingAddress\.state\}[^>]*\/>)/g, '$1\n                          {showErrors && !billingAddress.state && <p className="text-red-500 text-xs mt-1 font-medium">State/Province is required</p>}');
content = content.replace(/(<input[^>]*value=\{billingAddress\.zip\}[^>]*\/>)/g, '$1\n                          {showErrors && !billingAddress.zip && <p className="text-red-500 text-xs mt-1 font-medium">ZIP/Postal Code is required</p>}');
content = content.replace(/(<input[^>]*value=\{billingAddress\.country\}[^>]*\/>)/g, '$1\n                          {showErrors && !billingAddress.country && <p className="text-red-500 text-xs mt-1 font-medium">Country is required</p>}');


fs.writeFileSync(filepath, content);
console.log('Successfully injected EVERYTHING natively');
