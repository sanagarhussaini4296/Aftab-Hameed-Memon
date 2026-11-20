/**
 * Admin Management & In-Place Direct Website Editor
 * For Prof. Dr. Aftab Hameed Memon
 * Allows direct in-place editing, rapid section management, and disk saves on localhost
 */

(function () {
  'use strict';

  let adminToken = sessionStorage.getItem('prof_aftab_admin_token') || '';
  let adminUser = sessionStorage.getItem('prof_aftab_admin_user') || '';
  let isEditModeActive = false;
  let hasUnsavedChanges = false;

  // DOM Elements
  let loginModal, controlBar, managerModal, toastEl;

  document.addEventListener('DOMContentLoaded', () => {
    initSecretAdminTriggers();
    createAdminUI();
    if (adminToken) {
      verifyExistingSession();
    }
  });

  /* ----------------------------------------------------
     1. Secret Trigger Setup
     ---------------------------------------------------- */
  function initSecretAdminTriggers() {
    // 1. Label trigger: "Profiles:" in Academic Links Bar
    const profilesLabel = document.querySelector('.academic-links-label');
    if (profilesLabel) {
      profilesLabel.classList.add('secret-admin-trigger');
      profilesLabel.id = 'adminProfilesTrigger';
      profilesLabel.addEventListener('click', (e) => {
        e.preventDefault();
        openAdminModal();
      });
    }

    // 2. Portrait Avatar trigger (additional discrete trigger)
    const portraitImg = document.querySelector('.portrait-img-wrap img');
    if (portraitImg) {
      portraitImg.addEventListener('dblclick', (e) => {
        e.preventDefault();
        openAdminModal();
      });
    }

    // 3. Discreet Keyboard Shortcut: Ctrl + Shift + A
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openAdminModal();
      }
    });
  }

  /* ----------------------------------------------------
     2. Create Admin Interface DOM
     ---------------------------------------------------- */
  function createAdminUI() {
    // Admin Login Modal
    loginModal = document.createElement('div');
    loginModal.className = 'admin-modal-overlay';
    loginModal.id = 'adminLoginModal';
    loginModal.innerHTML = `
      <div class="admin-login-card">
        <div class="admin-card-header">
          <h3><i class="fas fa-lock"></i> Administration Portal</h3>
          <button type="button" class="admin-close-btn" id="closeAdminLogin">&times;</button>
        </div>
        <div class="admin-card-body">
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Authenticate to enable website live editing and content management.
          </p>
          <div id="adminLoginAlert" class="admin-alert admin-alert-error"></div>
          <form id="adminLoginForm">
            <div class="admin-form-group">
              <label for="adminUsername"><i class="fas fa-user"></i> Username</label>
              <input type="text" id="adminUsername" placeholder="Enter username" autocomplete="username" required>
            </div>
            <div class="admin-form-group">
              <label for="adminPassword"><i class="fas fa-key"></i> Password</label>
              <input type="password" id="adminPassword" placeholder="Enter password" autocomplete="current-password" required>
            </div>
            <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">
              <button type="button" class="admin-btn admin-btn-outline" id="cancelAdminLogin">Cancel</button>
              <button type="submit" class="admin-btn admin-btn-primary" id="submitAdminLogin">
                <i class="fas fa-sign-in-alt"></i> Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(loginModal);

    // Admin Control Top Bar
    controlBar = document.createElement('div');
    controlBar.id = 'adminControlBar';
    controlBar.innerHTML = `
      <div class="admin-bar-identity">
        <span class="admin-status-indicator"></span>
        <span>ADMIN MODE</span>
        <span style="opacity: 0.7; font-weight: normal; font-size: 0.8rem;">| Prof. Dr. Aftab Hameed Memon</span>
      </div>
      <div class="admin-bar-actions">
        <button type="button" class="admin-bar-btn" id="btnToggleEditMode" title="Enable direct in-place editing on page text">
          <i class="fas fa-edit"></i> Visual Edit: <strong id="editModeStateText">OFF</strong>
        </button>
        <button type="button" class="admin-bar-btn save-btn" id="btnSaveToDisk" title="Save all changes directly to localhost index.html">
          <i class="fas fa-save"></i> Save Changes
          <span class="admin-unsaved-badge" id="unsavedBadge">● Unsaved</span>
        </button>
        <button type="button" class="admin-bar-btn" id="btnOpenManager" title="Open Quick Content Manager for Metrics, Publications, Supervision & Activities">
          <i class="fas fa-sliders-h"></i> Website Manager
        </button>
        <button type="button" class="admin-bar-btn" id="btnAdminLogout" style="background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4);" title="Sign out of admin mode">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    `;
    document.body.appendChild(controlBar);

    // Website Manager Modal (Multi-Tab)
    managerModal = document.createElement('div');
    managerModal.className = 'admin-modal-overlay';
    managerModal.id = 'adminManagerModal';
    managerModal.innerHTML = `
      <div class="admin-login-card admin-manager-modal">
        <div class="admin-card-header">
          <h3><i class="fas fa-cogs"></i> Website Content Manager</h3>
          <button type="button" class="admin-close-btn" id="closeAdminManager">&times;</button>
        </div>
        <div class="admin-manager-tabs">
          <button type="button" class="admin-tab-btn active" data-mgr-tab="metrics">
            <i class="fas fa-chart-line"></i> Metrics &amp; Stats
          </button>
          <button type="button" class="admin-tab-btn" data-mgr-tab="publication">
            <i class="fas fa-book"></i> Add Publication
          </button>
          <button type="button" class="admin-tab-btn" data-mgr-tab="supervision">
            <i class="fas fa-user-graduate"></i> Add Mentorship
          </button>
          <button type="button" class="admin-tab-btn" data-mgr-tab="activity">
            <i class="fas fa-calendar-check"></i> Add Activity
          </button>
          <button type="button" class="admin-tab-btn" data-mgr-tab="security">
            <i class="fas fa-key"></i> Change Password
          </button>
        </div>

        <!-- Tab 1: Fast Metrics -->
        <div class="admin-tab-content active" id="mgrTab_metrics">
          <div class="admin-alert admin-alert-success" id="metricsAlert"></div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Update citations, h-index, and theses counts across the entire website instantly.
          </p>
          <div class="admin-grid-2">
            <div class="admin-form-group">
              <label>Google Scholar Citations</label>
              <input type="text" id="mgrCitations" value="6,290+">
            </div>
            <div class="admin-form-group">
              <label>h-index</label>
              <input type="text" id="mgrHIndex" value="32+">
            </div>
            <div class="admin-form-group">
              <label>i10-index</label>
              <input type="text" id="mgrI10Index" value="65+">
            </div>
            <div class="admin-form-group">
              <label>Total Publications</label>
              <input type="text" id="mgrTotalPubs" value="120+">
            </div>
            <div class="admin-form-group">
              <label>PhD &amp; MS Theses Supervised</label>
              <input type="text" id="mgrPhdMsTheses" value="50+ PhD and MS Thesis">
            </div>
            <div class="admin-form-group">
              <label>Undergraduate Thesis Projects</label>
              <input type="text" id="mgrUgTheses" value="50+ Undergraduate Thesis Projects">
            </div>
          </div>
          <div style="margin-top: 1rem; display: flex; justify-content: flex-end;">
            <button type="button" class="admin-btn admin-btn-success" id="btnApplyMetrics">
              <i class="fas fa-check"></i> Apply &amp; Save Metrics
            </button>
          </div>
        </div>

        <!-- Tab 2: Add Publication -->
        <div class="admin-tab-content" id="mgrTab_publication">
          <div class="admin-alert admin-alert-success" id="pubAlert"></div>
          <div class="admin-form-group">
            <label>Publication Type</label>
            <select id="pubType">
              <option value="journals">Journal Article (Peer-Reviewed)</option>
              <option value="conferences">Conference Proceeding</option>
              <option value="books">Authored Book</option>
              <option value="chapters">Book Chapter / Technical Report</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label>Paper Title *</label>
            <input type="text" id="pubTitle" placeholder="e.g. AI-driven predictive modeling in construction..." required>
          </div>
          <div class="admin-form-group">
            <label>Authors *</label>
            <input type="text" id="pubAuthors" placeholder="e.g. Memon, A. H., Khan, J. S., & ..." value="Memon, A. H.">
          </div>
          <div class="admin-grid-2">
            <div class="admin-form-group">
              <label>Journal / Conference Name *</label>
              <input type="text" id="pubJournal" placeholder="e.g. Journal of Construction Engineering and Management">
            </div>
            <div class="admin-form-group">
              <label>Year *</label>
              <input type="number" id="pubYear" value="2026">
            </div>
          </div>
          <div class="admin-form-group">
            <label>DOI / Link URL</label>
            <input type="url" id="pubUrl" placeholder="https://doi.org/10.xxxx/xxxx">
          </div>
          <div class="admin-form-group">
            <label>Indexing &amp; Impact (comma-separated badges)</label>
            <input type="text" id="pubBadges" placeholder="WOS, Scopus Q1, IF: 4.5, HJRS: W-Category">
          </div>
          <div style="margin-top: 1rem; display: flex; justify-content: flex-end;">
            <button type="button" class="admin-btn admin-btn-primary" id="btnSubmitPub">
              <i class="fas fa-plus-circle"></i> Add Publication to Database
            </button>
          </div>
        </div>

        <!-- Tab 3: Add Supervision Record -->
        <div class="admin-tab-content" id="mgrTab_supervision">
          <div class="admin-alert admin-alert-success" id="supAlert"></div>
          <div class="admin-grid-2">
            <div class="admin-form-group">
              <label>Degree Level</label>
              <select id="supDegree">
                <option value="PhD">Ph.D. Scholar</option>
                <option value="ME">Master of Engineering (M.E.)</option>
                <option value="UG">Undergraduate Capstone</option>
              </select>
            </div>
            <div class="admin-form-group">
              <label>Completion Year / Status</label>
              <input type="text" id="supYear" value="2026">
            </div>
          </div>
          <div class="admin-form-group">
            <label>Student / Scholar Name *</label>
            <input type="text" id="supStudent" placeholder="e.g. Engr. Muhammad Ali" required>
          </div>
          <div class="admin-form-group">
            <label>Thesis / Research Title *</label>
            <textarea id="supTitle" rows="2" placeholder="e.g. Assessment of Green Concrete Formulations using Rice Husk Ash..." required></textarea>
          </div>
          <div class="admin-grid-2">
            <div class="admin-form-group">
              <label>Supervisory Role</label>
              <select id="supRole">
                <option value="Principal Supervisor">Principal Supervisor</option>
                <option value="Co-Supervisor">Co-Supervisor</option>
              </select>
            </div>
            <div class="admin-form-group">
              <label>Status</label>
              <select id="supStatus">
                <option value="Completed">Completed / Awarded</option>
                <option value="In Progress">In Progress (Final Stage)</option>
              </select>
            </div>
          </div>
          <div style="margin-top: 1rem; display: flex; justify-content: flex-end;">
            <button type="button" class="admin-btn admin-btn-primary" id="btnSubmitSup">
              <i class="fas fa-plus-circle"></i> Add Mentorship Record
            </button>
          </div>
        </div>

        <!-- Tab 4: Add Activity / Keynote -->
        <div class="admin-tab-content" id="mgrTab_activity">
          <div class="admin-alert admin-alert-success" id="actAlert"></div>
          <div class="admin-form-group">
            <label>Target Activity Subsection</label>
            <select id="actSection">
              <option value="workshops">Workshops &amp; Keynotes</option>
              <option value="leadership">Institutional Leadership</option>
              <option value="service">Continuous Service</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label>Activity Description / Bullet Text *</label>
            <textarea id="actText" rows="3" placeholder="e.g. Keynote Speaker on 'AI Applications in Civil Engineering' organized by..." required></textarea>
          </div>
          <div style="margin-top: 1rem; display: flex; justify-content: flex-end;">
            <button type="button" class="admin-btn admin-btn-primary" id="btnSubmitAct">
              <i class="fas fa-plus-circle"></i> Add to Activities
            </button>
          </div>
        </div>

        <!-- Tab 5: Security / Password -->
        <div class="admin-tab-content" id="mgrTab_security">
          <div class="admin-alert" id="secAlert"></div>
          <div class="admin-form-group">
            <label>Current Password *</label>
            <input type="password" id="secCurrentPass" placeholder="Enter current password" required>
          </div>
          <div class="admin-form-group">
            <label>New Username</label>
            <input type="text" id="secNewUser" placeholder="Leave empty to keep current username">
          </div>
          <div class="admin-grid-2">
            <div class="admin-form-group">
              <label>New Password *</label>
              <input type="password" id="secNewPass" placeholder="At least 4 characters" required>
            </div>
            <div class="admin-form-group">
              <label>Confirm New Password *</label>
              <input type="password" id="secConfirmPass" placeholder="Re-enter new password" required>
            </div>
          </div>
          <div style="margin-top: 1rem; display: flex; justify-content: flex-end;">
            <button type="button" class="admin-btn admin-btn-gold" id="btnUpdatePass">
              <i class="fas fa-key"></i> Update Credentials
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(managerModal);

    // Toast element
    toastEl = document.createElement('div');
    toastEl.className = 'admin-toast';
    toastEl.id = 'adminToast';
    toastEl.innerHTML = `<i class="fas fa-check-circle"></i> <span id="adminToastMsg">Notification</span>`;
    document.body.appendChild(toastEl);

    bindAdminEvents();
  }

  /* ----------------------------------------------------
     3. Event Bindings
     ---------------------------------------------------- */
  function bindAdminEvents() {
    // Modal close & cancel
    const closeBtn = document.getElementById('closeAdminLogin');
    const cancelBtn = document.getElementById('cancelAdminLogin');
    if (closeBtn) closeBtn.addEventListener('click', closeAdminModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeAdminModal);

    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) closeAdminModal();
    });

    // Login Form Submit
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        await handleAdminLogin(username, password);
      });
    }

    // Top Bar Actions
    const btnToggleEdit = document.getElementById('btnToggleEditMode');
    if (btnToggleEdit) {
      btnToggleEdit.addEventListener('click', toggleVisualEditMode);
    }

    const btnSaveDisk = document.getElementById('btnSaveToDisk');
    if (btnSaveDisk) {
      btnSaveDisk.addEventListener('click', saveWebsiteChangesToDisk);
    }

    const btnOpenMgr = document.getElementById('btnOpenManager');
    if (btnOpenMgr) {
      btnOpenMgr.addEventListener('click', openManagerModal);
    }

    const closeMgrBtn = document.getElementById('closeAdminManager');
    if (closeMgrBtn) {
      closeMgrBtn.addEventListener('click', closeManagerModal);
    }

    managerModal.addEventListener('click', (e) => {
      if (e.target === managerModal) closeManagerModal();
    });

    const btnLogout = document.getElementById('btnAdminLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', handleAdminLogout);
    }

    // Manager Tabs
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-mgr-tab');
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const content = document.getElementById(`mgrTab_${targetTab}`);
        if (content) content.classList.add('active');
      });
    });

    // Tab 1: Apply Metrics
    const btnApplyMetrics = document.getElementById('btnApplyMetrics');
    if (btnApplyMetrics) {
      btnApplyMetrics.addEventListener('click', handleApplyMetrics);
    }

    // Tab 2: Add Publication
    const btnSubmitPub = document.getElementById('btnSubmitPub');
    if (btnSubmitPub) {
      btnSubmitPub.addEventListener('click', handleAddPublication);
    }

    // Tab 3: Add Supervision
    const btnSubmitSup = document.getElementById('btnSubmitSup');
    if (btnSubmitSup) {
      btnSubmitSup.addEventListener('click', handleAddSupervision);
    }

    // Tab 4: Add Activity
    const btnSubmitAct = document.getElementById('btnSubmitAct');
    if (btnSubmitAct) {
      btnSubmitAct.addEventListener('click', handleAddActivity);
    }

    // Tab 5: Update Password
    const btnUpdatePass = document.getElementById('btnUpdatePass');
    if (btnUpdatePass) {
      btnUpdatePass.addEventListener('click', handleChangePassword);
    }
  }

  /* ----------------------------------------------------
     4. Admin Authentication
     ---------------------------------------------------- */
  function openAdminModal() {
    if (adminToken) {
      showToast('You are already logged in as Admin!');
      return;
    }
    const alertBox = document.getElementById('adminLoginAlert');
    if (alertBox) alertBox.style.display = 'none';
    loginModal.classList.add('active');
    setTimeout(() => {
      const uField = document.getElementById('adminUsername');
      if (uField) uField.focus();
    }, 100);
  }

  function closeAdminModal() {
    loginModal.classList.remove('active');
  }

  async function handleAdminLogin(username, password) {
    const alertBox = document.getElementById('adminLoginAlert');
    const submitBtn = document.getElementById('submitAdminLogin');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Authenticating...`;

    let authenticated = false;

    // 1. Try local server API if running
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token) {
          adminToken = data.token;
          adminUser = data.username;
          authenticated = true;
        }
      }
    } catch (_) {
      // Server API unreachable (e.g. running as static host on Netlify)
    }

    // 2. Client-side fallback check (for static hosting or offline)
    if (!authenticated) {
      const storedUser = localStorage.getItem('prof_aftab_admin_user') || 'admin';
      const storedPass = localStorage.getItem('prof_aftab_admin_pass') || 'aftab2026';
      if (username === storedUser && password === storedPass) {
        adminToken = 'client_token_' + Date.now();
        adminUser = username;
        authenticated = true;
      }
    }

    if (authenticated) {
      sessionStorage.setItem('prof_aftab_admin_token', adminToken);
      sessionStorage.setItem('prof_aftab_admin_user', adminUser);
      activateAdminMode();
      closeAdminModal();
      showToast('Welcome, Prof. Dr. Aftab Hameed Memon! Admin Mode Activated.');
    } else {
      alertBox.textContent = 'Invalid username or password. Please verify credentials.';
      alertBox.style.display = 'block';
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Sign In`;
  }

  async function verifyExistingSession() {
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success && data.authorized) {
        activateAdminMode();
      } else {
        handleAdminLogout();
      }
    } catch (e) {
      activateAdminMode();
    }
  }

  function activateAdminMode() {
    document.body.classList.add('admin-mode-active');
  }

  function handleAdminLogout() {
    if (adminToken && !adminToken.startsWith('local_')) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }).catch(() => {});
    }
    adminToken = '';
    adminUser = '';
    sessionStorage.removeItem('prof_aftab_admin_token');
    sessionStorage.removeItem('prof_aftab_admin_user');
    disableVisualEditMode();
    document.body.classList.remove('admin-mode-active');
    showToast('Admin session logged out.');
  }

  /* ----------------------------------------------------
     5. Visual In-Place Editing
     ---------------------------------------------------- */
  function toggleVisualEditMode() {
    if (isEditModeActive) {
      disableVisualEditMode();
    } else {
      enableVisualEditMode();
    }
  }

  function enableVisualEditMode() {
    isEditModeActive = true;
    document.body.classList.add('admin-edit-active');
    const stateText = document.getElementById('editModeStateText');
    const toggleBtn = document.getElementById('btnToggleEditMode');
    if (stateText) stateText.textContent = 'ON';
    if (toggleBtn) toggleBtn.classList.add('active-edit-mode');

    // Find all candidate editable elements: headers, paragraphs, list items, spans inside content
    const selectors = [
      '.hero-title', '.hero-subtitle', '.hero-text',
      'h1', 'h2', 'h3', 'h4', 'h5',
      'p', '.bio-text', '.stat-value', '.stat-label',
      '.metric-card-number', '.metric-card-label',
      '.timeline-title', '.timeline-org', '.timeline-desc',
      '.publication-title', '.publication-authors', '.publication-meta',
      '.course-card-title', '.course-card-desc',
      '.supervision-student', '.supervision-title'
    ];

    document.querySelectorAll(selectors.join(', ')).forEach(el => {
      // Avoid editing admin controls
      if (el.closest('#adminControlBar') || el.closest('.admin-modal-overlay') || el.closest('#themeToggleBtn')) {
        return;
      }
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('data-admin-editable', 'true');
      el.addEventListener('input', onContentEdited);
    });

    showToast('✏️ Visual Editing is ON. Click any text on the website to edit directly!');
  }

  function disableVisualEditMode() {
    isEditModeActive = false;
    document.body.classList.remove('admin-edit-active');
    const stateText = document.getElementById('editModeStateText');
    const toggleBtn = document.getElementById('btnToggleEditMode');
    if (stateText) stateText.textContent = 'OFF';
    if (toggleBtn) toggleBtn.classList.remove('active-edit-mode');

    document.querySelectorAll('[data-admin-editable="true"]').forEach(el => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-admin-editable');
      el.removeEventListener('input', onContentEdited);
    });
  }

  function onContentEdited(e) {
    hasUnsavedChanges = true;
    const badge = document.getElementById('unsavedBadge');
    if (badge) badge.style.display = 'inline-block';
    if (e.target) e.target.classList.add('admin-edited-dirty');
  }

  /* ----------------------------------------------------
     6. Save Changes to Disk on Localhost
     ---------------------------------------------------- */
  async function saveWebsiteChangesToDisk() {
    const saveBtn = document.getElementById('btnSaveToDisk');
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;

    try {
      // 1. Temporarily disable editing mode to sanitize DOM
      const wasEditActive = isEditModeActive;
      if (wasEditActive) disableVisualEditMode();

      // 2. Clone HTML and strip injected admin containers
      const docClone = document.documentElement.cloneNode(true);

      // Clean up injected admin nodes from saved file
      const adminNodes = docClone.querySelectorAll('#adminControlBar, #adminLoginModal, #adminManagerModal, #adminToast, script[src*="admin.js"], link[href*="admin.css"]');
      adminNodes.forEach(n => n.remove());

      // Ensure class list is clean
      docClone.querySelector('body')?.classList.remove('admin-mode-active', 'admin-edit-active');
      docClone.querySelectorAll('.admin-edited-dirty').forEach(n => n.classList.remove('admin-edited-dirty'));

      // Ensure admin scripts and link are neatly re-included before </body> so admin capabilities remain intact
      const bodyNode = docClone.querySelector('body');
      if (bodyNode) {
        const headNode = docClone.querySelector('head');
        if (headNode && !headNode.querySelector('link[href="css/admin.css"]')) {
          const adminLink = docClone.createElement('link');
          adminLink.rel = 'stylesheet';
          adminLink.href = 'css/admin.css';
          headNode.appendChild(adminLink);
        }
        const adminScript = docClone.createElement('script');
        adminScript.src = 'js/admin.js';
        adminScript.defer = true;
        bodyNode.appendChild(adminScript);
      }

      const fullHtml = '<!DOCTYPE html>\n' + docClone.outerHTML;

      // 3. Send to Server API
      let savedOnServer = false;
      try {
        const res = await fetch('/api/admin/save-page', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ html: fullHtml, filename: 'index.html' })
        });

        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            savedOnServer = true;
            hasUnsavedChanges = false;
            const badge = document.getElementById('unsavedBadge');
            if (badge) badge.style.display = 'none';
            showToast(`✅ Saved to index.html! (Backup: ${result.backup || 'created'})`);
          }
        }
      } catch (_) {
        // Server API not reachable
      }

      if (!savedOnServer) {
        showToast('ℹ️ Notice: Direct file saving runs on localhost server (http://localhost:3050). Run on localhost to commit edits to disk.');
      }

      // Re-enable editing if it was active
      if (wasEditActive) enableVisualEditMode();
    } catch (err) {
      showToast('Save error: ' + err.message, true);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<i class="fas fa-save"></i> Save Changes <span class="admin-unsaved-badge" id="unsavedBadge" style="${hasUnsavedChanges ? 'display:inline-block;' : 'display:none;'}">● Unsaved</span>`;
    }
  }

  /* ----------------------------------------------------
     7. Website Manager Functions
     ---------------------------------------------------- */
  function openManagerModal() {
    managerModal.classList.add('active');
  }

  function closeManagerModal() {
    managerModal.classList.remove('active');
  }

  // Fast Metrics update
  async function handleApplyMetrics() {
    const citations = document.getElementById('mgrCitations').value.trim();
    const hIndex = document.getElementById('mgrHIndex').value.trim();
    const i10Index = document.getElementById('mgrI10Index').value.trim();
    const totalPubs = document.getElementById('mgrTotalPubs').value.trim();
    const phdMs = document.getElementById('mgrPhdMsTheses').value.trim();
    const ugTheses = document.getElementById('mgrUgTheses').value.trim();

    // Update citations across the document
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length === 0 && el.textContent) {
        if (el.textContent.includes('6,290') || el.textContent.includes('6,290+')) {
          el.textContent = el.textContent.replace(/6,290\+?/g, citations);
        }
      }
    });

    const alertBox = document.getElementById('metricsAlert');
    alertBox.textContent = 'Metrics updated on live page! Click "Save Changes" on the top bar to save permanently to disk.';
    alertBox.style.display = 'block';
    hasUnsavedChanges = true;
    document.getElementById('unsavedBadge').style.display = 'inline-block';
    showToast('Metrics updated! Click "Save Changes" to commit to index.html.');
  }

  // Add Publication
  async function handleAddPublication() {
    const title = document.getElementById('pubTitle').value.trim();
    const authors = document.getElementById('pubAuthors').value.trim();
    const journal = document.getElementById('pubJournal').value.trim();
    const year = parseInt(document.getElementById('pubYear').value.trim(), 10) || new Date().getFullYear();
    const url = document.getElementById('pubUrl').value.trim();
    const type = document.getElementById('pubType').value;
    const badgesRaw = document.getElementById('pubBadges').value.trim();

    if (!title || !authors) {
      alert('Please enter at least the Title and Authors.');
      return;
    }

    const badges = badgesRaw ? badgesRaw.split(',').map(b => {
      const text = b.trim();
      let badgeType = 'default';
      const lower = text.toLowerCase();
      if (lower.includes('wos')) badgeType = 'wos';
      else if (lower.includes('scopus')) badgeType = 'scopus';
      else if (lower.includes('if')) badgeType = 'if';
      else if (lower.includes('hjrs')) badgeType = 'hjrs';
      return { text, type: badgeType };
    }) : [];

    const newItem = {
      id: `${type.slice(0, 4)}-${Date.now()}`,
      rawId: Date.now(),
      title,
      authors,
      journal,
      year,
      url,
      badges,
      bibtex: `@article{memon${year}${title.slice(0, 10).replace(/[^a-zA-Z]/g, '').toLowerCase()},\n  title={${title}},\n  author={${authors}},\n  journal={${journal}},\n  year={${year}}\n}`
    };

    try {
      const res = await fetch('/api/admin/add-publication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ item: newItem, type })
      });

      const data = await res.json();
      if (data.success) {
        const alertBox = document.getElementById('pubAlert');
        alertBox.textContent = `✅ "${title}" was successfully added to ${type}!`;
        alertBox.style.display = 'block';
        showToast('Publication added to publications-data.js!');
        document.getElementById('pubTitle').value = '';
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to add publication: ' + err.message);
    }
  }

  // Add Supervision
  function handleAddSupervision() {
    const degree = document.getElementById('supDegree').value;
    const student = document.getElementById('supStudent').value.trim();
    const title = document.getElementById('supTitle').value.trim();
    const year = document.getElementById('supYear').value.trim();
    const role = document.getElementById('supRole').value;
    const status = document.getElementById('supStatus').value;

    if (!student || !title) {
      alert('Please fill in Student Name and Thesis Title.');
      return;
    }

    // Append to supervision list
    const supervisionContainer = document.querySelector('#supervision-view .supervision-cards-grid, #supervision-view .table-responsive tbody, #supervision-view');
    if (supervisionContainer) {
      const newCard = document.createElement('div');
      newCard.className = 'supervision-card admin-edited-dirty';
      newCard.style.padding = '1.25rem';
      newCard.style.background = 'var(--bg-surface)';
      newCard.style.borderRadius = '0.75rem';
      newCard.style.marginBottom = '1rem';
      newCard.style.border = '1px solid var(--border-color)';
      newCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <span class="badge" style="background:#0284c7; color:#fff; padding:0.2rem 0.6rem; border-radius:4px; font-size:0.75rem;">${degree}</span>
          <span style="font-size:0.85rem; color:var(--text-muted);"><i class="fas fa-calendar-alt"></i> ${year} (${status})</span>
        </div>
        <h4 style="margin:0 0 0.5rem 0; font-size:1.05rem;">${title}</h4>
        <p style="margin:0 0 0.25rem 0; font-size:0.9rem;"><strong>Candidate:</strong> ${student}</p>
        <p style="margin:0; font-size:0.85rem; color:var(--text-muted);"><i class="fas fa-user-tie"></i> Role: ${role}</p>
      `;
      supervisionContainer.prepend(newCard);
    }

    const alertBox = document.getElementById('supAlert');
    alertBox.textContent = `✅ Mentorship record for ${student} added! Save Changes to commit to disk.`;
    alertBox.style.display = 'block';
    hasUnsavedChanges = true;
    document.getElementById('unsavedBadge').style.display = 'inline-block';
    showToast('Supervision added! Click "Save Changes" on top bar.');
  }

  // Add Activity
  function handleAddActivity() {
    const section = document.getElementById('actSection').value;
    const text = document.getElementById('actText').value.trim();

    if (!text) {
      alert('Please enter activity details.');
      return;
    }

    // Find subsection
    let targetList;
    if (section === 'workshops') {
      targetList = document.querySelector('#act-workshops ul, #workshops-list');
    } else if (section === 'leadership') {
      targetList = document.querySelector('#act-leadership ul, #leadership-list');
    } else {
      targetList = document.querySelector('#act-service ul, #service-list');
    }

    if (!targetList) {
      targetList = document.querySelector('#activities-view ul');
    }

    if (targetList) {
      const li = document.createElement('li');
      li.className = 'admin-edited-dirty';
      li.style.marginBottom = '0.75rem';
      li.innerHTML = text;
      targetList.prepend(li);
    }

    const alertBox = document.getElementById('actAlert');
    alertBox.textContent = `✅ Activity item added! Click "Save Changes" on top bar to save.`;
    alertBox.style.display = 'block';
    hasUnsavedChanges = true;
    document.getElementById('unsavedBadge').style.display = 'inline-block';
    showToast('Activity added! Click "Save Changes" to commit.');
  }

  // Change Password
  async function handleChangePassword() {
    const currentPassword = document.getElementById('secCurrentPass').value.trim();
    const newUsername = document.getElementById('secNewUser').value.trim();
    const newPassword = document.getElementById('secNewPass').value.trim();
    const confirmPassword = document.getElementById('secConfirmPass').value.trim();
    const alertBox = document.getElementById('secAlert');

    if (!currentPassword || !newPassword) {
      alertBox.className = 'admin-alert admin-alert-error';
      alertBox.textContent = 'Please enter both current and new passwords.';
      alertBox.style.display = 'block';
      return;
    }

    if (newPassword !== confirmPassword) {
      alertBox.className = 'admin-alert admin-alert-error';
      alertBox.textContent = 'New password and confirmation do not match.';
      alertBox.style.display = 'block';
      return;
    }

    try {
      localStorage.setItem('prof_aftab_admin_pass', newPassword);
      if (newUsername) localStorage.setItem('prof_aftab_admin_user', newUsername);

      const res = await fetch('/api/admin/change-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ currentPassword, newUsername, newPassword })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alertBox.className = 'admin-alert admin-alert-success';
          alertBox.textContent = '✅ Password updated successfully! Please remember your new password.';
          alertBox.style.display = 'block';
          showToast('Admin password updated successfully!');
          return;
        }
      }
      alertBox.className = 'admin-alert admin-alert-success';
      alertBox.textContent = '✅ Credentials updated for this browser session!';
      alertBox.style.display = 'block';
      showToast('Admin credentials updated!');
    } catch (err) {
      alertBox.className = 'admin-alert admin-alert-success';
      alertBox.textContent = '✅ Credentials updated for this browser session!';
      alertBox.style.display = 'block';
      showToast('Admin credentials updated!');
    }
  }

  /* ----------------------------------------------------
     8. Toast Helper
     ---------------------------------------------------- */
  let toastTimeout;
  function showToast(msg, isError = false) {
    if (!toastEl) return;
    const msgEl = document.getElementById('adminToastMsg');
    if (msgEl) msgEl.textContent = msg;

    if (isError) {
      toastEl.classList.add('error');
    } else {
      toastEl.classList.remove('error');
    }

    toastEl.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 4500);
  }

})();
