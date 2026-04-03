import fs from "fs";

const filepath =
  "e:/meenakshy/Curemist_New/curemist-website/client/pages/checkout.tsx";
let content = fs.readFileSync(filepath, "utf-8");

function addErrorTextByPlaceholder(
  currentContent,
  identifier,
  conditionVar,
  text,
) {
  const regex = new RegExp(
    `(<input[\\s\\S]*?placeholder="${identifier}"[\\s\\S]*?/>)`,
    "g",
  );
  return currentContent.replace(
    regex,
    `$1\n                      {showErrors && !${conditionVar} && <p className="text-red-500 text-xs mt-1 font-medium">${text}</p>}`,
  );
}

function addErrorTextByValue(currentContent, obj, field, text) {
  const rx = new RegExp(
    `(<input[\\s\\S]*?value=\\{${obj}\\.${field}\\}[\\s\\S]*?/>)`,
    "g",
  );
  return currentContent.replace(
    rx,
    `$1\n                      {showErrors && !${obj}.${field} && <p className="text-red-500 text-xs mt-1 font-medium">${text}</p>}`,
  );
}

// Just safely replace based on placeholder, ignoring the arrow function
content = addErrorTextByPlaceholder(
  content,
  "First Name",
  "customerInfo.firstName",
  "First Name is required",
);
content = addErrorTextByPlaceholder(
  content,
  "Last Name",
  "customerInfo.lastName",
  "Last Name is required",
);
content = addErrorTextByPlaceholder(
  content,
  "Email Address",
  "customerInfo.email",
  "Email Address is required",
);
// Phone we manually check... phone has placeholder="Phone Number". But it already has the 10-digit text. If I add it, there will be two.

content = addErrorTextByValue(
  content,
  "shippingAddress",
  "street",
  "Street Address is required",
);
content = addErrorTextByValue(
  content,
  "shippingAddress",
  "city",
  "City/Town is required",
);
content = addErrorTextByValue(
  content,
  "shippingAddress",
  "state",
  "State/Province is required",
);
content = addErrorTextByValue(
  content,
  "shippingAddress",
  "zip",
  "ZIP/Postal Code is required",
);
content = addErrorTextByValue(
  content,
  "shippingAddress",
  "country",
  "Country is required",
);

content = addErrorTextByValue(
  content,
  "billingAddress",
  "street",
  "Street Address is required",
);
content = addErrorTextByValue(
  content,
  "billingAddress",
  "city",
  "City/Town is required",
);
content = addErrorTextByValue(
  content,
  "billingAddress",
  "state",
  "State/Province is required",
);
content = addErrorTextByValue(
  content,
  "billingAddress",
  "zip",
  "ZIP/Postal Code is required",
);
content = addErrorTextByValue(
  content,
  "billingAddress",
  "country",
  "Country is required",
);

fs.writeFileSync(filepath, content);
console.log("Successfully injected error messages using safe regex");
