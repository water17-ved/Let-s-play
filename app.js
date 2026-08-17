/* ============================================================
   JEE Battle Arena — app.js
   Full game logic: boss battles, tasks, drills, leaderboard,
   shop, journal, trial quiz — Firebase online + localStorage offline
   ============================================================ */

'use strict';

// ── Firebase Config ─────────────────────────────────────────
const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyAf7gaZu52OpJXRZoOFV-RBsw-EKdW7lqQ",
    authDomain:        "lets-85076.firebaseapp.com",
    databaseURL:       "https://lets-85076-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:         "lets-85076",
    storageBucket:     "lets-85076.firebasestorage.app",
    messagingSenderId: "183210284372",
    appId:             "1:183210284372:web:a1dced56c89689e6b464c1",
    measurementId:     "G-K6DWYFLR9K"
};

let db = null;
let firebaseReady = false;

try {
    if (typeof firebase !== 'undefined' && FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(FIREBASE_CONFIG);
        db = firebase.firestore();
        firebaseReady = true;
        console.log("✅ Firebase connected");
    } else {
        console.warn("⚠️ Firebase not configured — using localStorage only");
    }
} catch(e) {
    console.warn("⚠️ Firebase init failed:", e.message);
}

// ── Default Boss Config ─────────────────────────────────────
const DEFAULT_BOSS = {
    bossName: "IRON COLOSSUS",
    bossIcon: "fa-skull",
    specialChallenge: "Defeat the Iron Colossus by completing all daily tasks and proving your mastery in the Final Slay Trial!",
    basicTasks: [
        { id: "t1", category: "Study Session",   text: "Complete a 2-hour focused Maths study block",      xp: 30, done: false },
        { id: "t2", category: "Problem Solving", text: "Solve 20 JEE-level Physics problems",               xp: 25, done: false },
        { id: "t3", category: "Revision",        text: "Revise Organic Chemistry reaction mechanisms",      xp: 20, done: false },
        { id: "t4", category: "Mock Test",        text: "Attempt a 30-min Maths mini mock test",            xp: 35, done: false },
        { id: "t5", category: "Doubts",           text: "Clear all pending doubts from yesterday's session",xp: 15, done: false },
        { id: "t6", category: "General",          text: "Revise NCERT line-by-line for 30 minutes",         xp: 15, done: false },
        { id: "t7", category: "General",          text: "Make/update short revision notes for today's topics", xp: 15, done: false },
        { id: "t8", category: "General",          text: "Take a focused 10-min break every 50 minutes of study", xp: 10, done: false },
    ],
    reward: { coins: 150, xp: 200 }
};

// ── Shop Titles Catalog ─────────────────────────────────────
const SHOP_TITLES = [
    { id: "st1", name: "⚔️ Blade Scholar",    cost: 100, desc: "For the diligent warrior",       color: "blue"   },
    { id: "st2", name: "🔥 Inferno Mind",      cost: 200, desc: "Burns through problems fast",    color: "orange" },
    { id: "st3", name: "🌟 JEE Phantom",       cost: 350, desc: "A ghost that haunts wrong answers", color: "purple" },
    { id: "st4", name: "💀 Boss Killer",       cost: 500, desc: "Supreme slayer of all bosses",   color: "rose"   },
    { id: "st5", name: "👑 Iron Chancellor",   cost: 750, desc: "Ruler of the study arena",       color: "yellow" },
    { id: "st6", name: "🌌 Quantum Slayer",    cost: 1200, desc: "Beyond mortal comprehension",   color: "cyan"   },
];

// ── Shop Avatars Catalog (Free Fire-style weapon/gear display items) ──
const SHOP_AVATARS = [
    { id: "av1", emoji: "🔫", name: "AK Recruit",     cost: 80,  rarity: "Common"    },
    { id: "av2", emoji: "🎯", name: "Deadeye Sniper", cost: 150, rarity: "Rare"      },
    { id: "av3", emoji: "🪓", name: "Axe Berserker",  cost: 150, rarity: "Rare"      },
    { id: "av4", emoji: "🛡️", name: "Iron Guardian",  cost: 220, rarity: "Rare"      },
    { id: "av5", emoji: "💣", name: "Grenadier",      cost: 220, rarity: "Rare"      },
    { id: "av6", emoji: "🗡️", name: "Shadow Blade",   cost: 350, rarity: "Epic"      },
    { id: "av7", emoji: "🏹", name: "Ghost Archer",   cost: 350, rarity: "Epic"      },
    { id: "av8", emoji: "💥", name: "Airstrike Ace",  cost: 500, rarity: "Epic"      },
    { id: "av9", emoji: "👑", name: "Booyah King",    cost: 900, rarity: "Legendary" },
    { id: "av10",emoji: "🐉", name: "Dragon Slayer",  cost: 900, rarity: "Legendary" },
];

// ── Question Bank for Slay Trial ────────────────────────────
const QUESTION_BANK = [
    { subject:"MATHS",   q:"If f(x) = x² + 2x + 1, what is f(3)?", opts:["14","16","12","18"], ans:1 },
    { subject:"MATHS",   q:"What is the derivative of sin(x)?",     opts:["cos(x)","-cos(x)","sin(x)","-sin(x)"], ans:0 },
    { subject:"MATHS",   q:"Evaluate: ∫₀¹ x dx",                    opts:["1/2","1","1/4","2"], ans:0 },
    { subject:"MATHS",   q:"What is lim(x→0) sin(x)/x?",            opts:["1","0","∞","undefined"], ans:0 },
    { subject:"MATHS",   q:"Which is NOT a trigonometric identity?", opts:["sin²x+cos²x=1","tan²x+1=sec²x","sin2x=2sinx·cosx","cosx=sinx+1"], ans:3 },
    { subject:"PHYSICS", q:"F = ma is Newton's which Law?",          opts:["First","Second","Third","Zeroth"], ans:1 },
    { subject:"PHYSICS", q:"SI unit of electric charge?",            opts:["Ampere","Volt","Coulomb","Joule"], ans:2 },
    { subject:"PHYSICS", q:"Speed of light in vacuum (approx)?",     opts:["3×10⁸ m/s","3×10⁶ m/s","3×10¹⁰ m/s","3×10⁷ m/s"], ans:0 },
    { subject:"PHYSICS", q:"Work done when force ⊥ displacement?",  opts:["0","Maximum","Negative","Depends on mass"], ans:0 },
    { subject:"PHYSICS", q:"KE = ?",                                  opts:["½mv²","mv²","2mv","mv/2"], ans:0 },
    { subject:"CHEMISTRY",q:"Atomic number of Carbon?",              opts:["6","8","12","4"], ans:0 },
    { subject:"CHEMISTRY",q:"pH of pure water at 25°C?",             opts:["6","8","7","9"], ans:2 },
    { subject:"CHEMISTRY",q:"Valency of Oxygen?",                    opts:["1","2","3","4"], ans:1 },
    { subject:"CHEMISTRY",q:"What does an acid release in water?",   opts:["OH⁻","H⁺","Na⁺","Cl⁻"], ans:1 },
    { subject:"CHEMISTRY",q:"Molecular formula of glucose?",         opts:["C₆H₁₂O₆","C₁₂H₂₂O₁₁","CH₂O","C₆H₆"], ans:0 },
    { subject:"GENERAL",  q:"Which study technique uses spaced repetition?", opts:["Anki method","Cornell Notes","Mind mapping","Pomodoro"], ans:0 },
    { subject:"GENERAL",  q:"JEE Advanced tests how many subjects?", opts:["2","3","4","1"], ans:1 },
    { subject:"GENERAL",  q:"Best time to review notes (retention)?",opts:["Immediately after","Next day","1 week later","1 month later"], ans:0 },
];

