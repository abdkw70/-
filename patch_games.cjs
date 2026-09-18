const fs = require('fs');
let code = fs.readFileSync('server/freeChallenge.ts', 'utf8');

const replacements = [
  ['title: \\\'اختلاف الصورة والبحث عن المختلف\\\'', 'title: { ar: "اختلاف الصورة والبحث عن المختلف", en: "Spot the Difference" }'],
  ['description: \\\'حدد العنصر المختلف أو الفارق بين العناصر المعروضة بأعلى دقة وتركيز بصري.\\\'', 'description: { ar: "حدد العنصر المختلف أو الفارق بين العناصر المعروضة بأعلى دقة وتركيز بصري.", en: "Identify the different element or spot the difference with high accuracy and visual focus." }'],
  ['winMessage: \\\'مبروك! لقد اجتزت تحدي الاختلافات بنجاح\\\'', 'winMessage: { ar: "مبروك! لقد اجتزت تحدي الاختلافات بنجاح", en: "Congratulations! You passed the Spot the Difference challenge successfully" }'],
  ['lossMessage: \\\'حظ أوفر في إيجاد الاختلاف المرة القادمة\\\'', 'lossMessage: { ar: "حظ أوفر في إيجاد الاختلاف المرة القادمة", en: "Better luck finding the difference next time" }'],
  ['timeoutMessage: \\\'انتهى الوقت قبل إيجاد الاختلاف\\\'', 'timeoutMessage: { ar: "انتهى الوقت قبل إيجاد الاختلاف", en: "Time is up before finding the difference" }'],

  ['title: \\\'مطابقة الظلال الدقيقة\\\'', 'title: { ar: "مطابقة الظلال الدقيقة", en: "Exact Silhouette Match" }'],
  ['description: \\\'قارن تفاصيل الأشكال وظلالها الدقيقة واختر الظل المطابق بنسبة 100%.\\\'', 'description: { ar: "قارن تفاصيل الأشكال وظلالها الدقيقة واختر الظل المطابق بنسبة 100%.", en: "Compare shapes and their accurate silhouettes and select the 100% matching shadow." }'],
  ['winMessage: \\\'رائع! عينك دقيقة في مطابقة الظلال\\\'', 'winMessage: { ar: "رائع! عينك دقيقة في مطابقة الظلال", en: "Awesome! Your eyes are sharp in matching silhouettes" }'],
  ['lossMessage: \\\'أخطأت في اختيار الظل المطابق\\\'', 'lossMessage: { ar: "أخطأت في اختيار الظل المطابق", en: "You chose the wrong matching silhouette" }'],
  ['timeoutMessage: \\\'انتهى الوقت أثناء مطابقة الظل\\\'', 'timeoutMessage: { ar: "انتهى الوقت أثناء مطابقة الظل", en: "Time is up while matching the silhouette" }'],

  ['title: \\\'إكمال الأنماط الهندسية\\\'', 'title: { ar: "إكمال الأنماط الهندسية", en: "Geometric Pattern Completion" }'],
  ['description: \\\'اكتشف التسلسل المنطقي وأكمل النمط الرياضي أو البصري الناقص بدقة.\\\'', 'description: { ar: "اكتشف التسلسل المنطقي وأكمل النمط الرياضي أو البصري الناقص بدقة.", en: "Discover the logical sequence and accurately complete the missing visual or mathematical pattern." }'],
  ['winMessage: \\\'أحسنت في استكمال النمط الهندسي\\\'', 'winMessage: { ar: "أحسنت في استكمال النمط الهندسي", en: "Well done on completing the geometric pattern" }'],
  ['lossMessage: \\\'النمط الذي اخترته غير صحيح\\\'', 'lossMessage: { ar: "النمط الذي اخترته غير صحيح", en: "The pattern you selected is incorrect" }'],
  ['timeoutMessage: \\\'لم تكتشف النمط في الوقت المحدد\\\'', 'timeoutMessage: { ar: "لم تكتشف النمط في الوقت المحدد", en: "You did not discover the pattern in time" }'],

  ['title: \\\'تحدي العد والتركيز السريع\\\'', 'title: { ar: "تحدي العد والتركيز السريع", en: "Fast Counting and Focus Challenge" }'],
  ['description: \\\'قم بإحصاء عدد الأدوات والعناصر المحددة المعروضة بأسرع وقت ممكن.\\\'', 'description: { ar: "قم بإحصاء عدد الأدوات والعناصر المحددة المعروضة بأسرع وقت ممكن.", en: "Count the number of specified tools and elements displayed as quickly as possible." }'],
  ['winMessage: \\\'مذهل! سرعة وعد صحيح 100%\\\'', 'winMessage: { ar: "مذهل! سرعة وعد صحيح 100%", en: "Amazing! Fast and 100% accurate count" }'],
  ['lossMessage: \\\'أخطأت في العد هذه المرة\\\'', 'lossMessage: { ar: "أخطأت في العد هذه المرة", en: "You miscounted this time" }'],
  ['timeoutMessage: \\\'تأخرت في عد العناصر بشكل صحيح\\\'', 'timeoutMessage: { ar: "تأخرت في عد العناصر بشكل صحيح", en: "You were too slow to count the elements correctly" }'],

  ['title: \\\'فرز ومطابقة الأشكال\\\'', 'title: { ar: "فرز ومطابقة الأشكال", en: "Shape Sorting and Matching" }'],
  ['description: \\\'رتب وفرز الأشكال والأدوات الهندسية وفق قواعد التصنيف واللون.\\\'', 'description: { ar: "رتب وفرز الأشكال والأدوات الهندسية وفق قواعد التصنيف واللون.", en: "Sort and arrange geometric shapes and tools according to sorting rules and color." }'],
  ['winMessage: \\\'ممتاز في فرز وتصنيف الأشكال\\\'', 'winMessage: { ar: "ممتاز في فرز وتصنيف الأشكال", en: "Excellent at sorting and classifying shapes" }'],
  ['lossMessage: \\\'خطأ في قواعد فرز الأشكال\\\'', 'lossMessage: { ar: "خطأ في قواعد فرز الأشكال", en: "Error in shape sorting rules" }'],
  ['timeoutMessage: \\\'لم تنتهِ من فرز الأشكال بالوقت\\\'', 'timeoutMessage: { ar: "لم تنتهِ من فرز الأشكال بالوقت", en: "You didn\'t finish sorting the shapes in time" }'],

  ['title: \\\'الذاكرة البصرية السريعة\\\'', 'title: { ar: "الذاكرة البصرية السريعة", en: "Fast Visual Memory" }'],
  ['description: \\\'احفظ مواقع الرموز والأدوات والبطاقات واسترجعها بعد إخفائها.\\\'', 'description: { ar: "احفظ مواقع الرموز والأدوات والبطاقات واسترجعها بعد إخفائها.", en: "Memorize the locations of symbols, tools, and cards and recall them after they are hidden." }'],
  ['winMessage: \\\'ذاكرة فوتوغرافية مذهلة! لقد فزت\\\'', 'winMessage: { ar: "ذاكرة فوتوغرافية مذهلة! لقد فزت", en: "Amazing photographic memory! You won" }'],
  ['lossMessage: \\\'خانتك الذاكرة البصرية هذه المرة\\\'', 'lossMessage: { ar: "خانتك الذاكرة البصرية هذه المرة", en: "Your visual memory betrayed you this time" }'],
  ['timeoutMessage: \\\'نفد وقت الاسترجاع من الذاكرة\\\'', 'timeoutMessage: { ar: "نفد وقت الاسترجاع من الذاكرة", en: "Memory recall time ran out" }'],

  ['title: \\\'القطعة الناقصة من التركيب\\\'', 'title: { ar: "القطعة الناقصة من التركيب", en: "The Missing Puzzle Piece" }'],
  ['description: \\\'اختر القطعة الهندسية المناسبة تماماً لإكمال الصورة أو اللوحة الفنية.\\\'', 'description: { ar: "اختر القطعة الهندسية المناسبة تماماً لإكمال الصورة أو اللوحة الفنية.", en: "Choose the perfectly matching geometric piece to complete the picture or artwork." }'],
  ['winMessage: \\\'أحسنت اختيار القطعة المفقودة بدقة\\\'', 'winMessage: { ar: "أحسنت اختيار القطعة المفقودة بدقة", en: "Well done on accurately choosing the missing piece" }'],
  ['lossMessage: \\\'هذه القطعة لا تتطابق مع الفراغ\\\'', 'lossMessage: { ar: "هذه القطعة لا تتطابق مع الفراغ", en: "This piece does not match the gap" }'],
  ['timeoutMessage: \\\'انتهى الوقت ولم تجد القطعة المناسبة\\\'', 'timeoutMessage: { ar: "انتهى الوقت ولم تجد القطعة المناسبة", en: "Time is up and you didn\'t find the right piece" }'],

  ['title: \\\'المتاهة الذكية السريعة\\\'', 'title: { ar: "المتاهة الذكية السريعة", en: "Fast Smart Maze" }'],
  ['description: \\\'تتبع مسار الخط أو المتاهة المعقدة للوصول إلى المخرج أو الهدف الصحيح.\\\'', 'description: { ar: "تتبع مسار الخط أو المتاهة المعقدة للوصول إلى المخرج أو الهدف الصحيح.", en: "Trace the path of the line or complex maze to reach the correct exit or target." }'],
  ['winMessage: \\\'بطل المتاهات! مسار صحيح 100%\\\'', 'winMessage: { ar: "بطل المتاهات! مسار صحيح 100%", en: "Maze champion! 100% correct path" }'],
  ['lossMessage: \\\'لقد ضللت الطريق في المتاهة\\\'', 'lossMessage: { ar: "لقد ضللت الطريق في المتاهة", en: "You lost your way in the maze" }'],
  ['timeoutMessage: \\\'علقت في المتاهة بعد انتهاء الوقت\\\'', 'timeoutMessage: { ar: "علقت في المتاهة بعد انتهاء الوقت", en: "You got stuck in the maze after time ran out" }'],

  ['title: \\\'ترتيب العمليات المتسلسل\\\'', 'title: { ar: "ترتيب العمليات المتسلسل", en: "Sequential Operations Order" }'],
  ['description: \\\'رتب الخطوات أو الأدوات بالتسلسل المنطقي والصحيح من البداية للنهاية.\\\'', 'description: { ar: "رتب الخطوات أو الأدوات بالتسلسل المنطقي والصحيح من البداية للنهاية.", en: "Arrange the steps or tools in the correct logical sequence from start to finish." }'],
  ['winMessage: \\\'تسلسل منطقي صحيح ومثالي\\\'', 'winMessage: { ar: "تسلسل منطقي صحيح ومثالي", en: "Perfect and correct logical sequence" }'],
  ['lossMessage: \\\'التسلسل الذي رتبته خاطئ تماماً\\\'', 'lossMessage: { ar: "التسلسل الذي رتبته خاطئ تماماً", en: "The sequence you arranged is completely wrong" }'],
  ['timeoutMessage: \\\'نفد وقت الترتيب التسلسلي\\\'', 'timeoutMessage: { ar: "نفد وقت الترتيب التسلسلي", en: "Sequential sorting time ran out" }'],

  ['title: \\\'سرعة البديهة ورد الفعل\\\'', 'title: { ar: "سرعة البديهة ورد الفعل", en: "Reflex Speed and Quick Wit" }'],
  ['description: \\\'اضغط على العنصر المطلوب بمجرد ظهوره وتجنب الفخاخ والعناصر المشتتة.\\\'', 'description: { ar: "اضغط على العنصر المطلوب بمجرد ظهوره وتجنب الفخاخ والعناصر المشتتة.", en: "Click on the required element as soon as it appears and avoid traps and distracting elements." }'],
  ['winMessage: \\\'رد فعل صاعق! أداء استثنائي\\\'', 'winMessage: { ar: "رد فعل صاعق! أداء استثنائي", en: "Lightning fast reflex! Exceptional performance" }'],
  ['lossMessage: \\\'رد فعلك كان بطيئاً أو خاطئاً\\\'', 'lossMessage: { ar: "رد فعلك كان بطيئاً أو خاطئاً", en: "Your reaction was slow or incorrect" }'],
  ['timeoutMessage: \\\'الوقت لا ينتظر أحداً، تأخرت جداً\\\'', 'timeoutMessage: { ar: "الوقت لا ينتظر أحداً، تأخرت جداً", en: "Time waits for no one, you were too late" }']
];

for (const [ar, obj] of replacements) {
  code = code.replace(new RegExp(ar, 'g'), obj);
}

fs.writeFileSync('server/freeChallenge.ts', code);
