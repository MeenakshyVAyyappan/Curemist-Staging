import fs from "fs";

const filepath =
  "e:/meenakshy/Curemist_New/curemist-website/client/pages/checkout.tsx";
let content = fs.readFileSync(filepath, "utf-8");

// 1. Add showErrors state
content = content.replace(
  /(const \[sameAsBilling, setSameAsBilling\] = useState\(true\);\s*const \[billingAddress, setBillingAddress\] = useState<Address>\(\{[\s\S]*?\}\);)/,
  "$1\n  const [showErrors, setShowErrors] = useState(false);",
);

// 2. Add setShowErrors(true) to onInvalidCapture
content = content.replace(
  /onInvalidCapture=\{\(e\) => \{/,
  "onInvalidCapture={(e) => {\n                setShowErrors(true);",
);

// 3. Helper function to process sections
function injectError(content, type, field, errorText) {
  const rx = new RegExp(`(<input[^>]*value={${type}\\.${field}}[^>]*/>)`, "g");
  const selectRx = new RegExp(
    `(<select[^>]*value={${type}\\.${field}}[^>]*>[\\s\\S]*?</select>)`,
    "g",
  );

  let res = content.replace(
    rx,
    `$1\n                      {showErrors && !${type}.${field} && <p className="text-red-500 text-xs mt-1 font-medium">${errorText}</p>}`,
  );
  res = res.replace(
    selectRx,
    `$1\n                      {showErrors && !${type}.${field} && <p className="text-red-500 text-xs mt-1 font-medium">${errorText}</p>}`,
  );
  return res;
}

// 4. Inject across customerInfo
content = injectError(
  content,
  "customerInfo",
  "firstName",
  "First Name is required",
);
content = injectError(
  content,
  "customerInfo",
  "lastName",
  "Last Name is required",
);
content = injectError(
  content,
  "customerInfo",
  "email",
  "Email Address is required",
);
content = injectError(
  content,
  "customerInfo",
  "phone",
  "Phone Number is required",
);
content = injectError(content, "customerInfo", "sex", "Gender is required");
content = injectError(
  content,
  "customerInfo",
  "dob",
  "Date of Birth is required",
);

// 5. Inject across shippingAddress
content = injectError(
  content,
  "shippingAddress",
  "street",
  "Street Address is required",
);
content = injectError(
  content,
  "shippingAddress",
  "city",
  "City/Town is required",
);
content = injectError(
  content,
  "shippingAddress",
  "state",
  "State/Province is required",
);
content = injectError(
  content,
  "shippingAddress",
  "zip",
  "ZIP/Postal Code is required",
);
content = injectError(
  content,
  "shippingAddress",
  "country",
  "Country is required",
);

// 6. Inject across billingAddress
content = injectError(
  content,
  "billingAddress",
  "street",
  "Street Address is required",
);
content = injectError(
  content,
  "billingAddress",
  "city",
  "City/Town is required",
);
content = injectError(
  content,
  "billingAddress",
  "state",
  "State/Province is required",
);
content = injectError(
  content,
  "billingAddress",
  "zip",
  "ZIP/Postal Code is required",
);
content = injectError(
  content,
  "billingAddress",
  "country",
  "Country is required",
);

// 7. Add CSS to suppress native tooltips optionally (or we just let them show up)
// e.preventDefault() in handleInvalid will stop native tooltips, which we SHOULD do now that we have custom messages.
content = content.replace(
  /firstInvalid\.focus\(\{ preventScroll: true \}\);/g,
  "firstInvalid.focus({ preventScroll: true });\n                  e.preventDefault();",
);

fs.writeFileSync(filepath, content);
console.log("Successfully injected error messages");
