import { TEAMS } from "./team.js";

// House → CSS class mapping
const HOUSE_CLASSES = {
    gryffindor: "house-gryffindor",
    slytherin:  "house-slytherin",
    ravenclaw:  "house-ravenclaw",
    hufflepuff: "house-hufflepuff",
};

// ──────────────────────────────────────────────
// Detect mobile for performance tuning
// ──────────────────────────────────────────────
const IS_MOBILE = window.innerWidth < 560;
const MAX_PARTICLES = IS_MOBILE ? 35 : 70;

class MagicalParticles {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.particles = [];
        this.mouse = { x: -9999, y: -9999 };
        this.raf = null;
        this.resize();
        this.seed();
        this.listen();
        this.loop();
    }

    resize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    seed() {
        this.particles = [];
        const count = Math.min(MAX_PARTICLES, Math.floor((this.canvas.width * this.canvas.height) / 16000));
        for (let i = 0; i < count; i++) this.particles.push(this.spawn());
    }

    spawn() {
        const colors = [
            "212,168,67",   // gold
            "240,208,96",   // bright gold
            "155,109,204",  // purple
            "110,68,160",   // deep purple
            "58,123,213",   // blue
            "255,255,255",  // white
        ];
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            r: Math.random() * 2.2 + 0.4,
            c: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.25 - 0.12,   // slight antigravity
            a:  Math.random() * 0.55 + 0.15,
            ad: Math.random() > 0.5 ? 0.003 : -0.003,
            p:  Math.random() * 6.28,
        };
    }

    listen() {
        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { this.resize(); this.seed(); }, 200);
        });
        if (!IS_MOBILE) {
            window.addEventListener("mousemove", (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
        }
    }

    loop() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;
        ctx.clearRect(0, 0, W, H);

        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.p += 0.018;
            p.a += p.ad;
            if (p.a > 0.7 || p.a < 0.12) p.ad *= -1;

            // Mouse repulsion (desktop only)
            if (!IS_MOBILE) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < 110) {
                    const f = (110 - d) / 110;
                    p.x += (dx / d) * f * 0.7;
                    p.y += (dy / d) * f * 0.7;
                }
            }

            // Wrap
            if (p.x < -8) p.x = W + 8;
            if (p.x > W + 8) p.x = -8;
            if (p.y < -8) p.y = H + 8;
            if (p.y > H + 8) p.y = -8;

            const pr = p.r + Math.sin(p.p) * 0.4;

            // Particle dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, pr, 0, 6.28);
            ctx.fillStyle = `rgba(${p.c},${p.a})`;
            ctx.fill();

            // Soft glow (skip on mobile for perf)
            if (!IS_MOBILE) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, pr * 2.8, 0, 6.28);
                ctx.fillStyle = `rgba(${p.c},${p.a * 0.12})`;
                ctx.fill();
            }
        }

        this.raf = requestAnimationFrame(() => this.loop());
    }
}

function playMagicChime() {
    try {
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        const now = ac.currentTime;

        const o1 = ac.createOscillator();
        const g1 = ac.createGain();
        o1.type = "sine";
        o1.frequency.setValueAtTime(880, now);
        o1.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
        g1.gain.setValueAtTime(0.12, now);
        g1.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        o1.connect(g1).connect(ac.destination);
        o1.start(); o1.stop(now + 0.7);

        const o2 = ac.createOscillator();
        const g2 = ac.createGain();
        o2.type = "triangle";
        o2.frequency.setValueAtTime(1760, now + 0.1);
        o2.frequency.exponentialRampToValueAtTime(2640, now + 0.25);
        g2.gain.setValueAtTime(0.05, now + 0.1);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        o2.connect(g2).connect(ac.destination);
        o2.start(now + 0.1); o2.stop(now + 0.9);
    } catch (_) { /* silent fallback */ }
}


document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("particleCanvas");
    if (canvas) new MagicalParticles(canvas);

    if (document.body.classList.contains("dashboard-page")) {
        initDashboard();
    } else {
        initLogin();
    }
});