// ── App State ───────────────────────────────────────────────
let STATE = {
    playerName:  "Candidate",
    playerId:    null,
    weeklyXp:    0,
    coins:       0,
    totalSlays:  0,
    totalQuestions: 0,
    trophies:    [],
    purchasedTitles: [],
    activeTitle: null,
    purchasedAvatars: [],
    activeAvatar: null,
    theme: 'default',
    drills: { maths:0, physics:0, chem:0 },
    boss: JSON.parse(JSON.stringify(DEFAULT_BOSS)),
    trialDone: false,
    rankSort: "weeklyXp",
    weekStart: null,
    dayStart:  null,
    streak:    0,
    lastDayTasks: [],
};

let trialState = {
    questions: [],
    current: 0,
    timer: null,
    seconds: 0,
};

// ── Persistence ─────────────────────────────────────────────
function saveLocal() {
    try { localStorage.setItem('jba_state', JSON.stringify(STATE)); } catch(e){}
}

function loadLocal() {
    try {
        const raw = localStorage.getItem('jba_state');
        if (raw) {
            const saved = JSON.parse(raw);
            STATE = Object.assign(STATE, saved);
            // ensure boss has all fields
            if (!STATE.boss) STATE.boss = JSON.parse(JSON.stringify(DEFAULT_BOSS));
            if (!STATE.drills) STATE.drills = { maths:0, physics:0, chem:0 };
            if (!STATE.trophies) STATE.trophies = [];
            if (!STATE.purchasedTitles) STATE.purchasedTitles = [];
            if (!STATE.lastDayTasks) STATE.lastDayTasks = [];
            if (typeof STATE.streak !== 'number') STATE.streak = 0;
            if (!STATE.purchasedAvatars) STATE.purchasedAvatars = [];
            if (!STATE.theme) STATE.theme = 'default';
        }
    } catch(e) { console.warn("Load error:", e); }
}

