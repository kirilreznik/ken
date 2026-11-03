// Interactive "בחירת שם" (name swipe) demo for the public landing page.
// A self-contained preview of the app's E16 swipe screen: 10 sample names, real CBS birth
// counts, nothing stored or sent. Design: the Nest name swipe canvas (liquid-glass cards on
// a photo background, the fabrics photo by default).

// Birth counts come from CBS release 391/2025 (names given to newborns, 1949–2024), via the
// app repo's assets/data/names.json. m/f are births by sex since 1949; y is births per year
// 2000–2024; rank is the 2024 rank among all names. Band and trend follow the E16 PRD rules
// (נפוץ = top 100, בינוני = 101–500; trend = last 3 years vs. the 3 years five years earlier,
// ±25%). Intros, Bible notes and people are the 10 hand-written samples from
// assets/data/name-content.json.
const NAMES = [
  {"n":"זיו","niqqud":"זִיו","sex":"u","m":8660,"f":3499,"rank":143,"band":"בינוני","trend":"flat","intro":"זיו הוא אור, זוהר וברק. שם קצר שניתן לבנים ולבנות.","bible":{"text":"\"בְּחֹדֶשׁ זִו הוּא הַחֹדֶשׁ הַשֵּׁנִי\". חודש זיו הוא השם המקראי של אייר.","ref":"מלכים א ו, א"},"people":[{"name":"זיו קורן","what":"צלם עיתונות"}],"y":[257,276,272,317,281,293,300,300,297,325,255,263,251,255,236,270,270,285,285,276,294,300,274,267,302]},
  {"n":"נועם","niqqud":"נֹעַם","sex":"u","m":42517,"f":12945,"rank":17,"band":"נפוץ","trend":"flat","intro":"נעימות, עדינות. שם עברי שנפוץ כבר עשרות שנים.","bible":{"text":"\"וִיהִי נֹעַם ה׳ אֱלֹהֵינוּ עָלֵינוּ\"","ref":"תהילים צ, יז"},"people":[{"name":"נועם גרשוני","what":"אלוף פראלימפי בטניס, לונדון 2012"},{"name":"נועם חומסקי","what":"בלשן"}],"y":[1067,1386,1403,1508,1494,1505,1446,1707,2802,2688,2181,2063,1986,2018,2086,1869,1930,1707,1632,1583,1484,1472,1474,1327,1189]},
  {"n":"יעל","niqqud":"יָעֵל","sex":"f","m":102,"f":53285,"rank":27,"band":"נפוץ","trend":"flat","intro":"יעל היא עז הבר שחיה במצוקים, גם בעין גדי.","bible":{"text":"יעל אשת חבר הקיני, מגיבורות שירת דבורה.","ref":"שופטים ד–ה"},"people":[{"name":"יעל ארד","what":"זכתה במדליה האולימפית הראשונה של ישראל, ג׳ודו 1992"}],"y":[614,723,720,720,838,810,955,1041,1104,1064,1168,1107,1081,1109,1199,1103,1141,1104,1125,1104,941,1013,985,1015,958]},
  {"n":"לביא","niqqud":"לָבִיא","sex":"m","m":15234,"f":70,"rank":6,"band":"נפוץ","trend":"flat","intro":"לביא הוא אריה. שם שכמעט לא ניתן לפני 2010 והפך לאחד הנפוצים.","bible":{"text":"\"כָּרַע שָׁכַב כְּאַרְיֵה וּכְלָבִיא מִי יְקִימֶנּוּ\"","ref":"בראשית מט, ט"},"people":[],"y":[21,32,27,46,50,62,63,89,114,176,193,223,306,375,504,643,898,1200,1271,1362,1355,1385,1376,1447,1523]},
  {"n":"תמר","niqqud":"תָּמָר","sex":"f","m":145,"f":47192,"rank":20,"band":"נפוץ","trend":"flat","intro":"עץ התמר ופריו, מסמלי הארץ.","bible":{"text":"תמר, כלתו של יהודה, ותמר בת דוד המלך.","ref":"בראשית לח; שמואל ב יג"},"people":[{"name":"תמר מלכת גאורגיה","what":"מלכה שמלכה במאה ה־12"}],"y":[544,597,734,741,832,865,909,1022,1047,1136,1201,1342,1343,1371,1472,1411,1365,1349,1358,1305,1200,1293,1196,1141,1090]},
  {"n":"שקד","niqqud":"שָׁקֵד","sex":"u","m":4836,"f":10567,"rank":107,"band":"בינוני","trend":"flat","intro":"עץ השקד, שפורח ראשון בסוף החורף.","bible":{"text":"\"מַקֵּל שָׁקֵד אֲנִי רֹאֶה\"","ref":"ירמיהו א, יא"},"people":[],"y":[546,554,659,627,492,466,468,475,434,441,424,381,410,440,438,502,459,481,479,493,448,444,409,389,388]},
  {"n":"אריאל","niqqud":"אֲרִיאֵל","sex":"u","m":37350,"f":11443,"rank":2,"band":"נפוץ","trend":"flat","intro":"אריה של אל. אחד השמות הנפוצים בישראל היום.","bible":{"text":"\"הוֹי אֲרִיאֵל אֲרִיאֵל קִרְיַת חָנָה דָוִד\". בספר ישעיהו זה כינוי לירושלים.","ref":"ישעיהו כט, א"},"people":[{"name":"אריאל זילבר","what":"זמר ויוצר"},{"name":"אריאל זאבי","what":"ג׳ודוקא, מדליית ארד באולימפיאדת אתונה 2004"}],"y":[637,765,749,743,802,838,986,1027,1119,1174,1348,1402,1565,1567,1857,1888,1870,1979,2003,1952,1883,2044,2077,1829,2099]},
  {"n":"אביגיל","niqqud":"אֲבִיגַיִל","sex":"f","m":0,"f":25912,"rank":7,"band":"נפוץ","trend":"flat","intro":"אבי גיל: אבי הוא שמחה. שם שהפך נפוץ מאוד מאז שנות ה־2000.","bible":{"text":"אביגיל, אישה נבונה שהפכה לאשת דוד.","ref":"שמואל א כה"},"people":[],"y":[238,275,287,321,353,395,386,466,542,663,700,827,842,944,1133,1236,1226,1290,1294,1198,1159,1139,1348,1311,1437]},
  {"n":"עמית","niqqud":"עָמִית","sex":"u","m":26107,"f":12674,"rank":99,"band":"נפוץ","trend":"down","intro":"עמית הוא חבר, רע, מי שהולך לצדך.","bible":{"text":"\"לֹא תְשַׁקְּרוּ אִישׁ בַּעֲמִיתוֹ\"","ref":"ויקרא יט, יא"},"people":[],"y":[1304,1154,1225,1186,1184,1087,1071,1113,1086,1047,1132,1046,1075,988,985,930,909,856,740,670,546,643,521,428,403]},
  {"n":"אלה","niqqud":"אֵלָה","sex":"f","m":18,"f":26407,"rank":39,"band":"נפוץ","trend":"flat","intro":"עץ האלה, עץ חסון ועתיק בנוף של ארץ ישראל.","bible":{"text":"\"וַיַּחֲנוּ בְּעֵמֶק הָאֵלָה\"","ref":"שמואל א יז, ב"},"people":[],"y":[160,167,209,272,346,379,443,479,549,643,640,769,778,727,726,681,729,713,718,693,779,804,662,762,769]}
];

