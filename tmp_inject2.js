import fs from "fs";

const filepath =
  "e:/meenakshy/Curemist_New/curemist-website/client/pages/checkout.tsx";
let content = fs.readFileSync(filepath, "utf-8");

function addError(content, fieldName, errorVar, errorText) {
  // Look for `placeholder="fieldName"` and the `/>` that follows it
  const searchStr = `placeholder="${fieldName}"\n                        required\n                      />`;
  const replacement = `${searchStr}\n                      {showErrors && !${errorVar} && <p className="text-red-500 text-xs mt-1 font-medium">${errorText}</p>}`;

  // Also try without required if it's billing and I missed it somewhere
  const searchStr2 = `placeholder="${fieldName}"\n                      />`;
  const replacement2 = `${searchStr2}\n                      {showErrors && !${errorVar} && <p className="text-red-500 text-xs mt-1 font-medium">${errorText}</p>}`;

  // Try single line search
  const rx = new RegExp(`(placeholder="${fieldName}"[^>]*\/>)`, "g");
  return content.replace(
    rx,
    `$1\n                      {showErrors && !${errorVar} && <p className="text-red-500 text-xs mt-1 font-medium">${errorText}</p>}`,
  );
}

content = addError(
  content,
  "First Name",
  "customerInfo.firstName",
  "First Name is required",
);
content = addError(
  content,
  "Last Name",
  "customerInfo.lastName",
  "Last Name is required",
);
content = addError(
  content,
  "Email Address",
  "customerInfo.email",
  "Email Address is required",
);
content = addError(
  content,
  "Phone Number",
  "customerInfo.phone",
  "Phone Number is required",
);

// Date of birth doesn't have placeholder, it has max="2009-12-31"
content = content.replace(
  /(max="2009-12-31"[^>]*\/>)/g,
  '$1\n                      {showErrors && !customerInfo.dob && <p className="text-red-500 text-xs mt-1 font-medium">Date of Birth is required</p>}',
);

content = addError(
  content,
  "Street Address",
  "shippingAddress.street",
  "Street Address is required",
); // This will hit both, we must differentiate
content = addError(
  content,
  "City/Town",
  "shippingAddress.city",
  "City/Town is required",
);
content = addError(
  content,
  "State/Province",
  "shippingAddress.state",
  "State/Province is required",
);
content = addError(
  content,
  "ZIP/Postal Code",
  "shippingAddress.zip",
  "ZIP/Postal Code is required",
);
content = addError(
  content,
  "Country",
  "shippingAddress.country",
  "Country is required",
);

// Let's replace the billing explicitly by value
function addErrorByValue(content, valueStr, errorVar, errorText) {
  const rx = new RegExp(`(value=\\{${valueStr}\\}[^>]*\/>)`, "g");
  return content.replace(
    rx,
    `$1\n                      {showErrors && !${errorVar} && <p className="text-red-500 text-xs mt-1 font-medium">${errorText}</p>}`,
  );
}

// Re-do everything by value, it is specific and safe!
content = fs.readFileSync(filepath, "utf-8"); // reset

content = addErrorByValue(
  content,
  "customerInfo.firstName",
  "customerInfo.firstName",
  "First Name is required",
);
content = addErrorByValue(
  content,
  "customerInfo.lastName",
  "customerInfo.lastName",
  "Last Name is required",
);
content = addErrorByValue(
  content,
  "customerInfo.email",
  "customerInfo.email",
  "Email Address is required",
);
content = addErrorByValue(
  content,
  "customerInfo.phone",
  "customerInfo.phone",
  "Phone Number is required",
);
content = addErrorByValue(
  content,
  "customerInfo.dob",
  "customerInfo.dob",
  "Date of Birth is required",
);

content = addErrorByValue(
  content,
  "shippingAddress.street",
  "shippingAddress.street",
  "Street Address is required",
);
content = addErrorByValue(
  content,
  "shippingAddress.city",
  "shippingAddress.city",
  "City/Town is required",
);
content = addErrorByValue(
  content,
  "shippingAddress.state",
  "shippingAddress.state",
  "State/Province is required",
);
content = addErrorByValue(
  content,
  "shippingAddress.zip",
  "shippingAddress.zip",
  "ZIP/Postal Code is required",
);
content = addErrorByValue(
  content,
  "shippingAddress.country",
  "shippingAddress.country",
  "Country is required",
);

content = addErrorByValue(
  content,
  "billingAddress.street",
  "billingAddress.street",
  "Street Address is required",
);
content = addErrorByValue(
  content,
  "billingAddress.city",
  "billingAddress.city",
  "City/Town is required",
);
content = addErrorByValue(
  content,
  "billingAddress.state",
  "billingAddress.state",
  "State/Province is required",
);
content = addErrorByValue(
  content,
  "billingAddress.zip",
  "billingAddress.zip",
  "ZIP/Postal Code is required",
);
content = addErrorByValue(
  content,
  "billingAddress.country",
  "billingAddress.country",
  "Country is required",
);

fs.writeFileSync(filepath, content);
console.log("Successfully injected error messages");