// ── Firebase Sync ────────────────────────────────────────────
async function syncToFirebase() {
    if (!firebaseReady || !STATE.playerId) return;
    try {
        await db.collection('players').doc(STATE.playerId).set({
            name:           STATE.playerName,
            weeklyXp:       STATE.weeklyXp,
            coins:          STATE.coins,
            totalSlays:     STATE.totalSlays,
            totalQuestions: STATE.totalQuestions,
            activeTitle:    STATE.activeTitle || null,
            activeAvatar:   STATE.activeAvatar || null,
            weekStart:      STATE.weekStart || getMonday(),
            lastSeen:       firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    } catch(e) { console.warn("Firebase sync failed:", e.message); }
}

async function fetchLeaderboard() {
    if (!firebaseReady) {
        renderLeaderboard([]);
        return;
    }
    try {
        const field = STATE.rankSort === 'slays' ? 'totalSlays'
                    : STATE.rankSort === 'questions' ? 'totalQuestions'
                    : 'weeklyXp';
        const snap = await db.collection('players')
            .orderBy(field, 'desc')
            .limit(20)
            .get();
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        renderLeaderboard(list);
    } catch(e) {
        console.warn("Leaderboard fetch failed:", e.message);
        renderLeaderboard([]);
    }
}

// ── Weekly XP Reset Check ────────────────────────────────────
function getMonday() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const diff = (day === 0) ? 6 : day - 1;
    const mon = new Date(now);
    mon.setDate(now.getDate() - diff);
    mon.setHours(0,0,0,0);
    return mon.toISOString().split('T')[0];
}

function checkWeeklyReset() {
    const thisMonday = getMonday();
    if (STATE.weekStart !== thisMonday) {
        STATE.weeklyXp  = 0;
        STATE.weekStart = thisMonday;
        saveLocal();
        syncToFirebase();
    }
}

// ── Daily Rollover: auto-carry, streak tracking, repeat-yesterday ──
function getToday() {
    const now = new Date();
    now.setHours(0,0,0,0);
    return now.toISOString().split('T')[0];
}

function checkDailyReset() {
    const today = getToday();
    if (STATE.dayStart === today) return; // already handled today

    const isFirstRun = !STATE.dayStart;
    const tasks = STATE.boss.basicTasks || [];

    if (!isFirstRun && tasks.length > 0) {
        // Snapshot yesterday's task set so "Repeat Yesterday" can restore it
        STATE.lastDayTasks = tasks.map(t => ({ category: t.category, text: t.text, xp: t.xp || 20 }));

        // Streak: count it if every task was completed yesterday
        const allDone = tasks.every(t => t.done);
        STATE.streak = allDone ? (STATE.streak || 0) + 1 : 0;

        // Auto-carry: unfinished tasks stay (already true), finished ones reset for the new day
        tasks.forEach(t => t.done = false);
        STATE.trialDone = false;

        showToast(
            allDone ? `🔥 ${STATE.streak}-Day Streak!` : 'New Day',
            allDone ? 'Boss fully slain yesterday — tasks reset, streak extended!' : 'Fresh day — yesterday\'s tasks carried over, streak reset.'
        );
    }

    STATE.dayStart = today;
    saveLocal();
}

function repeatYesterdayTasks() {
    const bank = STATE.lastDayTasks || [];
    if (bank.length === 0) {
        showToast('Nothing to Repeat', 'No task history from yesterday yet.');
        return;
    }
    const existingTexts = new Set((STATE.boss.basicTasks || []).map(t => t.text));
    let added = 0;
    bank.forEach(t => {
        if (!existingTexts.has(t.text)) {
            STATE.boss.basicTasks.push({ id: 'repeat_' + Date.now() + '_' + added, category: t.category, text: t.text, xp: t.xp, done: false });
            added++;
        }
    });
    saveLocal();
    renderTaskList();
    showToast(added > 0 ? 'Tasks Restored' : 'Already Up To Date', added > 0 ? `Added ${added} task(s) from yesterday.` : 'All of yesterday\'s tasks are already on your list.');
}

function updateCountdown() {
    const now    = new Date();
    const day    = now.getDay();
    const daysUntilMon = (day === 0) ? 1 : 8 - day;
    const nextMon = new Date(now);
    nextMon.setDate(now.getDate() + daysUntilMon);
    nextMon.setHours(0,0,0,0);
    const diff = nextMon - now;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const el = document.getElementById('monday-reset-countdown');
    if (el) el.textContent = `${d}d ${h}h ${m}m`;
}

// ── View Switcher ────────────────────────────────────────────
function switchView(name) {
    ['battle','ai','achievements','shop','rankings'].forEach(v => {
        document.getElementById('view-' + v).classList.add('hidden');
        const btn = document.getElementById('nav-' + v);
        btn.classList.remove('text-blue-400','font-bold','nav-pill-active');
        btn.classList.add('text-slate-400');
    });
    document.getElementById('view-' + name).classList.remove('hidden');
    const active = document.getElementById('nav-' + name);
    active.classList.add('text-blue-400','font-bold','nav-pill-active');
    active.classList.remove('text-slate-400');

    if (name === 'rankings') fetchLeaderboard();
    if (name === 'shop')     renderShop();
    if (name === 'achievements') renderJournal();
}

// ── Boss HP Rendering ────────────────────────────────────────
function getBossProgress() {
    const tasks   = STATE.boss.basicTasks || [];
    const total   = tasks.length;
    const done    = tasks.filter(t => t.done).length;
    return total > 0 ? done / total : 0;
}

function renderBossHUD() {
    const progress = getBossProgress(); // 0..1 = fraction of basic tasks done
    const basicHP  = Math.max(0, 75 - progress * 75);    // 75→0 as tasks done
    const specialHP = STATE.trialDone ? 0 : 25;
    const totalHP  = basicHP + specialHP;

    const basicW   = Math.max(0, basicHP / 75 * 75);
    const specialW = STATE.trialDone ? 0 : 25;

    document.getElementById('boss-hp-text').textContent = Math.round(totalHP) + '% HP';
    document.getElementById('hp-basic-bar').style.width   = basicW + '%';
    document.getElementById('hp-special-bar').style.width = specialW + '%';

    const bossName = (STATE.boss.bossName || 'IRON COLOSSUS').toUpperCase();
    document.getElementById('boss-title-tag').textContent = 'DAILY BOSS: ' + bossName;

    const icon = document.getElementById('boss-icon');
    icon.className = 'fa-solid ' + (STATE.boss.bossIcon || 'fa-skull') + ' text-rose-500 animate-pulse';

    // Enrage card when boss low HP
    const hudCard = document.getElementById('boss-hud-card');
    if (totalHP <= 25 && totalHP > 0) {
        hudCard.classList.add('boss-enraged','border-rose-800');
    } else {
        hudCard.classList.remove('boss-enraged','border-rose-800');
    }

    // Streak badge
    const streakBadge = document.getElementById('streak-badge');
    if (streakBadge) {
        if ((STATE.streak || 0) > 0) {
            document.getElementById('streak-count-text').textContent = STATE.streak;
            streakBadge.classList.remove('hidden');
        } else {
            streakBadge.classList.add('hidden');
        }
    }

    syncWidgetData(totalHP, bossName);
}

// ── Home Screen Widget Sync (Android only, no-op on web/preview) ──
// Sends boss data straight into the native BossWidgetPlugin, which stores it
// and tells Android to redraw the home-screen widget immediately.
// See /android-widget-files in the project for the native side of this.
async function syncWidgetData(totalHP, bossName) {
    try {
        if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.BossWidget) return;
        const tasks = STATE.boss.basicTasks || [];
        const done  = tasks.filter(t => t.done).length;
        await window.Capacitor.Plugins.BossWidget.pushData({
            bossName:   bossName || 'DAILY BOSS',
            hp:         Math.round(totalHP),
            streak:     STATE.streak || 0,
            tasksDone:  done,
            tasksTotal: tasks.length,
        });
    } catch (e) { /* silently ignore on web preview, where this plugin doesn't exist */ }
}

// ── Basic Tasks List ─────────────────────────────────────────
function renderTaskList() {
    const container = document.getElementById('basic-tasks-list');
    const tasks = STATE.boss.basicTasks || [];
    container.innerHTML = '';

    if (tasks.length === 0) {
        container.innerHTML = '<div class="text-xs text-slate-500 text-center py-4">No tasks yet. Add one above!</div>';
        return;
    }

    tasks.forEach((task, idx) => {
        const catColor = {
            'Study Session':'blue','Problem Solving':'indigo','Revision':'purple',
            'Mock Test':'rose','Doubts':'amber','General':'slate'
        }[task.category] || 'slate';

        const div = document.createElement('div');
        div.className = `task-row glass-row relative overflow-hidden flex items-start gap-2.5 rounded-xl p-2.5 transition-all ${task.done ? 'opacity-50' : ''}`;
        div.innerHTML = `
            <div class="swipe-hint absolute inset-0 flex items-center justify-end pr-4 bg-gradient-to-r from-transparent to-emerald-600/70 opacity-0 pointer-events-none rounded-xl">
                <i class="fa-solid fa-check text-white"></i>
            </div>
            <div class="swipe-content flex items-start gap-2.5 w-full transition-transform">
                <button onclick="toggleTask(${idx})" class="mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                    ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 hover:border-blue-400'}">
                    ${task.done ? '<i class="fa-solid fa-check text-white text-[10px]"></i>' : ''}
                </button>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span class="text-[9px] font-bold bg-${catColor}-900/60 text-${catColor}-300 px-1.5 py-0.5 rounded-md border border-${catColor}-800/50">${task.category}</span>
                        <span class="text-[9px] text-slate-400">+${task.xp || 20} XP</span>
                    </div>
                    <p class="text-xs text-slate-200 leading-snug ${task.done ? 'line-through text-slate-500' : ''}">${task.text}</p>
                </div>
                <button onclick="removeTask(${idx})" class="text-slate-600 hover:text-rose-400 text-xs mt-0.5 shrink-0">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>`;
        container.appendChild(div);
        attachSwipeToComplete(div, idx);
    });

    updateSpecialCard();
    renderBossHUD();
    renderHeaderStats();
}

