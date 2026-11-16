# Academic & Research Portfolio Website
### **Prof. Dr. Aftab Hameed Memon**
**Professor, Department of Civil Engineering**  
**Quaid-e-Awam University of Engineering, Science & Technology (QUEST), Nawabshah, Pakistan**

---

## 🌟 Overview & Design Philosophy

This website is a modern, high-performance personal academic web portal developed for **Prof. Dr. Aftab Hameed Memon**, inspired by the academic presence of his colleague **Prof. Dr. Riaz Bhanbhro** ([riaz.quest](https://riaz.quest/)), but reimagined with a **fresh new look, bespoke color palette, and interactive academic features**.

### 🎨 Color Palette & Aesthetic
- **Primary Imperial Navy** (`#0b1a30`, `#1e3a8a`): Symbolizes academic rigor, structural engineering stability, and institutional excellence.
- **Construction Amber & Royal Gold** (`#d97706`, `#f59e0b`, `#fbbf24`): Accents representing civil construction, prestige, citations, and awards.
- **Structural Cyan & Azure** (`#0284c7`, `#0ea5e9`): Highlights research indicators, DOI links, and interactive elements.
- **Dark & Light Mode**: Built-in 1-click theme switcher with local storage memory and smooth transitions.
- **Subtle Architectural Grid**: Precision blueprint/grid background pattern for an engineering feel.

---

## 🚀 Key Features

1. **Academic Hero Section**:
   - Status indicators, verified Pakistan Engineering Council (PEC) registration badge.
   - Live research keyword pills (Cost & Time Overrun, Sustainable Construction, SEM-PLS, Lean Construction, WRATTCO).
   - Direct links to **Google Scholar (6,200+ citations)**, **ResearchGate**, **ORCID**, and **LinkedIn**.
   - Auto-fallback profile portrait: displays `assets/images/profile.jpg` automatically if placed in the folder, or smoothly falls back to the custom vector emblem.

2. **Dynamic Key Metrics Counter**:
   - Animated counters that smoothly scroll into view (6,200+ Citations, 120+ Publications, 22+ Years Experience, 50+ Graduate Theses Supervised).

3. **About & Academic Progression**:
   - Biography covering academic career at QUEST (Lecturer → Assistant Professor → Associate Professor & Chairman → Professor).
   - Industrial engineering background at **Osmani & Company** and **Paragon Constructors**.
   - Education timeline: **Ph.D. (UTHM Malaysia)**, **M.S. (UTM Malaysia)**, **B.E. (QUEST Pakistan)**.
   - Professional registrations: PEC Registered Professional Engineer, Concrete Society Malaysia, MSET, IAENG.

4. **Research Thrusts & Innovations**:
   - Detailed breakdown of 4 core research pillars:
     1. Construction Cost & Time Overrun Modeling (WRATTCO framework).
     2. Advanced Quantitative Methods (SEM-PLS & AMOS).
     3. Sustainable Construction & 3R Waste Management.
     4. Lean Construction & 5D Digital Project Delivery.

5. **Interactive Publications Ledger**:
   - Live real-time search filtering across titles, authors, journals, and abstracts.
   - Category filtering pills: *All*, *Cost & Time Overruns*, *Sustainable Construction*, *SEM-PLS Modeling*, *Lean & Quality*.
   - **Inline Abstract Viewer**: Read publication summaries without page reloading.
   - **1-Click BibTeX Citation Generator**: View and copy formatted BibTeX directly to clipboard.
   - Direct DOI and external publication links.

6. **Teaching & Mentorship Panel**:
   - Tabbed view covering **Postgraduate Courses**, **Undergraduate Courses**, and **Thesis Supervision (Ph.D. & M.S.)**.

7. **Academic Leadership & Activities**:
   - Peer reviewer roles for top Q1/Q2 journals (ASCE, Elsevier, Taylor & Francis, MDPI).
   - Institutional administration as Chairman of Civil Engineering Technology.
   - SEM-PLS Hands-on research training workshops.

8. **Printable Curriculum Vitae (`cv.html`)**:
   - Dedicated, HEC/international-standard academic CV page with 1-click **Print / Save as PDF** styling.

9. **Direct Contact & Department Office**:
   - Department location, consultation hours, and interactive inquiry form with mailto fallback.

---

## 📂 Project Structure

```
d:\Web Development work\Aftab Hameed Memon\
├── index.html                  # Main academic portfolio homepage
├── cv.html                     # Dedicated printable Curriculum Vitae
├── README.md                   # Documentation and customization guide
├── css/
│   └── style.css               # Modern CSS with Dark/Light theme variables & responsive styles
├── js/
│   ├── main.js                 # Theme switcher, scrollspy, counters, modals, filters
│   └── publications-data.js    # Structured publication dataset with abstracts & BibTeX
└── assets/
    ├── images/
    │   ├── logo.svg            # AHM monogram logo
    │   ├── profile-avatar.svg  # Vector academic professor emblem
    │   └── profile.jpg         # (Drop Dr. Aftab's photo here to replace avatar)
    └── docs/                   # (Optional folder for downloadable PDFs, syllabi, slides)
```

---

## 🛠️ How to Customize

### 1. Adding Dr. Aftab's Real Photograph
Simply save Dr. Aftab's professional photo as **`profile.jpg`** in the `assets/images/` directory:
```
assets/images/profile.jpg
```
The website is programmed to automatically detect and display `profile.jpg` immediately!

### 2. Adding or Editing Publications
Open `js/publications-data.js` and add new publications using this simple JSON structure:
```javascript
{
  id: "pub-new",
  title: "Title of Your New Paper",
  authors: "A. H. Memon, et al.",
  journal: "Journal Name",
  year: 2025,
  category: "cost-time", // or "sustainability", "sem-pls", "lean-quality"
  citations: 15,
  doi: "10.1016/...",
  abstract: "Summary of findings...",
  bibtex: `@article{...}`
}
```

### 3. Deploying the Website Online
This website is 100% static (HTML5/CSS3/JavaScript) with zero dependencies:
- **Option A (GitHub Pages / Custom Domain like `aftab.quest` or `aftabhameed.com`)**:
  Push this folder to a GitHub repository, enable **GitHub Pages** under Settings, and your site is live for free!
- **Option B (QUEST University Hosting `quest.edu.pk`)**:
  Upload the files directly into your cPanel or public HTML directory.
- **Option C (Netlify / Vercel / Cloudflare Pages)**:
  Drag and drop the folder directly into Netlify for instant deployment with free SSL.

