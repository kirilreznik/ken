// Standalone public marketing document, intentionally outside the authenticated app shell.
// Visual language follows the Claude Design redesign of the app: Heebo, warm grey canvas,
// near-black ink, peach and clay accents, a photo hero with liquid-glass cards,
// and the lowercase "nest" wordmark whose n shelters a clay dot.
const BRAND = 'Nest'; // שם המותג: החלפה כאן מעדכנת את האתר כולו.
const VERSION = '2026-10-31';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ready = env => Boolean(env.WAITLIST_WEBHOOK_URL && env.CONTACT_EMAIL && env.OPERATOR_NAME);
const icon = (name) => { const paths = {
  calendar:'M8 2v4|M16 2v4|M3 10h18|M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z|M14 2v6h6|M8 13h8|M8 17h5',
  check:'m5 12 4 4L19 6',
  list:'M9 6h11|M9 12h11|M9 18h11|m3.5 6 1 1 2-2|m3.5 12 1 1 2-2|m3.5 18 1 1 2-2',
  question:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z|M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3|M12 17h.01',
  people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2|M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z|M22 21v-2a4 4 0 0 0-3-3.87|M16 3.13a4 4 0 0 1 0 7.75',
  lock:'M5 11h14v10H5Z|M8 11V7a4 4 0 0 1 8 0v4',
  home:'M3 10.5 12 3l9 7.5|M5 9v11h14V9',
  clock:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z|M12 6v6l4 2',
  nav:'M3 11 22 2l-9 19-2-8Z',
  arrow:'M19 12H5|m11 6-6 6 6 6',
  phone:'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z|M11 18h2',
  more:'M5 12h.01|M12 12h.01|M19 12h.01'};
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(paths[name]||paths.check).split('|').map(p=>`<path d="${p}"/>`).join('')}</svg>`; };

const WORDMARK = `<svg viewBox="14 1 148 56" role="img" aria-label="Nest"><g fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 50V30a14 14 0 0 1 28 0v20"/><path d="M59 33H89A15 17 0 1 0 85.49 43.93"/><path d="M126 21.5C122 16.5 103 15 103 24.5C103 33 127 32 127 41.5C127 51.5 108 52 103 45.5"/><path d="M148 6V42a8 8 0 0 0 8 8"/><path d="M140 20H158"/></g><circle cx="32" cy="43" r="6" fill="#C97A3E"/></svg>`;

