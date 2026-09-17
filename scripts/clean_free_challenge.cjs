const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'free_challenge.json');
const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw);

// Clean settings
if (data.settings) {
  if (data.settings.tickerSettings && Array.isArray(data.settings.tickerSettings.customItems)) {
    data.settings.tickerSettings.customItems = [
      "🔥 تحدى سرعتك وذكاءك الآن في 10 ألعاب حصرية واربح كوبونات خصم إضافية لطلبك!",
      "🚚 توصيل سريع لجميع مناطق ومحافظات دولة الكويت خلال 24 ساعة فقط",
      "🎁 فائزون جدد كل ساعة بجوائز فورية وكوبونات خصم نقدية"
    ];
  }
}

// Clean games
if (Array.isArray(data.games)) {
  data.games.forEach(game => {
    if (game.rewardType === 'free_cart') {
      game.rewardType = 'discount_wheel';
    }
    if (game.winMessage && game.winMessage.includes('سلتك مجاناً')) {
      game.winMessage = game.winMessage.replace(/وحصلت على سلتك مجاناً!/g, 'وحصلت على كوبون خصم مميز لطلبك!');
    }
    if (game.winMessage && game.winMessage.includes('السلة مجاناً')) {
      game.winMessage = game.winMessage.replace(/وحصلت على السلة مجاناً!/g, 'وحصلت على خصم فوري مميز لطلبك!');
    }
  });
}

// Clean recent winners
if (Array.isArray(data.recentWinners)) {
  data.recentWinners.forEach(w => {
    if (w.rewardType === 'free_cart') {
      w.rewardType = 'discount_wheel';
      w.rewardTitle = 'فاز بخصم 25% على كامل السلة ومكافأة XP';
    }
    if (typeof w.rewardTitle === 'string' && (w.rewardTitle.includes('سلة مجانية') || w.rewardTitle.includes('سلتك مجانا'))) {
      w.rewardTitle = 'فاز بخصم 20% على كامل مشترياته';
    }
  });
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Sanitized data/free_challenge.json successfully');
