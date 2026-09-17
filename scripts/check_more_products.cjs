const https = require('https');
const fs = require('fs');

const storeId = "Store_cl3tiz3wg036701fw09eod7yt";

const query = `
  query GetProductDetails($storeId: ID!, $slug: String) {
    product: storeProductByHandle(storeId: $storeId, handle: $slug) {
      id
      title
      handle
      isInStock
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
`;

function fetchProduct(slug) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ query, variables: { storeId, slug } });
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
          resolve(parsed.data?.product);
        } catch(e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.write(postData);
    req.end();
  });
}

async function run() {
  const slugs = [
    "ستاند-عرض-شفاف-وجهين-اكرلك-هرمي",
    "ستاند-مايل-للبروشرات-اكرلك",
    "ستاند-عرض-بروشور-شفاف-وجه-واحد-مائل",
    "علبة-اقلام-مكتب-حديد",
    "مشرط-كتر",
    "براية-درام"
  ];

  for (const s of slugs) {
    const p = await fetchProduct(s);
    console.log(`\n================================`);
    console.log(`PRODUCT: ${p?.title} (${s})`);
    console.log(`Options (${p?.options?.length || 0}):`, p?.options?.map(o => `${o.name}: [${o.values.map(v => v.name).join(', ')}]`).join(' | '));
    console.log(`Variants (${p?.variants?.nodes?.length || 0}):`);
    p?.variants?.nodes?.forEach(v => {
      const opts = v.selectedOptions?.map(so => `${so.option?.name}=${so.value?.name}`).join(', ');
      console.log(`  - SKU: ${v.sku} | Price: ${v.price?.amount} KWD | Opts: ${opts} | Img: ${v.image ? 'YES' : 'NO'}`);
    });
  }
}

run();
