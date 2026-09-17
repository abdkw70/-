const https = require('https');
const fs = require('fs');

const storeId = "Store_cl3tiz3wg036701fw09eod7yt";
const slug = "ستاند-عرض-شفاف-وجهين-اكرلك-هرمي";

const query = `
  query GetProductDetails($storeId: ID!, $slug: String) {
    product: storeProductByHandle(storeId: $storeId, handle: $slug) {
      id
      title
      handle
      isInStock
      descriptionHtml
      shortDescription
      initialPrice {
        amount
        currencyCode
      }
      images {
        src
      }
      options {
        name
        values {
          id
          name
        }
      }
      variants {
        nodes {
          id
          title
          sku
          quantity
          trackQuantity
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          image {
            src
          }
          selectedOptions {
            option {
              id
              name
            }
            value {
              id
              name
            }
          }
        }
      }
    }
  }
`;

const postData = JSON.stringify({
  query,
  variables: {
    storeId,
    slug
  }
});

const req = https.request('https://graphql.wuilt.com', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Origin': 'https://maktaba-q8.com',
    'Referer': 'https://maktaba-q8.com/'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('scripts/wuilt_stand_response.json', data);
    const parsed = JSON.parse(data);
    console.log('Product title:', parsed.data?.product?.title);
    console.log('Options:', JSON.stringify(parsed.data?.product?.options, null, 2));
    console.log('Variants count:', parsed.data?.product?.variants?.nodes?.length);
    console.log('First 3 variants:', JSON.stringify(parsed.data?.product?.variants?.nodes?.slice(0, 3), null, 2));
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(postData);
req.end();