// ── Swipe-to-complete (touch) ─────────────────────────────────
function attachSwipeToComplete(row, idx) {
    const content = row.querySelector('.swipe-content');
    const hint    = row.querySelector('.swipe-hint');
    let startX = 0, dx = 0, dragging = false;
    const THRESHOLD = 70;

    row.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        dragging = true;
        content.style.transition = 'none';
    }, { passive: true });

    row.addEventListener('touchmove', e => {
        if (!dragging) return;
        dx = Math.max(0, Math.min(100, e.touches[0].clientX - startX)); // only allow right-swipe, capped
        content.style.transform = `translateX(${dx}px)`;
        hint.style.opacity = Math.min(1, dx / THRESHOLD);
    }, { passive: true });

    row.addEventListener('touchend', () => {
        dragging = false;
        content.style.transition = 'transform .2s ease';
        content.style.transform = 'translateX(0)';
        hint.style.opacity = 0;
        if (dx >= THRESHOLD) toggleTask(idx);
        dx = 0;
    });
}

function toggleTask(idx) {
    const task = STATE.boss.basicTasks[idx];
    if (!task) return;
    task.done = !task.done;
    if (task.done) {
        addXP(task.xp || 20);
        showToast('Task Complete!', `+${task.xp || 20} XP earned! Keep going! 🔥`);
    }
    saveLocal();
    syncToFirebase();
    renderTaskList();
}

function removeTask(idx) {
    STATE.boss.basicTasks.splice(idx, 1);
    saveLocal();
    renderTaskList();
}

function addCustomBasicTask() {
    const input = document.getElementById('add-task-input');
    const cat   = document.getElementById('add-task-category').value;
    const text  = input.value.trim();
    if (!text) { input.focus(); return; }

    const id = 'custom_' + Date.now();
    STATE.boss.basicTasks.push({ id, category: cat, text, xp: 20, done: false });
    input.value = '';
    saveLocal();
    renderTaskList();
}

// ── Special / Trial Card ─────────────────────────────────────
function updateSpecialCard() {
    const tasks   = STATE.boss.basicTasks || [];
    const done    = tasks.filter(t => t.done);
    const total   = tasks.length;
    const pct     = total > 0 ? done.length / total : 0;
    const unlocked = pct >= 1 && !STATE.trialDone; // all tasks done

    // Topic chips
    const chips = document.getElementById('synthesized-topics-chips');
    if (done.length === 0) {
        chips.innerHTML = '<span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">No tasks completed yet</span>';
    } else {
        const cats = [...new Set(done.map(t => t.category))];
        chips.innerHTML = cats.map(c =>
            `<span class="text-[10px] bg-indigo-900/60 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded-md font-bold">${c}</span>`
        ).join('');
    }

    // Trial active topics
    const topicsList = document.getElementById('trial-active-topics-list');
    if (topicsList) {
        topicsList.textContent = done.length > 0
            ? [...new Set(done.map(t => t.category))].join(' • ')
            : 'General Study';
    }

    const badge = document.getElementById('special-badge-tag');
    const desc  = document.getElementById('special-challenge-desc');
    const icon  = document.getElementById('special-icon');
    const btn   = document.getElementById('btn-start-slay-trial');
    const progWrap = document.getElementById('special-unlock-progress-wrap');
    const progBar  = document.getElementById('special-unlock-progress-bar');

    if (STATE.trialDone) {
        badge.textContent = '✅ Trial Complete — Boss Slain!';
        badge.className = 'text-[10px] bg-emerald-900/60 text-emerald-300 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-700';
        desc.textContent = STATE.boss.specialChallenge || 'Boss defeated! Claim your glory!';
        icon.className   = 'fa-solid fa-trophy text-amber-400 text-xl';
        btn.disabled = true;
        btn.className = 'bg-emerald-900/60 text-emerald-300 text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-not-allowed';
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Boss Slain!';
        if (progWrap) progWrap.classList.add('hidden');
    } else if (unlocked) {
        badge.textContent = '🔓 UNLOCKED — Final Slay Trial Ready!';
        badge.className = 'text-[10px] bg-rose-900/60 text-rose-300 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-rose-700 animate-pulse';
        desc.textContent = STATE.boss.specialChallenge || 'Prove your mastery in the Final Slay Trial!';
        icon.className   = 'fa-solid fa-crosshairs text-rose-400 text-xl animate-pulse';
        btn.disabled = false;
        btn.className = 'btn-premium btn-press text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5';
        btn.innerHTML = '<i class="fa-solid fa-crosshairs"></i> Initiate 25% Slay Trial';
        if (progWrap) progWrap.classList.add('hidden');
    } else {
        const remaining = total - done.length;
        const pct = total > 0 ? Math.round((done.length / total) * 100) : 0;
        badge.textContent = `🔒 Locked Phase (${done.length}/${total} Tasks Done)`;
        badge.className = 'text-[10px] bg-slate-800 text-slate-400 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-slate-700';
        desc.textContent = `Complete ${remaining} more task${remaining !== 1 ? 's' : ''} to unlock the Slay Trial…`;
        icon.className   = 'fa-solid fa-lock text-slate-600 text-xl';
        btn.disabled = true;
        btn.className = 'bg-slate-800 text-slate-500 text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-not-allowed';
        btn.innerHTML = '<i class="fa-solid fa-crosshairs"></i> Initiate 25% Slay Trial';
        if (progWrap) { progWrap.classList.remove('hidden'); progBar.style.width = pct + '%'; }
    }
}

// ── Drill Counters ────────────────────────────────────────────
function addQ(subject, delta) {
    const key = subject;
    const before = STATE.drills[key] || 0;
    STATE.drills[key] = Math.max(0, before + delta);
    const actualDelta = STATE.drills[key] - before;
    document.getElementById('q-' + key + '-count').textContent = STATE.drills[key];
    flashGain('q-' + key + '-count');

    if (actualDelta > 0) {
        addXP(actualDelta * 10);
        STATE.totalQuestions = (STATE.totalQuestions || 0) + actualDelta;
        showToast('Drill Solved!', `+${actualDelta * 10} Weekly XP`);
    }
    saveLocal();
    syncToFirebase();
    renderHeaderStats();
}

