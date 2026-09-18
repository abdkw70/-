const fs = require('fs');
let code = fs.readFileSync('src/components/freeChallenge/FreeChallengeCartBanner.tsx', 'utf8');

const regex = /\? `حل \$\{settings\?\.puzzlesPerChallenge \|\| 3\} ألغاز بصرية سريعة واحصل على كوبون خصم \$\{winDiscount\}% فوري لطلبك \+ رصيد نقدي في محفظتك!`/;
const replacement = "? t('games.cart_banner_desc', `حل ${settings?.puzzlesPerChallenge || 3} ألغاز بصرية سريعة واحصل على كوبون خصم ${winDiscount}% فوري لطلبك + رصيد نقدي في محفظتك!`, { count: settings?.puzzlesPerChallenge || 3, discount: winDiscount })";

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/freeChallenge/FreeChallengeCartBanner.tsx', code);
