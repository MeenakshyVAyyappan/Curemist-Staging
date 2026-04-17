fetch("http://localhost:3000/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "test",
    email: "test@test.com",
    phone: "123",
    subject: "test",
    message: "hello"
  })
}).then(r => r.json()).then(console.log);
