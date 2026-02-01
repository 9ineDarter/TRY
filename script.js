// ============================================
// InfoDarts - Main Script
// ============================================

// State Management
const state = {
  today: new Date(),
  viewYear: null,
  viewMonth: null,
  currentTheme: localStorage.getItem('theme') || 'light',
  currentSection: 'calendario'
};

// Tournament Data
const torneos = [
  { titulo: "Czech Open (ET 11)", tipo: "pdc", fecha: "2025-09-05", hora: "13:00", enlace: "https://www.pdc.tv/tournament/gambrinus-czech-darts-open-et11" },
  { titulo: "Catalonia Open", tipo: "wdf", fecha: "2025-09-06", hora: "11:00", enlace: "https://www.dardscatalunya.cat/noticies/8/2126/live-scores-13th-catalonia-open-fcd-anniversary-2025" },
  { titulo: "Players Championship 26", tipo: "pdc", fecha: "2025-09-09", hora: "13:00", enlace: "https://www.pdc.tv/tournament/players-championship-26-3" },
  { titulo: "WSOD Finals", tipo: "pdc", fecha: "2025-09-12", hora: "19:00", enlace: "https://www.pdc.tv/tournament/jacks-casino-world-series-darts-finals-0" },
  { titulo: "Italian Open", tipo: "wdf", fecha: "2025-09-13", hora: "10:00", enlace: "https://dartswdf.com/competitions/italian-open/2025" }
];

// Utility Functions
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

// ============================================
// Theme Management
// ============================================
function initTheme() {
  // Apply saved theme
  document.documentElement.setAttribute('data-theme', state.currentTheme);
  updateThemeIcons();
  
  // Setup theme toggle buttons
  const themeToggles = $$('#themeToggle, #themeToggleHeader');
  themeToggles.forEach(btn => {
    btn?.addEventListener('click', toggleTheme);
  });
}

function toggleTheme() {
  state.currentTheme = state.currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.currentTheme);
  localStorage.setItem('theme', state.currentTheme);
  updateThemeIcons();
  
  // Add animation class
  document.body.style.transition = 'background 0.3s ease, color 0.3s ease';
}

function updateThemeIcons() {
  const icons = $$('.theme-icon');
  icons.forEach(icon => {
    icon.textContent = state.currentTheme === 'light' ? '🌙' : '☀️';
  });
}

// ============================================
// Menu & Navigation
// ============================================
function setupMenu() {
  const menuBtn = $('#menuToggle');
  const sidebar = $('#sidebar');
  const overlay = $('#overlay');
  const closeBtn = $('#sidebarClose');
  
  if (!menuBtn || !sidebar) return;
  
  // Toggle menu
  const toggleMenu = (show) => {
    sidebar.classList.toggle('show', show);
    overlay.classList.toggle('show', show);
    menuBtn.setAttribute('aria-expanded', String(show));
    document.body.style.overflow = show ? 'hidden' : '';
  };
  
  // Open menu
  menuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu(true);
  });
  
  // Close menu
  closeBtn?.addEventListener('click', () => toggleMenu(false));
  overlay?.addEventListener('click', () => toggleMenu(false));
  
  // Close on navigation
  $$('#sidebar a[data-section]').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(() => toggleMenu(false), 150);
    });
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('show')) {
      toggleMenu(false);
      menuBtn.focus();
    }
  });
}

// ============================================
// Section Routing
// ============================================
function setupSectionRouting() {
  const sections = $$('.section');
  if (!sections.length) return;
  
  function showSection(id) {
    state.currentSection = id;
    sections.forEach(section => {
      section.classList.toggle('active', section.id === id);
    });
    
    // Update URL hash without scrolling
    if (history.pushState) {
      history.pushState(null, null, `#${id}`);
    } else {
      location.hash = id;
    }
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Initial section
  const initialSection = location.hash ? location.hash.replace('#', '') : 'calendario';
  showSection(initialSection);
  
  // Handle hash changes
  window.addEventListener('hashchange', () => {
    const section = location.hash.replace('#', '') || 'calendario';
    showSection(section);
  });
  
  // Handle navigation clicks
  $$('#sidebar a[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      showSection(section);
    });
  });
}

// ============================================
// Calendar Functions
// ============================================
function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonthName(monthIndex) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[monthIndex];
}