const CBS_URL = 'https://www.cbs.gov.il/he/mediarelease/DocLib/2025/391/11_25_391t1.xlsx';
const CBS_LICENSE_URL = 'https://www.cbs.gov.il/en/Pages/Enduser-license.aspx';

const svg = (d, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d.split('|').map(p => `<path d="${p}"/>`).join('')}</svg>`;
const ICON = {
  bookmark: 'M6 4h12v16l-6-4-6 4z',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  close: 'M6 6l12 12|M18 6L6 18',
  undo: 'M14 7h-5a5 5 0 0 0 0 10h6|M14 7l-3-3|M14 7l-3 3',
  image: 'M6 5h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z|M9 8.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z|M21 16l-5-5-8 8',
  swipe: 'M9 11V6a2 2 0 0 1 4 0v5|M13 10.5a2 2 0 0 1 4 0V12a2 2 0 0 1 4 0v3a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.5L4.5 15a2 2 0 0 1 3.4-2L9 14.5',
  people: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2|M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z|M22 21v-2a4 4 0 0 0-3-3.87|M16 3.13a4 4 0 0 1 0 7.75',
};

export const namesStyle = `
/* name swipe demo */
.nd-wrap{display:grid;grid-template-columns:minmax(0,410px) minmax(0,1fr);gap:56px;align-items:start}
.nd{--nd-glass:rgba(255,255,255,.34);--nd-soft:rgba(255,255,255,.22);--nd-well:rgba(255,255,255,.42);--nd-bar:#FFCFA8;position:relative;container-type:inline-size;background:var(--ink);padding:8px;border-radius:52px;box-shadow:0 30px 60px -30px rgba(31,27,30,.5);user-select:none;-webkit-user-select:none}
.nd-screen{position:relative;overflow:hidden;border-radius:44px;display:flex;flex-direction:column;height:min(216cqw,calc(100svh - 96px));min-height:560px;background:var(--bg) center/cover no-repeat;transition:background-image .3s}
.nd[data-bg=fabric] .nd-screen{background-image:url(/landing/names-fabric.webp)}
.nd[data-bg=notebook] .nd-screen{background-image:url(/landing/names-notebook.webp)}
.nd[data-bg=nursery] .nd-screen{background-image:url(/landing/names-nursery.webp)}
.nd[data-bg=none] .nd-screen{background-image:radial-gradient(circle at 85% 30%,rgba(255,207,168,.55),rgba(255,207,168,0) 45%),radial-gradient(circle at 10% 85%,rgba(255,226,201,.7),rgba(255,226,201,0) 40%)}
.nd-screen:before{content:'';position:absolute;inset:0 0 auto;height:180px;background:linear-gradient(180deg,rgba(244,242,241,.75),rgba(244,242,241,0));pointer-events:none}
.nd-screen>*{position:relative}
.nd-island{flex:none;align-self:center;width:112px;height:30px;margin-top:11px;border-radius:999px;background:#000}
.nd-home{flex:none;align-self:center;width:128px;height:5px;margin:2px 0 8px;border-radius:999px;background:rgba(31,27,30,.75)}
.nd-glass{background:var(--nd-glass);-webkit-backdrop-filter:blur(28px) saturate(180%);backdrop-filter:blur(28px) saturate(180%);border:1px solid rgba(255,255,255,.55);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 14px 30px -16px rgba(0,0,0,.4)}
.nd-soft{background:var(--nd-soft);-webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);border:1px solid rgba(255,255,255,.45)}
.nd[data-bg=none] .nd-glass{background:var(--surface);-webkit-backdrop-filter:none;backdrop-filter:none;border-color:transparent;box-shadow:0 18px 36px -18px rgba(31,27,30,.28)}
.nd[data-bg=none] .nd-soft{background:rgba(255,255,255,.7)}
.nd button,.nd a{color:var(--ink);cursor:pointer}
.nd-head{display:flex;align-items:center;gap:8px;padding:12px 18px 8px}
.nd-head h3{margin:0;flex-grow:1;font-size:22px;line-height:28px;font-weight:800}
.nd-round{width:44px;height:44px;border-radius:999px;display:grid;place-items:center;padding:0}
.nd-saved{height:44px;padding:0 14px;border-radius:999px;background:var(--ink);color:#fff!important;display:flex;align-items:center;gap:6px;font-size:14px;font-weight:700}
.nd-chips{display:flex;gap:8px;padding:4px 18px 14px;flex-wrap:wrap}
.nd-chip{min-height:36px;padding:4px 14px;border-radius:999px;font-size:13px;font-weight:700;position:relative}
.nd-chip:after{content:'';position:absolute;inset:-4px 0}
.nd .nd-chip[aria-pressed=true]{background:var(--ink);color:#fff;border-color:var(--ink)}
.nd-stage{position:relative;flex:1;min-height:0;margin:0 18px}
.nd-back{position:absolute;top:28px;inset-inline:40px;bottom:2px;border-radius:30px;transform:rotate(-3deg);display:flex;align-items:flex-end;justify-content:center;padding-bottom:12px;font-size:14px;font-weight:800;color:var(--ink-2)}
.nd-back.n1{top:14px;bottom:16px;inset-inline:28px;transform:rotate(2deg);background:rgba(255,255,255,.3);font-size:15px}
.nd-card{position:absolute;top:0;bottom:30px;inset-inline:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;border-radius:30px;padding:20px;display:flex;flex-direction:column;gap:12px;touch-action:pan-y;cursor:grab;will-change:transform;line-height:1.45}
.nd-card:active{cursor:grabbing}
.nd-card.enter{animation:nd-in .28s ease-out}
@keyframes nd-in{from{transform:translateY(14px) scale(.96);opacity:.5}}
.nd-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.nd-tag{padding:4px 11px;border-radius:999px;background:var(--accent-soft);color:var(--accent);font-size:12px;font-weight:700}
.nd-pos{font-size:12.5px;color:var(--ink-2);font-weight:500}
.nd-name{text-align:center;font-size:54px;line-height:64px;font-weight:800;letter-spacing:-1px;padding-top:6px}
.nd-intro{margin:0;text-align:center;font-size:15px;line-height:22px;font-weight:500}
.nd-well{background:var(--nd-well);border:1px solid rgba(255,255,255,.5);border-radius:16px;padding:12px}
.nd[data-bg=none] .nd-well{background:var(--bg);border-color:transparent}
.nd-bible{display:flex;gap:10px;align-items:flex-start;background:rgba(255,246,238,.6)}
.nd[data-bg=none] .nd-bible{background:#FFF6EE}
.nd-bible svg{color:var(--accent);margin-top:2px;flex:none}
.nd-label{display:block;font-size:11.5px;font-weight:700;color:var(--ink-2)}
.nd-bible .nd-label{color:var(--accent)}
.nd-bible p{margin:0;font-size:13.5px;line-height:20px;font-weight:500}
.nd-ref{display:block;font-size:12px;color:var(--ink-2)}
.nd-people{display:grid;gap:6px}
.nd-person{display:flex;align-items:center;gap:8px;font-size:13px;line-height:18px;color:var(--ink-2)}
.nd-person b{color:var(--ink)}
.nd-initial{flex:none;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.55);display:grid;place-items:center;font-size:11px;font-weight:800;color:var(--ink)}
.nd[data-bg=none] .nd-initial{background:var(--bg)}
.nd-sex{margin-top:auto;display:grid;gap:6px}
.nd-sex div:first-child{display:flex;justify-content:space-between;font-size:12.5px;font-weight:700}
.nd-bar{display:flex;height:8px;border-radius:999px;overflow:hidden;background:var(--nd-bar)}.nd-bar i{background:var(--ink)}
.nd-tiles{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.nd-tile{display:flex;flex-direction:column;gap:2px;font-size:12.5px;color:var(--ink-2)}
.nd-tile strong{font-size:19px;line-height:24px;font-weight:800;color:var(--ink)}
.nd-tile svg{width:100%;height:30px;direction:ltr}
.nd-trend{font-weight:700;color:var(--ink)}
.nd-stamp{position:absolute;top:22px;padding:4px 12px;border:3px solid currentColor;border-radius:12px;font-size:22px;font-weight:800;opacity:0;pointer-events:none;background:rgba(255,255,255,.75)}
.nd-stamp.keep{inset-inline-end:20px;transform:rotate(-12deg);color:var(--ink);opacity:var(--keep,0)}
.nd-stamp.skip{inset-inline-start:20px;transform:rotate(12deg);color:var(--ink-2);opacity:var(--skip,0)}
.nd-stamp.love{inset-inline:0;margin:auto;width:max-content;top:40%;color:var(--accent);opacity:var(--love,0)}
.nd-empty{position:absolute;inset:0 0 30px;overflow-y:auto;border-radius:30px;padding:28px 22px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px}
.nd-empty b{font-size:20px;line-height:1.4}.nd-empty p{margin:0;font-size:14.5px;color:var(--ink-2)}
.nd-empty ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
.nd-empty li{padding:4px 12px;border-radius:999px;background:rgba(255,255,255,.6);font-weight:700;font-size:14px}
.nd-cta{min-height:44px;padding:10px 20px;border-radius:999px;background:var(--ink);color:#fff!important;font-weight:700;font-size:14.5px;border:0;display:inline-flex;align-items:center}
.nd-link{font-weight:700;font-size:14px;text-decoration:underline;text-underline-offset:3px;min-height:44px;display:inline-flex;align-items:center}
.nd-actions{display:flex;align-items:center;justify-content:center;gap:18px;padding:16px 18px 10px}
.nd-actions button{height:56px;border-radius:999px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:15px;font-weight:700;transition:transform .15s}
.nd-actions button:active{transform:scale(.95)}
.nd-actions button:disabled{opacity:.45;cursor:default;transform:none}
.nd-keep{padding:0 22px;background:var(--ink);color:#fff!important;border:0;box-shadow:0 8px 20px rgba(31,27,30,.25)}
.nd-love{width:56px;background:var(--accent-soft);color:var(--accent)!important;border:1px solid rgba(255,255,255,.6)}
.nd-skip{padding:0 22px}.nd-actions .nd-skip{background:rgba(255,255,255,.55)}
.nd-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 22px 20px}
.nd-undo{min-height:44px;padding:0 14px;border-radius:999px;display:flex;align-items:center;gap:6px;font-size:13.5px;font-weight:700}
.nd-undo:disabled{opacity:.5;cursor:default}
.nd-status{padding:6px 12px;border-radius:999px;font-size:12.5px;font-weight:500;text-align:center;max-width:62%}
.nd-side{display:grid;gap:18px;padding-top:8px}
.nd-how{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.nd-how li{display:flex;gap:14px;align-items:center;background:var(--surface);border-radius:var(--radius-m);padding:14px 18px;box-shadow:var(--shadow-s);font-size:15px;color:var(--ink-2)}
.nd-how b{color:var(--ink)}
.nd-how .ico{flex:none;width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent)}.nd-how .ico.ink{background:var(--ink);color:#fff}.nd-how .ico.plain{background:#EEEAE8;color:var(--ink)}
.nd-how .ico svg{width:20px;height:20px}
.nd-list{background:var(--surface);border-radius:var(--radius-l);padding:20px 22px;box-shadow:var(--shadow-s);scroll-margin-top:100px}
.nd-list h3{margin:0 0 4px;font-size:18px}.nd-list p{margin:0;font-size:14px;color:var(--muted)}
.nd-list ol{margin:12px 0 0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:8px}
.nd-list li{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:var(--bg);font-weight:700}
.nd-list li small{font-weight:600;font-size:12px;color:var(--accent);display:inline-flex;align-items:center;gap:4px}.nd-list li svg{width:14px;height:14px}
.nd-note{font-size:12.5px;color:var(--muted);margin:0}.nd-note a{text-decoration:underline;text-underline-offset:2px}
@media(max-width:1020px){.nd-wrap{grid-template-columns:1fr;gap:28px}.nd{max-width:410px;width:100%;margin-inline:auto}.nd-side{max-width:560px;margin-inline:auto;width:100%}}
@media(max-width:600px){.nd{padding:5px;border-radius:40px}.nd-screen{border-radius:35px}.nd-head{padding:14px 14px 4px}.nd-head h3{font-size:20px}.nd-chips{padding:2px 14px 10px;gap:6px}.nd-stage{margin:0 12px}.nd-card{bottom:20px}.nd-empty{bottom:20px}.nd-back{top:20px;bottom:0;inset-inline:34px}.nd-back.n1{top:10px;bottom:10px;inset-inline:22px}.nd-island,.nd-home{display:none}.nd-head{padding-top:14px}.nd-foot{padding-bottom:14px}.nd-card{padding:16px;gap:9px}.nd-name{font-size:44px;line-height:52px;padding-top:0}.nd-intro{font-size:14.5px;line-height:21px}.nd-well{padding:10px}.nd-tiles{gap:8px}.nd-actions{gap:12px;padding:12px 12px 8px}.nd-actions button{height:52px}.nd-love{width:52px!important}.nd-keep,.nd-skip{padding:0 18px!important}.nd-foot{padding:0 14px 14px}}
.nd-close{display:none}
.nd-launch{display:none;position:relative;overflow:hidden;width:100%;min-height:380px;border:0;border-radius:30px;padding:24px 20px;background:var(--bg) url(/landing/names-fabric.webp) center/cover;box-shadow:0 30px 60px -30px rgba(31,27,30,.5);flex-direction:column;align-items:center;justify-content:center;gap:22px;color:var(--ink);cursor:pointer;text-align:center}
.nd-launch-card{width:min(260px,100%);border-radius:26px;padding:18px 18px 22px;display:flex;flex-direction:column;align-items:center;gap:6px;transform:rotate(-2deg)}
.nd-launch-card b{font-size:52px;line-height:62px;font-weight:800}
.nd-launch-card span:last-child{font-size:14px;color:var(--ink-2);font-weight:500}
.nd-launch-cta{display:inline-flex;align-items:center;gap:10px;min-height:52px;padding:0 24px;border-radius:999px;background:var(--ink);color:#fff;font-weight:700;font-size:16px;box-shadow:0 8px 20px rgba(31,27,30,.25)}
.nd.nd-full{position:fixed;inset:0;z-index:60;width:auto;max-width:none;margin:0;padding:0;border-radius:0;box-shadow:none}
.nd-full .nd-screen{height:100vh;height:100dvh;min-height:0;border-radius:0;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}
.nd-full .nd-close{display:grid}.nd-full .nd-island,.nd-full .nd-home{display:none}
body.nd-open{overflow:hidden}
@media(max-width:600px){.nd:not(.nd-full){display:none}.nd-launch{display:flex}}
@media(prefers-reduced-motion:reduce){.nd-card.enter{animation:nd-fade .2s}@keyframes nd-fade{from{opacity:0}}}
`;

export const namesSection = (brand) => `<section class="section" id="names" aria-labelledby="names-title"><div class="section-head"><h2 id="names-title">מחפשים שם?<br>נסו להחליק.</h2><p>כל כרטיס מציג שם אחד: מה הוא אומר, איפה הוא מופיע בתנ״ך וכמה תינוקות קיבלו אותו ב־2024. ככה זה יעבוד ב־${brand}, ואפשר לנסות כבר כאן.</p></div>
<div class="nd-wrap">
<button type="button" class="nd-launch" data-nd-open aria-label="פתיחת ההדגמה של בחירת שם במסך מלא"><span class="nd-launch-card nd-glass" aria-hidden="true"><span class="nd-tag">מתאים לכולם</span><b>זִיו</b><span>ועוד 9 שמות לדוגמה</span></span><span class="nd-launch-cta">${svg(ICON.swipe)}לנסות במסך מלא</span></button>
<div class="nd" data-names-demo data-bg="fabric" role="region" aria-label="הדגמה של בחירת שם, עם 10 שמות לדוגמה">
<div class="nd-screen">
<div class="nd-island" aria-hidden="true"></div>
<div class="nd-head"><button type="button" class="nd-round nd-soft nd-close" data-nd-close aria-label="סגירת ההדגמה">${svg(ICON.close)}</button><h3>בחירת שם</h3><button type="button" class="nd-round nd-soft" data-bg-next aria-label="החלפת רקע. עכשיו: בדים">${svg(ICON.image)}</button><a class="nd-saved" href="#nd-list" aria-label="השמות שלי: 0 נשמרו">${svg(ICON.bookmark, 18)}<span data-count>0</span></a></div>
<div class="nd-chips" role="group" aria-label="סינון לפי מין"><button type="button" class="nd-chip nd-soft" data-filter="all" aria-pressed="true">כל השמות</button><button type="button" class="nd-chip nd-soft" data-filter="u" aria-pressed="false">מתאים לכולם</button><button type="button" class="nd-chip nd-soft" data-filter="f" aria-pressed="false">בת</button><button type="button" class="nd-chip nd-soft" data-filter="m" aria-pressed="false">בן</button></div>
<div class="nd-stage"><noscript><div class="nd-empty nd-glass"><b>ההדגמה צריכה JavaScript.</b></div></noscript></div>
<div class="nd-actions"><button type="button" class="nd-keep" data-act="keep" aria-label="שמירה לרשימה">${svg(ICON.bookmark)}שמירה</button><button type="button" class="nd-love" data-act="love" aria-label="אהבתי מאוד">${svg(ICON.heart, 22)}</button><button type="button" class="nd-skip nd-glass" data-act="skip" aria-label="דילוג, לא בשבילנו">דילוג${svg(ICON.close)}</button></div>
<div class="nd-foot"><button type="button" class="nd-undo nd-soft" data-undo aria-label="ביטול ההחלטה האחרונה" disabled>${svg(ICON.undo, 18)}ביטול</button><span class="nd-status nd-soft" role="status" aria-live="polite">10 שמות לדוגמה</span></div>
<div class="nd-home" aria-hidden="true"></div>
</div></div>
<div class="nd-side">
<ul class="nd-how">
<li><span class="ico plain">${svg(ICON.swipe)}</span><span><b>מחליקים את הכרטיס.</b> ימינה לשמירה, שמאלה לדילוג. אפשר גם בכפתורים.</span></li>
<li><span class="ico">${svg(ICON.heart)}</span><span><b>לב לשם שאוהבים במיוחד.</b> הוא עולה לראש הרשימה.</span></li>
<li><span class="ico ink">${svg(ICON.people)}</span><span><b>בוחרים לבד או ביחד.</b> כל אחד מחליק אצלו, ושם ששניכם שמרתם מופיע בהתאמות.</span></li>
</ul>
<div class="nd-list" id="nd-list"><h3>השמות ששמרת</h3><p data-list-empty>עוד לא נשמרו שמות. מה שיישמר יופיע כאן.</p><ol data-list hidden></ol></div>
<p class="nd-note">10 שמות לדוגמה. באפליקציה יהיו כמעט 20,000 שמות. מספרי הלידות לקוחים מ<a href="${CBS_URL}" target="_blank" rel="noopener">נתוני הלשכה המרכזית לסטטיסטיקה</a> על שמות שניתנו ליילודים בשנים 1949–2024 (הודעה לתקשורת 391/2025), לפי <a href="${CBS_LICENSE_URL}" target="_blank" rel="noopener">תנאי השימוש</a> שלה. ההסברים נכתבו בעזרת בינה מלאכותית ועשויים להכיל טעויות. מה שבוחרים כאן לא נשמר ולא נשלח לשום מקום.</p>
</div>
</div></section>`;

// Runs in the browser. Kept as a real function so it is linted and readable; serialized below.
function demo(NAMES) {
  const root = document.querySelector('[data-names-demo]'); if (!root) return;
  const q = s => root.querySelector(s);
  const stage = q('.nd-stage'), status = q('.nd-status'), undoBtn = q('[data-undo]'), bgBtn = q('[data-bg-next]');
  const countEl = q('[data-count]'), savedLink = q('.nd-saved');
  const list = document.querySelector('[data-list]'), listEmpty = document.querySelector('[data-list-empty]');
  const actBtns = [...root.querySelectorAll('[data-act]')], chips = [...root.querySelectorAll('[data-filter]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const SEX = { m: 'בן', f: 'בת', u: 'מתאים לכולם' };
  const TREND = { up: ['בעלייה', '↗'], down: ['בירידה', '↘'], flat: ['יציב', '→'] };
  const BGS = [['fabric', 'בדים'], ['notebook', 'מחברת'], ['nursery', 'חדר תינוק'], ['none', 'ללא רקע']];
  const ICONS = { bookmark: '__BOOK__', heart: '__HEART__' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => n.toLocaleString('he-IL');
  const order = NAMES.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const decided = new Map(); const past = [];
  let filter = 'all', busy = false, bg = 0;

  const share = c => {
    const b = c.m / (c.m + c.f) * 100;
    if (b < 1) return ['פחות מ־1%', 'מעל 99%', b];
    if (b > 99) return ['מעל 99%', 'פחות מ־1%', b];
    return [Math.round(b) + '%', (100 - Math.round(b)) + '%', b];
  };
  const spark = y => {
    const max = Math.max(...y), min = Math.min(...y);
    const pts = y.map((v, i) => [+(4 + i * (124 / (y.length - 1))).toFixed(1), +(32 - (v - min) / ((max - min) || 1) * 28).toFixed(1)]);
    const end = pts[pts.length - 1];
    return `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${end[0]}" cy="${end[1]}" r="3.5" fill="#C97A3E"/>`;
  };
  const matches = c => filter === 'all' || c.sex === filter;
  const deck = () => order.filter(i => !decided.has(i) && matches(NAMES[i]));
  const label = c => { const last = c.y[c.y.length - 1]; return `${c.n}, ${SEX[c.sex]}. ${c.intro} ניתן ל־${fmt(last)} תינוקות ב־2024, מגמה: ${TREND[c.trend][0]}.`; };

  const cardInner = (c, pos) => {
    const [bt, gt, b] = share(c), last = c.y[c.y.length - 1], [tw, ta] = TREND[c.trend];
    return `<div class="nd-row"><span class="nd-tag">${SEX[c.sex]}</span><span class="nd-pos">${esc(pos)}</span></div>
<div class="nd-name">${esc(c.niqqud)}</div>
<p class="nd-intro">${esc(c.intro)}</p>
${c.bible ? `<div class="nd-well nd-bible"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/></svg><div><span class="nd-label">מהתנ״ך</span><p>${esc(c.bible.text)}</p><span class="nd-ref">${esc(c.bible.ref)}</span></div></div>` : ''}
${c.people.length ? `<div class="nd-people"><span class="nd-label">אנשים ידועים בשם הזה</span>${c.people.slice(0, 2).map(p => `<div class="nd-person"><span class="nd-initial" aria-hidden="true">${esc(p.name.charAt(0))}</span><span><b>${esc(p.name)}</b> · ${esc(p.what)}</span></div>`).join('')}</div>` : ''}
<div class="nd-sex" role="img" aria-label="מאז 1949: בנים ${bt}, בנות ${gt}"><div aria-hidden="true"><span>בנים ${bt}</span><span>בנות ${gt}</span></div><div class="nd-bar" aria-hidden="true"><i style="width:${b.toFixed(1)}%"></i></div></div>
<div class="nd-tiles"><div class="nd-well nd-tile"><span class="nd-label">ב־2024</span><strong>${fmt(last)}</strong><span>תינוקות · ${c.band}</span></div><div class="nd-well nd-tile"><span class="nd-label">מגמה מאז 2000</span><svg viewBox="0 0 132 36" aria-hidden="true">${spark(c.y)}</svg><span class="nd-trend"><span aria-hidden="true">${ta}</span> ${tw}</span></div></div>`;
  };

  const renderList = () => {
    const loved = past.filter(i => decided.get(i) === 'love'), kept = past.filter(i => decided.get(i) === 'keep');
    const saved = [...loved, ...kept];
    countEl.textContent = saved.length; savedLink.setAttribute('aria-label', `השמות שלי: ${saved.length} נשמרו`);
    list.hidden = !saved.length; listEmpty.hidden = !!saved.length;
    list.innerHTML = saved.map(i => `<li>${esc(NAMES[i].n)}${decided.get(i) === 'love' ? `<small>${ICONS.heart}אהבתי מאוד</small>` : ''}</li>`).join('');
    return saved;
  };

  const render = (enter) => {
    const d = deck(), saved = renderList();
    undoBtn.disabled = !past.length;
    actBtns.forEach(b => { b.disabled = !d.length; });
    if (!d.length) {
      const all = decided.size === NAMES.length;
      stage.innerHTML = all
        ? `<div class="nd-empty nd-glass"><b>עברת על כל השמות.<br>בקרוב יתווספו עוד.</b>${saved.length ? `<p>השמות ששמרת:</p><ol>${saved.map(i => `<li>${esc(NAMES[i].n)}</li>`).join('')}</ol>` : '<p>לא נשמרו שמות הפעם.</p>'}<button type="button" class="nd-cta" data-restart>להתחיל מחדש</button><a class="nd-link" href="#waitlist">לקבל עדכון כשהאפליקציה יוצאת</a></div>`
        : `<div class="nd-empty nd-glass"><b>אין שמות שמתאימים לסינון הזה</b><button type="button" class="nd-cta" data-reset>איפוס סינון</button></div>`;
      return;
    }
    const total = NAMES.filter(matches).length, done = total - d.length;
    const backs = d.slice(1, 3).map((i, k) => `<div class="nd-back nd-soft${k === 0 ? ' n1' : ''}" aria-hidden="true">${esc(NAMES[i].n)}</div>`).reverse().join('');
    const c = NAMES[d[0]];
    stage.innerHTML = `${backs}<article class="nd-card nd-glass${enter ? ' enter' : ''}" aria-label="${esc(label(c))}">${cardInner(c, `שם ${done + 1} מתוך ${total}`)}<span class="nd-stamp keep" aria-hidden="true">שמירה</span><span class="nd-stamp skip" aria-hidden="true">דילוג</span><span class="nd-stamp love" aria-hidden="true">אהבתי מאוד</span></article>`;
    bindDrag(stage.querySelector('.nd-card'));
  };

  const say = t => { status.textContent = t; };
  const decide = async (kind, card = stage.querySelector('.nd-card')) => {
    const d = deck(); if (busy || !d.length || !card) return;
    busy = true; const i = d[0], name = NAMES[i].n;
    const from = card.style.transform || 'none';
    const to = kind === 'love' ? 'translateY(-120%) scale(.9)' : `translateX(${kind === 'keep' ? 130 : -130}%) rotate(${kind === 'keep' ? 18 : -18}deg)`;
    const frames = reduce.matches ? [{ opacity: 1, transform: from }, { opacity: 0, transform: from }] : [{ transform: from }, { transform: to, opacity: .4 }];
    if (kind === 'love' && !reduce.matches) card.style.setProperty('--love', 1);
    try { await card.animate(frames, { duration: reduce.matches ? 160 : 300, easing: 'ease-in', fill: 'forwards' }).finished; } catch { /* element replaced */ }
    decided.set(i, kind); past.push(i);
    say(kind === 'skip' ? `דילגת על ${name}` : kind === 'love' ? `${name} נשמר, ראשון ברשימה` : `${name} נשמר`);
    const hadFocus = root.contains(document.activeElement);
    busy = false; render(true);
    if (hadFocus && !deck().length) stage.querySelector('button')?.focus();
  };

  function bindDrag(card) {
    let s = null;
    const set = (dx, dy) => {
      card.style.transform = `translate(${dx}px,${dy * .15}px) rotate(${dx / 16}deg)`;
      card.style.setProperty('--keep', Math.max(0, Math.min(1, dx / 90)));
      card.style.setProperty('--skip', Math.max(0, Math.min(1, -dx / 90)));
    };
    const reset = () => {
      if (!s) return;
      const from = card.style.transform; s = null;
      card.style.transform = ''; card.style.setProperty('--keep', 0); card.style.setProperty('--skip', 0);
      if (from && !reduce.matches) card.animate([{ transform: from }, { transform: 'none' }], { duration: 220, easing: 'ease-out' });
    };
    card.addEventListener('pointerdown', e => { if (busy || e.button > 0) return; s = { x: e.clientX, y: e.clientY, t: performance.now(), on: false, dx: 0, dy: 0 }; });
    card.addEventListener('pointermove', e => {
      if (!s) return; s.dx = e.clientX - s.x; s.dy = e.clientY - s.y;
      if (!s.on) { if (Math.abs(s.dx) < 8 || Math.abs(s.dx) < Math.abs(s.dy)) { if (Math.abs(s.dy) > 12) s = null; return; } s.on = true; card.setPointerCapture(e.pointerId); }
      set(s.dx, s.dy);
    });
    const end = () => {
      if (!s) return; if (!s.on) { s = null; return; }
      const v = Math.abs(s.dx) / Math.max(1, performance.now() - s.t);
      if (Math.abs(s.dx) > 100 || (Math.abs(s.dx) > 40 && v > .6)) { const dx = s.dx; s = null; decide(dx > 0 ? 'keep' : 'skip', card); } else reset();
    };
    card.addEventListener('pointerup', end); card.addEventListener('pointercancel', reset);
  }

  actBtns.forEach(b => b.addEventListener('click', () => decide(b.dataset.act)));
  chips.forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.filter; chips.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    render(true); say(filter === 'all' ? 'מוצגים כל השמות' : `סינון: ${b.textContent}`);
  }));
  undoBtn.addEventListener('click', () => {
    if (busy || !past.length) return;
    const i = past.pop(); decided.delete(i);
    order.splice(order.indexOf(i), 1); order.unshift(i);
    if (!matches(NAMES[i])) { filter = 'all'; chips.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.filter === 'all'))); }
    say(`בוטל: ${NAMES[i].n}`); render(true);
  });
  bgBtn.addEventListener('click', () => {
    bg = (bg + 1) % BGS.length; root.dataset.bg = BGS[bg][0];
    bgBtn.setAttribute('aria-label', `החלפת רקע. עכשיו: ${BGS[bg][1]}`); say(`רקע: ${BGS[bg][1]}`);
  });
  stage.addEventListener('click', e => {
    if (e.target.closest('[data-reset]')) { chips[0].click(); chips[0].focus(); }
    if (e.target.closest('[data-restart]')) { decided.clear(); past.length = 0; say('מתחילים מחדש'); render(true); actBtns[0].focus(); }
  });
  BGS.slice(1, 3).forEach(([k]) => { const img = new Image(); img.src = `/landing/names-${k}.webp`; });
  // Phones: the demo opens full screen from a launch card. Back, Escape and the close button close it.
  const launch = document.querySelector('[data-nd-open]');
  let returnTo = null;
  const isFull = () => root.classList.contains('nd-full');
  const closeUI = () => {
    root.classList.remove('nd-full'); document.body.classList.remove('nd-open');
    requestAnimationFrame(() => {
      const t = returnTo && document.querySelector(returnTo); returnTo = null;
      if (t) t.scrollIntoView(); else launch?.focus({ preventScroll: true });
    });
  };
  const close = () => { if (history.state && history.state.nd) history.back(); else closeUI(); };
  launch?.addEventListener('click', () => {
    root.classList.add('nd-full'); document.body.classList.add('nd-open');
    history.pushState({ nd: 1 }, '');
    actBtns[0].focus({ preventScroll: true });
  });
  addEventListener('popstate', () => { if (isFull()) closeUI(); });
  q('[data-nd-close]').addEventListener('click', close);
  root.addEventListener('keydown', e => { if (e.key === 'Escape' && isFull()) close(); });
  root.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a && isFull()) { e.preventDefault(); returnTo = a.getAttribute('href'); close(); }
  });
  render(false);
}

export const namesScript = `(${demo.toString()
  .replace("'__BOOK__'", JSON.stringify(svg(ICON.bookmark, 14)))
  .replace("'__HEART__'", JSON.stringify(svg(ICON.heart, 14)))})(${JSON.stringify(NAMES).replace(/</g, '\\u003c')});`;