// ── Focus Timer (one-tap study session) ─────────────────────
let focusTimer = { running: false, seconds: 0, target: 25 * 60, interval: null };

function toggleFocusTimer() {
    const widget = document.getElementById('focus-timer-widget');
    if (!focusTimer.running) {
        focusTimer.running = true;
        widget.classList.remove('hidden');
        focusTimer.interval = setInterval(() => {
            focusTimer.seconds++;
            renderFocusTimer();
            if (focusTimer.seconds >= focusTimer.target) completeFocusSession();
        }, 1000);
        renderFocusTimer();
    } else {
        stopFocusTimer(false);
    }
}

function stopFocusTimer(completed) {
    clearInterval(focusTimer.interval);
    const widget = document.getElementById('focus-timer-widget');
    if (completed) {
        const mins = Math.round(focusTimer.seconds / 60);
        addXP(30);
        showToast('Study Session Complete! 🎯', `+30 XP for a ${mins}-minute focused block`);
    }
    focusTimer.running = false;
    focusTimer.seconds = 0;
    widget.classList.add('hidden');
}

function completeFocusSession() { stopFocusTimer(true); }

function renderFocusTimer() {
    const remaining = Math.max(0, focusTimer.target - focusTimer.seconds);
    const m = String(Math.floor(remaining / 60)).padStart(2,'0');
    const s = String(remaining % 60).padStart(2,'0');
    const el = document.getElementById('focus-timer-display');
    if (el) el.textContent = `${m}:${s}`;
    const bar = document.getElementById('focus-timer-bar');
    if (bar) bar.style.width = Math.min(100, (focusTimer.seconds / focusTimer.target) * 100) + '%';
}


function flashGain(elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.classList.remove('flash-gain');
    void el.offsetWidth; // restart animation
    el.classList.add('flash-gain');
}

function addXP(amount) {
    STATE.weeklyXp = (STATE.weeklyXp || 0) + amount;
    renderHeaderStats();
    if (amount > 0) flashGain('my-weekly-xp-count');
}

function addCoins(amount) {
    STATE.coins = (STATE.coins || 0) + amount;
    renderHeaderStats();
    renderShop();
    if (amount > 0) flashGain('my-coins-count');
}

function renderHeaderStats() {
    document.getElementById('my-coins-count').textContent      = STATE.coins || 0;
    document.getElementById('my-weekly-xp-count').textContent  = (STATE.weeklyXp || 0) + ' XP';
    document.getElementById('my-name-tag').textContent         = STATE.activeTitle || STATE.playerName || 'Candidate';
    document.getElementById('shop-balance-display').textContent = (STATE.coins || 0) + ' Coins';

    const avatarEl = document.getElementById('my-avatar-icon');
    if (avatarEl) {
        avatarEl.innerHTML = STATE.activeAvatar
            ? `<span class="text-sm leading-none">${STATE.activeAvatar}</span>`
            : '<i class="fa-solid fa-user-gear text-blue-400"></i>';
    }

    // Leaderboard my-card
    document.getElementById('battle-my-name').textContent  = 'YOU (' + (STATE.playerName || 'Candidate') + ')';
    document.getElementById('battle-my-xp').textContent    = (STATE.weeklyXp || 0) + ' Weekly XP';
    document.getElementById('battle-my-coins').textContent = STATE.coins || 0;
    document.getElementById('battle-my-kills').textContent = STATE.totalSlays || 0;

    // Drills
    document.getElementById('q-maths-count').textContent   = STATE.drills.maths   || 0;
    document.getElementById('q-physics-count').textContent = STATE.drills.physics || 0;
    document.getElementById('q-chem-count').textContent    = STATE.drills.chem    || 0;

    // Total slays
    document.getElementById('total-kills-count').textContent = (STATE.totalSlays || 0) + ' Slays';
}

// ── Profile ──────────────────────────────────────────────────
function openLoginModal() {
    document.getElementById('login-name-input').value = STATE.playerName !== 'Candidate' ? STATE.playerName : '';
    document.getElementById('login-modal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
}

function openManualModal() {
    document.getElementById('manual-modal').classList.remove('hidden');
}

function closeManualModal() {
    document.getElementById('manual-modal').classList.add('hidden');
}

function openThemeModal() {
    document.getElementById('theme-modal').classList.remove('hidden');
    highlightActiveTheme();
}

function closeThemeModal() {
    document.getElementById('theme-modal').classList.add('hidden');
}

function setTheme(name) {
    STATE.theme = name;
    document.body.setAttribute('data-theme', name === 'default' ? '' : name);
    saveLocal();
    highlightActiveTheme();
}

function highlightActiveTheme() {
    document.querySelectorAll('.theme-swatch-btn').forEach(btn => {
        btn.classList.toggle('active-theme', btn.dataset.themeId === (STATE.theme || 'default'));
    });
}

function saveProfile() {
    const input = document.getElementById('login-name-input');
    const name  = input.value.trim();
    if (!name) { input.focus(); return; }

    STATE.playerName = name;
    if (!STATE.playerId) {
        STATE.playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
    }
    saveLocal();
    syncToFirebase();
    renderHeaderStats();
    closeLoginModal();
    showToast('Profile Saved!', 'Welcome, ' + name + '! ⚔️');
}

// ── Reset Daily ──────────────────────────────────────────────
function resetDailyProgress() {
    showDialog(
        'Reset Tasks',
        'Reset all task completions for today? Your XP, coins, and slays are kept.',
        'fa-rotate-left','rose',
        () => {
            (STATE.boss.basicTasks || []).forEach(t => t.done = false);
            STATE.trialDone = false;
            saveLocal();
            renderTaskList();
            renderBossHUD();
            showToast('Tasks Reset', 'All tasks cleared for today 🔄');
        }
    );
}

// ── Slay Trial Modal ─────────────────────────────────────────
function openSlayTrialModal() {
    const tasks = STATE.boss.basicTasks || [];
    const done  = tasks.filter(t => t.done);
    if (done.length < tasks.length) {
        showDialog('Trial Locked','Complete all basic tasks first!','fa-lock','amber');
        return;
    }
    if (STATE.trialDone) {
        showDialog('Already Slain!','You have already completed the Slay Trial today!','fa-check','emerald');
        return;
    }

    // Pick 3 random questions
    const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
    trialState.questions = shuffled.slice(0, 3);
    trialState.current   = 0;

    document.getElementById('trial-modal').classList.remove('hidden');
    renderTrialQuestion();
    startTrialTimer();
}

function closeSlayTrialModal() {
    document.getElementById('trial-modal').classList.add('hidden');
    clearTrialTimer();
}

function renderTrialQuestion() {
    const q   = trialState.questions[trialState.current];
    const idx = trialState.current;
    const total = trialState.questions.length;

    document.getElementById('trial-q-subject').textContent = q.subject + ' — QUESTION ' + (idx+1) + ' OF ' + total;
    document.getElementById('trial-q-text').textContent    = q.q;

    const opts = document.getElementById('trial-options-container');
    opts.innerHTML = '';
    q.opts.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 text-slate-200 px-3.5 py-2.5 rounded-xl transition';
        btn.textContent = String.fromCharCode(65+i) + '. ' + opt;
        btn.onclick = () => handleTrialAnswer(i, btn, q);
        opts.appendChild(btn);
    });
}

