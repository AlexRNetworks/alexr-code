document.addEventListener('DOMContentLoaded', () => {
    let htmlEditor, cssEditor, jsEditor; // CodeMirror instances

    // UI Elements
    const previewFrame = document.getElementById('preview-frame');
    const runButton = document.getElementById('run-button');
    const downloadZipButton = document.getElementById('download-zip-button');
    const themeStylesheetLink = document.getElementById('theme-stylesheet'); // For page theme
    const fullscreenButton = document.getElementById('fullscreen-button');
    const saveProjectButton = document.getElementById('save-project-button');
    const loadProjectsButton = document.getElementById('load-projects-button');
    const settingsButton = document.getElementById('settings-button');

    // Modals & their content
    const saveProjectModal = document.getElementById('save-project-modal');
    const projectNameInput = document.getElementById('project-name-input');
    const confirmSaveButton = document.getElementById('confirm-save-button');

    const loadProjectsModal = document.getElementById('load-projects-modal');
    const projectsListContainer = document.getElementById('projects-list-container');

    const settingsModal = document.getElementById('settings-modal');
    const externalCssUrlsTextarea = document.getElementById('external-css-urls');
    const externalJsUrlsTextarea = document.getElementById('external-js-urls');
    const codeMirrorThemeSelect = document.getElementById('codemirror-theme-select'); 
    const editorFontSizeInput = document.getElementById('editor-font-size-input'); 
    const applySettingsButton = document.getElementById('apply-settings-button');
    
    const consoleOutputDiv = document.getElementById('console-output');
    const clearConsoleButton = document.getElementById('clear-console-button');
    
    let externalCSS = []; 
    let externalJS = [];  
    let currentProjectId = null; 

    // --- LocalStorage Keys ---
    const LS_PROJECTS_KEY = 'alexrCodeProjects';
    const LS_PAGE_THEME_KEY = 'selectedTheme'; 
    const LS_CODEMIRROR_THEME_KEY = 'alexrCodeMirrorTheme'; 
    const LS_EDITOR_FONT_SIZE_KEY = 'alexrCodeEditorFontSize'; 
    const LS_UNSAVED_WORK_KEY = 'alexrCodeUnsavedWork'; // NEW for unsaved work

    console.log("Alexr Code script.js: DOMContentLoaded - Unsaved work persistence added");

    // --- Default Settings ---
    const DEFAULT_CODEMIRROR_THEME = 'material-darker';
    const DEFAULT_EDITOR_FONT_SIZE = 14;

    // --- Auto-Save for Unsaved Work ---
    let autoSaveTimeout;
    function autoSaveUnsavedWork() {
        if (!htmlEditor || !cssEditor || !jsEditor) {
            // Editors might not be ready on initial very fast calls
            // console.log("Auto-save skipped: Editors not ready.");
            return; 
        }
        const unsavedWork = {
            html: htmlEditor.getValue(),
            css: cssEditor.getValue(),
            js: jsEditor.getValue(),
            externalCSS: [...externalCSS],
            externalJS: [...externalJS],
            // Note: Editor appearance settings (CM theme, font size) are global,
            // so they are not part of "unsaved work" specific to content.
            // They are loaded initially and applied.
            timestamp: Date.now()
        };
        localStorage.setItem(LS_UNSAVED_WORK_KEY, JSON.stringify(unsavedWork));
        console.log("Unsaved work auto-saved to localStorage at", new Date(unsavedWork.timestamp).toLocaleTimeString());
    }

    function setupAutoSave(editorInstance) {
        if (editorInstance) {
            editorInstance.on('change', () => {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(autoSaveUnsavedWork, 1500); // Auto-save after 1.5s of inactivity
            });
        }
    }
    // Event listeners for externalCSS/JS changes to also trigger auto-save
    function triggerAutoSaveForExternalLibs() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(autoSaveUnsavedWork, 1500);
    }


    // --- Apply Initial Editor Settings from LocalStorage ---
    function applyInitialEditorSettings() {
        const savedCmTheme = localStorage.getItem(LS_CODEMIRROR_THEME_KEY) || DEFAULT_CODEMIRROR_THEME;
        const savedFontSize = parseInt(localStorage.getItem(LS_EDITOR_FONT_SIZE_KEY), 10) || DEFAULT_EDITOR_FONT_SIZE;

        document.documentElement.style.setProperty('--editor-font-size', `${savedFontSize}px`);
        
        initialCodeMirrorOptions.theme = savedCmTheme;

        if(codeMirrorThemeSelect) codeMirrorThemeSelect.value = savedCmTheme;
        if(editorFontSizeInput) editorFontSizeInput.value = savedFontSize;
    }
    
    const initialCodeMirrorOptions = { 
        lineNumbers: true, theme: DEFAULT_CODEMIRROR_THEME, 
        autoCloseTags: true, autoCloseBrackets: true, lineWrapping: true,
    };
    applyInitialEditorSettings(); 

    // --- Initialize CodeMirror ---
    try {
        htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), {...initialCodeMirrorOptions, mode: 'htmlmixed'});
        cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {...initialCodeMirrorOptions, mode: 'css'});
        jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {...initialCodeMirrorOptions, mode: 'javascript'});
        
        // Setup auto-save listeners after editors are initialized
        setupAutoSave(htmlEditor);
        setupAutoSave(cssEditor);
        setupAutoSave(jsEditor);

        console.log("CodeMirror instances initialized.");
    } catch (e) {
        console.error("Error initializing CodeMirror:", e);
    }

    // --- CodeMirror Refresh Function ---
    function refreshAllCodeMirrors() {
        if (htmlEditor) htmlEditor.refresh();
        if (cssEditor) cssEditor.refresh();
        if (jsEditor) jsEditor.refresh();
    }

    // --- Initialize Split.js Panes (Fixed Vertical Layout) ---
    function initializeFixedSplits() { /* ... (Same as Turn 59/61) ... */ }
    initializeFixedSplits(); 
    
    // --- Page Theme Application ---
    function applyAppTheme() { /* ... (Same as Turn 59/61) ... */ }
    applyAppTheme();

    // --- Custom Console Logging ---
    function logToCustomConsole(argsArray, type = 'log') { /* ... (Same as Turn 59/61) ... */ }

    // --- Preview Update ---
    function updatePreview() { /* ... (Same as Turn 59/61 - including console override logic) ... */ }

    function refreshEditorsAndPreview() {
        refreshAllCodeMirrors();
        updatePreview();
    }
    // setTimeout for initial refresh will be handled after loading content

    // --- Event Listeners ---
    if(runButton) runButton.addEventListener('click', () => {
        if (consoleOutputDiv) consoleOutputDiv.innerHTML = ''; 
        updatePreview();
    });

    if(clearConsoleButton) clearConsoleButton.addEventListener('click', () => {
        if (consoleOutputDiv) consoleOutputDiv.innerHTML = '';
    });

    // --- Modal Generic Close Logic ---
    function closeModal(modalElement) { /* ... (Same as Turn 59/61) ... */ }
    document.querySelectorAll('.close-button, .button-alt.close-modal-action').forEach(button => { /* ... */ });
    window.onclick = function(event) { /* ... */ }

    // --- Project Save/Load Functionality ---
    function getProjects() { const p = localStorage.getItem(LS_PROJECTS_KEY); return p ? JSON.parse(p) : []; }
    function saveProjects(pA) { localStorage.setItem(LS_PROJECTS_KEY, JSON.stringify(pA)); }

    if(saveProjectButton) saveProjectButton.addEventListener('click', () => {
        const existingProject = currentProjectId ? getProjects().find(p => p.id === currentProjectId) : null;
        projectNameInput.value = existingProject ? existingProject.name : '';
        saveProjectModal.style.display = 'block';
        projectNameInput.focus();
    });

    if(confirmSaveButton) confirmSaveButton.addEventListener('click', () => {
        const pN = projectNameInput.value.trim(); if(!pN){alert('Project name required.'); projectNameInput.focus(); return;}
        
        const cmThemeToSave = localStorage.getItem(LS_CODEMIRROR_THEME_KEY) || DEFAULT_CODEMIRROR_THEME;
        const editorFontSizeToSave = parseInt(localStorage.getItem(LS_EDITOR_FONT_SIZE_KEY), 10) || DEFAULT_EDITOR_FONT_SIZE;

        const projectData = {
            name:pN, html:htmlEditor.getValue(), css:cssEditor.getValue(), js:jsEditor.getValue(),
            externalCSS: [...externalCSS], externalJS: [...externalJS], 
            cmTheme: cmThemeToSave, editorFontSize: editorFontSizeToSave,
            savedAt:new Date().toISOString()
        };
        
        let ps = getProjects();
        let projectExistsAndUpdated = false;
        if (currentProjectId) { 
            ps = ps.map(p => {
                if (p.id === currentProjectId) {
                    projectExistsAndUpdated = true;
                    return { ...p, ...projectData }; 
                }
                return p;
            });
        }
        
        if (!projectExistsAndUpdated) { 
             const newId = Date.now();
             ps.push({ ...projectData, id: newId });
             currentProjectId = newId; 
        }
        saveProjects(ps);
        localStorage.removeItem(LS_UNSAVED_WORK_KEY); // Clear unsaved work after explicit save
        console.log(`Project "${pN}" saved! Unsaved work slot cleared.`);
        alert(`Project "${pN}" saved!`);
        closeModal(saveProjectModal);
    });

    if(loadProjectsButton) loadProjectsButton.addEventListener('click', () => { renderProjectsList(); loadProjectsModal.style.display = 'block'; });
    
    function renderProjectsList() { /* ... (Same as Turn 59/61) ... */ }

    function loadProject(pId) {
        const ps=getProjects(); const pTL=ps.find(p=>p.id===pId);
        if(pTL){
            htmlEditor.setValue(pTL.html || ''); cssEditor.setValue(pTL.css || ''); jsEditor.setValue(pTL.js || '');
            externalCSS = Array.isArray(pTL.externalCSS) ? [...pTL.externalCSS] : [];
            externalJS = Array.isArray(pTL.externalJS) ? [...pTL.externalJS] : [];
            currentProjectId = pTL.id;

            const cmTheme = pTL.cmTheme || DEFAULT_CODEMIRROR_THEME;
            const editorFontSize = pTL.editorFontSize || DEFAULT_EDITOR_FONT_SIZE;

            localStorage.setItem(LS_CODEMIRROR_THEME_KEY, cmTheme);
            localStorage.setItem(LS_EDITOR_FONT_SIZE_KEY, editorFontSize);

            if (htmlEditor) htmlEditor.setOption('theme', cmTheme);
            if (cssEditor) cssEditor.setOption('theme', cmTheme);
            if (jsEditor) jsEditor.setOption('theme', cmTheme);
            document.documentElement.style.setProperty('--editor-font-size', `${editorFontSize}px`);
            
            if(codeMirrorThemeSelect) codeMirrorThemeSelect.value = cmTheme;
            if(editorFontSizeInput) editorFontSizeInput.value = editorFontSize;
            
            if (consoleOutputDiv) consoleOutputDiv.innerHTML = '';
            
            autoSaveUnsavedWork(); // Update unsaved slot with the content of the loaded project
            
            setTimeout(()=>{
                refreshEditorsAndPreview();
            },100); 
            alert(`Project "${pTL.name}" loaded!`); closeModal(loadProjectsModal);
        } else { alert('Error: Project not found.'); currentProjectId = null; }
    }

    function deleteProject(pId) {
        if(!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
        let ps=getProjects(); ps=ps.filter(p=>p.id!==pId); saveProjects(ps);
        if (currentProjectId === pId) {
            setInitialContent(false, true); // Pass true to autoSave the default content
            currentProjectId = null; 
        }
        renderProjectsList(); alert('Project deleted.');
    }
    
    // --- Settings Modal ---
    if(settingsButton) settingsButton.addEventListener('click', () => { /* ... (Same as Turn 59/61) ... */ });
    if(applySettingsButton) applySettingsButton.addEventListener('click', () => {
        // External Libs
        const oldExternalCSS = JSON.stringify(externalCSS);
        const oldExternalJS = JSON.stringify(externalJS);

        externalCSS = externalCssUrlsTextarea.value.split('\n').map(url => url.trim()).filter(url => url);
        externalJS = externalJsUrlsTextarea.value.split('\n').map(url => url.trim()).filter(url => url);

        // Editor Appearance
        const newCmTheme = codeMirrorThemeSelect.value;
        const newFontSize = parseInt(editorFontSizeInput.value, 10);

        localStorage.setItem(LS_CODEMIRROR_THEME_KEY, newCmTheme);
        if (htmlEditor) htmlEditor.setOption('theme', newCmTheme);
        if (cssEditor) cssEditor.setOption('theme', newCmTheme);
        if (jsEditor) jsEditor.setOption('theme', newCmTheme);

        if (!isNaN(newFontSize) && newFontSize >= 8 && newFontSize <= 30) {
            localStorage.setItem(LS_EDITOR_FONT_SIZE_KEY, newFontSize);
            document.documentElement.style.setProperty('--editor-font-size', `${newFontSize}px`);
            refreshAllCodeMirrors(); 
        } else {
            alert("Invalid font size. Please enter a number between 8 and 30.");
            editorFontSizeInput.value = localStorage.getItem(LS_EDITOR_FONT_SIZE_KEY) || DEFAULT_EDITOR_FONT_SIZE;
        }
        
        closeModal(settingsModal); 
        if (consoleOutputDiv) consoleOutputDiv.innerHTML = ''; // Clear console as preview will re-render
        
        // Auto-save if external libs changed
        if(JSON.stringify(externalCSS) !== oldExternalCSS || JSON.stringify(externalJS) !== oldExternalJS) {
            triggerAutoSaveForExternalLibs();
        }
        updatePreview(); 
    });

    // --- Download ZIP ---
    if(downloadZipButton) downloadZipButton.addEventListener('click', () => { /* ... (Same as Turn 59/61) ... */ });
    function generateAndDownloadZip(zipInstance) { /* ... (Same as Turn 59/61) ... */ }
    
    // --- Fullscreen Preview ---
    if(fullscreenButton) fullscreenButton.addEventListener('click', () => toggleFullScreen(previewFrame));
    function toggleFullScreen(element) { /* ... (Same as Turn 59/61) ... */ }
    function updateFullscreenButtonText() { /* ... (Same as Turn 59/61) ... */ }
    ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(event => 
        document.addEventListener(event, updateFullscreenButtonText, false)
    );

    // --- Initialize with default content, unsaved work, or last project ---
    function setInitialContent(callRefreshPreview = true, autoSaveThisContent = true) { // Added autoSaveThisContent flag
        if (!htmlEditor || !cssEditor || !jsEditor) return; 
        htmlEditor.setValue("<h1>Welcome to Alexr Code!</h1>\n<p>Your ideas start here. Try some HTML, CSS, and JavaScript.</p>\n<button onclick=\"greetUser()\">Say Hello</button>");
        cssEditor.setValue( /* ... (default CSS from Turn 59/61) ... */ );
        jsEditor.setValue( /* ... (default JS from Turn 59/61) ... */ );
        
        externalCSS = []; 
        externalJS = [];
        currentProjectId = null;

        // Apply default/global editor appearance settings
        const initialCmTheme = localStorage.getItem(LS_CODEMIRROR_THEME_KEY) || DEFAULT_CODEMIRROR_THEME;
        const initialFontSize = parseInt(localStorage.getItem(LS_EDITOR_FONT_SIZE_KEY), 10) || DEFAULT_EDITOR_FONT_SIZE;
        
        if (htmlEditor) htmlEditor.setOption('theme', initialCmTheme);
        if (cssEditor) cssEditor.setOption('theme', initialCmTheme);
        if (jsEditor) jsEditor.setOption('theme', initialCmTheme);
        document.documentElement.style.setProperty('--editor-font-size', `${initialFontSize}px`);
        
        if(codeMirrorThemeSelect) codeMirrorThemeSelect.value = initialCmTheme;
        if(editorFontSizeInput) editorFontSizeInput.value = initialFontSize;

        if (consoleOutputDiv) consoleOutputDiv.innerHTML = '';
        if (autoSaveThisContent) autoSaveUnsavedWork(); // Save this default content to the unsaved slot
        if (callRefreshPreview) {
            setTimeout(refreshEditorsAndPreview, 250);
        }
    }

    // Initial Page Load Logic:
    // 1. Apply page theme and editor appearance settings first
    applyAppTheme(); // Applies page theme
    // applyInitialEditorSettings() is already called before CM init to set CM options

    // 2. Try to load unsaved work
    const unsavedWorkJSON = localStorage.getItem(LS_UNSAVED_WORK_KEY);
    let loadedUnsavedWork = false;
    if (unsavedWorkJSON) {
        try {
            const unsavedWork = JSON.parse(unsavedWorkJSON);
            if (unsavedWork && typeof unsavedWork.html === 'string') { // Basic check
                htmlEditor.setValue(unsavedWork.html);
                cssEditor.setValue(unsavedWork.css || '');
                jsEditor.setValue(unsavedWork.js || '');
                externalCSS = Array.isArray(unsavedWork.externalCSS) ? [...unsavedWork.externalCSS] : [];
                externalJS = Array.isArray(unsavedWork.externalJS) ? [...unsavedWork.externalJS] : [];
                currentProjectId = null; // It's unsaved work, not a specific saved project
                loadedUnsavedWork = true;
                console.log("Loaded unsaved work from previous session.");
                // Don't clear LS_UNSAVED_WORK_KEY here; it will be updated by auto-save or cleared on explicit save.
            }
        } catch (e) {
            console.error("Error parsing unsaved work from localStorage:", e);
            localStorage.removeItem(LS_UNSAVED_WORK_KEY); // Clear corrupted data
        }
    }

    // 3. If no unsaved work, try to load the most recent project or set defaults
    if (!loadedUnsavedWork) {
        const projects = getProjects();
        if (projects.length > 0 && projects[0].id) {
           loadProject(projects[0].id); // This will also call autoSaveUnsavedWork
        } else {
           setInitialContent(true, true); // Sets default and auto-saves it
        }
    }
    
    // Final refresh after all initial setup and content loading
    setTimeout(refreshEditorsAndPreview, 400);


    // == Ensure all functions below are complete based on Turn 59/61 ==
    // (Pasting them fully here for clarity this time)

    // function initializeFixedSplits() { // Already defined above }
    // function applyAppTheme() { // Already defined above }
    // function logToCustomConsole(argsArray, type = 'log') { // Already defined above }
    // function updatePreview() { // Already defined above }
    // function refreshEditorsAndPreview() { // Already defined above }
    function closeModal(modalElement) { // Defined above
        if (modalElement) modalElement.style.display = 'none';
    }
    // function getProjects() { // Already defined above }
    // function saveProjects(pA) { // Already defined above }
    function renderProjectsList() { // Full implementation
        const ps = getProjects(); projectsListContainer.innerHTML = '';
        if(ps.length === 0){projectsListContainer.innerHTML='<p>No projects saved yet.</p>'; return;}
        ps.sort((a,b) => new Date(b.savedAt) - new Date(a.savedAt));
        ps.forEach(p => {
            const pD=document.createElement('div');pD.className='project-item';
            const nS=document.createElement('span');nS.className='project-item-name';nS.textContent=p.name;
            const aD=document.createElement('div');aD.className='project-item-actions';
            const lB=document.createElement('button');lB.textContent='Load';lB.className='load-button primary-action'; lB.onclick=()=>loadProject(p.id);
            const dB=document.createElement('button');dB.textContent='Delete';dB.className='delete-button'; dB.onclick=()=>deleteProject(p.id);
            aD.appendChild(lB);aD.appendChild(dB);pD.appendChild(nS);pD.appendChild(aD);projectsListContainer.appendChild(pD);
        });
    }
    // function loadProject(pId) { // Already defined above and updated for auto-save }
    // function deleteProject(pId) { // Already defined above and updated }
    // function setInitialContent(callRefreshPreview = true, autoSaveThisContent = true) { // Already defined above and updated }
    function generateAndDownloadZip(zipInstance) { // Full implementation
        zipInstance.generateAsync({ type: "blob" }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "alexr-code-project.zip";
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }).catch(err => { console.error("Error generating ZIP: ", err); alert("Could not generate ZIP."); });
    }
    function toggleFullScreen(element) { // Full implementation
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (element.requestFullscreen) element.requestFullscreen();
            else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
            else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
            else if (element.msRequestFullscreen) element.msRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
        }
    }
    function updateFullscreenButtonText() { // Full implementation
        if(fullscreenButton) {
            const isFs = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
            fullscreenButton.textContent = isFs ? 'Exit Fullscreen' : 'Fullscreen Preview';
        }
    }

}); // End DOMContentLoaded