const STYLE = `
@font-face{font-family:'Heebo';font-style:normal;font-weight:400 800;font-display:swap;src:url(/landing/heebo-hebrew.woff2) format('woff2');unicode-range:U+0307-0308,U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F}
@font-face{font-family:'Heebo';font-style:normal;font-weight:400 800;font-display:swap;src:url(/landing/heebo-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212,U+FEFF,U+FFFD}
:root{--bg:#F4F2F1;--surface:#FFFFFF;--ink:#1F1B1E;--ink-2:#4A4149;--muted:#6E655F;--faint:#B5ACA6;--line:#E6E1DE;--accent:#8A5225;--accent-2:#C97A3E;--accent-soft:#FFE2C9;--peach:#FFD9B8;--peach-soft:#FFEBDB;--radius-xl:30px;--radius-l:22px;--radius-m:16px;--shadow:0 18px 36px -18px rgba(31,27,30,.28);--shadow-s:0 2px 8px rgba(0,0,0,.06)}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:90px}body{margin:0;overflow-x:clip;background:var(--bg);color:var(--ink);font-family:'Heebo',system-ui,'Noto Sans Hebrew',Arial,sans-serif;font-size:17px;line-height:1.65}
a{color:inherit;text-decoration:none}button,input{font:inherit}svg{width:22px;height:22px;flex-shrink:0}p{margin:0 0 14px;text-wrap:pretty}
a:focus-visible,button:focus-visible,input:focus-visible,summary:focus-visible,[tabindex]:focus-visible{outline:3px solid var(--accent-2);outline-offset:4px;border-radius:8px}
html{scrollbar-color:var(--faint) var(--bg);accent-color:var(--accent-2)}::selection{background:var(--peach);color:var(--ink)}input{caret-color:var(--accent-2)}
.wrap{max-width:1200px;margin:auto;padding-inline:32px}
.skip{position:fixed;top:-100px;inset-inline-start:16px;z-index:30;background:var(--surface);padding:12px 16px;border-radius:12px}.skip:focus{top:12px}
header{position:sticky;top:0;z-index:20;background:rgba(244,242,241,.82);-webkit-backdrop-filter:blur(18px) saturate(160%);backdrop-filter:blur(18px) saturate(160%);border-bottom:1px solid rgba(31,27,30,.06)}
.nav{height:76px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.brand{display:flex;align-items:center;color:var(--ink);line-height:0}.brand svg{width:auto;height:34px}

.navlinks{display:flex;gap:28px;font-size:15px;font-weight:500;color:var(--ink-2)}.navlinks a{padding:10px 0}.navlinks a:hover{color:var(--ink)}
.button{display:inline-flex;justify-content:center;align-items:center;gap:10px;min-height:48px;background:var(--ink);color:#fff;padding:12px 24px;border-radius:999px;border:0;font-weight:700;font-size:16px;cursor:pointer;transition:transform .2s,background .2s}.button:hover{background:#3a3238;transform:translateY(-1px)}.button svg{width:18px;height:18px}
.button.small{min-height:44px;font-size:14px;padding:10px 18px}
.button.light{background:#fff;color:var(--ink)}.button.light:hover{background:#f7f3fb}
h1,h2,h3{margin:0;color:inherit;text-wrap:balance}h2{font-size:clamp(34px,4.6vw,58px);font-weight:800;line-height:1.08;letter-spacing:-.025em;margin:0 0 18px}
.lead{font-size:19px;line-height:1.75;color:var(--muted);max-width:520px}

/* hero: photo card + liquid glass */
.hero{padding-block:24px 0}
.hero-card{position:relative;border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow);background:#3b302a;isolation:isolate;min-height:640px;display:grid;grid-template-columns:1.1fr .9fr;align-items:end;gap:40px;padding:56px}
.hero-card:before{content:'';position:absolute;inset:0;background:linear-gradient(270deg,rgba(20,14,10,.72) 0%,rgba(20,14,10,.45) 38%,rgba(20,14,10,.08) 70%,rgba(20,14,10,.18) 100%)}
.hero-card:after{content:'';position:absolute;inset:0;z-index:-1;background:url(/landing/hero.webp) center 25%/cover no-repeat}
.hero-copy{position:relative;color:#fff;align-self:center}
.hero h1{font-size:clamp(42px,5.6vw,80px);font-weight:800;line-height:1.04;letter-spacing:-.03em;margin:0 0 22px;text-shadow:0 2px 18px rgba(0,0,0,.25)}
.hero h1 .ln{display:block}.hero h1 .accent{color:var(--peach)}
.hero .lead{color:rgba(255,255,255,.88);max-width:500px}
.hero-actions{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-top:28px}
.ghost{display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:12px 22px;border-radius:999px;color:#fff;font-weight:700;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.4);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px)}.ghost:hover{background:rgba(255,255,255,.22)}
.stores{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px;font-size:13px;color:rgba(255,255,255,.85)}
.stores span{display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.22)}.stores svg{width:15px;height:15px}
.glass{position:relative;background:rgba(255,255,255,.16);-webkit-backdrop-filter:blur(28px) saturate(180%);backdrop-filter:blur(28px) saturate(180%);border:1px solid rgba(255,255,255,.4);border-radius:var(--radius-l);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 14px 30px -16px rgba(0,0,0,.4);color:#fff}
.hero-stack{position:relative;display:grid;gap:14px;max-width:380px;justify-self:end;width:100%}
.glass{font-variant-numeric:tabular-nums}
.glass.week{padding:20px 22px}.glass.week small{font-size:13px;color:rgba(255,255,255,.85);font-weight:600}.glass.week b{display:block;font-size:28px;font-weight:800;line-height:1.25}.glass.week span{font-size:12.5px;color:rgba(255,255,255,.82)}
.bar{display:block;height:6px;border-radius:9px;background:rgba(255,255,255,.22);margin:12px 0 9px;overflow:hidden}.bar i{display:block;height:100%;width:var(--p);background:var(--peach);border-radius:inherit;transform-origin:right}
.glass.appt{padding:18px}
.appt-row{display:flex;align-items:center;gap:14px}
.appt-ico{width:48px;height:48px;border-radius:16px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);display:grid;place-items:center}
.appt-row b{display:block;font-size:15px;font-weight:800}.appt-row span{font-size:12.5px;color:rgba(255,255,255,.82)}
.appt-when{margin-inline-start:auto;white-space:nowrap;display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:rgba(255,255,255,.85)}.appt-when svg{width:14px;height:14px}
.appt-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid rgba(255,255,255,.22);margin-top:14px;padding-top:14px;font-size:12.5px}
.appt-foot b{display:block;font-size:13px}
.pill{display:inline-flex;align-items:center;gap:6px;background:var(--ink);color:#fff;border-radius:999px;padding:9px 16px;font-size:13px;font-weight:700}.pill svg{width:14px;height:14px}
.demo{position:relative;font-size:11.5px;color:rgba(255,255,255,.75)}
.below-note{margin:10px 8px 0;font-size:12px;color:var(--muted)}

/* trust line: quiet, so the sections after it can peak */
.strip{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px 28px;margin-top:8px;padding:22px 8px;border-bottom:1px solid var(--line)}
.strip div{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:600;color:var(--ink-2)}
.strip .ico{color:var(--accent);display:grid}.strip .ico svg{width:20px;height:20px}

/* sections */
.section{padding-block:120px 0}
.section-head{display:flex;justify-content:space-between;align-items:end;gap:32px;margin-bottom:44px}.section-head h2{margin:0}.section-head p{max-width:400px;color:var(--muted);font-size:16px;margin:0}

/* features: sticky statement + editorial rows */
.split{display:grid;grid-template-columns:5fr 7fr;gap:24px 80px;align-items:start}
.split-head{position:sticky;top:116px}.split-head p{color:var(--muted);max-width:400px}
.features{display:grid;border-top:1px solid var(--line)}
.feature{display:grid;grid-template-columns:56px 1fr;gap:6px 22px;padding:32px 0;border-bottom:1px solid var(--line)}
.feature .ico{grid-row:span 2;width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent)}
.feature h3{font-size:clamp(22px,2.1vw,27px);font-weight:800;line-height:1.25;letter-spacing:-.01em;align-self:center}.feature p{color:var(--muted);font-size:16px;margin:0;max-width:52ch}
.fineprint{font-size:12.5px;color:var(--muted);margin-top:18px}.split .fineprint{grid-column:2}

/* peek: the page's peak. Oversized heading, staggered devices */
#peek .section-head{display:block;text-align:center;margin-bottom:56px}#peek .section-head p{margin:0 auto;max-width:none}
#peek h2{font-size:clamp(44px,7vw,96px);letter-spacing:-.035em;line-height:1;margin-bottom:18px}
.peek{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;align-items:start}
.peek figure{margin:0}.peek figure:nth-child(2){margin-top:88px}.peek figure:nth-child(3){margin-top:32px}.peek figure:nth-child(4){margin-top:120px}
.device{background:var(--ink);padding:7px;border-radius:40px;box-shadow:0 30px 60px -30px rgba(31,27,30,.45);max-width:300px;margin:auto}.device img{display:block;width:100%;height:auto;border-radius:33px}.peek figcaption{text-align:center;margin-top:14px;font-size:15px;font-weight:700}.peek figcaption span{display:block;font-size:13px;font-weight:400;color:var(--muted)}
.peek-note{text-align:center;font-size:12.5px;color:var(--muted);margin-top:22px}

/* who it's for */
.who{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;background:var(--surface);border-radius:var(--radius-xl);padding:56px;box-shadow:var(--shadow-s)}
.who p{color:var(--muted)}
.modes{display:grid;gap:12px}
.modes{gap:0}
.mode{display:flex;gap:18px;align-items:center;padding:20px 0;border-bottom:1px solid var(--line)}.mode:last-child{border:0}
.mode .ico{width:48px;height:48px;border-radius:16px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center}
.mode b{display:block;font-size:19px;font-weight:800}.mode span{font-size:14.5px;color:var(--muted)}

/* steps: one track, the wordmark's clay dot marks each stop */
.steps{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:40px;counter-reset:s}
.steps:before{content:'';position:absolute;top:0;inset-inline:0;height:2px;background:var(--ink);transform-origin:right}
.step{position:relative;padding-top:32px}
.step:after{content:'';position:absolute;top:-6px;inset-inline-start:0;width:14px;height:14px;border-radius:50%;background:var(--accent-2);box-shadow:0 0 0 5px var(--bg)}
.step:before{counter-increment:s;content:counter(s);display:block;color:var(--accent);font-size:clamp(72px,8vw,112px);font-weight:800;line-height:.85;letter-spacing:-.04em;margin-bottom:22px;font-variant-numeric:tabular-nums}
.step b{display:block;font-size:22px;font-weight:800;line-height:1.3;margin-bottom:8px}.step span{color:var(--muted);font-size:16px}

/* faq */
.faq{display:grid;grid-template-columns:.8fr 1.2fr;gap:64px}
.faq-intro p{color:var(--muted)}
.faq-list{background:var(--surface);border-radius:var(--radius-l);padding:8px 28px;box-shadow:var(--shadow-s)}
details{border-bottom:1px solid var(--line)}details:last-child{border:0}
summary{cursor:pointer;list-style:none;min-height:44px;padding:20px 0;font-weight:700;font-size:16.5px;display:flex;justify-content:space-between;align-items:center;gap:20px}summary::-webkit-details-marker{display:none}
summary:after{content:'+';flex-shrink:0;width:30px;height:30px;border-radius:50%;background:var(--bg);display:grid;place-items:center;font-size:20px;font-weight:400;line-height:1}details[open] summary:after{content:'−'}
details p{color:var(--muted);font-size:15.5px;padding-bottom:12px}

/* signup */
.signup{position:relative;overflow:hidden;background:var(--ink);color:#fff;border-radius:var(--radius-xl);padding:56px;display:grid;grid-template-columns:1fr 1fr;gap:56px}
.signup:before{content:'';position:absolute;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(201,122,62,.42),rgba(201,122,62,0) 70%);top:-220px;inset-inline-end:-160px;pointer-events:none}
.signup>*{position:relative}
.signup .intro{color:rgba(255,255,255,.78)}
.signup form{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:var(--radius-l);padding:28px}
.email-label{display:block;font-size:14px;font-weight:600;margin-bottom:8px}
input[type=email]{width:100%;min-height:50px;background:#fff;border:1px solid transparent;border-radius:14px;padding:12px 16px;direction:ltr;text-align:right;color:var(--ink)}input[type=email]:disabled{background:#d9d4d1}
.consent{display:flex;align-items:flex-start;gap:12px;font-size:13px;line-height:1.75;margin:16px 0;color:rgba(255,255,255,.85)}
input[type=checkbox]{margin:3px 0 0;accent-color:var(--accent-2);width:20px;height:20px;flex-shrink:0}
.privacy-link{color:inherit;text-decoration:underline;text-underline-offset:3px;background:none;border:0;padding:0;cursor:pointer;font-size:inherit;min-height:24px}
.signup .button{width:100%;background:#fff;color:var(--ink)}.signup .button:hover{background:var(--accent-soft)}.signup .button:disabled{opacity:.6;cursor:default;transform:none}
.micro{font-size:12.5px;color:rgba(255,255,255,.7);margin-top:12px}
.notice{padding:10px 14px;margin-bottom:16px;border-radius:12px;background:rgba(255,217,184,.12);border:1px solid rgba(255,217,184,.35);font-size:13px;color:var(--peach)}
.status{font-size:14px;margin-top:12px}
.honeypot{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}

footer{padding-block:40px;margin-top:56px;font-size:13px;color:var(--muted);display:flex;align-items:center;justify-content:space-between;gap:20px;border-top:1px solid var(--line)}
footer .brand svg{height:26px}
dialog{background:var(--surface);color:var(--ink);border:0;border-radius:24px;max-width:650px;width:calc(100% - 32px);max-height:85vh;padding:32px;line-height:1.8}
dialog::backdrop{background:rgba(31,27,30,.55);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
dialog h2{font-size:26px}dialog h3{font-size:18px;margin-top:18px}dialog p{font-size:14.5px;color:var(--ink-2)}
body:has(dialog[open]){overflow:hidden}

@media(max-width:1020px){
.hero-card{grid-template-columns:1fr;min-height:0;padding:40px;gap:32px}.hero-card:before{background:linear-gradient(180deg,rgba(20,14,10,.66) 0%,rgba(20,14,10,.35) 45%,rgba(20,14,10,.25) 70%,rgba(20,14,10,.5) 100%)}
.hero-stack{justify-self:stretch;max-width:420px}
.strip{grid-template-columns:repeat(2,1fr)}
.peek{grid-template-columns:1fr 1fr}.peek figure:nth-child(n){margin-top:0}.peek figure:nth-child(even){margin-top:72px}
.who,.faq,.signup,.split{grid-template-columns:1fr;gap:28px}.split-head{position:static}.split .fineprint{grid-column:auto}
}
@media(max-width:740px){
.wrap{padding-inline:16px}.nav{height:64px}.navlinks{display:none}.brand svg{height:28px}
.hero{padding-top:12px}.hero-card{padding:28px 20px 20px;border-radius:26px}.hero h1{font-size:44px;letter-spacing:-1px}.hero .lead{font-size:17px}
.strip{display:grid;grid-template-columns:1fr 1fr;gap:14px 12px;padding:20px 4px}.strip div{font-size:14px;gap:8px}
.section{padding-block:80px 0}.section-head{display:block}.section-head h2{margin-bottom:12px}
.feature{padding:24px 0;grid-template-columns:46px 1fr;gap:6px 16px}.feature .ico{width:46px;height:46px;border-radius:14px}
.steps{grid-template-columns:1fr;gap:0;padding-inline-start:30px}.steps:before{inset:0 auto;inset-inline-start:0;width:2px;height:auto;transform-origin:top}.step{padding:0 0 36px}.step:last-child{padding-bottom:0}.step:after{top:6px;inset-inline-start:-36px}.step:before{font-size:64px;margin-bottom:12px}
#peek .section-head{text-align:start;margin-bottom:28px}#peek .section-head p{margin:0}
.peek{display:flex;margin-inline:-16px;padding:4px 16px 20px;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:16px;scrollbar-width:none;overscroll-behavior-x:contain}.peek::-webkit-scrollbar{display:none}
.peek figure{flex:0 0 74%;scroll-snap-align:start}.peek figure:nth-child(n){margin-top:0}
.who,.signup{padding:28px 20px;border-radius:26px}.faq-list{padding:4px 18px}
footer{flex-direction:column;align-items:flex-start}
}
/* motion. Hero: one arrival sequence (photo settles, headline lines rise from a mask, copy follows,
   glass cards frost in, week bar fills while the week counts up). Scroll: sections rise in once, staggered
   within a group; the steps track draws; the screens slide to rest from above and below at different heights.
   Hidden states exist only under [data-reveal]/[data-stage], which the script adds, so no-JS shows everything. */
@media(prefers-reduced-motion:no-preference){
.hero-card:after{animation:photo 2.6s cubic-bezier(.16,1,.3,1) both}
.hero h1 .ln{overflow:hidden;padding-block:.14em .18em;margin-block:-.14em -.18em}
.hero h1 .ln>span{display:block;animation:line 1s cubic-bezier(.16,1,.3,1) both;animation-delay:calc(.15s + var(--i,0)*.1s)}
.hero .lead,.hero-actions,.stores{animation:rise .9s cubic-bezier(.16,1,.3,1) both}.hero .lead{animation-delay:.5s}.hero-actions{animation-delay:.6s}.stores{animation-delay:.7s}
.hero-stack .glass,.hero-stack .demo{animation:settle 1s .65s cubic-bezier(.16,1,.3,1) both}.hero-stack .appt{animation-delay:.8s}.hero-stack .demo{animation-delay:.95s}
.bar i{animation:fill 1.6s 1s cubic-bezier(.16,1,.3,1) both}
[data-reveal]{transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1);transition-delay:calc(var(--i,0)*90ms)}
[data-reveal]:not(.in){opacity:0;transform:translateY(36px)}
[data-stage].steps:before{transition:transform 1.4s .1s cubic-bezier(.16,1,.3,1)}[data-stage].steps:not(.in):before{transform:scaleX(0)}
[data-stage].peek figure{transition:opacity .7s cubic-bezier(.16,1,.3,1),transform 1.4s cubic-bezier(.16,1,.3,1);transition-delay:calc(var(--i,0)*120ms)}
[data-stage].peek:not(.in) figure{opacity:0;transform:translateY(220px)}
[data-stage].peek:not(.in) figure:nth-child(even){transform:translateY(-220px)}
@media(max-width:740px){
[data-stage].steps:not(.in):before{transform:scaleY(0)}
[data-stage].peek:not(.in) figure,[data-stage].peek:not(.in) figure:nth-child(even){transform:translateX(-80px)}
}
@keyframes photo{from{transform:scale(1.1)}}
@keyframes line{from{transform:translateY(110%)}}
@keyframes rise{from{opacity:0;transform:translateY(18px)}}
@keyframes settle{from{opacity:0;transform:translateY(26px) scale(.97);-webkit-backdrop-filter:blur(0);backdrop-filter:blur(0)}}
@keyframes fill{from{transform:scaleX(0)}}
}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
`;