function handleTrialAnswer(selected, btn, q) {
    // Disable all buttons
    document.querySelectorAll('#trial-options-container button').forEach(b => b.disabled = true);

    if (selected === q.ans) {
        btn.classList.add('bg-emerald-600','border-emerald-500','text-white');
        btn.innerHTML = '✅ ' + btn.textContent;
        setTimeout(() => {
            trialState.current++;
            if (trialState.current >= trialState.questions.length) {
                // Trial won!
                clearTrialTimer();
                completeSlay();
            } else {
                renderTrialQuestion();
            }
        }, 700);
    } else {
        btn.classList.add('bg-rose-700','border-rose-500','text-white');
        btn.innerHTML = '❌ ' + btn.textContent;
        // Show correct
        document.querySelectorAll('#trial-options-container button')[q.ans].classList.add('bg-emerald-700','border-emerald-500','text-white');
        setTimeout(() => {
            clearTrialTimer();
            closeSlayTrialModal();
            showDialog('Trial Failed!','A wrong answer was detected! The trial has been reset. Complete tasks and try again.','fa-skull','rose');
        }, 1500);
    }
}

function startTrialTimer() {
    trialState.seconds = 90;
    const display = document.getElementById('trial-timer-display');
    display.textContent = trialState.seconds + 's';
    clearTrialTimer();
    trialState.timer = setInterval(() => {
        trialState.seconds--;
        display.textContent = trialState.seconds + 's';
        if (trialState.seconds <= 10) display.classList.add('text-rose-300');
        if (trialState.seconds <= 0) {
            clearTrialTimer();
            closeSlayTrialModal();
            showDialog('Time\'s Up!','The Slay Trial timer expired! Try again.','fa-clock','amber');
        }
    }, 1000);
}

function clearTrialTimer() {
    if (trialState.timer) { clearInterval(trialState.timer); trialState.timer = null; }
}

function completeSlay() {
    STATE.trialDone  = true;
    STATE.totalSlays = (STATE.totalSlays || 0) + 1;
    const reward = STATE.boss.reward || { coins: 150, xp: 200 };
    addCoins(reward.coins || 150);
    addXP(reward.xp || 200);

    // Add trophy
    const trophy = {
        id:   'trophy_' + Date.now(),
        name: STATE.boss.bossName || 'Iron Colossus',
        icon: STATE.boss.bossIcon || 'fa-skull',
        date: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }),
        coins: reward.coins || 150,
    };
    STATE.trophies.push(trophy);
    saveLocal();
    syncToFirebase();

    closeSlayTrialModal();
    renderTaskList();
    renderBossHUD();
    renderJournal();
    showToast('BOSS SLAIN! 🏆', `+${reward.coins || 150} Coins, +${reward.xp || 200} XP!`);
    updateMilestoneBadges();
}

// ── Journal ──────────────────────────────────────────────────
function renderJournal() {
    const list = document.getElementById('trophies-list');
    if (!STATE.trophies || STATE.trophies.length === 0) {
        list.innerHTML = '<div class="text-xs text-slate-500 text-center py-4">No boss trophies unlocked yet.</div>';
    } else {
        list.innerHTML = [...STATE.trophies].reverse().map(t => `
            <div class="flex items-center gap-3 bg-gradient-to-r from-slate-800 to-amber-950/30 border border-amber-800/30 rounded-xl p-3">
                <div class="w-9 h-9 bg-amber-900/40 rounded-full flex items-center justify-center text-amber-400 shrink-0">
                    <i class="fa-solid ${t.icon || 'fa-skull'}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-xs font-bold text-white">Trophy: ${t.name}</div>
                    <div class="text-[10px] text-slate-400">${t.date} • +${t.coins} coins earned</div>
                </div>
                <span class="text-amber-400 text-xs font-black">🏆</span>
            </div>`).join('');
    }
    document.getElementById('total-kills-count').textContent = (STATE.totalSlays || 0) + ' Slays';
    updateMilestoneBadges();
}

function updateMilestoneBadges() {
    const slays = STATE.totalSlays || 0;
    [['badge-m10',10],['badge-m50',50],['badge-m100',100]].forEach(([id,req]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (slays >= req) {
            el.classList.remove('opacity-50');
            el.classList.add('border-amber-500','shadow-lg');
        }
    });
}

// ── Shop ──────────────────────────────────────────────────────
function renderShop() {
    const container = document.getElementById('shop-titles-list');
    document.getElementById('shop-balance-display').textContent = (STATE.coins || 0) + ' Coins';
    container.innerHTML = SHOP_TITLES.map(t => {
        const owned = (STATE.purchasedTitles || []).includes(t.id);
        const active = STATE.activeTitle === t.name;
        const canAfford = (STATE.coins || 0) >= t.cost;
        return `
        <div class="flex items-center justify-between glass-tile rounded-xl p-3">
            <div>
                <div class="text-xs font-bold text-white">${t.name}</div>
                <div class="text-[10px] text-slate-400">${t.desc}</div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                ${owned ? `
                    <button onclick="equipTitle('${t.id}','${t.name}')" class="btn-press text-[10px] font-bold px-3 py-1.5 rounded-lg ${active ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}">
                        ${active ? '✓ Equipped' : 'Equip'}
                    </button>` : `
                    <div class="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        <i class="fa-solid fa-coins"></i>${t.cost}
                    </div>
                    <button onclick="buyTitle('${t.id}','${t.name}',${t.cost})" ${!canAfford ? 'disabled' : ''}
                        class="btn-press text-[10px] font-bold px-3 py-1.5 rounded-lg ${canAfford ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}">
                        ${canAfford ? 'Buy' : 'Need more coins'}
                    </button>`}
            </div>
        </div>`;
    }).join('');

    renderAvatarShop();
}

