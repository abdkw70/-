const fs = require('fs');
let content = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

// Add state for orders sub-tab
content = content.replace(
  "const [activeTab, setActiveTab] = useState",
  "const [ordersTab, setOrdersTab] = useState<'ongoing' | 'previous'>('ongoing');\n  const [activeTab, setActiveTab] = useState"
);

// Define orders UI
const ordersUI = `      {/* 0. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isRtl ? 'مشترياتك' : 'Your Purchases'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl
                ? 'تابع حالة طلباتك الجارية واستعرض تفاصيل مشترياتك السابقة'
                : 'Track your ongoing orders and review your previous purchases'}
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setOrdersTab('ongoing')}
              className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer \${
                ordersTab === 'ongoing'
                  ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }\`}
            >
              {isRtl ? 'مشترياتك الجارية' : 'Ongoing Purchases'}
            </button>
            <button
              onClick={() => setOrdersTab('previous')}
              className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer \${
                ordersTab === 'previous'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }\`}
            >
              {isRtl ? 'مشترياتك السابقة' : 'Previous Purchases'}
            </button>
          </div>

          {(() => {
            const displayOrders = ordersTab === 'ongoing'
              ? orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.orderStatus))
              : orders.filter(o => ['delivered', 'completed', 'cancelled'].includes(o.orderStatus));

            if (displayOrders.length === 0) {
              return (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {ordersTab === 'ongoing'
                      ? (isRtl ? 'لا توجد مشتريات جارية' : 'No ongoing purchases')
                      : (isRtl ? 'لا توجد مشتريات سابقة' : 'No previous purchases')}
                  </h3>
                  <button
                    onClick={() => onNavigate('/shop')}
                    className="py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer inline-flex"
                  >
                    {isRtl ? 'تسوق الآن' : 'Shop Now'}
                  </button>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {displayOrders.map(order => (
                  <div key={order.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={\`p-2.5 rounded-xl flex items-center justify-center \${
                          order.orderStatus === 'completed' || order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                          order.orderStatus === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                          'bg-sky-50 text-sky-600'
                        }\`}>
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {isRtl ? 'طلب #' : 'Order #'}{order.orderNumber}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {new Date(order.createdAt || Date.now()).toLocaleDateString(isRtl ? 'ar-KW' : 'en-US')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <span className={\`text-xs font-bold px-2.5 py-1 rounded-full \${
                          order.orderStatus === 'completed' || order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          order.orderStatus === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                          order.orderStatus === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-sky-100 text-sky-800'
                        }\`}>
                          {t(\`order.status_\${order.orderStatus}\`, order.orderStatus)}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatPrice(order.total || order.subtotal)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500">
                          {order.items.length} {isRtl ? 'عناصر' : 'items'}
                        </span>
                        <button
                          onClick={() => onNavigate(\`/order/\${order.id}\`)}
                          className="font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                        >
                          {isRtl ? 'عرض التفاصيل' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
`;

content = content.replace("{/* 1. SAVED ADDRESSES TAB */}", ordersUI + "\n      {/* 1. SAVED ADDRESSES TAB */}");

fs.writeFileSync('src/pages/AccountPage.tsx', content);
