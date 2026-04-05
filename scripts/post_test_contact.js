(async () => {
  try {
    const resp = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-resend-api-key': 're_CDML8cDj_4rufYLnP5oamyQxNFwcZDRaF'
      },
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com', phone: '9999999999', subject: 'Test', message: 'Hello from test' })
    });
    const text = await resp.text();
    console.log('status', resp.status);
    console.log('body', text);
  } catch (e) {
    console.error('error', e);
  }
})();
