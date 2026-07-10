// 1. Add the missing data categories to the app's memory safely
window.userProfileData = window.userProfileData || {};
if (window.userProfileData.skills === undefined) window.userProfileData.skills = "";
if (window.userProfileData.professionalSummary === undefined) window.userProfileData.professionalSummary = "";

// Track generation cycles to rotate styles on multiple clicks
window.aiClickCount = window.aiClickCount || 0;

window.addEventListener('DOMContentLoaded', () => {
  
  // A. ATTACH LISTENERS TO YOUR NEW PANEL INPUTS (Runs once)
  function initDashboardInputs() {
    setupInputListeners();
    setupAIListeners();
  }

  // B. FORCE INJECT INTO THE LIVE PORTFOLIO PREVIEW (Runs continuously)
  function injectPreview() {
    if (document.querySelector('#view-summary')) {
      document.querySelector('#view-summary').textContent = window.userProfileData.professionalSummary || 'Your summary will appear here.';
      document.querySelector('#view-skills').innerHTML = renderSkills(window.userProfileData.skills);
      return;
    }

    const possibleContainers = [
      document.querySelector('.preview-about'),
      document.querySelector('#preview-container'),
      document.querySelector('.hero-section'),
      document.body 
    ];

    const target = possibleContainers.find(el => el !== null);

    if (target) {
      const previewHTML = `
        <div id="ext-summary-box" style="margin-top: 20px; padding: 10px 0;">
          <h3 style="margin-bottom:5px; text-transform:uppercase; font-size:14px; letter-spacing:1px;">Professional Summary</h3>
          <p id="view-summary" style="color: #333; white-space: pre-line;">${window.userProfileData.professionalSummary || 'Your summary will appear here.'}</p>
        </div>
        <div id="ext-skills-box" style="margin-top: 20px; padding: 10px 0;">
          <h3 style="margin-bottom:5px; text-transform:uppercase; font-size:14px; letter-spacing:1px;">Skills</h3>
          <div id="view-skills" style="display:flex; flex-wrap:wrap; gap:8px;">${renderSkills(window.userProfileData.skills)}</div>
        </div>
      `;
      target.insertAdjacentHTML('afterend', previewHTML);
    }
  }

  function renderSkills(skillsString) {
    if (!skillsString || !skillsString.trim()) return '<span style="color:#777;">Your skills will appear here.</span>';
    return skillsString
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .map(skill => `<span class="skill-badge" style="background:#000; color:#fff; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:bold;">${skill}</span>`)
      .join('');
  }

  // C. LISTEN FOR TYPING INSIDE DASHBOARD FIELDS
  function setupInputListeners() {
    const summaryInput = document.querySelector('#summary-input');
    if (summaryInput) {
      summaryInput.addEventListener('input', (e) => {
        window.userProfileData.professionalSummary = e.target.value;
        const view = document.querySelector('#view-summary');
        if (view) view.textContent = e.target.value || 'Your summary will appear here.';
        if (typeof triggerGlobalAutoSave === 'function') triggerGlobalAutoSave();
      });
    }

    const skillsInput = document.querySelector('#skills-keyword');
    if (skillsInput) {
      skillsInput.addEventListener('input', (e) => {
        window.userProfileData.skills = e.target.value;
        const view = document.querySelector('#view-skills');
        
        if (view && typeof renderSkills === 'function') {
          view.innerHTML = renderSkills(e.target.value);
        } else if (view) {
          view.textContent = e.target.value;
        }
        if (typeof triggerGlobalAutoSave === 'function') triggerGlobalAutoSave();
      });
    }
  }

  // D. LIVE REAL-AI API GATEWAY FOR SEPARATE BUTTONS
  function setupAIListeners() {
    const summaryBtn = document.querySelector('#generate-summary-btn');
    const skillsBtn = document.querySelector('#generate-skills-btn');

    // Context helper payload builder
    const getContext = () => ({
      name: document.getElementById('input-name')?.value.trim() || "Anonymous User",
      profession: document.getElementById('input-title')?.value.trim() || "Professional",
      aboutMe: document.getElementById('input-about')?.value.trim() || "",
      projects: (window.projectsArray || []).map(p => ({ title: p.title, description: p.desc || "" }))
    });

    // 1. Generate Summary Action
    if (summaryBtn) {
      summaryBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // STOPS REFRESH / REDIRECT
        summaryBtn.innerText = "✨ AI is Writing Summary...";
        summaryBtn.disabled = true;

        try {
          const response = await fetch('/api/generate-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(getContext())
          });

          if (!response.ok) throw new Error('API server error occurred');
          const data = await response.json();

          window.userProfileData.professionalSummary = data.summary;
          const summaryInput = document.querySelector('#summary-input');
          if (summaryInput) summaryInput.value = data.summary;

          const viewSummary = document.querySelector('#view-summary');
          if (viewSummary) viewSummary.textContent = data.summary;

          if (typeof triggerGlobalAutoSave === 'function') triggerGlobalAutoSave();
        } catch (error) {
          console.error('AI Summary Error:', error);
          alert('Could not connect to the real AI network. Make sure your backend server route is active.');
        } finally {
          summaryBtn.innerText = "✨ Generate AI Summary";
          summaryBtn.disabled = false;
        }
      });
    }

    // 2. Generate Skills Action
    if (skillsBtn) {
      skillsBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // STOPS REFRESH / REDIRECT
        skillsBtn.innerText = "✨ AI is Generating Tags...";
        skillsBtn.disabled = true;

        try {
          const response = await fetch('/api/generate-summary', { // Reusing same API response model structure
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(getContext())
          });

          if (!response.ok) throw new Error('API server error occurred');
          const data = await response.json();

          window.userProfileData.skills = data.skills;
          const skillsInput = document.querySelector('#skills-keyword');
          if (skillsInput) skillsInput.value = data.skills;

          const viewSkills = document.querySelector('#view-skills');
          if (viewSkills) viewSkills.innerHTML = renderSkills(data.skills);

          if (typeof triggerGlobalAutoSave === 'function') triggerGlobalAutoSave();
        } catch (error) {
          console.error('AI Skills Error:', error);
          alert('Could not connect to the real AI network. Make sure your backend server route is active.');
        } finally {
          skillsBtn.innerText = "✨ Generate Skills Tags";
          skillsBtn.disabled = false;
        }
      });
    }
  }

  // Run builders
  initDashboardInputs();
  setInterval(injectPreview, 500);
});