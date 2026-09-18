const fs = require('fs');
let code = fs.readFileSync('src/components/gamification/ChallengeModal.tsx', 'utf8');

const regex = /`إجابة صحيحة وممتازة! \(\+\$\{formatPrice\(lastAnswerResult\.rewardEarned\)\} و \+\$\{lastAnswerResult\.xpEarned\} XP\)`/;
const replacement = "t('games.correct_answer_reward', `إجابة صحيحة وممتازة! (+${formatPrice(lastAnswerResult.rewardEarned)} و +${lastAnswerResult.xpEarned} XP)`, { reward: formatPrice(lastAnswerResult.rewardEarned), xp: lastAnswerResult.xpEarned })";

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/gamification/ChallengeModal.tsx', code);
