const https = require('https');

const storeId = "Store_cl3tiz3wg036701fw09eod7yt";

const query = `
  query GetStoreCatalog($storeId: ID!) {
    products(
      connection: { first: 50, offset: 0 }
      filter: { storeIds: [$storeId] }
    ) {
      totalCount
      nodes {
        id
        title
        handle
        isInStock
        initialPrice {
          amount
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
            sku
            title
            quantity
            price {
              amount
            }
            compareAtPrice {
              amount
            }
            image {
              src
            }
            selectedOptions {
              option {
                name
              }
              value {
                name
              }
            }
          }
        }
      }
    }
  }
`;

const postData = JSON.stringify({ query, variables: { storeId } });

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
    try {
      const parsed = JSON.parse(data);
      if (parsed.errors) {
        console.log('Errors:', JSON.stringify(parsed.errors, null, 2));
      } else {
        const prods = parsed.data?.products?.nodes || [];
        console.log('Total Count from Wuilt:', parsed.data?.products?.totalCount);
        console.log('Fetched nodes count:', prods.length);
        const withOpts = prods.filter(p => p.options && p.options.length > 0);
        console.log('Products with options:', withOpts.length);
        const withVariants = prods.filter(p => p.variants?.nodes && p.variants.nodes.length > 1);
        console.log('Products with >1 variants:', withVariants.length);
        if (withVariants.length > 0) {
          console.log('Sample with variants:', JSON.stringify(withVariants[0], null, 2).substring(0, 1000));
        }
      }
    } catch(e) {
      console.log('Parse error:', e.message);
    }
  });
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
