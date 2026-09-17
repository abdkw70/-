const https = require('https');
const fs = require('fs');

const storeId = "Store_cl3tiz3wg036701fw09eod7yt";

const query = `
  query GetStoreCatalog($storeId: ID!, $first: ConnectionLimitInt, $offset: Int) {
    products(
      connection: { first: $first, offset: $offset }
      filter: { storeIds: [$storeId] }
    ) {
      totalCount
      pageInfo {
        hasNextPage
      }
      nodes {
        id
        title
        handle
        descriptionHtml
        shortDescription
        isInStock
        initialPrice {
          amount
          currencyCode
        }
        images {
          src
        }
        options {
          id
          name
          position
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
  }
`;

function fetchBatch(offset, first = 50) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      query,
      variables: { storeId, first, offset }
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
        try {
          const parsed = JSON.parse(data);
          if (parsed.errors) {
            reject(new Error(JSON.stringify(parsed.errors)));
          } else {
            resolve(parsed.data?.products);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testAll() {
  let offset = 0;
  let totalFetched = 0;
  let hasMore = true;
  const allProducts = [];

  while (hasMore) {
    console.log(`Fetching batch at offset ${offset}...`);
    const res = await fetchBatch(offset, 50);
    const nodes = res.nodes || [];
    allProducts.push(...nodes);
    totalFetched += nodes.length;
    console.log(`Fetched ${nodes.length} products (total so far: ${totalFetched} / ${res.totalCount})`);
    
    if (nodes.length < 50 || totalFetched >= res.totalCount) {
      hasMore = false;
    } else {
      offset += 50;
    }
  }

  console.log(`Finished fetching! Total products: ${allProducts.length}`);
  fs.writeFileSync('scripts/wuilt_all_products_raw.json', JSON.stringify(allProducts, null, 2));

  const multiVariant = allProducts.filter(p => p.variants?.nodes?.length > 1);
  const withOpts = allProducts.filter(p => p.options?.length > 0);
  console.log(`Products with options: ${withOpts.length}`);
  console.log(`Products with >1 variants: ${multiVariant.length}`);
  
  // List option names found
  const optNames = new Set();
  withOpts.forEach(p => p.options.forEach(o => optNames.add(o.name)));
  console.log('All unique option names found in store:', Array.from(optNames));
}

testAll().catch(console.error);
