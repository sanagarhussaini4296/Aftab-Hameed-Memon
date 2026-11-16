/**
 * Prof. Dr. Aftab Hameed Memon - Academic Portfolio JS Engine
 * Section-by-Section Tab View & Publications Sub-Menu Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSectionTabs();
  initAnimatedCounters();
  initResearchSubtabs();
  initPublications();
  initBibtexModal();
  initContactForm();
  initBackToTop();
});

/* ----------------------------------------------------
   1. Theme Management (Light / Dark Mode)
   ---------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    if (theme === 'dark') {
      themeIcon.className = 'fas fa-sun';
      themeIcon.title = 'Switch to Light Mode';
    } else {
      themeIcon.className = 'fas fa-moon';
      themeIcon.title = 'Switch to Dark Mode';
    }
  }
}

/* ----------------------------------------------------
   2. Section-by-Section Tab Switching Architecture
   ---------------------------------------------------- */
function initSectionTabs() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  // Mobile menu toggle
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
  }

  // Bind all elements with [data-tab-target]
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-tab-target]');
    if (trigger) {
      e.preventDefault();
      const targetTab = trigger.getAttribute('data-tab-target');
      switchMainTab(targetTab);

      // Close mobile drawer if open
      if (navLinks && navLinks.classList.contains('mobile-open')) {
        navLinks.classList.remove('mobile-open');
        if (mobileToggle) {
          const icon = mobileToggle.querySelector('i');
          if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
          }
        }
      }
    }
  });

  // Handle URL Hash on initial page load
  const initialHash = window.location.hash ? window.location.hash.replace('#', '') : 'home';
  switchMainTab(initialHash, false);

  // Handle browser Back / Forward buttons
  window.addEventListener('hashchange', () => {
    const currentHash = window.location.hash ? window.location.hash.replace('#', '') : 'home';
    switchMainTab(currentHash, false);
  });
}

window.switchMainTab = function(targetId, updateHash = true) {
  if (!targetId) targetId = 'home';
  const cleanId = targetId.replace('#', '').replace('-view', '');
  const sectionId = `${cleanId}-view`;
  const targetSection = document.getElementById(sectionId);

  if (!targetSection) {
    const homeSection = document.getElementById('home-view');
    if (homeSection) homeSection.classList.add('active-view');
    return;
  }

  // Deactivate all sections
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.remove('active-view');
  });

  // Activate target section
  targetSection.classList.add('active-view');

  // Update active state on navigation buttons
  document.querySelectorAll('[data-tab-target]').forEach(link => {
    const tabTarget = link.getAttribute('data-tab-target');
    if (tabTarget === cleanId) {
      link.classList.add('active-tab');
    } else {
      link.classList.remove('active-tab');
    }
  });

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update URL hash
  if (updateHash && window.history.pushState) {
    window.history.pushState(null, null, `#${cleanId}`);
  }

  // Refresh publications when opening Publications tab
  if (cleanId === 'publications') {
    renderAllPublicationSections();
  }
};

/* ----------------------------------------------------
   3. Animated Metric Numbers
   ---------------------------------------------------- */
function initAnimatedCounters() {
  const counterElements = document.querySelectorAll('.counter-val');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counterElements.forEach(el => {
          const target = parseInt(el.getAttribute('data-target'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          animateNumber(el, target, suffix, 1800);
        });
      }
    });
  }, { threshold: 0.2 });

  const metricsSection = document.getElementById('metrics');
  if (metricsSection) {
    observer.observe(metricsSection);
  }
}

function animateNumber(element, target, suffix, duration) {
  let startTimestamp = null;
  const start = 0;
  
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(easeProgress * (target - start) + start);
    
    element.textContent = current.toLocaleString() + suffix;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = target.toLocaleString() + suffix;
    }
  };
  
  window.requestAnimationFrame(step);
}

/* ----------------------------------------------------
   3.5. Research 3 Sub-Sections (Thrusts, Grants, Awards)
   ---------------------------------------------------- */
function initResearchSubtabs() {
  const subtabButtons = document.querySelectorAll('[data-research-tab]');
  subtabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSubtab = btn.getAttribute('data-research-tab');
      switchResearchSubtab(targetSubtab);
    });
  });
}