// ──────────────────────────────────────────────
// LOGIN
// ──────────────────────────────────────────────
function initLogin() {
    const card       = document.getElementById("loginCard");
    const form       = document.getElementById("loginForm");
    const errorMsg   = document.getElementById("errorMsg");
    const transition = document.getElementById("pageTransition");

    // GSAP entrance
    if (typeof gsap !== "undefined") {
        gsap.set(card, { opacity: 0, y: 30, scale: 0.96 });
        gsap.set(".footer-text", { opacity: 0, y: 16 });

        gsap.timeline({ delay: 0.25 })
            .to(card, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" })
            .to(".footer-text", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.35");

        // Antigravity float
        gsap.to(card, {
            y: IS_MOBILE ? -5 : -8,
            duration: 3.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 1.2,
        });
    }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const tid   = document.getElementById("teamId").value.trim();
    const house = document.getElementById("houseName").value.trim();
    const room  = document.getElementById("roomNumber").value.trim();

    // 🔥 normalize function
    const normalize = (str) =>
        str.toLowerCase().replace(/[-\s]/g, ""); // remove - and spaces

    const match = TEAMS.find(
        (t) =>
            t.team_id.toLowerCase() === tid.toLowerCase() &&
            t.house_name.toLowerCase() === house.toLowerCase() &&
            normalize(t.location) === normalize(room) // 👈 FIX
    );

    if (match) {
        errorMsg.classList.remove("visible");
        playMagicChime();

        sessionStorage.setItem("wizard_team_id", match.team_id);
        sessionStorage.setItem("wizard_house_name", match.house_name);
        sessionStorage.setItem("wizard_room_number", match.location);

        transition.classList.add("active");
        if (typeof gsap !== "undefined") {
            gsap.to(card, { scale: 0.92, opacity: 0, duration: 0.45, ease: "power2.in" });
        }
        setTimeout(() => { window.location.href = "dashboard.html"; }, 750);
    } else {
        errorMsg.classList.add("visible");
        if (typeof gsap !== "undefined") {
            gsap.fromTo(card, { x: -5 }, { x: 0, duration: 0.35, ease: "elastic.out(1,0.3)" });
        }
        setTimeout(() => { errorMsg.classList.remove("visible"); }, 3500);
    }
});
}


function initDashboard() {
    const card       = document.getElementById("dashboardCard");
    const transition = document.getElementById("pageTransition");
    const signoutBtn = document.getElementById("signoutBtn");
    const badge      = document.getElementById("houseBadge");

    const teamId     = sessionStorage.getItem("wizard_team_id");
    const houseName  = sessionStorage.getItem("wizard_house_name");
    const roomNumber = sessionStorage.getItem("wizard_room_number");

    if (!teamId || !houseName || !roomNumber) {
        window.location.href = "index.html";
        return;
    }

    // Populate data
    document.getElementById("displayTeamId").textContent     = teamId;
    document.getElementById("displayHouseName").textContent   = houseName;
    document.getElementById("displayRoomNumber").textContent  = roomNumber;

    // House badge
    const houseKey = houseName.toLowerCase();
    if (HOUSE_CLASSES[houseKey]) {
        badge.className = "house-badge " + HOUSE_CLASSES[houseKey];
        badge.textContent = houseName;
    }

    // Dismiss loader
    setTimeout(() => { transition.classList.remove("active"); }, 550);

    // GSAP entrance
    if (typeof gsap !== "undefined") {
        gsap.set(card, { opacity: 0, y: 40, scale: 0.93 });
        gsap.to(card, { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out", delay: 0.7 });

        gsap.set(".info-card", { opacity: 0, y: 16 });
        gsap.to(".info-card", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.12, delay: 1.2 });

        gsap.set(".magical-quote", { opacity: 0 });
        gsap.to(".magical-quote", { opacity: 1, duration: 0.7, ease: "power2.out", delay: 1.8 });

        gsap.set(".magic-btn--purple", { opacity: 0, y: 8 });
        gsap.to(".magic-btn--purple", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", delay: 2.1 });

        // Float
        gsap.to(card, {
            y: IS_MOBILE ? -4 : -6,
            duration: 4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 2.2,
        });

        // Candles
        gsap.set(".candle", { opacity: 0, y: 20 });
        gsap.to(".candle", { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.1, delay: 0.9 });
    }

    // Sign out
    signoutBtn.addEventListener("click", () => {
        transition.classList.add("active");
        if (typeof gsap !== "undefined") {
            gsap.to(card, { scale: 0.92, opacity: 0, duration: 0.45, ease: "power2.in" });
        }
        setTimeout(() => {
            sessionStorage.clear();
            window.location.href = "index.html";
        }, 750);
    });
}