// ── Custom Avatars (Free Fire-style weapon/gear items) ───────
const RARITY_COLOR = {
    Common: 'slate', Rare: 'blue', Epic: 'purple', Legendary: 'amber'
};

function renderAvatarShop() {
    const container = document.getElementById('shop-avatars-list');
    if (!container) return;
    container.innerHTML = SHOP_AVATARS.map(a => {
        const owned = (STATE.purchasedAvatars || []).includes(a.id);
        const active = STATE.activeAvatar === a.emoji;
        const canAfford = (STATE.coins || 0) >= a.cost;
        const c = RARITY_COLOR[a.rarity] || 'slate';
        return `
        <div class="glass-tile rounded-xl p-2.5 text-center space-y-1.5 ${active ? 'ring-2 ring-emerald-500' : ''}">
            <div class="w-12 h-12 mx-auto rounded-xl bg-${c}-950/60 border border-${c}-700/50 flex items-center justify-center text-2xl stat-ring">
                ${a.emoji}
            </div>
            <div class="text-[10px] font-bold text-white truncate">${a.name}</div>
            <div class="text-[9px] font-bold text-${c}-400 uppercase tracking-wide">${a.rarity}</div>
            ${owned ? `
                <button onclick="equipAvatar('${a.id}','${a.emoji}')" class="btn-press w-full text-[10px] font-bold px-2 py-1.5 rounded-lg ${active ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}">
                    ${active ? '✓ Equipped' : 'Equip'}
                </button>` : `
                <button onclick="buyAvatar('${a.id}','${a.name}','${a.emoji}',${a.cost})" ${!canAfford ? 'disabled' : ''}
                    class="btn-press w-full text-[10px] font-bold px-2 py-1.5 rounded-lg ${canAfford ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}">
                    <i class="fa-solid fa-coins"></i> ${a.cost}
                </button>`}
        </div>`;
    }).join('');
}

function buyAvatar(id, name, emoji, cost) {
    if ((STATE.coins || 0) < cost) return;
    showDialog(
        'Confirm Purchase',
        `Buy "${emoji} ${name}" for ${cost} coins?`,
        'fa-cart-shopping', 'amber',
        () => {
            STATE.coins -= cost;
            if (!STATE.purchasedAvatars) STATE.purchasedAvatars = [];
            STATE.purchasedAvatars.push(id);
            saveLocal();
            syncToFirebase();
            renderShop();
            renderHeaderStats();
            showToast('Avatar Unlocked!', `"${emoji} ${name}" is now yours! Equip it from the shop.`);
        }, true
    );
}

function equipAvatar(id, emoji) {
    if (STATE.activeAvatar === emoji) {
        STATE.activeAvatar = null;
        showToast('Avatar Removed', 'Reverted to default avatar.');
    } else {
        STATE.activeAvatar = emoji;
        showToast('Avatar Equipped!', `Now displaying: ${emoji}`);
    }
    saveLocal();
    syncToFirebase();
    renderShop();
    renderHeaderStats();
}

function buyTitle(id, name, cost) {
    if ((STATE.coins || 0) < cost) return;
    showDialog(
        'Confirm Purchase',
        `Buy "${name}" for ${cost} coins?`,
        'fa-cart-shopping', 'amber',
        () => {
            STATE.coins -= cost;
            if (!STATE.purchasedTitles) STATE.purchasedTitles = [];
            STATE.purchasedTitles.push(id);
            saveLocal();
            syncToFirebase();
            renderShop();
            renderHeaderStats();
            showToast('Title Unlocked!', `"${name}" is now yours! Equip it from the shop.`);
        }, true
    );
}

function equipTitle(id, name) {
    if (STATE.activeTitle === name) {
        STATE.activeTitle = null;
        showToast('Title Removed', 'Title unequipped.');
    } else {
        STATE.activeTitle = name;
        showToast('Title Equipped!', `Now showing: ${name}`);
    }
    saveLocal();
    syncToFirebase();
    renderShop();
    renderHeaderStats();
}

// ── Leaderboard ───────────────────────────────────────────────
function setRankSort(type) {
    STATE.rankSort = type;
    ['weeklyXp','slays','questions'].forEach(t => {
        const btn = document.getElementById('sort-btn-' + t);
        btn.className = t === type
            ? 'py-1.5 rounded-lg bg-indigo-600 text-white shadow'
            : 'py-1.5 rounded-lg text-slate-400 hover:text-white';
    });
    fetchLeaderboard();
}

function renderLeaderboard(players) {
    const container = document.getElementById('rankings-list-container');
    const myId      = STATE.playerId;
    const field     = STATE.rankSort === 'slays' ? 'totalSlays'
                    : STATE.rankSort === 'questions' ? 'totalQuestions'
                    : 'weeklyXp';
    const label     = STATE.rankSort === 'slays'     ? 'Slays'
                    : STATE.rankSort === 'questions' ? 'Drills'
                    : 'XP';

    // Include local player
    let list = [...players];
    const myEntry = {
        id: myId,
        name: STATE.playerName,
        weeklyXp: STATE.weeklyXp,
        totalSlays: STATE.totalSlays,
        totalQuestions: STATE.totalQuestions,
        coins: STATE.coins,
        activeTitle: STATE.activeTitle,
        activeAvatar: STATE.activeAvatar,
    };
    if (!list.find(p => p.id === myId)) list.push(myEntry);
    list.sort((a,b) => (b[field]||0) - (a[field]||0));

    const myRank = list.findIndex(p => p.id === myId) + 1;
    document.getElementById('battle-my-rank-badge').textContent = '#' + myRank;

    if (list.length === 0) {
        container.innerHTML = '<div class="text-xs text-slate-500 text-center py-4">No competitors yet. Be the first!</div>';
        return;
    }

    const rankColors = ['text-amber-400','text-slate-300','text-amber-600'];
    const rankIcons  = ['fa-crown','fa-medal','fa-award'];
    container.innerHTML = list.slice(0,15).map((p,i) => {
        const isMe  = p.id === myId;
        const rank  = i + 1;
        const icon  = rank <= 3 ? `<i class="fa-solid ${rankIcons[rank-1]} ${rankColors[rank-1]}"></i>` : `<span class="text-[10px] font-black text-slate-400">#${rank}</span>`;
        return `
        <div class="flex items-center gap-2 ${isMe ? 'bg-blue-950/40 border border-blue-700/50' : 'bg-slate-800/60 border border-slate-700/30'} rounded-xl p-2.5">
            <div class="w-6 text-center shrink-0">${icon}</div>
            <div class="w-8 h-8 rounded-lg glass-tile flex items-center justify-center text-base shrink-0">
                ${p.activeAvatar ? p.activeAvatar : '<i class="fa-solid fa-user text-slate-500 text-xs"></i>'}
            </div>
            <div class="flex-1 min-w-0">
                <div class="text-xs font-bold ${isMe ? 'text-blue-300' : 'text-white'} truncate">
                    ${p.activeTitle ? p.activeTitle + ' ' : ''}${p.name || 'Unknown'}${isMe ? ' (You)' : ''}
                </div>
                <div class="text-[10px] text-slate-400">${p.coins || 0} coins • ${p.totalSlays || 0} slays</div>
            </div>
            <div class="text-sm font-black ${isMe ? 'text-amber-400' : 'text-slate-200'} code-font shrink-0">
                ${(p[field]||0)} ${label}
            </div>
        </div>`;
    }).join('');
}