function renderCalendar(year, month) {
  const monthYearEl = $('#monthYear');
  const grid = $('#calendarGrid');
  
  if (!grid || !monthYearEl) return;
  
  // Update header
  monthYearEl.textContent = `${getMonthName(month)} ${year}`;
  
  // Clear grid
  grid.innerHTML = '';
  
  // Calculate calendar data
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  
  // Calculate total cells needed
  const totalCells = startDay + daysInMonth;
  const rows = Math.ceil(totalCells / 7);
  const totalDays = rows * 7;
  
  // Generate calendar cells
  for (let i = 0; i < totalDays; i++) {
    const cell = document.createElement('div');
    cell.className = 'day';
    
    const dayNumber = i - startDay + 1;
    
    if (i < startDay) {
      // Previous month
      const prevDay = prevMonthDays - startDay + i + 1;
      cell.classList.add('other-month');
      cell.innerHTML = `<div class="num">${prevDay}</div>`;
    } else if (dayNumber > daysInMonth) {
      // Next month
      const nextDay = dayNumber - daysInMonth;
      cell.classList.add('other-month');
      cell.innerHTML = `<div class="num">${nextDay}</div>`;
    } else {
      // Current month
      const currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      const todayISO = formatDateISO(state.today);
      
      // Mark today
      if (currentDate === todayISO) {
        cell.classList.add('today');
      }
      
      cell.innerHTML = `<div class="num">${dayNumber}</div>`;
      
      // Add events for this date
      const events = torneos.filter(t => t.fecha === currentDate);
      events.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = `event ${event.tipo || ''}`;
        eventEl.textContent = `${event.titulo}${event.hora ? ` — ${event.hora}` : ''}`;
        eventEl.setAttribute('title', event.titulo);
        
        if (event.enlace) {
          eventEl.style.cursor = 'pointer';
          eventEl.addEventListener('click', () => {
            window.open(event.enlace, '_blank', 'noopener,noreferrer');
          });
        }
        
        cell.appendChild(eventEl);
      });
    }
    
    grid.appendChild(cell);
  }
}

function initCalendar() {
  const now = state.today;
  state.viewYear = now.getFullYear();
  state.viewMonth = now.getMonth();
  
  renderCalendar(state.viewYear, state.viewMonth);
  
  // Previous month button
  const prevBtn = $('#prevMonth');
  prevBtn?.addEventListener('click', () => {
    state.viewMonth -= 1;
    if (state.viewMonth < 0) {
      state.viewMonth = 11;
      state.viewYear -= 1;
    }
    renderCalendar(state.viewYear, state.viewMonth);
  });
  
  // Next month button
  const nextBtn = $('#nextMonth');
  nextBtn?.addEventListener('click', () => {
    state.viewMonth += 1;
    if (state.viewMonth > 11) {
      state.viewMonth = 0;
      state.viewYear += 1;
    }
    renderCalendar(state.viewYear, state.viewMonth);
  });
}

// ============================================
// Articles & Routines
// ============================================
async function loadAndRenderArticles() {
  const articlesContainer = $('#articles-list');
  const rutinasContainer = $('#rutinas-list');
  
  if (!articlesContainer && !rutinasContainer) return;
  
  try {
    const response = await fetch('articles.json');
    if (!response.ok) throw new Error('Failed to load articles');
    
    const data = await response.json();
    const articles = data.articles || [];
    const rutinas = data.rutinas || [];
    
    // Render articles
    if (articlesContainer) {
      articlesContainer.innerHTML = '';
      
      if (articles.length === 0) {
        articlesContainer.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">No hay artículos disponibles.</p>';
      } else {
        articles.forEach((article, index) => {
          const card = createArticleCard(article);
          articlesContainer.appendChild(card);
        });
      }
    }
    
    // Render routines
    if (rutinasContainer) {
      rutinasContainer.innerHTML = '';
      
      if (rutinas.length === 0) {
        rutinasContainer.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">No hay rutinas disponibles.</p>';
      } else {
        rutinas.forEach(rutina => {
          const card = createRoutineCard(rutina);
          rutinasContainer.appendChild(card);
        });
      }
    }
  } catch (error) {
    console.error('Error loading articles:', error);
    if (articlesContainer) {
      articlesContainer.innerHTML = '<p style="text-align:center;color:var(--danger);">Error al cargar los artículos.</p>';
    }
    if (rutinasContainer) {
      rutinasContainer.innerHTML = '<p style="text-align:center;color:var(--danger);">Error al cargar las rutinas.</p>';
    }
  }
}

function createArticleCard(article) {
  const card = document.createElement('article');
  card.className = 'article-container';
  
  const link = `articulo.html?docx=${encodeURIComponent(article.docx)}&title=${encodeURIComponent(article.title)}`;
  const image = article.image ? `<img src="${article.image}" alt="${article.title}" loading="lazy">` : '';
  
  card.innerHTML = `
    <a href="${link}">
      ${image}
      <h3>${article.title}</h3>
      <p>${article.summary || ''}</p>
    </a>
  `;
  
  return card;
}

