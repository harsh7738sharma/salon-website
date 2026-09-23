const fs = require('fs');
const path = require('path');

const htmlDir = path.join(__dirname, 'stitch', 'html');
const files = [
  { file: 'salon_discovery.html', id: 'explore', label: 'Explore', icon: 'explore' },
  { file: 'service_menu.html', id: 'services', label: 'Services', icon: 'spa' },
  { file: 'stylist_profile.html', id: 'stylist', label: 'Stylists', icon: 'person' },
  { file: 'booking_flow.html', id: 'booking', label: 'Book Now', icon: 'calendar_today' },
  { file: 'salon_manager_dashboard.html', id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { file: 'business_insights.html', id: 'insights', label: 'Insights', icon: 'payments' },
];

function extractBody(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return '';
  let c = bodyMatch[1];
  // Strip fixed headers, sidebars, bottom navs
  c = c.replace(/<header[^>]*class="[^"]*fixed[^"]*"[^>]*>[\s\S]*?<\/header>/gi, '');
  c = c.replace(/<nav[^>]*class="[^"]*fixed[^"]*"[^>]*>[\s\S]*?<\/nav>/gi, '');
  c = c.replace(/<nav[^>]*class="[^"]*hidden md:flex[^"]*"[^>]*>[\s\S]*?<\/nav>/gi, '');
  c = c.replace(/<aside[^>]*class="[^"]*hidden[^"]*"[^>]*>[\s\S]*?<\/aside>/gi, '');
  c = c.replace(/<aside[^>]*class="[^"]*fixed[^"]*"[^>]*>[\s\S]*?<\/aside>/gi, '');
  // Fix padding that assumed fixed navs
  c = c.replace(/pb-24/g, 'pb-4');
  c = c.replace(/md:pb-0/g, '');
  c = c.replace(/md:pl-72/g, '');
  c = c.replace(/md:ml-72/g, '');
  c = c.replace(/pt-24/g, 'pt-2');
  c = c.replace(/pt-28/g, 'pt-2');
  c = c.replace(/pt-20/g, 'pt-2');
  // Reduce excessive gaps/padding
  c = c.replace(/gap-8/g, 'gap-5');
  c = c.replace(/mb-12/g, 'mb-6');
  c = c.replace(/mb-8/g, 'mb-5');
  c = c.replace(/p-8/g, 'p-5');
  c = c.replace(/py-8/g, 'py-5');
  // Reduce hero image height on stylist profile
  c = c.replace(/h-\[442px\]/g, 'h-[320px]');
  c = c.replace(/h-\[530px\]/g, 'h-[380px]');
  c = c.replace(/h-\[400px\]/g, 'h-[300px]');
  c = c.replace(/min-h-\[300px\]/g, 'min-h-[240px]');

  // Indian Localization Replacements
  const localizations = [
    [/Elena Rostova/g, 'Ananya Sharma'],
    [/Elena Rossi/g, 'Anjali Sharma'],
    [/Elena/g, 'Ananya'],
    [/Julian Vance/g, 'Aarav Malhotra'],
    [/Julian/g, 'Aarav'],
    [/Sarah Chen/g, 'Riya Sen'],
    [/Sarah/g, 'Riya'],
    [/Marcus/g, 'Rohan'],
    [/David/g, 'Vikram'],
    [/Jessica W\./g, 'Jyoti W.'],
    [/Michael K\./g, 'Manish K.'],
    [/Amanda L\./g, 'Amanda L. (Asha)'],
    [/Eleanor Vance/g, 'Esha Verma'],
    [/London/g, 'Mumbai'],
    [/New York/g, 'New Delhi'],
    [/The Style Room/g, 'The Style Room'],
    [/2mi away/g, '2 km away'],
    [/2 mi away/g, '2 km away'],
    [/4mi away/g, '4 km away'],
    [/4 mi away/g, '4 km away'],
    [/1mi away/g, '1 km away'],
    [/1 mi away/g, '1 km away'],
    [/3mi away/g, '3 km away'],
    [/3 mi away/g, '3 km away'],
    [/\$120/g, '₹1,200'],
    [/\$280/g, '₹2,800'],
    [/\$150/g, '₹1,500'],
    [/\$110/g, '₹1,100'],
    [/\$65/g, '₹650'],
    [/\$85/g, '₹850'],
    [/\$320/g, '₹3,200'],
    [/\$380/g, '₹3,800'],
    [/\$145/g, '₹1,450'],
    [/\$185\.00/g, '₹1,850.00'],
    [/\$185/g, '₹1,850'],
    [/\$4,250\.00/g, '₹42,500.00'],
    [/\$4,250/g, '₹42,500'],
    [/\$/g, '₹'] // fallback
  ];

  for (const [pattern, replacement] of localizations) {
    c = c.replace(pattern, replacement);
  }

  return c.trim();
}

let sections = '';
for (const f of files) {
  const html = fs.readFileSync(path.join(htmlDir, f.file), 'utf-8');
  const body = extractBody(html);
  sections += `
<section id="${f.id}" class="page-section ${f.id === 'explore' ? '' : 'hidden'}">
  <div class="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
    ${body}
  </div>
</section>`;
}

const navLinks = files.map(f =>
  `<a href="#${f.id}" onclick="showSection('${f.id}')" class="nav-link flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-on-surface-variant dark:text-dark-text-secondary hover:bg-primary/10 dark:hover:bg-dark-primary/15 hover:text-primary dark:hover:text-dark-primary transition-all duration-200 text-sm" data-section="${f.id}">
    <span class="material-symbols-outlined text-lg">${f.icon}</span>
    <span>${f.label}</span>
  </a>`
).join('\n');

const mobileNav = files.slice(0, 5).map(f =>
  `<a href="#${f.id}" onclick="showSection('${f.id}')" class="nav-link flex flex-col items-center gap-0.5 text-on-surface-variant dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary transition-all active:scale-90 duration-200 py-1" data-section="${f.id}">
    <span class="material-symbols-outlined text-xl">${f.icon}</span>
    <span class="text-[9px] font-semibold tracking-wide">${f.label}</span>
  </a>`
).join('\n');

const finalHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
  <title>The Style Salon - Premium Salon & Wellness</title>
  <meta name="description" content="The Style Salon - Premium salon services, master stylists, and true tranquility."/>
  <link href="https://fonts.googleapis.com" rel="preconnect"/>
  <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <script>
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            /* ── Light Mode (Sage/Warm) ── */
            "primary": "#43664c", "primary-container": "#7ba083",
            "on-primary": "#ffffff", "on-primary-container": "#143620",
            "secondary": "#695c53", "secondary-container": "#efdcd1",
            "on-secondary": "#ffffff", "on-secondary-container": "#6d6057",
            "tertiary": "#805159", "tertiary-container": "#c08991",
            "on-tertiary": "#ffffff", "on-tertiary-container": "#4b242b",
            "surface": "#f8f9ff", "surface-container": "#e6eeff",
            "surface-container-low": "#eff4ff", "surface-container-lowest": "#ffffff",
            "surface-container-high": "#dee9fc", "surface-container-highest": "#d9e3f6",
            "surface-variant": "#d9e3f6", "surface-dim": "#d0dbed",
            "on-surface": "#121c2a", "on-surface-variant": "#424842",
            "background": "#f8f9ff", "on-background": "#121c2a",
            "outline": "#727972", "outline-variant": "#c2c8c0",
            "error": "#ba1a1a", "error-container": "#ffdad6",
            "on-error": "#ffffff", "on-error-container": "#93000a",
            "inverse-surface": "#27313f", "inverse-on-surface": "#eaf1ff",
            "inverse-primary": "#a9d0b1", "surface-tint": "#43664c",
            "primary-fixed": "#c5eccc", "primary-fixed-dim": "#a9d0b1",
            "secondary-fixed": "#f1dfd4", "secondary-fixed-dim": "#d5c3b8",
            "tertiary-fixed": "#ffd9de", "tertiary-fixed-dim": "#f3b7bf",
            "on-primary-fixed": "#00210e", "on-primary-fixed-variant": "#2c4e36",
            "on-secondary-fixed": "#231a13", "on-secondary-fixed-variant": "#50443c",
            "on-tertiary-fixed": "#321017", "on-tertiary-fixed-variant": "#663a42",

            /* ── Dark Mode (Midnight Teal/Amber) ── */
            "dark-bg": "#0f1419",
            "dark-surface": "#161b22",
            "dark-surface-raised": "#1c2128",
            "dark-surface-overlay": "#252c35",
            "dark-border": "#2d333b",
            "dark-border-light": "#3d444d",
            "dark-text": "#e6edf3",
            "dark-text-secondary": "#8b949e",
            "dark-text-muted": "#6e7681",
            "dark-primary": "#56d399",
            "dark-primary-dim": "#3fb882",
            "dark-primary-container": "#1a3a2a",
            "dark-secondary": "#f0b866",
            "dark-secondary-container": "#3d2e14",
            "dark-tertiary": "#e78fa3",
            "dark-tertiary-container": "#3d1f27",
            "dark-accent": "#79c0ff",
            "dark-error": "#f97583",
            "dark-success": "#56d399",
          },
          borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px", "2xl": "1rem", "3xl": "1.5rem" },
          spacing: { unit: "8px", gutter: "1.5rem", "bento-gap": "0.75rem", "container-padding": "1.5rem", safe: "env(safe-area-inset-bottom, 16px)" },
          fontFamily: {
            "headline-lg": ["Plus Jakarta Sans"], "body-md": ["Inter"], "label-sm": ["Inter"],
            "headline-lg-mobile": ["Plus Jakarta Sans"], "display-lg": ["Plus Jakarta Sans"],
            "body-lg": ["Inter"], "headline-md": ["Plus Jakarta Sans"]
          },
          fontSize: {
            "headline-lg": ["30px", { lineHeight: "1.2", fontWeight: "400" }],
            "body-md": ["15px", { lineHeight: "1.5", fontWeight: "400" }],
            "label-sm": ["11px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" }],
            "headline-lg-mobile": ["22px", { lineHeight: "1.2", fontWeight: "400" }],
            "display-lg": ["42px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "300" }],
            "body-lg": ["17px", { lineHeight: "1.6", fontWeight: "300" }],
            "headline-md": ["18px", { lineHeight: "1.4", fontWeight: "500" }]
          }
        }
      }
    }
  </script>
  <style>
    :root { --transition-speed: 0.3s; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    .filled-icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    body { -webkit-tap-highlight-color: transparent; transition: background-color var(--transition-speed), color var(--transition-speed); }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    /* ── Light Glass ── */
    .glass-panel { background: rgba(255,255,255,0.45); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 4px 24px rgba(31,38,135,0.06); }
    .glass-subtle { background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.35); }
    .bento-card { background: rgba(255,255,255,0.45); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 4px 24px rgba(31,38,135,0.06); border-radius: 1rem; }
    .glass-card { background: #fff; border: 1px solid rgba(255,255,255,0.5); border-radius: 1rem; box-shadow: 0 4px 24px rgba(31,38,135,0.06); }

    /* ── Dark Glass ── */
    .dark .glass-panel { background: rgba(22,27,34,0.7); border-color: rgba(45,51,59,0.6); box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
    .dark .glass-subtle { background: rgba(22,27,34,0.4); border-color: rgba(45,51,59,0.4); }
    .dark .bento-card { background: rgba(22,27,34,0.65); border-color: rgba(45,51,59,0.5); box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
    .dark .glass-card { background: #1c2128; border-color: #2d333b; box-shadow: 0 4px 24px rgba(0,0,0,0.3); }

    /* ── Dark Mode Body/Text ── */
    .dark body, .dark { background-color: #0f1419 !important; color: #e6edf3 !important; }
    .dark .bg-background, .dark .bg-surface { background-color: #0f1419 !important; }
    .dark .bg-surface-container-lowest { background-color: #161b22 !important; }
    .dark .text-on-surface, .dark .text-on-background, .dark .text-on-surface-variant { color: #e6edf3 !important; }
    .dark .text-primary { color: #56d399 !important; }
    .dark .text-secondary { color: #f0b866 !important; }
    .dark .text-tertiary { color: #e78fa3 !important; }
    .dark .text-outline, .dark .text-outline-variant { color: #6e7681 !important; }
    .dark .bg-primary { background-color: #56d399 !important; color: #0f1419 !important; }
    .dark .bg-primary-container { background-color: #1a3a2a !important; }
    .dark .text-on-primary-container { color: #56d399 !important; }
    .dark .bg-secondary-container { background-color: #3d2e14 !important; }
    .dark .text-on-secondary-container { color: #f0b866 !important; }
    .dark .bg-surface-container-high, .dark .bg-surface-container { background-color: #1c2128 !important; }
    .dark .bg-surface-container-low { background-color: #161b22 !important; }
    .dark .border-white\\/60, .dark .border-white\\/40 { border-color: #2d333b !important; }
    .dark .bg-white\\/40, .dark .bg-white\\/20 { background-color: rgba(255,255,255,0.05) !important; }
    .dark .text-error { color: #f97583 !important; }
    .dark img { filter: brightness(0.92); }

    /* ── Section Transitions ── */
    .page-section { animation: fadeSlide 0.35s ease-out; }
    .page-section.hidden { display: none; }
    @keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* ── Nav Active ── */
    .nav-link.active { background: rgba(67,102,76,0.12); color: #43664c; font-weight: 600; }
    .nav-link.active .material-symbols-outlined { font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
    .dark .nav-link.active { background: rgba(86,211,153,0.12); color: #56d399; }

    /* ── Toggle Switch ── */
    .theme-toggle { position: relative; width: 52px; height: 28px; border-radius: 14px; background: #d0dbed; border: none; cursor: pointer; transition: background var(--transition-speed); padding: 0; }
    .theme-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.15); transition: transform var(--transition-speed), background var(--transition-speed); display: flex; align-items: center; justify-content: center; }
    .dark .theme-toggle { background: #2d333b; }
    .dark .theme-toggle::after { transform: translateX(24px); background: #56d399; }
    .theme-toggle-icons { position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 6px; pointer-events: none; font-size: 14px; }

    /* ── Decorative Blobs ── */
    .blob-1 { position: fixed; top: -15%; left: -10%; width: 45%; height: 45%; border-radius: 50%; background: #c5eccc; opacity: 0.15; filter: blur(90px); pointer-events: none; z-index: -1; transition: opacity var(--transition-speed); }
    .blob-2 { position: fixed; bottom: -15%; right: -10%; width: 50%; height: 50%; border-radius: 50%; background: #ffd9de; opacity: 0.12; filter: blur(100px); pointer-events: none; z-index: -1; transition: opacity var(--transition-speed); }
    .dark .blob-1 { background: #56d399; opacity: 0.04; }
    .dark .blob-2 { background: #f0b866; opacity: 0.03; }

    /* ── Compact Sparkline ── */
    .sparkline { fill: none; stroke: #7ba083; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
    .dark .sparkline { stroke: #56d399; }

    @media (max-width: 768px) { .desktop-sidebar { display: none !important; } }
  </style>
</head>
<body class="text-on-background antialiased min-h-screen font-body-md text-body-md bg-background overflow-x-hidden">
  <div class="blob-1"></div>
  <div class="blob-2"></div>

  <!-- ── Header ── -->
  <header class="fixed top-0 w-full z-50 bg-surface/75 dark:bg-dark-surface/80 backdrop-blur-xl border-b border-white/40 dark:border-dark-border shadow-sm transition-colors duration-300">
    <div class="flex justify-between items-center px-4 md:px-6 py-2.5 max-w-[1600px] mx-auto">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary dark:text-dark-primary text-xl filled-icon">spa</span>
        <h1 class="font-headline-md text-[17px] text-primary dark:text-dark-primary tracking-tight font-semibold">The Style Salon</h1>
      </div>
      <div class="flex items-center gap-3">
        <!-- Dark Mode Toggle -->
        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">
          <div class="theme-toggle-icons">
            <span class="text-amber-500">☀️</span>
            <span class="text-indigo-300">🌙</span>
          </div>
        </button>
        <button onclick="document.getElementById('mobile-menu').classList.toggle('hidden')" class="md:hidden w-9 h-9 flex items-center justify-center text-primary dark:text-dark-primary rounded-full hover:bg-primary/10 dark:hover:bg-dark-primary/10 transition-colors">
          <span class="material-symbols-outlined text-xl">menu</span>
        </button>
        <div class="w-9 h-9 rounded-full overflow-hidden border border-white/50 dark:border-dark-border shadow-sm">
          <img alt="Profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNSBHA6oBna8mdYWKzoxNz5I8D9vitO1D2v0phiD4nPUbLsjHxRoQPoOFgExYLvCuL0SVR6c5gPrlnvBRczVGx3DeEZ1sQeQb3WVAdhNSF7ipzlyLtap9KJfzAcBYnPJAdAtM6-TfstJk2tLFfLOIFVe_rsDJ6TyVuDPr-eMSXFKNABo5PAOUvdnVmfhoqvJcd0PG-puwOjq6SRd2OlpdaXx5TpSu6182LACNxc6DTpbvR2JzlBxwQlQ"/>
        </div>
      </div>
    </div>
    <!-- Mobile Menu -->
    <div id="mobile-menu" class="hidden md:hidden bg-surface/90 dark:bg-dark-surface/95 backdrop-blur-xl border-t border-white/30 dark:border-dark-border px-3 py-2">
      <div class="grid grid-cols-3 gap-1.5">
        ${files.map(f => `<a href="#${f.id}" onclick="showSection('${f.id}');document.getElementById('mobile-menu').classList.add('hidden')" class="nav-link flex flex-col items-center gap-1 p-2 rounded-lg text-on-surface-variant dark:text-dark-text-secondary text-center text-xs" data-section="${f.id}">
          <span class="material-symbols-outlined text-base">${f.icon}</span>
          <span>${f.label}</span>
        </a>`).join('\n')}
      </div>
    </div>
  </header>

  <!-- ── Desktop Sidebar ── -->
  <nav class="desktop-sidebar hidden md:flex flex-col gap-1 p-3 bg-surface/50 dark:bg-dark-surface/60 backdrop-blur-2xl border-r border-white/40 dark:border-dark-border h-screen w-56 fixed left-0 top-0 z-40 pt-14 transition-colors duration-300">
    <div class="flex items-center gap-2.5 p-3 mb-2 mt-2">
      <div class="w-9 h-9 rounded-full overflow-hidden border border-white/50 dark:border-dark-border shadow-sm flex-shrink-0">
        <img alt="Manager" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKPMnWcqMqVqK-Z8H7CuRCsapAayIAQXrcwTxf1FviPH8M4DoOKWPrQrz5cwPyyB1OKOYkOGVpnbaxc_SQxoNm_tXI_TzwG9q0NFgIroOFBaNwjODvbhmQylL7uqgO4ZJ8yCtunzQm_dCNK62lja71wg7FTN3kMTp1wLo8sNcCGPG-ryAKSxMEnJUuGhhbLtZ-0UtguzxHrDph-J7IwfUr2z3Dk6q3azcOgQ6KD-vAjsp7fTUKb67dtg"/>
      </div>
      <div class="min-w-0">
        <h2 class="text-sm text-primary dark:text-dark-primary font-semibold truncate">Salon Manager</h2>
        <p class="text-[10px] text-on-surface-variant dark:text-dark-text-muted truncate">The Style Salon</p>
      </div>
    </div>
    <div class="flex flex-col gap-0.5 flex-1 overflow-y-auto hide-scrollbar">
      ${navLinks}
    </div>
  </nav>

  <!-- ── Main Content ── -->
  <main class="md:ml-56 pt-14 pb-16 md:pb-2 min-h-screen transition-colors duration-300">
    ${sections}
  </main>

  <!-- ── Mobile Bottom Nav ── -->
  <nav class="md:hidden fixed bottom-0 w-full z-50 bg-surface/75 dark:bg-dark-surface/85 backdrop-blur-xl border-t border-white/40 dark:border-dark-border transition-colors duration-300">
    <div class="flex justify-around items-center py-1.5 px-1">
      ${mobileNav}
    </div>
  </nav>

  <script>
    /* ── Theme Toggle ── */
    const toggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.classList.add('dark');
    }
    toggle.addEventListener('click', () => {
      html.classList.toggle('dark');
      localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });

    /* ── Section Navigation ── */
    let currentSection = 'explore';
    function showSection(id) {
      document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
      const target = document.getElementById(id);
      if (target) { target.classList.remove('hidden'); target.style.animation = 'none'; target.offsetHeight; target.style.animation = ''; }
      document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.section === id));
      currentSection = id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    showSection('explore');
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), finalHTML, 'utf-8');
console.log('Done! index.html: ' + (finalHTML.length / 1024).toFixed(1) + ' KB');
