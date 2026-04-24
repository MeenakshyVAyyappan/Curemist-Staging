import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mpaysdxsmxqcivpsprlw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYXlzZHhzbXhxY2l2cHNwcmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NjM2MDIsImV4cCI6MjA4NDEzOTYwMn0.EWlABmiNMYese4iEKPZdS8DPodNVdWIX0OLfGe4cS9U";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Format order ID as ORD-00000000
function formatOrderId(id) {
  const digits = id.replace(/\D/g, "");
  const num = (digits || "00000000").slice(0, 8).padStart(8, "0");
  return `ORD-${num}`;
}

async function run() {
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_info, created_at, payment_status, order_status")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error(error);
    return;
  }
  
  let found = false;
  for (const order of data) {
    const formattedId = formatOrderId(order.id);
    if (formattedId === "ORD-18405272" || order.customer_info?.email === "shafeekedakkara9@gmail.com") {
      console.log("Found order:", order.id, order.created_at, order.payment_status);
      found = true;
      
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          order_status: "payment_successful"
        })
        .eq("id", order.id);
        
      if (updateError) {
        console.error("Update error:", updateError);
      } else {
        console.log("Successfully updated order for Shafeeque Bukhari to paid!");
      }
    }
  }
  
  if (!found) {
    console.log("Could not find order. Listing top 5 orders:");
    data.slice(0, 5).forEach(o => {
      console.log(formatOrderId(o.id), o.customer_info?.email, o.created_at);
    });
  }
}

run();