function switchResearchSubtab(subtabId) {
  // Update button active state
  document.querySelectorAll('[data-research-tab]').forEach(btn => {
    if (btn.getAttribute('data-research-tab') === subtabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Show target subview, hide others
  document.querySelectorAll('.research-subview').forEach(view => {
    if (view.id === `research-subview-${subtabId}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });
}

/* ----------------------------------------------------
   4. Publications 4 Sub-Menus & Yearwise Rendering Architecture
   ---------------------------------------------------- */
let currentJournalCategory = 'all';
let currentJournalSearch = '';
let currentJournalYear = 'all';

let currentConfSearch = '';
let currentConfYear = 'all';

function initPublications() {
  if (typeof publicationsData === 'undefined') return;

  // Bind 4 Sub-Menu Tabs (Journals, Conferences, Books, Chapters)
  const subtabButtons = document.querySelectorAll('[data-pub-tab]');
  subtabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSubtab = btn.getAttribute('data-pub-tab');
      switchPublicationSubtab(targetSubtab);
    });
  });

  // Journal Category Filter Buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentJournalCategory = btn.getAttribute('data-filter');
      renderJournals();
    });
  });

  // Journal Search Input
  const journalSearchInput = document.getElementById('pubSearchInput');
  if (journalSearchInput) {
    journalSearchInput.addEventListener('input', (e) => {
      currentJournalSearch = e.target.value.toLowerCase().trim();
      renderJournals();
    });
  }

  // Conference Search Input
  const confSearchInput = document.getElementById('confSearchInput');
  if (confSearchInput) {
    confSearchInput.addEventListener('input', (e) => {
      currentConfSearch = e.target.value.toLowerCase().trim();
      renderConferences();
    });
  }

  renderAllPublicationSections();
}

function switchPublicationSubtab(subtabId) {
  // Update button active state
  document.querySelectorAll('[data-pub-tab]').forEach(btn => {
    if (btn.getAttribute('data-pub-tab') === subtabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Show target subview, hide others
  document.querySelectorAll('.pub-subview').forEach(view => {
    if (view.id === `pub-subview-${subtabId}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });
}

function renderAllPublicationSections() {
  renderJournals();
  renderConferences();
  renderBooks();
  renderChapters();
}

/* --- Sub-section 1: Journal Publications (Grouped Yearwise + Graphical Columns) --- */
function renderJournals() {
  const container = document.getElementById('publicationsList');
  const pillsContainer = document.getElementById('journalYearPills');
  if (!container || !publicationsData.journals) return;

  const allJournals = publicationsData.journals;

  // 1. Compute all unique years and counts for graphical column summary
  const yearCounts = {};
  allJournals.forEach(pub => {
    yearCounts[pub.year] = (yearCounts[pub.year] || 0) + 1;
  });
  // Chronological ascending order (earliest to latest) for trajectory column graphic
  const sortedYearsAsc = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
  const maxCount = Math.max(...Object.values(yearCounts));
  const peakYear = sortedYearsAsc.slice().sort((a, b) => yearCounts[b] - yearCounts[a])[0];
  const hasActive = currentJournalYear !== 'all';

  // Render Graphical Year-Wise Columns Chart
  if (pillsContainer) {
    pillsContainer.innerHTML = `
      <div class="pub-chart-card">
        <div class="pub-chart-header">
          <div class="pub-chart-title-area">
            <div class="pub-chart-title">
              <i class="fas fa-chart-column"></i>
              <span>Year-Wise Journal Publication Distribution</span>
            </div>
            <p class="pub-chart-subtitle">
              Graphical summary of <strong>${allJournals.length}</strong> peer-reviewed articles across ${sortedYearsAsc.length} years • Peak Output: <strong>${maxCount} Articles in ${peakYear}</strong>
            </p>
          </div>

          <div class="pub-chart-actions">
            ${hasActive ? `
              <span class="pub-chart-filter-tag">
                <i class="fas fa-filter"></i> Year: <strong>${currentJournalYear}</strong> (${yearCounts[currentJournalYear]} ${yearCounts[currentJournalYear] === 1 ? 'Article' : 'Articles'})
              </span>
            ` : ''}
            <button class="pub-chart-all-btn ${!hasActive ? 'active' : ''}" onclick="filterJournalYear('all')" title="View all publication years">
              <i class="fas fa-layer-group"></i> All Years (${allJournals.length})
            </button>
          </div>
        </div>

        <!-- Interactive Graphical Columns -->
        <div class="pub-chart-scroll-box">
          <div class="pub-chart-columns-container ${hasActive ? 'has-active' : ''}">
            ${sortedYearsAsc.map(yr => {
              const count = yearCounts[yr];
              const heightPct = Math.max(14, Math.round((count / maxCount) * 100));
              const isActive = currentJournalYear === String(yr);
              return `
                <div class="pub-column-item ${isActive ? 'active' : ''}" 
                     onclick="toggleJournalYearFilter('${yr}')"
                     title="Year ${yr}: ${count} ${count === 1 ? 'Journal Article' : 'Journal Articles'} (Click to filter or toggle)"
                     tabindex="0" role="button" aria-label="Year ${yr}: ${count} articles">
                  <span class="pub-column-count">${count}</span>
                  <div class="pub-column-track">
                    <div class="pub-column-bar" style="height: ${heightPct}%;"></div>
                  </div>
                  <span class="pub-column-year">${yr}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 2. Filter journals according to category, search, and year
  let filtered = allJournals.filter(pub => {
    const matchesCategory = currentJournalCategory === 'all' || pub.category === currentJournalCategory;
    const matchesYear = currentJournalYear === 'all' || String(pub.year) === currentJournalYear;
    const matchesSearch = !currentJournalSearch ||
      pub.title.toLowerCase().includes(currentJournalSearch) ||
      pub.authors.toLowerCase().includes(currentJournalSearch) ||
      pub.journal.toLowerCase().includes(currentJournalSearch) ||
      (pub.metricsRaw && pub.metricsRaw.toLowerCase().includes(currentJournalSearch)) ||
      String(pub.year).includes(currentJournalSearch);

    return matchesCategory && matchesYear && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search" style="font-size: 2.2rem; color: var(--text-muted); margin-bottom: 0.75rem;"></i>
        <p>No journal articles found matching your selected filters.</p>
        <button class="btn btn-outline" style="margin-top: 1rem;" onclick="resetJournalFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  // 3. Group filtered journals by Year (descending)
  const groupedByYear = {};
  filtered.forEach(pub => {
    if (!groupedByYear[pub.year]) groupedByYear[pub.year] = [];
    groupedByYear[pub.year].push(pub);
  });
  const filteredYears = Object.keys(groupedByYear).map(Number).sort((a, b) => b - a);

  container.innerHTML = filteredYears.map(year => {
    const pubsInYear = groupedByYear[year];
    return `
      <div class="pub-year-group" id="journal-year-${year}">
        <div class="pub-year-header">
          <span class="pub-year-badge"><i class="far fa-calendar-check"></i> ${year}</span>
          <span class="pub-year-count-label">${pubsInYear.length} ${pubsInYear.length === 1 ? 'Peer-Reviewed Article' : 'Peer-Reviewed Articles'}</span>
          <span class="pub-year-line"></span>
        </div>

        <div class="pub-year-cards">
          ${pubsInYear.map(pub => `
            <article class="pub-card" id="${pub.id}">
              <div class="pub-header-row">
                <h3 class="pub-card-title">${escapeHtml(pub.title)}</h3>
              </div>

              ${pub.badges && pub.badges.length > 0 ? `
                <div class="pub-badges-list">
                  ${pub.badges.map(b => `<span class="metric-tag ${b.type}">${escapeHtml(b.text)}</span>`).join('')}
                </div>
              ` : ''}

              <div class="pub-authors">
                <i class="fas fa-user-friends" style="font-size: 0.8rem; margin-right: 0.35rem; color: var(--accent-gold);"></i>
                ${highlightAuthor(pub.authors)}
              </div>

              <div class="pub-meta">
                <span class="pub-journal"><i class="fas fa-book-open" style="margin-right: 0.35rem;"></i>${escapeHtml(pub.journal)}</span>
                <span>•</span>
                <span class="pub-year"><i class="far fa-calendar-alt" style="margin-right: 0.35rem;"></i>${pub.year}</span>
                ${pub.url ? `<span>•</span> <a href="${pub.url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-gold); font-weight: 600;"><i class="fas fa-external-link-alt" style="font-size: 0.75rem;"></i> Publisher / DOI</a>` : ''}
              </div>

              <div class="pub-actions">
                <button class="pub-btn" onclick="openBibtexModal('${pub.id}')">
                  <i class="fas fa-quote-left"></i> Cite (BibTeX)
                </button>
                ${pub.url ? `
                  <a class="pub-btn" href="${pub.url}" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-file-pdf"></i> Read Article / DOI
                  </a>
                ` : ''}
                <a class="pub-btn" href="https://scholar.google.com/scholar?q=${encodeURIComponent(pub.title)}" target="_blank" rel="noopener noreferrer">
                  <i class="fab fa-google"></i> Google Scholar
                </a>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

window.toggleJournalYearFilter = function(year) {
  if (currentJournalYear === String(year)) {
    currentJournalYear = 'all';
  } else {
    currentJournalYear = String(year);
  }
  renderJournals();
};

window.filterJournalYear = function(year) {
  currentJournalYear = String(year);
  renderJournals();
};

/* --- Sub-section 2: Conference Publications (Grouped Yearwise + Graphical Columns) --- */
function renderConferences() {
  const container = document.getElementById('conferencesList');
  const pillsContainer = document.getElementById('confYearPills');
  if (!container || !publicationsData.conferences) return;

  const allConfs = publicationsData.conferences;

  // 1. Compute all unique years and counts for graphical column summary
  const yearCounts = {};
  allConfs.forEach(conf => {
    yearCounts[conf.year] = (yearCounts[conf.year] || 0) + 1;
  });
  const sortedYearsAsc = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
  const maxCount = Math.max(...Object.values(yearCounts));
  const peakYear = sortedYearsAsc.slice().sort((a, b) => yearCounts[b] - yearCounts[a])[0];
  const hasActive = currentConfYear !== 'all';

  // Render Graphical Year-Wise Columns Chart for Conferences
  if (pillsContainer) {
    pillsContainer.innerHTML = `
      <div class="pub-chart-card">
        <div class="pub-chart-header">
          <div class="pub-chart-title-area">
            <div class="pub-chart-title">
              <i class="fas fa-chart-column"></i>
              <span>Year-Wise Conference Proceedings Distribution</span>
            </div>
            <p class="pub-chart-subtitle">
              Graphical summary of <strong>${allConfs.length}</strong> conference papers across ${sortedYearsAsc.length} years • Peak Output: <strong>${maxCount} Papers in ${peakYear}</strong>
            </p>
          </div>

          <div class="pub-chart-actions">
            ${hasActive ? `
              <span class="pub-chart-filter-tag">
                <i class="fas fa-filter"></i> Year: <strong>${currentConfYear}</strong> (${yearCounts[currentConfYear]} ${yearCounts[currentConfYear] === 1 ? 'Paper' : 'Papers'})
              </span>
            ` : ''}
            <button class="pub-chart-all-btn ${!hasActive ? 'active' : ''}" onclick="filterConfYear('all')" title="View all conference years">
              <i class="fas fa-layer-group"></i> All Years (${allConfs.length})
            </button>
          </div>
        </div>

        <!-- Interactive Graphical Columns -->
        <div class="pub-chart-scroll-box">
          <div class="pub-chart-columns-container ${hasActive ? 'has-active' : ''}">
            ${sortedYearsAsc.map(yr => {
              const count = yearCounts[yr];
              const heightPct = Math.max(16, Math.round((count / maxCount) * 100));
              const isActive = currentConfYear === String(yr);
              return `
                <div class="pub-column-item ${isActive ? 'active' : ''}" 
                     onclick="toggleConfYearFilter('${yr}')"
                     title="Year ${yr}: ${count} ${count === 1 ? 'Conference Paper' : 'Conference Papers'} (Click to filter or toggle)"
                     tabindex="0" role="button" aria-label="Year ${yr}: ${count} papers">
                  <span class="pub-column-count">${count}</span>
                  <div class="pub-column-track">
                    <div class="pub-column-bar" style="height: ${heightPct}%;"></div>
                  </div>
                  <span class="pub-column-year">${yr}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 2. Filter conferences
  let filtered = allConfs.filter(conf => {
    const matchesYear = currentConfYear === 'all' || String(conf.year) === currentConfYear;
    const matchesSearch = !currentConfSearch ||
      conf.title.toLowerCase().includes(currentConfSearch) ||
      conf.conference.toLowerCase().includes(currentConfSearch) ||
      conf.authors.toLowerCase().includes(currentConfSearch) ||
      (conf.metricsRaw && conf.metricsRaw.toLowerCase().includes(currentConfSearch)) ||
      String(conf.year).includes(currentConfSearch);

    return matchesYear && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search" style="font-size: 2.2rem; color: var(--text-muted); margin-bottom: 0.75rem;"></i>
        <p>No conference proceedings found matching your search.</p>
        <button class="btn btn-outline" style="margin-top: 1rem;" onclick="resetConfFilters()">Reset Filter</button>
      </div>
    `;
    return;
  }

  // 3. Group by Year (descending)
  const groupedByYear = {};
  filtered.forEach(conf => {
    if (!groupedByYear[conf.year]) groupedByYear[conf.year] = [];
    groupedByYear[conf.year].push(conf);
  });
  const filteredYears = Object.keys(groupedByYear).map(Number).sort((a, b) => b - a);

  container.innerHTML = filteredYears.map(year => {
    const confsInYear = groupedByYear[year];
    return `
      <div class="pub-year-group" id="conf-year-${year}">
        <div class="pub-year-header">
          <span class="pub-year-badge"><i class="far fa-calendar-check"></i> ${year}</span>
          <span class="pub-year-count-label">${confsInYear.length} ${confsInYear.length === 1 ? 'Conference Paper' : 'Conference Papers'}</span>
          <span class="pub-year-line"></span>
        </div>

        <div class="pub-year-cards">
          ${confsInYear.map(conf => `
            <article class="pub-card" id="${conf.id}">
              <div class="pub-header-row">
                <h3 class="pub-card-title">${escapeHtml(conf.title)}</h3>
              </div>

              ${conf.badges && conf.badges.length > 0 ? `
                <div class="pub-badges-list">
                  ${conf.badges.map(b => `<span class="metric-tag ${b.type}">${escapeHtml(b.text)}</span>`).join('')}
                </div>
              ` : ''}

              <div class="pub-authors">
                <i class="fas fa-user-friends" style="font-size: 0.8rem; margin-right: 0.35rem; color: var(--accent-gold);"></i>
                ${highlightAuthor(conf.authors)}
              </div>

              <div class="pub-meta">
                <span class="pub-journal"><i class="fas fa-map-marker-alt" style="margin-right: 0.35rem;"></i>${escapeHtml(conf.conference)}</span>
                <span>•</span>
                <span class="pub-year"><i class="far fa-calendar-alt" style="margin-right: 0.35rem;"></i>${conf.year}</span>
                ${conf.url ? `<span>•</span> <a href="${conf.url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-gold); font-weight: 600;"><i class="fas fa-external-link-alt" style="font-size: 0.75rem;"></i> Proceedings Link</a>` : ''}
              </div>

              <div class="pub-actions">
                <button class="pub-btn" onclick="openBibtexModal('${conf.id}')">
                  <i class="fas fa-quote-left"></i> Cite (BibTeX)
                </button>
                ${conf.url ? `
                  <a class="pub-btn" href="${conf.url}" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-file-pdf"></i> View Paper
                  </a>
                ` : ''}
                <a class="pub-btn" href="https://scholar.google.com/scholar?q=${encodeURIComponent(conf.title)}" target="_blank" rel="noopener noreferrer">
                  <i class="fab fa-google"></i> Google Scholar
                </a>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

window.toggleConfYearFilter = function(year) {
  if (currentConfYear === String(year)) {
    currentConfYear = 'all';
  } else {
    currentConfYear = String(year);
  }
  renderConferences();
};

window.filterConfYear = function(year) {
  currentConfYear = String(year);
  renderConferences();
};

window.resetConfFilters = function() {
  currentConfYear = 'all';
  currentConfSearch = '';
  const searchInput = document.getElementById('confSearchInput');
  if (searchInput) searchInput.value = '';
  renderConferences();
};

/* --- Sub-section 3: Books & Monographs --- */
function renderBooks() {
  const container = document.getElementById('booksList');
  if (!container || !publicationsData.books) return;

  container.innerHTML = publicationsData.books.map(book => `
    <div class="book-card" id="${book.id}">
      <div class="book-cover-wrap">
        ${book.coverImage ? `
          <img src="${book.coverImage}" alt="${escapeHtml(book.title)}" class="book-cover-img">
        ` : `
          <div class="book-cover-mock">
            <i class="fas fa-book-reader"></i>
            <span>${escapeHtml(book.publisher.split('/')[0])}</span>
          </div>
        `}
      </div>

      <div class="book-details">
        <h3 class="book-title">${escapeHtml(book.title)}</h3>
        ${book.subtitle ? `
          <div style="font-size: 0.95rem; font-weight: 600; color: var(--accent-gold); margin-bottom: 0.5rem; line-height: 1.4;">
            ${escapeHtml(book.subtitle)}
          </div>
        ` : ''}

        <div class="book-meta-bar">
          <span><i class="fas fa-user-edit" style="color: var(--accent-gold);"></i> ${highlightAuthor(book.authors, "Aftab Hameed Memon")}</span>
          <span>•</span>
          <span><i class="fas fa-landmark"></i> ${escapeHtml(book.publisher)}</span>
          <span>•</span>
          <span><i class="far fa-calendar-alt"></i> ${book.year}</span>
          <span>•</span>
          <span><i class="fas fa-barcode"></i> ISBN: ${book.isbn}</span>
        </div>

        <p class="book-synopsis">${escapeHtml(book.synopsis)}</p>

        <div class="pub-actions">
          ${book.link ? `
            <a class="pub-btn" href="${book.link}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-gold); font-weight: 700; border-color: var(--border-gold);">
              <i class="fas fa-external-link-alt"></i> ${book.id === 'book-1' ? 'View on Amazon' : 'View at Publisher (UTHM)'}
            </a>
          ` : ''}
          <button class="pub-btn" onclick="openBibtexModal('${book.id}')">
            <i class="fas fa-quote-left"></i> Cite Book (BibTeX)
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/* --- Sub-section 4: Book Chapters & Technical Reports --- */
function renderChapters() {
  const container = document.getElementById('chaptersList');
  if (!container || !publicationsData.chapters) return;

  container.innerHTML = publicationsData.chapters.map(chap => `
    <article class="pub-card" id="${chap.id}">
      <div class="pub-header-row">
        <h3 class="pub-card-title">${escapeHtml(chap.title)}</h3>
        <span class="pub-citations-badge"><i class="fas fa-bookmark"></i> ${chap.id.startsWith('chap') && chap.doi.includes('TR') ? 'Technical Report' : 'Book Chapter'}</span>
      </div>

      <div class="pub-authors">
        <i class="fas fa-user-friends" style="font-size: 0.8rem; margin-right: 0.35rem; color: var(--accent-gold);"></i>
        ${highlightAuthor(chap.authors, "A. H. Memon")}
      </div>

      <div class="pub-meta">
        <span class="pub-journal"><i class="fas fa-book" style="margin-right: 0.35rem;"></i>${escapeHtml(chap.bookTitle)}</span>
        <span>•</span>
        <span><i class="fas fa-building"></i> ${escapeHtml(chap.publisher)}</span>
        <span>•</span>
        <span class="pub-year"><i class="far fa-calendar-alt"></i> ${chap.year}</span>
        ${chap.doi ? `<span>•</span> <span style="color: var(--accent-gold);">${escapeHtml(chap.doi)}</span>` : ''}
      </div>

      <div class="pub-abstract open">
        <strong>Synopsis:</strong> ${escapeHtml(chap.synopsis)}
      </div>

      <div class="pub-actions">
        <button class="pub-btn" onclick="openBibtexModal('${chap.id}')">
          <i class="fas fa-quote-left"></i> Cite (BibTeX)
        </button>
      </div>
    </article>
  `).join('');
}

function highlightAuthor(authorsString, authorName) {
  if (!authorsString) return '';
  let safe = escapeHtml(authorsString);
  if (authorName) {
    return safe.replace(new RegExp(escapeHtml(authorName), 'gi'), `<strong class="pub-author-self">$&</strong>`);
  }
  return safe.replace(/(Memon,\s*A\.\s*H\.|A\.\s*H\.\s*Memon|Memon,\s*A\.H\.|Aftab\s+Hameed\s+Memon|Memon,\s*Aftab\s+Hameed)/gi, '<strong class="pub-author-self">$1</strong>');
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.toggleAbstract = function(pubId) {
  const el = document.getElementById(`abstract-${pubId}`);
  if (el) {
    el.classList.toggle('open');
  }
};

window.resetJournalFilters = function() {
  currentJournalCategory = 'all';
  currentJournalSearch = '';
  currentJournalYear = 'all';
  const searchInput = document.getElementById('pubSearchInput');
  if (searchInput) searchInput.value = '';
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
  });
  renderJournals();
};

/* ----------------------------------------------------
   5. BibTeX Citation Modal
   ---------------------------------------------------- */
let currentBibtex = '';

function initBibtexModal() {
  const modalOverlay = document.getElementById('bibtexModal');
  const closeBtn = document.getElementById('bibtexCloseBtn');
  const copyBtn = document.getElementById('bibtexCopyBtn');

  if (closeBtn && modalOverlay) {
    closeBtn.addEventListener('click', closeBibtexModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeBibtexModal();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!currentBibtex) return;
      navigator.clipboard.writeText(currentBibtex).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied to Clipboard!';
        copyBtn.style.background = '#10b981';
        copyBtn.style.color = '#ffffff';
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.background = '';
          copyBtn.style.color = '';
        }, 2200);
      });
    });
  }
}

window.openBibtexModal = function(pubId) {
  if (!publicationsData) return;

  // Search across all 4 publication arrays
  const allPubs = [
    ...(publicationsData.journals || []),
    ...(publicationsData.conferences || []),
    ...(publicationsData.books || []),
    ...(publicationsData.chapters || [])
  ];

  const pub = allPubs.find(p => p.id === pubId);
  if (!pub) return;

  const modalOverlay = document.getElementById('bibtexModal');
  const codeBox = document.getElementById('bibtexCodeBox');
  const titleBox = document.getElementById('bibtexPubTitle');

  currentBibtex = pub.bibtex;
  if (codeBox) codeBox.textContent = pub.bibtex;
  if (titleBox) titleBox.textContent = pub.title;

  if (modalOverlay) modalOverlay.classList.add('open');
};

function closeBibtexModal() {
  const modalOverlay = document.getElementById('bibtexModal');
  if (modalOverlay) modalOverlay.classList.remove('open');
}

/* ----------------------------------------------------
   6. Contact Form Simulation & Mailto Fallback
   ---------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('senderName').value;
      const email = document.getElementById('senderEmail').value;
      const subject = document.getElementById('senderSubject').value;
      const message = document.getElementById('senderMessage').value;

      if (!name || !email || !message) {
        alert('Please fill in all required fields.');
        return;
      }

      if (status) {
        status.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid #10b981; padding: 1rem; border-radius: 8px; color: #10b981;">
            <strong><i class="fas fa-check-circle"></i> Thank you, ${escapeHtml(name)}!</strong><br>
            Your inquiry has been formulated. You can also send this directly via your email client to 
            <a href="mailto:aftab@quest.edu.pk?subject=${encodeURIComponent(subject || 'Academic Inquiry')}&body=${encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message)}" style="text-decoration: underline; color: #10b981; font-weight: 700;">
              aftab@quest.edu.pk
            </a>.
          </div>
        `;
        status.classList.add('success');
      }

      form.reset();
    });
  }
}

/* ----------------------------------------------------
   7. Back to Top Button
   ---------------------------------------------------- */
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
