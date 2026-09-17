const fs = require('fs');
let content = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

content = content.replace(
  "import { fetchAchievements, fetchLeaderboard, fetchUserAddresses, saveUserAddress, deleteUserAddress, setDefaultUserAddress } from '../lib/api';",
  "import { fetchAchievements, fetchLeaderboard, fetchUserAddresses, saveUserAddress, deleteUserAddress, setDefaultUserAddress, fetchOrders } from '../lib/api';"
);

content = content.replace(
  "import { Achievement, LeaderboardEntry, UserAddress } from '../types';",
  "import { Achievement, LeaderboardEntry, UserAddress, Order } from '../types';"
);

content = content.replace(
  "const [addresses, setAddresses] = useState<UserAddress[]>([]);",
  "const [addresses, setAddresses] = useState<UserAddress[]>([]);\n  const [orders, setOrders] = useState<Order[]>([]);"
);

content = content.replace(
  "const [activeTab, setActiveTab] = useState<'addresses' | 'levels' | 'achievements' | 'leaderboard'>('addresses');",
  "const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'levels' | 'achievements' | 'leaderboard'>('orders');"
);

content = content.replace(
  "const [achData, leadData, addrData] = await Promise.all([",
  "const phoneToUse = userProfile?.phone || '';\n        const [achData, leadData, addrData, ordersData] = await Promise.all(["
);

content = content.replace(
  "fetchUserAddresses(uId),\n        ]);",
  "fetchUserAddresses(uId),\n          fetchOrders({ phone: phoneToUse }),\n        ]);"
);

content = content.replace(
  "if (addrData.success && addrData.addresses) setAddresses(addrData.addresses);",
  "if (addrData.success && addrData.addresses) setAddresses(addrData.addresses);\n        if (ordersData.success && ordersData.orders) setOrders(ordersData.orders);"
);

// Add the Orders tab in the nav
const tabsNavStr = `      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">`;
const ordersTabButtonStr = `        <button
          onClick={() => setActiveTab('orders')}
          className={\`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer \${
            activeTab === 'orders'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }\`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isRtl ? \`مشترياتي (\${orders.length})\` : \`My Orders (\${orders.length})\`}</span>
        </button>

`;

content = content.replace(tabsNavStr, tabsNavStr + '\n' + ordersTabButtonStr);

fs.writeFileSync('src/pages/AccountPage.tsx', content);
