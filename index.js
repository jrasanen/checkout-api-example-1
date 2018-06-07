const crypto = require('crypto');
const SuperAgent = require('SuperAgent');

const ACCOUNT = '375917';
const SECRET = 'SAIPPUAKAUPPIAS';

const headers = {
  'checkout-account': ACCOUNT,
  'checkout-algorithm': 'sha256',
  'checkout-method': 'POST'
};

const body = {
  stamp: process.hrtime().join(''),
  reference: '3759170',
  amount: 1525,
  currency: 'EUR',
  language:'FI',
  items: [
    {
      unitPrice: 1525,
      units: 1,
      vatPercentage: 24,
      productCode: '#1234',
      deliveryDate: '2018-09-01'
    }
  ],
  customer: {
    email: 'test.customer@example.com'
  },
  redirectUrls: {
    success: 'https://ecom.example.com/cart/success',
    cancel: 'https://ecom.example.com/cart/cancel'
  }
};

const hmacPayload =
  Object.keys(headers)
    .sort()
    .map((key) => [ key, headers[key] ].join(':'))
    .concat(JSON.stringify(body))
    .join("\n");

const hmac = crypto
  .createHmac('sha256', SECRET)
  .update(hmacPayload)
  .digest('hex');

// Expected HMAC:
// 84b454005a4f087076ad86cee8b4a646b18982998de7221db57646743cda7b81

// Post request to https://api.checkout.fi/payments
// Send HMAC in 'signature' headers

SuperAgent
  .post('https://api.checkout.fi/payments')
  .set(Object.assign({}, headers, { signature: hmac }))
  .send(body)
  .then((res) => console.log(res.body))
  .catch((err) => console.error(err.status, err.response.body));