function page(env={}) { const enabled=ready(env); return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#F4F2F1"><link rel="icon" href="/landing/nest-mark.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/landing/apple-touch-icon.png"><meta name="description" content="${BRAND}: אפליקציה בעברית לניהול ההריון. תורים, בדיקות, משימות, שאלות ומסמכים במקום אחד, לבד או עם מי שבוחרים לשתף. בקרוב ב־App Store וב־Google Play."><title>${BRAND} | כל ההריון במקום אחד</title><link rel="preload" href="/landing/heebo-hebrew.woff2" as="font" type="font/woff2" crossorigin><style>${STYLE}</style></head><body>
<a class="skip" href="#main">דילוג לתוכן</a>
<header><nav class="wrap nav" aria-label="ניווט ראשי"><a href="#main" class="brand" aria-label="${BRAND}, לראש הדף">${WORDMARK}</a><div class="navlinks"><a href="#features">מה יש באפליקציה</a><a href="#peek">הצצה למסכים</a><a href="#who">למי זה מתאים</a><a href="#faq">שאלות ותשובות</a></div><a href="#waitlist" class="button small">עדכון על ההשקה</a></nav></header>
<main id="main"><div class="wrap">

<section class="hero" aria-labelledby="hero-title"><div class="hero-card">
<div class="hero-copy"><h1 id="hero-title"><span class="ln" style="--i:0"><span>כל ההריון </span></span><span class="ln" style="--i:1"><span>במקום אחד. </span></span><span class="ln accent" style="--i:2"><span>קצת יותר שקט.</span></span></h1><p class="lead">תורים, בדיקות, משימות, שאלות לרופא/ה ומסמכים, מסודרים לפי שבוע ההריון. בעברית, לבד או עם מי שבוחרים לשתף.</p><div class="hero-actions"><a class="button light" href="#waitlist">לקבל עדכון על ההשקה ${icon('arrow')}</a><a class="ghost" href="#peek">להציץ במסכים</a></div><div class="stores" aria-label="פלטפורמות"><span>${icon('phone')}בקרוב ב־App Store</span><span>${icon('phone')}בקרוב ב־Google Play</span><span>${icon('lock')}בלי פרסומות בתוך האפליקציה</span></div></div>
<div class="hero-stack" role="img" aria-label="הדמיה עם נתונים מומצאים: שבוע 24 להריון, ותור קרוב לאולטרסאונד בעוד 5 ימים">
<div class="glass week" aria-hidden="true"><small>שלום, נוי</small><b>שבוע 24 להריון</b><i class="bar"><i style="--p:60%"></i></i><span>תאריך לידה משוער: 14 בפברואר · 60% מהדרך</span></div>
<div class="glass appt" aria-hidden="true"><div class="appt-row"><span class="appt-ico">${icon('calendar')}</span><div><b>התור הקרוב</b><span>אולטרסאונד · מרפאה לדוגמה</span></div><span class="appt-when">${icon('clock')}בעוד 5 ימים</span></div><div class="appt-foot"><div><span>יום רביעי · 10:30</span><b>רח׳ הדוגמה 14</b></div><span class="pill">${icon('nav')}ניווט</span></div></div>
<div class="demo">הדמיה בלבד · כל השמות והנתונים מומצאים</div>
</div>
</div></section>

<div class="strip"><div><span class="ico">${icon('home')}</span>בעברית, מההתחלה</div><div><span class="ico">${icon('calendar')}</span>מסודר לפי שבוע ההריון</div><div><span class="ico">${icon('people')}</span>שיתוף רק אם רוצים</div><div><span class="ico">${icon('lock')}</span>המידע נשאר שלך</div></div>

<section class="section split" id="features" aria-labelledby="features-title"><div class="split-head"><h2 id="features-title">כל מה שסביב ההריון,<br>במבט אחד.</h2><p>בלי לדלג בין פתקים, צילומי מסך, קבוצות וואטסאפ ויומנים. ${BRAND} מרכזת את הניהול השוטף של ההריון.</p></div>
<div class="features">
<article class="feature"><span class="ico">${icon('calendar')}</span><h3>תוכנית מעקב ותורים</h3><p>תוכנית המעקב שקיבלת מהצוות המטפל, לפי שבועות. אפשר לראות מה כבר נקבע, מה עוד צריך לקבוע ומתי מגיע התור הבא.</p></article>
<article class="feature"><span class="ico">${icon('list')}</span><h3>משימות שלא נשכחות</h3><p>רשימת משימות לכל שלב, עם תאריכי יעד. כשמשתפים, רואים מי לקח על עצמו מה.</p></article>
<article class="feature"><span class="ico">${icon('question')}</span><h3>שאלות לרופא/ה</h3><p>רושמים שאלה ברגע שהיא עולה, ובתור עצמו כל השאלות הפתוחות מחכות במקום אחד.</p></article>
<article class="feature"><span class="ico">${icon('file')}</span><h3>מסמכים בהישג יד</h3><p>הפניות, תוצאות וסיכומים בתיקייה אחת, עם חיפוש לפי שם או שבוע. כדי שמה שצריך לתור לא יישאר אי שם בגלריה.</p></article>
</div>
<p class="fineprint">${BRAND} לא נותנת ייעוץ רפואי ולא מחליפה את הצוות המטפל. האפליקציה לקראת השקה, והתכונות עשויות להשתנות.</p></section>

<section class="section" id="peek" aria-labelledby="peek-title"><div class="section-head"><h2 id="peek-title">ככה זה נראה.</h2><p>ארבעה מסכים מתוך העיצוב של האפליקציה, עם נתונים לדוגמה.</p></div>
<div class="peek" role="region" aria-label="מסכי האפליקציה" tabindex="0">
<figure><div class="device"><img src="/landing/screen-home.webp" width="402" height="874" loading="lazy" alt="מסך הבית של Nest עם נתונים לדוגמה: שבוע 24 להריון, התור הקרוב לאולטרסאונד בעוד 5 ימים, ופעולות מהירות למשימות, שאלות, תורים ומסמכים"></div><figcaption>מסך הבית<span>השבוע, התור הבא ופעולות מהירות</span></figcaption></figure>
<figure><div class="device"><img src="/landing/screen-plan.webp" width="402" height="874" loading="lazy" alt="מסך תוכנית המעקב של Nest עם נתונים לדוגמה: חלון קביעת תור שנסגר בקרוב, וסיכום של בדיקות שדורשות קביעה, קרובות והושלמו"></div><figcaption>תוכנית המעקב<span>מה נקבע ומה עוד צריך לקבוע</span></figcaption></figure>
<figure><div class="device"><img src="/landing/screen-tasks.webp" width="402" height="874" loading="lazy" alt="מסך המשימות של Nest עם נתונים לדוגמה: משימות פתוחות, משימות שהושלמו, וסינון לפי נושא"></div><figcaption>משימות<span>לבד או מתחלקים, כל אחד יודע מה עליו</span></figcaption></figure>
<figure><div class="device"><img src="/landing/screen-week.webp" width="402" height="874" loading="lazy" alt="חלון עדכון שבועי ב־Nest עם נתונים לדוגמה: מה מתפתח השבוע, בשבוע 24 מתוך 40"></div><figcaption>עדכון שבועי<span>מה קורה השבוע, בקצרה</span></figcaption></figure>
</div><p class="peek-note">הדמיה בלבד · כל השמות, התאריכים והתכנים מומצאים · העיצוב עשוי להשתנות</p></section>

<section class="section" id="who" aria-labelledby="who-title"><div class="who"><div><h2 id="who-title">למי שמנהל את ההריון.<br>בכל הרכב.</h2><p>${BRAND} נבנתה למי שמחזיק את כל הפרטים: ההורה בהריון, בן/בת הזוג, או שניכם יחד. אפשר להשתמש בה לבד מההתחלה ועד הסוף, ואפשר להזמין מישהו נוסף בכל שלב.</p></div>
<div class="modes"><div class="mode"><span class="ico">${icon('home')}</span><div><b>לבד</b><span>הכול מסודר אצלך, בלי צורך בשותף.</span></div></div><div class="mode"><span class="ico">${icon('people')}</span><div><b>ביחד</b><span>שני חשבונות, תמונה אחת. כל אחד רואה ומעדכן.</span></div></div><div class="mode"><span class="ico">${icon('lock')}</span><div><b>שיתוף שבוחרים</b><span>בן/בת זוג, אמא, חבר/ה או דולה. רק מי שהוזמן.</span></div></div></div></div></section>

<section class="section" aria-labelledby="steps-title"><div class="section-head"><h2 id="steps-title">שלושה צעדים, וזה מסודר.</h2></div>
<div class="steps"><div class="step"><b>מזינים תאריך לידה משוער</b><span>האפליקציה מחשבת את השבוע ומסדרת הכול לפיו.</span></div><div class="step"><b>מוסיפים את תוכנית המעקב</b><span>מצלמים את התוכנית שקיבלת, או מתחילים מתוכנית בסיסית ומעדכנים.</span></div><div class="step"><b>מזמינים מי שרוצים</b><span>אם רוצים. אפשר גם להמשיך לבד.</span></div></div></section>

<section class="section faq" id="faq" aria-labelledby="faq-title"><div class="faq-intro"><h2 id="faq-title">שאלות ותשובות</h2><p>כמה תשובות קצרות, בלי אותיות קטנות.</p></div>
<div class="faq-list"><details open><summary>אפשר כבר להוריד את האפליקציה?</summary><p>עדיין לא. ${BRAND} בדרך ל־App Store ול־Google Play, ואין עדיין תאריך השקה סופי. אפשר להשאיר אימייל ולקבל עדכון כשהיא זמינה.</p></details><details><summary>למי היא מיועדת?</summary><p>לכל מי שמנהל הריון בישראל: ההורה בהריון, בן/בת הזוג, או שניכם יחד. אין צורך בשותף, והשיתוף תמיד אופציונלי.</p></details><details><summary>זה עולה כסף?</summary><p>ההרשמה לעדכונים חינמית ולא מחייבת לרכוש דבר. מודל התמחור של האפליקציה עוד לא נקבע.</p></details><details><summary>איזה מידע צריך להשאיר כאן?</summary><p>רק כתובת אימייל והסכמה לקבל עדכון על ההשקה. בטופס הזה אין שאלות על ההריון ואין מקום למידע רפואי.</p></details><details><summary>האפליקציה נותנת ייעוץ רפואי?</summary><p>לא. ${BRAND} נועדה לארגון ולניהול של מידע אישי. היא לא מחליפה ייעוץ, אבחון או מעקב של הצוות המטפל, ואינה קשורה לקופת חולים.</p></details><details><summary>איך מפסיקים לקבל עדכונים?</summary><p>בכל הודעת עדכון יהיה קישור להסרה. אפשר גם לבקש הסרה דרך פרטי הקשר במדיניות הפרטיות.</p></details></div></section>

<section class="section" id="waitlist" aria-labelledby="waitlist-title"><div class="signup"><div><h2 id="waitlist-title">לקבל עדכון<br>כש־${BRAND} יוצאת.</h2><p class="intro">משאירים אימייל, ונעדכן כשאפשר יהיה להצטרף לבטא או להוריד את האפליקציה.</p><p class="micro">רק עדכונים על ההשקה והבטא. בלי מידע רפואי.</p></div>
<form id="signup-form">${enabled?'':`<div class="notice" role="status">ההרשמה תיפתח בקרוב. הטופס כרגע בתצוגה מקדימה ולא אוסף כתובות אימייל.</div>`}<label class="email-label" for="email">כתובת אימייל</label><input id="email" name="email" type="email" maxlength="254" autocomplete="email" placeholder="you@example.com" required ${enabled?'':'disabled'}><label class="honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><label class="consent"><input name="consent" type="checkbox" required ${enabled?'':'disabled'}><span>אני מאשר/ת לקבל באימייל עדכונים על ההשקה והבטא של ${BRAND}. אפשר לבטל את ההסכמה בכל עת. קראתי את <button type="button" class="privacy-link" data-privacy>מדיניות הפרטיות</button>.</span></label><button class="button" type="submit" ${enabled?'':'disabled'}>לקבל עדכון על ההשקה ${icon('arrow')}</button><div id="form-status" class="status" role="status" aria-live="polite"></div></form></div></section>

</div></main>
<footer class="wrap"><span class="brand">${WORDMARK}</span><span>כל ההריון במקום אחד · בקרוב ב־App Store וב־Google Play</span><button class="privacy-link" data-privacy>מדיניות פרטיות</button></footer>
<dialog id="privacy" aria-labelledby="privacy-title"><h2 id="privacy-title">מדיניות פרטיות: רשימת העדכונים</h2><p>עודכן: 31.10.2026 · גרסה ${VERSION}</p>${enabled?`<p>מפעיל הפרויקט: ${esc(env.OPERATOR_NAME)}. לפניות, ביטול הסכמה או בקשת מחיקה: <a href="mailto:${esc(env.CONTACT_EMAIL)}">${esc(env.CONTACT_EMAIL)}</a>.</p>`:'<p><strong>זו גרסת תצוגה מקדימה. איסוף האימיילים מושבת עד להגדרת פרטי המפעיל, כתובת לפניות ושירות הרשמה.</strong></p>'}<h3>מה נאסף ולשם מה?</h3><p>כשההרשמה פעילה, נשלחים כתובת האימייל, אישור ההסכמה, מועד ההרשמה וגרסת נוסח ההסכמה. הם משמשים לניהול רשימת העדכונים ולשליחת עדכונים על ההשקה והבטא בלבד. אין בטופס שדות למידע רפואי ואין חובה להירשם.</p><h3>אחסון ושיתוף</h3><p>פרטי ההרשמה מועברים לשירות הרשימה שהמפעיל מגדיר לצורך ניהול הרשימה ומשלוח העדכונים. הם אינם מוצגים באתר. האתר אינו משתמש בכלי פרסום או ניתוח תנועה, אינו טוען משאבים מצד שלישי ואינו שומר את האימייל בדפדפן. ספק האירוח עשוי לעבד נתוני חיבור טכניים לצורך תפעול ואבטחה.</p><h3>בחירה, הסרה ומחיקה</h3><p>אפשר לבטל הסכמה ולבקש מחיקה באמצעות כתובת הקשר לעיל. המידע נשמר רק כל עוד הוא נחוץ למטרת העדכונים, ומוסר עם סיום הרשימה או בקשת מחיקה. בכל עדכון תינתן דרך להסרה.</p><h3>הפרדה ממידע רפואי</h3><p>מדיניות זו מתייחסת לדף הנחיתה ולרשימת העדכונים בלבד. לפני שימוש באפליקציה עצמה תפורסם מדיניות המתאימה למידע וליכולות שלה. אין לשלוח מידע רפואי דרך טופס זה.</p><form method="dialog"><button class="button">סגירה</button></form></dialog><script>
(()=>{const calm=!matchMedia('(prefers-reduced-motion: no-preference)').matches;if(calm||!('IntersectionObserver' in window))return;
const stage=el=>el.setAttribute('data-stage','');
document.querySelectorAll('.section-head,.split-head,.feature,.split .fineprint,.who,.step,.faq-intro,.faq-list,.signup,.peek-note').forEach(el=>{el.setAttribute('data-reveal','');const group=[...el.parentElement.children].filter(c=>c.matches(el.className.split(' ').map(c=>'.'+c).join('')));el.style.setProperty('--i',Math.max(0,group.indexOf(el)));});
document.querySelectorAll('.steps,.peek').forEach(stage);document.querySelectorAll('.peek figure').forEach((f,i)=>f.style.setProperty('--i',i));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -10% 0px',threshold:.12});
document.querySelectorAll('[data-reveal],[data-stage]').forEach(el=>io.observe(el));
const wk=document.querySelector('.glass.week b');if(wk){const n=24,t0=performance.now()+1000,d=1600,set=v=>wk.textContent='שבוע '+v+' להריון';set(1);const tick=t=>{const p=Math.min(1,Math.max(0,(t-t0)/d));set(Math.max(1,Math.round(n*(1-Math.pow(1-p,4)))));if(p<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);}
})();
const modal=document.querySelector('#privacy');document.querySelectorAll('[data-privacy]').forEach(b=>b.addEventListener('click',()=>modal.showModal()));modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
const form=document.querySelector('#signup-form');form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const status=document.querySelector('#form-status'),button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='שולחים את הבקשה…';try{const fields=new FormData(form);const response=await fetch('/api/pregnancy-waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:fields.get('email'),consent:fields.get('consent')==='on',website:fields.get('website')})});if(!response.ok)throw Error();status.textContent='ההרשמה נקלטה. נעדכן באימייל כשהבטא או האפליקציה יהיו זמינות.';form.reset();}catch{status.textContent='לא הצלחנו להשלים את ההרשמה. אפשר לנסות שוב בעוד כמה רגעים.';}finally{button.disabled=false;}});
</script></body></html>`; }
export default {async fetch(request,env={}) {const url=new URL(request.url);const headers={'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"};
if(url.pathname==='/api/pregnancy-waitlist') {const json=(status,data)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});if(request.method!=='POST')return json(405,{error:'method'});if(request.headers.get('origin')!==url.origin)return json(403,{error:'origin'});if(!ready(env))return json(503,{error:'not_configured'});if(!request.headers.get('content-type')?.startsWith('application/json'))return json(415,{error:'content_type'});try{const raw=await request.text();if(raw.length>2048)return json(413,{error:'too_large'});const b=JSON.parse(raw);if(Object.keys(b).some(k=>!['email','consent','website'].includes(k)))return json(400,{error:'fields'});if(typeof b.email!=='string'||b.email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(b.email)||b.consent!==true||b.website)return json(400,{error:'invalid'});const target=new URL(env.WAITLIST_WEBHOOK_URL);if(target.protocol!=='https:')return json(503,{error:'configuration'});const res=await fetch(target,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',...(env.WAITLIST_WEBHOOK_TOKEN?{Authorization:'Bearer '+env.WAITLIST_WEBHOOK_TOKEN}:{})},body:JSON.stringify({email:b.email.trim().toLowerCase(),consent:true,consent_text:'עדכונים על ההשקה והבטא של '+BRAND,consent_version:VERSION,created_at:new Date().toISOString()}),signal:AbortSignal.timeout(8000)});if(!res.ok)return json(502,{error:'upstream'});return json(200,{ok:true});}catch{return json(502,{error:'unavailable'});}}
if(url.pathname!=='/pregnancy')return new Response('Not found',{status:404});if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});return new Response(request.method==='HEAD'?null:page(env),{headers});}};