// ── AI / Boss Import ─────────────────────────────────────────
function copyGeminiPrompt() {
    const prompt = `You are a JEE study game boss config generator. Generate a JSON object for a daily study boss battle with this EXACT schema:

{
  "bossName": "Name of the boss (creative, e.g. 'Entropy Demon', 'Calculus Golem')",
  "bossIcon": "FontAwesome icon class without fa- prefix (e.g. 'fa-dragon', 'fa-skull-crossbones', 'fa-bolt')",
  "specialChallenge": "A motivating description of today's special challenge (1-2 sentences)",
  "basicTasks": [
    { "id": "t1", "category": "Study Session", "text": "Task description", "xp": 25, "done": false },
    { "id": "t2", "category": "Problem Solving", "text": "Task description", "xp": 30, "done": false },
    { "id": "t3", "category": "Revision", "text": "Task description", "xp": 20, "done": false },
    { "id": "t4", "category": "Mock Test", "text": "Task description", "xp": 35, "done": false },
    { "id": "t5", "category": "Doubts", "text": "Task description", "xp": 15, "done": false }
  ],
  "reward": { "coins": 150, "xp": 200 }
}

Categories must be one of: Study Session, Problem Solving, Revision, Mock Test, Doubts, General.
Generate tasks relevant to JEE 2025 preparation (Physics, Chemistry, Mathematics).
Return ONLY the JSON object, no explanations.`;

    navigator.clipboard.writeText(prompt).then(() => {
        showToast('Prompt Copied!', 'Paste it in Gemini AI and bring back the JSON! 🤖');
    }).catch(() => {
        showDialog('Prompt', prompt, 'fa-copy', 'blue');
    });
}

function importBossJSON() {
    const raw = document.getElementById('ai-json-import-input').value.trim();
    if (!raw) {
        showDialog('Empty Input', 'Please paste the boss config JSON first.', 'fa-triangle-exclamation', 'amber');
        return;
    }
    try {
        let cleaned = raw.replace(/```json\s*/gi,'').replace(/```/g,'').trim();
        const config = JSON.parse(cleaned);

        if (!config.bossName || !Array.isArray(config.basicTasks)) {
            throw new Error('Missing required fields: bossName, basicTasks');
        }

        config.basicTasks = config.basicTasks.map((t,i) => ({
            id: t.id || 'ai_t' + i,
            category: t.category || 'General',
            text: t.text || 'Complete task',
            xp: parseInt(t.xp) || 20,
            done: false,
        }));

        STATE.boss = config;
        STATE.trialDone = false;
        document.getElementById('ai-json-import-input').value = '';
        saveLocal();
        renderTaskList();
        renderBossHUD();
        switchView('battle');
        showToast('Boss Loaded!', `"${config.bossName}" has arrived! ⚔️`);
    } catch(e) {
        showDialog('Invalid JSON', 'Could not parse the config:\n' + e.message, 'fa-triangle-exclamation', 'rose');
    }
}

function resetToDefaultBoss() {
    showDialog('Reset Boss','Reset to the default Iron Colossus boss?','fa-rotate-left','amber', () => {
        STATE.boss = JSON.parse(JSON.stringify(DEFAULT_BOSS));
        STATE.trialDone = false;
        saveLocal();
        renderTaskList();
        renderBossHUD();
        switchView('battle');
        showToast('Boss Reset','Default boss loaded!');
    }, true);
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(title, message) {
    const toast = document.getElementById('congratulations-toast');
    document.getElementById('toast-title').textContent   = title;
    document.getElementById('toast-message').textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ── App Dialog ────────────────────────────────────────────────
function showDialog(title, message, icon='fa-circle-info', color='blue', onOk=null, showCancel=false) {
    document.getElementById('dialog-title').textContent   = title;
    document.getElementById('dialog-message').textContent = message;
    document.getElementById('dialog-icon').className      = 'fa-solid ' + icon;
    document.getElementById('dialog-icon-bg').className   = `w-10 h-10 bg-${color}-600/20 text-${color}-400 rounded-full flex items-center justify-center text-lg shrink-0`;

    const cancelBtn = document.getElementById('dialog-btn-cancel');
    const okBtn     = document.getElementById('dialog-btn-ok');

    cancelBtn.classList.toggle('hidden', !showCancel);
    cancelBtn.onclick = () => document.getElementById('app-dialog-modal').classList.add('hidden');
    okBtn.onclick = () => {
        document.getElementById('app-dialog-modal').classList.add('hidden');
        if (onOk) onOk();
    };
    document.getElementById('app-dialog-modal').classList.remove('hidden');
}

// ── Init ──────────────────────────────────────────────────────
function init() {
    loadLocal();
    checkWeeklyReset();
    checkDailyReset();
    document.body.setAttribute('data-theme', (STATE.theme && STATE.theme !== 'default') ? STATE.theme : '');

    if (!STATE.playerId) {
        setTimeout(() => openLoginModal(), 500);
    }

    renderHeaderStats();
    renderTaskList();
    renderBossHUD();
    updateMilestoneBadges();
    switchView('battle');

    // Countdown timer
    updateCountdown();
    setInterval(updateCountdown, 60000);

    // Auto-sync every 2min if online
    setInterval(() => { if (navigator.onLine) syncToFirebase(); }, 120000);
}

document.addEventListener('DOMContentLoaded', init);
