document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements Cache Anchors
    const sidebarName = document.getElementById('sidebar-name-preview');
    const sidebarAvatar = document.getElementById('sidebar-avatar-preview');
    const btnDesktop = document.getElementById('btn-desktop');
    const btnMobile = document.getElementById('btn-mobile');
    const browserFrame = document.getElementById('browser-frame');
    const previewBoxWrapper = document.querySelector('.browser-content-placeholder');
    const rightPanelContainer = document.querySelector('.dash-custom-panel');

    // Global State Matrix (Never Resets when Switching Tabs)
    let userProfileData = {
        name: "Amirah",
        title: "Web Developer",
        about: "Curious designer, \nimage maker, \nstoryteller",
        shape: "torus",
        color: "#00FFCC",
        bgStyle: "transparent" // Added State Property Field Tracking
    };

    let projectsArray = [
        { id: 'p1', title: 'Spatial Web App', desc: 'Interactive 3D structural matrix experience framework builds.', img: '' },
        { id: 'p2', title: 'Branding Identity', desc: 'Minimalist high-contrast layout components system.', img: '' }
    ];

    let userAvatarUrl = '';
    let currentSelectedTemplate = 'T1';
    let templateEngine = null; 
    let currentAssetSubTab = 'shapes'; // Inner navigation state tracking for Assets

    // Sync baseline defaults on DOM ready if elements are initially visible
    const initialName = document.getElementById('input-name');
    if (initialName) userProfileData.name = initialName.value;
    const initialTitle = document.getElementById('input-title');
    if (initialTitle) userProfileData.title = initialTitle.value;
    const initialAbout = document.getElementById('input-about');
    if (initialAbout) userProfileData.about = initialAbout.value;
    const initialShape = document.getElementById('input-shape');
    if (initialShape) userProfileData.shape = initialShape.value;
    const initialColor = document.getElementById('input-color');
    if (initialColor) userProfileData.color = initialColor.value;
    const initialBgStyle = document.getElementById('input-bg-style');
    if (initialBgStyle) userProfileData.bgStyle = initialBgStyle.value;

    // Force Redraw Layout Matrix Execution 
    function updateLivePreview() {
        const currentName = userProfileData.name || "Anonymous";
        const currentTitle = userProfileData.title || "Badge Title";
        const currentAbout = userProfileData.about || "Headline Statement";

        if (sidebarName) sidebarName.innerText = currentName;

        if (templateEngine) {
            templateEngine.renderTemplateLayout(currentSelectedTemplate, currentName, currentTitle, currentAbout, userAvatarUrl);
           
            // Fire the native dashboard auto save handler directly[cite: 3]
            triggerDashboardAutoSave();
        } 
    } 

    // Dynamic Binding Protection Layer (Prevents Null Pointer Exceptions)
    function bindWorkspaceInputEvents() {
        const inputName = document.getElementById('input-name');
        const inputTitle = document.getElementById('input-title');
        const inputAbout = document.getElementById('input-about');
        const inputAvatar = document.getElementById('input-avatar');
        const inputShape = document.getElementById('input-shape');
        const inputColor = document.getElementById('input-color');
        const inputBgStyle = document.getElementById('input-bg-style'); // Added Control Target Element

        if (inputName) {
            inputName.addEventListener('input', (e) => { userProfileData.name = e.target.value; updateLivePreview(); });
        }
        if (inputTitle) {
            inputTitle.addEventListener('input', (e) => { userProfileData.title = e.target.value; updateLivePreview(); });
        }
        if (inputAbout) {
            inputAbout.addEventListener('input', (e) => { userProfileData.about = e.target.value; updateLivePreview(); });
        }
        if (inputShape) {
            inputShape.addEventListener('change', (e) => { userProfileData.shape = e.target.value; updateThreeMesh(); });
        }
        if (inputColor) {
            inputColor.addEventListener('input', (e) => { userProfileData.color = e.target.value; updateThreeMesh(); });
        }
        if (inputBgStyle) {
            inputBgStyle.addEventListener('change', (e) => { userProfileData.bgStyle = e.target.value; updateLivePreview(); });
        }
        if (inputAvatar) {
            inputAvatar.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        userAvatarUrl = event.target.result;
                        const pBox = document.getElementById('upload-preview-box');
                        if (pBox) pBox.style.backgroundImage = `url('${userAvatarUrl}')`;
                        if (sidebarAvatar) sidebarAvatar.style.backgroundImage = `url('${userAvatarUrl}')`;
                        updateLivePreview();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        const currentAddBtn = document.getElementById('btn-add-project');
        if (currentAddBtn) {
            currentAddBtn.addEventListener('click', () => {
                const newId = 'p_' + Date.now();
                projectsArray.push({ id: newId, title: 'New Deck Item', desc: 'Short project summary goes here.', img: '' });
                renderProjects();
                updateLivePreview();
            });
        }
    }

    // Dynamic Project Rendering Framework
    function renderProjects() {
        const activeProjectsContainer = document.getElementById('panel-projects-list');
        const targetGrid = document.getElementById('live-projects-grid');
        
        if (targetGrid) targetGrid.innerHTML = '';
        if (activeProjectsContainer) activeProjectsContainer.innerHTML = '';

        projectsArray.forEach((proj, idx) => {
            // Render editing options only if user is actively in workspace tab layout panel
            if (activeProjectsContainer) {
                const itemRow = document.createElement('div');
                itemRow.className = 'panel-project-item';
                itemRow.draggable = true;
                itemRow.dataset.id = proj.id;
                itemRow.dataset.index = idx;

                itemRow.innerHTML = `
                    <div class="project-item-top">
                        <span class="drag-handle">☰</span>
                        <input type="text" class="edit-proj-title" value="${proj.title}" placeholder="Project Title">
                        <button type="button" class="btn-delete-project" title="Delete">×</button>
                    </div>
                    <div class="project-item-bottom">
                        <label class="mini-upload-btn" style="background-image: url('${proj.img}')">
                            ${proj.img ? '' : '＋'}
                            <input type="file" class="edit-proj-img" accept="image/*" style="display:none;">
                        </label>
                        <textarea class="edit-proj-desc" rows="1" placeholder="Description">${proj.desc}</textarea>
                    </div>
                `;

                itemRow.querySelector('.edit-proj-title').addEventListener('input', (e) => {
                    proj.title = e.target.value;
                    syncPreviewProjectCards();
                    triggerDashboardAutoSave();
                });
                itemRow.querySelector('.edit-proj-desc').addEventListener('input', (e) => {
                    proj.desc = e.target.value;
                    syncPreviewProjectCards();
                    triggerDashboardAutoSave();
                });
                itemRow.querySelector('.edit-proj-img').addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            proj.img = event.target.result;
                            renderProjects(); 
                            updateLivePreview();
                        };
                        reader.readAsDataURL(file);
                    }
                });
                itemRow.querySelector('.btn-delete-project').addEventListener('click', () => {
                    projectsArray = projectsArray.filter(p => p.id !== proj.id);
                    renderProjects();
                    updateLivePreview();
                });

                setupDragAndDropEvents(itemRow, activeProjectsContainer);
                activeProjectsContainer.appendChild(itemRow);
            }

            // Render output layout items on center display grid frame canvas view
            if (targetGrid) {
                const liveCard = document.createElement('div');
                liveCard.className = 'live-project-card';
                liveCard.innerHTML = `
                    <div class="project-card-image" style="background-image: url('${proj.img}')"></div>
                    <div class="project-card-details">
                        <h3 contenteditable="true" class="inline-edit-project-title" data-index="${idx}">${proj.title || 'Untitled Project'}</h3>
                        <p contenteditable="true" class="inline-edit-project-desc" data-index="${idx}">${proj.desc || 'No description provided.'}</p>
                    </div>
                `;
                targetGrid.appendChild(liveCard);
            }
        });

        // Bind events to the project items inside the live preview
        bindInlineProjectEvents();
    }

    function syncPreviewProjectCards() {
        const targetGrid = document.getElementById('live-projects-grid');
        if (!targetGrid) return;
        const cards = targetGrid.querySelectorAll('.live-project-card');
        projectsArray.forEach((proj, idx) => {
            if (cards[idx]) {
                const titleHeading = cards[idx].querySelector('.inline-edit-project-title');
                const descParagraph = cards[idx].querySelector('.inline-edit-project-desc');
                if (titleHeading && document.activeElement !== titleHeading) titleHeading.innerText = proj.title || 'Untitled Project';
                if (descParagraph && document.activeElement !== descParagraph) descParagraph.innerText = proj.desc || 'No description provided.';
            }
        });
    }

    function setupDragAndDropEvents(element, containerParent) {
        element.addEventListener('dragstart', () => { element.classList.add('dragging'); });
        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
            const currentUIOrder = [...containerParent.querySelectorAll('.panel-project-item')];
            projectsArray = currentUIOrder.map(el => projectsArray.find(p => p.id === el.dataset.id));
            renderProjects();
            updateLivePreview();
        });
        containerParent.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingEl = containerParent.querySelector('.dragging');
            const siblings = [...containerParent.querySelectorAll('.panel-project-item:not(.dragging)')];
            const nextSibling = siblings.find(sibling => e.clientY <= sibling.getBoundingClientRect().top + sibling.getBoundingClientRect().height / 2);
            containerParent.insertBefore(draggingEl, nextSibling);
        });
    }

    // Three.js Pipeline Component Engine Layout Frame Setting Core
    const canvas = document.getElementById('three-canvas');
    let scene, camera, renderer, currentMesh;

    if (canvas && canvas.parentElement) {
        const canvasBox = canvas.parentElement;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, canvasBox.clientWidth / canvasBox.clientHeight, 0.1, 1000);
        camera.position.z = 3.2;

        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setSize(canvasBox.clientWidth, canvasBox.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        window.updateThreeMesh = function() {
            if (!scene) return;
            if (currentMesh) scene.remove(currentMesh);

            const chosenShape = userProfileData.shape || 'torus';
            const chosenColor = userProfileData.color || '#00FFCC';

            const activeHexLabel = document.getElementById('color-hex-label');
            if (activeHexLabel) activeHexLabel.innerText = chosenColor.toUpperCase();

            let geometry;
            if (chosenShape === 'cube') {
                geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
            } else if (chosenShape === 'sphere') {
                geometry = new THREE.SphereGeometry(1.0, 24, 24);
            } else if (chosenShape === 'cone') {
                geometry = new THREE.ConeGeometry(0.8, 1.4, 16, 1, true);
            } else if (chosenShape === 'cylinder') {
                geometry = new THREE.CylinderGeometry(0.6, 0.6, 1.4, 16, 1, true);
            } else if (chosenShape === 'tetrahedron') {
                geometry = new THREE.TetrahedronGeometry(1.1, 0);
            } else {
                geometry = new THREE.TorusKnotGeometry(0.65, 0.2, 100, 16);
            }

            const material = new THREE.MeshBasicMaterial({ color: chosenColor, wireframe: true });
            currentMesh = new THREE.Mesh(geometry, material);
            
            const w = canvasBox.clientWidth;
            const h = canvasBox.clientHeight;
            currentMesh.position.x = w < 500 ? 0 : (w / h) * 0.95; 
            
            scene.add(currentMesh);
            updateLivePreview();
        };

        let mouseX = 0, mouseY = 0;
        canvasBox.addEventListener('mousemove', (event) => {
            const rect = canvasBox.getBoundingClientRect();
            mouseX = ((event.clientX - rect.left) / canvasBox.clientWidth) - 0.5;
            mouseY = ((event.clientY - rect.top) / canvasBox.clientHeight) - 0.5;
        });

        const animate = () => {
            requestAnimationFrame(animate);
            if (currentMesh) {
                currentMesh.rotation.y += (mouseX * 2.0 - currentMesh.rotation.y) * 0.05 + 0.003;
                currentMesh.rotation.x += (mouseY * 2.0 - currentMesh.rotation.x) * 0.05;
            }
            if (renderer && scene && camera) renderer.render(scene, camera);
        };

        function handleResize() {
            if (!canvasBox || !camera || !renderer) return;
            const w = canvasBox.clientWidth;
            const h = canvasBox.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            if (currentMesh) currentMesh.position.x = w < 500 ? 0 : (w / h) * 0.95;
        }

        if (btnDesktop) btnDesktop.addEventListener('click', () => {
            btnDesktop.classList.add('active');
            if (btnMobile) btnMobile.classList.remove('active');
            if (browserFrame) browserFrame.classList.remove('mobile-frame');
            setTimeout(handleResize, 50);
        });

        if (btnMobile) btnMobile.addEventListener('click', () => {
            btnMobile.classList.add('active');
            if (btnDesktop) btnDesktop.classList.remove('active');
            if (browserFrame) browserFrame.classList.add('mobile-frame');
            setTimeout(handleResize, 50);
        });

        window.addEventListener('resize', handleResize);
        updateThreeMesh();
        animate();
    }

    // Global Interactive Action Core Trigger Router Mapping Handler
    document.body.addEventListener('click', (e) => {
        if (e.target && (e.target.classList.contains('action-btn-generate') || e.target.innerText.includes('Compile'))) {
            
            // Bundle all your configuration data into a clean object payload
            const portfolioPayload = {
                name: userProfileData.name || "Amirah",
                title: userProfileData.title || "Web Developer",
                about: userProfileData.about || "Curious Designer",
                shape: userProfileData.shape || "torus",
                color: userProfileData.color || "#00FFCC",
                template: currentSelectedTemplate || "T1",
                bgStyle: userProfileData.bgStyle || "transparent",
                avatar: userAvatarUrl || "",
                projects: projectsArray || []
            };

            // Save the data to local storage so the new window can pull it safely
            localStorage.setItem('activePortfolioData', JSON.stringify(portfolioPayload));

            // Open view.html cleanly without a massive, fragile URL string
            window.open('view.html', '_blank');
        }
    });

    // Architecture Engine Renderer Controller
    class PortfolioTemplateEngine {
        constructor(placeholderContainer) {
            this.container = placeholderContainer;
            this.styleNode = null;
        }

        injectTemplateStyles(templateId) {
            if (this.styleNode) this.styleNode.remove();
            this.styleNode = document.createElement('style');
            this.styleNode.id = `style-runtime-${templateId}`;

            const baseThemeCss = `
                .browser-content-placeholder { transition: all 0.4s ease; font-family: 'Montserrat', sans-serif; display: flex; flex-direction: column; padding: 40px; box-sizing: border-box; }
                .tmpl-nav { display: flex; justify-content: space-between; width: 100%; align-items: center; font-weight: 700; z-index: 10; font-size: 0.9rem; margin-bottom: 20px; }
                .tmpl-links { display: flex; gap: 20px; font-weight: 600; opacity: 0.7; }
                .tmpl-projects-section { width: 100%; padding: 40px 0; margin-top: auto; z-index: 10; }
                .tmpl-grid-headline { font-size: 1.8rem; font-weight: 900; margin-bottom: 24px; letter-spacing: -1px; }
                
                /* Inline Direct Editing Feature Engine UI Additions */
                [contenteditable="true"] {
                    outline: none;
                    transition: background 0.2s ease, box-shadow 0.2s ease;
                    border-radius: 4px;
                }
                [contenteditable="true"]:hover {
                    background: rgba(0, 0, 0, 0.04);
                    box-shadow: 0 0 0 2px dashed rgba(0,0,0,0.2);
                    cursor: text;
                }
                #browser-frame.mobile-frame [contenteditable="true"]:hover,
                .browser-content-placeholder[style*="background: rgb(11, 12, 16)"] [contenteditable="true"]:hover,
                .browser-content-placeholder[style*="background: rgb(18, 18, 20)"] [contenteditable="true"]:hover {
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 0 2px dashed rgba(255,255,255,0.25);
                }
                [contenteditable="true"]:focus {
                    background: rgba(0, 0, 0, 0.02) !important;
                    box-shadow: 0 0 0 2px solid #111111 !important;
                }
            `;

            let templateSpecificCss = '';
            switch (templateId) {
                case 'T1':
                    templateSpecificCss = `
                        .browser-content-placeholder { background: #faf9f6 !important; color: #111111 !important; text-align: left !important; align-items: flex-start !important; }
                        .tmpl-nav { justify-content: space-between !important; }
                        .t1-hero { margin: 40px 0; max-width: 70%; z-index: 5; text-align: left; }
                        .t1-hero h1 { font-size: 2.3rem; font-weight: 900; line-height: 1.2; margin: 0 0 16px 0; color: #111 !important; letter-spacing: -1px; min-width: 200px; }
                        .dynamic-accent-pill { display: inline-block; padding: 6px 18px; border: 2px solid #111; border-radius: 30px; font-weight: 700; font-size: 0.85rem; }
                        .tmpl-projects-section { border-top: 2px solid #111; }
                    `;
                    break;
                case 'T2':
                    templateSpecificCss = `
                        .browser-content-placeholder { background: #0b0c10 !important; color: #66fcf1 !important; font-family: monospace !important; text-align: left !important; align-items: flex-start !important; }
                        .tmpl-nav { border-bottom: 1px dashed #1f2833; padding-bottom: 12px; justify-content: space-between !important; }
                        .t2-hero { margin: 40px 0; border-left: 3px solid #66fcf1; padding-left: 20px; z-index: 5; text-align: left; }
                        .t2-hero h1 { font-size: 2rem; font-weight: 700; text-transform: uppercase; color: #fff; margin: 0 0 10px 0; }
                        .dynamic-accent-pill { display: inline-block; color: #0b0c10; font-weight: 900; padding: 4px 12px; text-transform: uppercase; font-size: 0.75rem; border-radius: 4px; }
                        .tmpl-projects-section { border-top: 1px dashed #66fcf1; }
                        .live-project-card { border: 1px solid #66fcf1 !important; background: #1f2833 !important; color: #fff !important; box-shadow: none !important; }
                        .live-project-card h3 { color: #66fcf1 !important; }
                        .live-project-card p { color: #8892b0 !important; }
                    `;
                    break;
                case 'T3':
                    templateSpecificCss = `
                        .browser-content-placeholder { background: #f4eade !important; color: #2b2b2b !important; text-align: center !important; align-items: center !important; }
                        .tmpl-nav { justify-content: center !important; }
                        .t3-hero { margin: 30px auto; max-width: 80%; display: flex; flex-direction: column; align-items: center; z-index: 5; text-align: center; }
                        .t3-avatar { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #2b2b2b; margin-bottom: 16px; background-size: cover; background-position: center; background-color: #aaa; }
                        .t3-hero h1 { font-size: 1.8rem; font-weight: 700; font-family: serif; margin: 0 0 12px 0; color: #2b2b2b !important; }
                        .dynamic-accent-pill { display: inline-block; padding: 4px 14px; border-bottom: 2px solid #2b2b2b; font-weight: 600; font-size: 0.8rem; border-radius: 0px; border-top:none; border-left:none; border-right:none; }
                        .tmpl-projects-section { border-top: 2px solid #2b2b2b; }
                    `;
                    break;
                case 'T4':
                    templateSpecificCss = `
                        .browser-content-placeholder { background: #121214 !important; color: #efefef !important; text-align: left !important; align-items: flex-start !important; }
                        .tmpl-nav { justify-content: space-between !important; }
                        .t4-hero { background: #1a1a1e; border: 1px solid #2d2d34; padding: 24px; border-radius: 16px; margin: 20px 0; max-width: 75%; text-align: left; }
                        .t4-hero h1 { font-size: 1.8rem; font-weight: 800; color: #fff; margin: 0 0 10px 0; }
                        .dynamic-accent-pill { display: inline-block; padding: 5px 12px; border-radius: 6px; font-weight: 600; font-size: 0.8rem; }
                        .tmpl-projects-section { border-top: 1px solid #2d2d34; }
                        .live-project-card { background: #1a1a1e !important; border: 1px solid #2d2d34 !important; border-radius: 12px !important; box-shadow: none !important; }
                        .live-project-card h3 { color: #fff !important; }
                        .live-project-card p { color: #a0a0aa !important; }
                    `;
                    break;
                case 'T5':
                    templateSpecificCss = `
                        .browser-content-placeholder { background: #ffffff !important; color: #000000 !important; text-align: left !important; align-items: flex-start !important; }
                        .tmpl-nav { justify-content: space-between !important; }
                        .t5-hero { margin: 30px 0; position: relative; text-align: left; }
                        .t5-hero h1 { font-size: 3rem; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; line-height: 0.95; margin: 0; color: #111 !important; }
                        .dynamic-accent-pill { display: inline-block; margin-top: 15px; padding: 8px 20px; font-weight: 700; color: #fff; border-radius: 0px; text-transform: uppercase; font-size: 0.8rem; }
                        .tmpl-projects-section { border-top: 3px solid #000; }
                        .live-project-card { border-radius: 0px !important; border-width: 3px !important; }
                    `;
                    break;
            }

            this.styleNode.textContent = baseThemeCss + templateSpecificCss;
            document.head.appendChild(this.styleNode);
        }

        renderTemplateLayout(id, name, title, about, avatar) {
            this.injectTemplateStyles(id);
            const dynamicColorChoice = userProfileData.color || '#00FFCC';
            const gridHtml = `
                <div class="tmpl-projects-section">
                    <h2 class="tmpl-grid-headline">Selected Work</h2>
                    <div id="live-projects-grid" class="live-projects-grid"></div>
                </div>
            `;

            if (id === 'T1') {
                this.container.innerHTML = `
                    <div class="tmpl-nav"><span contenteditable="true" id="inline-edit-name">${name}</span><div class="tmpl-links"><span>Work</span><span>Info</span></div></div>
                    <div class="t1-hero"><h1 contenteditable="true" id="inline-edit-about">${about.replace(/\\n/g, '<br>')}</h1><div contenteditable="true" id="inline-edit-title" class="dynamic-accent-pill" style="background-color: ${dynamicColorChoice}">${title}</div></div>
                    ${gridHtml}
                `;
            } else if (id === 'T2') {
                this.container.innerHTML = `
                    <div class="tmpl-nav"><span>// <span contenteditable="true" id="inline-edit-name">${name.toUpperCase()}</span></span></div>
                    <div class="t2-hero"><h1>${name} / <span contenteditable="true" id="inline-edit-title">${title}</span></h1><p contenteditable="true" id="inline-edit-about" style="color:#8892b0; font-size:0.9rem; margin-bottom:15px; margin-top:10px;">${about.replace(/\\n/g, ' ')}</p><div class="dynamic-accent-pill" style="background-color: ${dynamicColorChoice}">${title}</div></div>
                    ${gridHtml}
                `;
            } else if (id === 'T3') {
                this.container.innerHTML = `
                    <div class="tmpl-nav"><span contenteditable="true" id="inline-edit-name">${name}</span></div>
                    <div class="t3-hero">
                        <div class="t3-avatar" style="background-image: url('${avatar || 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=150'}')"></div>
                        <h1 contenteditable="true" id="inline-edit-about">${about.replace(/\\n/g, ' ')}</h1><div contenteditable="true" id="inline-edit-title" class="dynamic-accent-pill" style="background-color: ${dynamicColorChoice}">${title}</div>
                    </div>
                    ${gridHtml}
                `;
            } else if (id === 'T4') {
                this.container.innerHTML = `
                    <div class="tmpl-nav"><span contenteditable="true" id="inline-edit-name">${name.toUpperCase()}</span><div class="tmpl-links"><span>+ Connect</span></div></div>
                    <div class="t4-hero"><h1>Hi, I'm ${name}</h1><p contenteditable="true" id="inline-edit-about" style="color:#a0a0aa; font-size:0.95rem; margin-top:5px; margin-bottom:15px;">${about.replace(/\\n/g, ' ')}</p><div contenteditable="true" id="inline-edit-title" class="dynamic-accent-pill" style="background-color: ${dynamicColorChoice}; color:#111;">${title}</div></div>
                    ${gridHtml}
                `;
            } else if (id === 'T5') {
                this.container.innerHTML = `
                    <div class="tmpl-nav"><span contenteditable="true" id="inline-edit-name">${name}</span> Studio</div>
                    <div class="t5-hero"><h1>I'M <br>${name.toUpperCase()}</h1><p contenteditable="true" id="inline-edit-about" style="margin: 15px 0; font-size:1.1rem; font-weight:500;">${about.replace(/\\n/g, ' ')}</p><div contenteditable="true" id="inline-edit-title" class="dynamic-accent-pill" style="background-color: ${dynamicColorChoice}; color: #fff;">${title}</div></div>
                    ${gridHtml}
                `;
            }
            
            bindInlineProfileEvents();
            renderProjects();
        }
    }

    // Core ContentEditable Direct Event Sync Engine Module 
    function bindInlineProfileEvents() {
        const inlineName = document.getElementById('inline-edit-name');
        const inlineTitle = document.getElementById('inline-edit-title');
        const inlineAbout = document.getElementById('inline-edit-about');

        const blurOnEnter = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
            }
        };

        if (inlineName) {
            inlineName.addEventListener('keydown', blurOnEnter);
            inlineName.addEventListener('input', (e) => {
                userProfileData.name = e.target.innerText;
                if (sidebarName) sidebarName.innerText = userProfileData.name;
                const inputName = document.getElementById('input-name');
                if (inputName) inputName.value = userProfileData.name;
                triggerDashboardAutoSave();
            });
        }
        if (inlineTitle) {
            inlineTitle.addEventListener('keydown', blurOnEnter);
            inlineTitle.addEventListener('input', (e) => {
                userProfileData.title = e.target.innerText;
                const inputTitle = document.getElementById('input-title');
                if (inputTitle) inputTitle.value = userProfileData.title;
                triggerDashboardAutoSave();
            });
        }
        if (inlineAbout) {
            inlineAbout.addEventListener('keydown', blurOnEnter);
            inlineAbout.addEventListener('input', (e) => {
                userProfileData.about = e.target.innerText;
                const inputAbout = document.getElementById('input-about');
                if (inputAbout) inputAbout.value = userProfileData.about;
                triggerDashboardAutoSave();
            });
        }
    }

    function bindInlineProjectEvents() {
        const blurOnEnter = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
            }
        };

        document.querySelectorAll('.inline-edit-project-title').forEach(el => {
            el.addEventListener('keydown', blurOnEnter);
            el.addEventListener('input', (e) => {
                const idx = e.target.dataset.index;
                if (projectsArray[idx]) {
                    projectsArray[idx].title = e.target.innerText;
                    
                    // Live mirror update option data values instantly back into the sidebar row layout components
                    const inputRows = document.querySelectorAll('.panel-project-item');
                    if (inputRows[idx]) {
                        const inputTitle = inputRows[idx].querySelector('.edit-proj-title');
                        if (inputTitle) inputTitle.value = e.target.innerText;
                    }
                    triggerDashboardAutoSave();
                }
            });
        });

        document.querySelectorAll('.inline-edit-project-desc').forEach(el => {
            el.addEventListener('keydown', blurOnEnter);
            el.addEventListener('input', (e) => {
                const idx = e.target.dataset.index;
                if (projectsArray[idx]) {
                    projectsArray[idx].desc = e.target.innerText;
                    
                    const inputRows = document.querySelectorAll('.panel-project-item');
                    if (inputRows[idx]) {
                        const inputDesc = inputRows[idx].querySelector('.edit-proj-desc');
                        if (inputDesc) inputDesc.value = e.target.innerText;
                    }
                    triggerDashboardAutoSave();
                }
            });
        });
    }

    if (previewBoxWrapper) {
        templateEngine = new PortfolioTemplateEngine(previewBoxWrapper);

        // Sidebar Routing Handler Controls
        const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                menuItems.forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                
                const text = item.textContent.trim();
                if (text.includes('Workspace')) {
                    renderWorkspaceTabView();
                } else if (text.includes('Templates')) {
                    renderTemplatesTabView();
                } else if (text.includes('Assets')) {
                    renderAssetsPanel();
                }
            });
        });

        // Event listener for template dropdown selection changes
        document.body.addEventListener('change', (e) => {
            if (e.target && e.target.id === 'template-style-picker') {
                currentSelectedTemplate = e.target.value;
                updateLivePreview();
            }
        });
    }

    function renderTemplatesTabView() {
        if (!rightPanelContainer) return;
        rightPanelContainer.innerHTML = `
            <div class="panel-scroll-wrapper">
                <div class="panel-section-title">Studio Templates</div>
                <p style="font-size:0.85rem; color:#666; margin-bottom:24px; line-height:1.4; font-weight:500;">Select a premade layout visual architecture skin for your workspace.</p>
                
                <div class="control-group">
                    <label>ACTIVE SKIN DESIGN</label>
                    <select id="template-style-picker">
                        <option value="T1" ${currentSelectedTemplate === 'T1' ? 'selected' : ''}>Template 1: Playful Pill</option>
                        <option value="T2" ${currentSelectedTemplate === 'T2' ? 'selected' : ''}>Template 2: Neon Cyber Studio</option>
                        <option value="T3" ${currentSelectedTemplate === 'T3' ? 'selected' : ''}>Template 3: Pastel Editorial</option>
                        <option value="T4" ${currentSelectedTemplate === 'T4' ? 'selected' : ''}>Template 4: Dark Bento Grid</option>
                        <option value="T5" ${currentSelectedTemplate === 'T5' ? 'selected' : ''}>Template 5: Clean Corporate Bold</option>
                    </select>
                </div>
            </div>
        `;
    }

    function renderAssetsPanel() {
        if (!rightPanelContainer) return;

        let usageGuideText = "";
        let guideBgColor = "#f4eade";
        if (currentAssetSubTab === 'shapes') {
            usageGuideText = " <b>How to use:</b> Click a shape below to instantly switch the 3D model in your portfolio preview backdrop.";
            guideBgColor = "#e1f5fe";
        } else if (currentAssetSubTab === 'ui') {
            usageGuideText = " <b>How to use:</b> Click any accent asset card to copy the character symbol, then navigate to the 'Workspace' tab and paste it directly into your text input fields.";
            guideBgColor = "#e8f5e9";
        } else if (currentAssetSubTab === 'skins') {
            usageGuideText = " <b>How to use:</b> These retro screen effects apply automatically in the background depending on your chosen Template style preset.";
            guideBgColor = "#fff3e0";
        }

        rightPanelContainer.innerHTML = `
            <div style="padding: 24px; box-sizing: border-box;">
                <h2 style="font-weight:900; margin:0 0 4px 0; font-size:1.6rem; letter-spacing:-0.5px; text-transform:uppercase;">Asset Repository</h2>
                <p style="font-size:0.85rem; color:#666; margin:0 0 16px 0; font-weight:500;">Inject custom geometry arrays or design textures into your site compilation decks.</p>
                
                <div style="background: ${guideBgColor}; color: #222; font-size: 0.8rem; padding: 12px; border-radius: 8px; border: 2px solid #111; margin-bottom: 20px; line-height: 1.4;">
                    ${usageGuideText}
                </div>

                <div class="assets-category-tabs">
                    <button class="asset-tab-btn ${currentAssetSubTab === 'shapes' ? 'active' : ''}" data-subtab="shapes">3D Shapes</button>
                    <button class="asset-tab-btn ${currentAssetSubTab === 'ui' ? 'active' : ''}" data-subtab="ui">UI Accents</button>
                    <button class="asset-tab-btn ${currentAssetSubTab === 'skins' ? 'active' : ''}" data-subtab="skins">Skins</button>
                </div>

                <div id="assets-grid-target" class="assets-grid-container"></div>
            </div>
        `;

        const gridTarget = document.getElementById('assets-grid-target');
        if (!gridTarget) return;
        
        if (currentAssetSubTab === 'shapes') {
            const shapeAssets = [
                { id: 'torus', name: 'Torus Knot', icon: '🪐' },
                { id: 'cube', name: 'Hyper Cube', icon: '📦' },
                { id: 'sphere', name: 'Geodesic Orb', icon: '🔮' },
                { id: 'cone', name: 'Cyber Cone', icon: '📐' },
                { id: 'cylinder', name: 'Data Cylinder', icon: '🔋' },
                { id: 'tetrahedron', name: 'Low-Poly Prism', icon: '💎' }
            ];

            gridTarget.innerHTML = shapeAssets.map(shape => `
                <div class="asset-card ${userProfileData.shape === shape.id ? 'active-mesh' : ''}" data-shape-id="${shape.id}">
                    ${userProfileData.shape === shape.id ? '<div class="asset-badge-tag">ACTIVE</div>' : ''}
                    <div class="asset-preview-icon">${shape.icon}</div>
                    <span>${shape.name}</span>
                </div>
            `).join('');

            gridTarget.querySelectorAll('.asset-card').forEach(card => {
                card.addEventListener('click', () => {
                    const targetShape = card.getAttribute('data-shape-id');
                    userProfileData.shape = targetShape;
                    updateThreeMesh();
                    renderAssetsPanel();
                });
            });
        } 
        else if (currentAssetSubTab === 'ui') {
            const uiAccents = [
                { name: 'Tech Target Crosshair', item: '⌖' },
                { name: 'Brutalist Arrow', item: '🡪' },
                { name: 'Matrix Code Block', item: '▰▰▱' },
                { name: 'Corner Reticle Accent', item: '🗚' },
                { name: 'Data Divider Separator', item: '⚡︎' },
                { name: 'Terminal Prompt Input', item: '//' }
            ];

            gridTarget.innerHTML = uiAccents.map(acc => `
                <div class="asset-card" data-copy-val="${acc.item}" style="padding: 16px 8px;">
                    <div class="asset-preview-icon" style="font-size:1.5rem; font-family:monospace; color:#111;">${acc.item}</div>
                    <span style="font-size:0.65rem; color:#555;">${acc.name}</span>
                    <div style="font-size:0.6rem; background:#eae9e2; padding:2px 4px; margin-top:8px; font-weight:700; border-radius:4px;">CLICK TO COPY</div>
                </div>
            `).join('');

            gridTarget.querySelectorAll('.asset-card').forEach(card => {
                card.addEventListener('click', () => {
                    const copyVal = card.getAttribute('data-copy-val');
                    navigator.clipboard.writeText(copyVal);
                    
                    const badge = card.querySelector('div:last-child');
                    badge.innerText = "COPIED!";
                    badge.style.background = "#00FFCC";
                    setTimeout(() => { renderAssetsPanel(); }, 800);
                });
            });
        } 
        else if (currentAssetSubTab === 'skins') {
            gridTarget.innerHTML = `
                <div class="asset-card" style="grid-column: span 2; padding: 30px; border-style: dashed; background: transparent; cursor: default;">
                    <div class="asset-preview-icon">🎞️</div>
                    <span style="margin-bottom: 4px;">Custom Layout Overlays</span>
                    <p style="font-size: 0.7rem; color: #777; margin: 0;">CRT scanning lines and grain noise injections will auto-configure based on your loaded Template mode selection presets.</p>
                </div>
            `;
        }

        rightPanelContainer.querySelectorAll('.asset-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentAssetSubTab = btn.getAttribute('data-subtab');
                renderAssetsPanel();
            });
        });
    }

    function renderWorkspaceTabView() {
        if (!rightPanelContainer) return;
        rightPanelContainer.innerHTML = `
            <div class="panel-scroll-wrapper">
                <div class="panel-section-title">Profile Configuration</div>
                
                <div class="control-group">
                    <label>Display Name</label>
                    <input type="text" id="input-name" value="${userProfileData.name}">
                </div>
                
                <div class="control-group">
                    <label>Accent Title Badge</label>
                    <input type="text" id="input-title" value="${userProfileData.title}">
                </div>
                
                <div class="control-group">
                    <label>Hero Headline / About Statement</label>
                    <textarea id="input-about" rows="3">${userProfileData.about}</textarea>
                </div>
                
                <div class="control-group">
                    <label>Profile Picture Upload</label>
                    <div class="avatar-upload-row">
                        <div id="upload-preview-box" class="upload-preview-square" style="background-image: url('${userAvatarUrl}')"></div>
                        <label class="file-input-label">
                            Upload Photo
                            <input type="file" id="input-avatar" accept="image/*" style="display: none;">
                        </label>
                    </div>
                </div>

                <div class="panel-section-title" style="margin-top: 24px;">3D Geometry Matrix</div>
                
                <div class="control-group">
                    <label>Mesh Structural Form</label>
                    <select id="input-shape">
                        <option value="torus" ${userProfileData.shape === 'torus' ? 'selected' : ''}>Torus Knot (Default)</option>
                        <option value="cube" ${userProfileData.shape === 'cube' ? 'selected' : ''}>Geometric Cube</option>
                        <option value="sphere" ${userProfileData.shape === 'sphere' ? 'selected' : ''}>Orb</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <label>Active Theme Tint Color</label>
                    <div class="color-picker-wrapper">
                        <input type="color" id="input-color" value="${userProfileData.color}">
                        <span id="color-hex-label" class="color-value-label">${userProfileData.color.toUpperCase()}</span>
                    </div>
                </div>

                <div class="control-group" style="margin-top: 16px;">
                    <label>Canvas Background style</label>
                    <select id="input-bg-style" style="width: 100%; padding: 10px; border: 2px solid #111111; border-radius: 10px; font-weight: 700; background: white;">
                        <option value="transparent" ${userProfileData.bgStyle === 'transparent' ? 'selected' : ''}>Transparent / Minimal</option>
                        <option value="grid" ${userProfileData.bgStyle === 'grid' ? 'selected' : ''}>Technical Grid Mesh</option>
                        <option value="particles" ${userProfileData.bgStyle === 'particles' ? 'selected' : ''}>Ambient Particle Field</option>
                    </select>
                </div>

                <div class="panel-section-title" style="margin-top: 24px;">Projects Workspace</div>
                <div class="control-group">
                    <div class="project-header-row">
                        <label>Manage Deck Items</label>
                        <button type="button" id="btn-add-project" class="small-action-btn">+ Add Item</button>
                    </div>
                </div>
                
                <div id="panel-projects-list" class="panel-drag-sortable-list"></div>
                
                <button class="action-btn-generate" style="margin-top: 20px; width:100%;">Compile & Export Portfolio</button>
            </div>
        `;
        
        bindWorkspaceInputEvents();
        renderProjects();
    }

    /* ====================================================================
       DASHBOARD NATIVE AUTO SAVE SYSTEM ARCHITECTURE
       ==================================================================== */
    
    // 1. Generate the Save Status UI banner dynamically inside the dashboard page viewport
    const saveIndicator = document.createElement('div');
    saveIndicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.85rem;
        font-weight: 900;
        padding: 10px 20px;
        border-radius: 30px;
        background-color: #111111;
        border: 2px solid #111111;
        color: #ffffff;
        box-shadow: 4px 4px 0px rgba(0,0,0,0.15);
        transition: all 0.2s ease;
        display: none;
    `;
    document.body.appendChild(saveIndicator);

    let autoSaveTimeout = null;

    // 2. Debounced save trigger implementation routing data directly to local storage
    function triggerDashboardAutoSave() {
        saveIndicator.style.display = 'block';
        saveIndicator.innerText = 'SAVING CONFIGURATION...';
        saveIndicator.style.backgroundColor = '#111111';
        saveIndicator.style.color = '#ffffff';

        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }

        autoSaveTimeout = setTimeout(() => {
            try {
                const savePayload = {
                    name: userProfileData.name,
                    title: userProfileData.title,
                    about: userProfileData.about,
                    shape: userProfileData.shape,
                    color: userProfileData.color,
                    template: currentSelectedTemplate,
                    bgStyle: userProfileData.bgStyle,
                    avatar: userAvatarUrl,
                    projects: projectsArray
                };

                localStorage.setItem('activePortfolioData', JSON.stringify(savePayload));
                
                saveIndicator.innerText = '✓ AUTO-SAVED JUST NOW';
                saveIndicator.style.backgroundColor = '#00FFCC';
                saveIndicator.style.color = '#111111';
                
                setTimeout(() => {
                    saveIndicator.style.display = 'none';
                }, 2000);
                
            } catch (error) {
                console.error("Auto-save operation broken:", error);
                saveIndicator.style.display = 'none';
            }
        }, 1000); 
    }

    // Run Initial Layout Framework Render
    updateLivePreview();
    bindWorkspaceInputEvents();
    renderProjects();
});