function createRoutineCard(rutina) {
  const card = document.createElement('article');
  card.className = 'article-container';
  
  const link = `rutina.html?title=${encodeURIComponent(rutina.title)}&image=${encodeURIComponent(rutina.image)}`;
  const image = rutina.image ? `<img src="${rutina.image}" alt="${rutina.title}" loading="lazy">` : '';
  
  card.innerHTML = `
    <a href="${link}">
      ${image}
      <h3>${rutina.title}</h3>
      <p>${rutina.summary || ''}</p>
    </a>
  `;
  
  return card;
}

// ============================================
// Ranking (Excel)
// ============================================
function loadRankingIfNeeded() {
  const rankingContainer = $('#ranking-list');
  if (!rankingContainer) return;
  
  // Check if XLSX library is available
  if (typeof XLSX === 'undefined') {
    // Try to load it
    const script = document.createElement('script');
    script.src = 'scripts/xlsx.full.min.js';
    script.onload = () => renderRanking();
    script.onerror = () => {
      rankingContainer.innerHTML = '<p style="text-align:center;color:var(--danger);">Error al cargar la biblioteca de Excel.</p>';
    };
    document.head.appendChild(script);
  } else {
    renderRanking();
  }
}

async function renderRanking() {
  const rankingContainer = $('#ranking-list');
  if (!rankingContainer) return;
  
  try {
    const response = await fetch('ranking_dardos_pdc_desde.xlsx');
    if (!response.ok) throw new Error('Failed to load ranking');
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    if (data.length === 0) {
      rankingContainer.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">No hay datos de ranking disponibles.</p>';
      return;
    }
    
    // Create table
    const table = document.createElement('table');
    table.className = 'ranking-table';
    
    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>#</th>
        <th>Jugador</th>
        <th>Puntos</th>
        <th>PDC desde</th>
        <th>Top 64</th>
      </tr>
    `;
    table.appendChild(thead);
    
    // Table body
    const tbody = document.createElement('tbody');
    data.forEach(player => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${player['Posición'] || '-'}</strong></td>
        <td>${player['Jugador'] || '-'}</td>
        <td>${player['Puntos'] || '-'}</td>
        <td>${player['PDC desde'] || '-'}</td>
        <td>${player['Top 64'] === '✅' ? '✅' : ''}</td>
      `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    rankingContainer.innerHTML = '';
    rankingContainer.appendChild(table);
    
  } catch (error) {
    console.error('Error loading ranking:', error);
    rankingContainer.innerHTML = '<p style="text-align:center;color:var(--danger);">Error al cargar el ranking.</p>';
  }
}

// ============================================
// Ads Consent & Loading
// ============================================
function showConsentBanner() {
  if (localStorage.getItem('ads_consent')) return;
  
  const banner = document.createElement('div');
  banner.className = 'consent-banner';
  banner.innerHTML = `
    <p>Usamos cookies para mejorar la experiencia y mostrar anuncios. ¿Aceptas anuncios personalizados?</p>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-primary consent-accept">Aceptar</button>
      <button class="btn consent-deny">Rechazar</button>
    </div>
  `;
  
  document.body.appendChild(banner);
  
  $('.consent-accept', banner)?.addEventListener('click', () => {
    localStorage.setItem('ads_consent', 'yes');
    banner.remove();
    loadAdsIfAllowed();
  });
  
  $('.consent-deny', banner)?.addEventListener('click', () => {
    localStorage.setItem('ads_consent', 'no');
    banner.remove();
  });
}

function loadAdsIfAllowed() {
  const consent = localStorage.getItem('ads_consent');
  if (consent !== 'yes') return;
  
  // Load AdSense script if not already loaded
  if (!window.adsByGoogleInjected) {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-REPLACE_ME';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
    window.adsByGoogleInjected = true;
  }
  
  // Initialize ad slots
  $$('.ad-slot[data-ad-slot]').forEach(slot => {
    if (slot.dataset.rendered) return;
    
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', 'ca-pub-REPLACE_ME');
    ins.setAttribute('data-ad-slot', slot.dataset.adSlot || '0000000000');
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    
    slot.appendChild(ins);
    
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.warn('AdSense error:', error);
    }
    
    slot.dataset.rendered = '1';
  });
}

// ============================================
// Initialization
// ============================================
function init() {
  console.log('🎯 InfoDarts initialized');
  
  // Initialize all modules
  initTheme();
  setupMenu();
  setupSectionRouting();
  initCalendar();
  loadAndRenderArticles();
  loadRankingIfNeeded();
  
  // Handle ads consent
  if (!localStorage.getItem('ads_consent')) {
    showConsentBanner();
  } else {
    loadAdsIfAllowed();
  }
  
  // Add loaded class for animations
  document.body.classList.add('loaded');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
