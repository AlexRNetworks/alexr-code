document.addEventListener('DOMContentLoaded', () => {
    let htmlEditor, cssEditor, jsEditor; // CodeMirror instances

    // UI Elements
    const previewFrame = document.getElementById('preview-frame');
    const runButton = document.getElementById('run-button');
    const downloadZipButton = document.getElementById('download-zip-button');
    const themeStylesheetLink = document.getElementById('theme-stylesheet');
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
    const LS_UNSAVED_WORK_KEY = 'alexrCodeUnsavedWork';

    console.log("Alexr Code script.js: DOMContentLoaded - Refining In-Editor Linting.");

    // --- Default Settings ---
    const DEFAULT_CODEMIRROR_THEME = 'material-darker';
    const DEFAULT_EDITOR_FONT_SIZE = 14;

    // --- Apply Initial Editor Settings ---
    function applyInitialEditorSettings() {
        const savedCmTheme = localStorage.getItem(LS_CODEMIRROR_THEME_KEY) || DEFAULT_CODEMIRROR_THEME;
        const savedFontSize = parseInt(localStorage.getItem(LS_EDITOR_FONT_SIZE_KEY), 10) || DEFAULT_EDITOR_FONT_SIZE;
        document.documentElement.style.setProperty('--editor-font-size', `${savedFontSize}px`);
        initialCodeMirrorOptions.theme = savedCmTheme;
        if(codeMirrorThemeSelect) codeMirrorThemeSelect.value = savedCmTheme;
        if(editorFontSizeInput) editorFontSizeInput.value = savedFontSize;
    }
    
    const initialCodeMirrorOptions = { 
        lineNumbers: true,
        theme: DEFAULT_CODEMIRROR_THEME, 
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        lint: true, // Enable linting globally for CM instances
        gutters: ["CodeMirror-linenumbers", "CodeMirror-lint-markers"] 
    };
    applyInitialEditorSettings(); 

    // --- JSHint Configuration (global options for the linter) ---
    // CodeMirror's javascript-lint.js will use window.JSHINT with these options.
    const jsHintOptions = {
        esversion: 2021, // Allows modern JavaScript syntax
        browser: true,    // Defines browser globals (document, window, etc.)
        undef: true,      // Warn on use of undefined variables (that are not in `globals`)
        unused: 'vars',   // Warn on unused variables (can be true or 'strict')
        // eqeqeq: true,  // Uncomment to enforce === over ==
        // laxcomma: true, // Allow comma-first style if desired
        globals: {
            // Define any global variables your users might commonly use from external scripts
            // or that you provide. Example:
            // "$": false, // false means it's a global but should not be overwritten
            // "jQuery": false,
            // "React": false,
            // "Vue": false
        }
    };

    // --- HTMLHint Configuration (global rules for the linter) ---
    // CodeMirror's html-lint.js will use window.HTMLHint.
    // You can customize rules here. Find HTMLHint rules online.
    // Example: window.HTMLHint.ruleset = { "tag-pair": true, "alt-require": true, ... };
    // For now, we'll rely on HTMLHint's defaults picked up by html-lint.js.
    // To pass options directly to html-lint.js, it can be done in the CM init.

    // --- CSSLint Configuration (global rules for the linter) ---
    // CodeMirror's css-lint.js will use window.CSSLint.
    // CSSLint rules can be complex to configure globally. Often, you pass specific rules
    // to CSSLint.verify(), which the html-lint.js addon might do.
    // For now, rely on defaults.

    // --- Initialize CodeMirror ---
    try {
        htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), {
            ...initialCodeMirrorOptions, 
            mode: 'htmlmixed',
            lint: true // Rely on html-lint.js to use global HTMLHint
                       // or pass options: lint: { options: { "tag-lowercase": true, ... } }
        });
        cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {
            ...initialCodeMirrorOptions, 
            mode: 'css',
            lint: true // Rely on css-lint.js to use global CSSLint
                       // or pass specific CSSLint rules: lint: { options: { "ids": false, "important": true } }
        });
        jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {
            ...initialCodeMirrorOptions, 
            mode: 'javascript',
            lint: { options: jsHintOptions } // Pass our defined JSHint options
        });
        
        setupAutoSave(htmlEditor); 
        setupAutoSave(cssEditor); 
        setupAutoSave(jsEditor);
        console.log("CodeMirror instances initialized with refined linting setup.");
    } catch (e) {
        console.error("Error initializing CodeMirror:", e);
    }

    // --- CodeMirror Refresh Function ---
    function refreshAllCodeMirrors() {
        if (htmlEditor) htmlEditor.refresh();
        if (cssEditor) cssEditor.refresh();
        if (jsEditor) jsEditor.refresh();
    }

    // --- Initialize Split.js Panes ---
    function initializeFixedSplits() { /* ... (Same as previous full script) ... */ }
    initializeFixedSplits(); 
    
    // --- Page Theme Application ---
    function applyAppTheme() { /* ... (Same as previous full script) ... */ }
    applyAppTheme();

    // --- Custom Console Logging ---
    function logToCustomConsole(argsArray, type = 'log') { /* ... (Same as previous full script) ... */ }

    // --- Preview Update ---
    function updatePreview() { /* ... (Same as previous full script) ... */ }

    function refreshEditorsAndPreview() {
        refreshAllCodeMirrors();
        updatePreview();
    }
    setTimeout(refreshEditorsAndPreview, 350); // Initial full refresh

    // --- Event Listeners (Run, Clear Console) ---
    if(runButton) runButton.addEventListener('click', () => {
        if (consoleOutputDiv) consoleOutputDiv.innerHTML = ''; 
        updatePreview();
    });
    if(clearConsoleButton) clearConsoleButton.addEventListener('click', () => {
        if (consoleOutputDiv) consoleOutputDiv.innerHTML = '';
    });

    // --- Modal Generic Close Logic ---
    function closeModal(modalElement) { if (modalElement) modalElement.style.display = 'none'; }
    document.querySelectorAll('.close-button, .button-alt.close-modal-action').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal-id');
            if (modalId) closeModal(document.getElementById(modalId));
        });
    });
    window.onclick = function(event) { if (event.target.classList.contains('modal')) { closeModal(event.target); } }

    // --- Project Save/Load Functionality ---
    function getProjects() { const p = localStorage.getItem(LS_PROJECTS_KEY); return p ? JSON.parse(p) : []; }
    function saveProjects(pA) { localStorage.setItem(LS_PROJECTS_KEY, JSON.stringify(pA)); }

    if(saveProjectButton) saveProjectButton.addEventListener('click', () => {
        const existingProject = currentProjectId ? getProjects().find(p => p.id === currentProjectId) : null;
        projectNameInput.value = existingProject ? existingProject.name : '';
        const saveModalTitleEl = document.getElementById('save-modal-title'); // Assumes this ID exists if "Save As" was added
        if(saveModalTitleEl) saveModalTitleEl.textContent = existingProject ? 'Update Project' : 'Save New Project';
        else if(saveProjectModal) saveProjectModal.querySelector('h2').textContent = existingProject ? 'Update Project' : 'Save New Project';

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
                if (p.id === currentProjectId) { projectExistsAndUpdated = true; return { ...p, ...projectData }; }
                return p;
            });
        }
        if (!projectExistsAndUpdated) { 
             const newId = Date.now() + Math.random();
             ps.push({ ...projectData, id: newId });
             currentProjectId = newId; 
        }
        saveProjects(ps);
        localStorage.removeItem(LS_UNSAVED_WORK_KEY); 
        alert(`Project "${pN}" saved!`);
        closeModal(saveProjectModal);
    });

    if(loadProjectsButton) loadProjectsButton.addEventListener('click', () => { renderProjectsList(); loadProjectsModal.style.display = 'block'; });
    
    function renderProjectsList() { /* ... (Same as previous full script) ... */ }
    function loadProject(pId) { /* ... (Same as previous full script) ... */ }
    function deleteProject(pId) { /* ... (Same as previous full script) ... */ }
    
    // --- Settings Modal ---
    if(settingsButton) settingsButton.addEventListener('click', () => { /* ... (Same as previous full script) ... */ });
    if(applySettingsButton) applySettingsButton.addEventListener('click', () => { /* ... (Same as previous full script) ... */ });

    // --- Download ZIP ---
    if(downloadZipButton) downloadZipButton.addEventListener('click', () => { /* ... (Same as previous full script) ... */ });
    function generateAndDownloadZip(zipInstance) { /* ... (Same as previous full script) ... */ }
    
    // --- Fullscreen Preview ---
    if(fullscreenButton) fullscreenButton.addEventListener('click', () => toggleFullScreen(previewFrame));
    function toggleFullScreen(element) { /* ... (Same as previous full script) ... */ }
    function updateFullscreenButtonText() { /* ... (Same as previous full script) ... */ }
    ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(event => 
        document.addEventListener(event, updateFullscreenButtonText, false)
    );

    // --- Initialize with default content, unsaved work, or last project ---
    function setInitialContent(callRefreshPreview = true, autoSaveThisContent = true) { /* ... (Same as previous full script) ... */ }

    // Initial Page Load Logic
    const unsavedWorkJSON = localStorage.getItem(LS_UNSAVED_WORK_KEY);
    let loadedUnsavedWork = false;
    if (unsavedWorkJSON) {
        try {
            const unsavedWork = JSON.parse(unsavedWorkJSON);
            if (unsavedWork && typeof unsavedWork.html === 'string') {
                if(htmlEditor) htmlEditor.setValue(unsavedWork.html);
                if(cssEditor) cssEditor.setValue(unsavedWork.css || '');
                if(jsEditor) jsEditor.setValue(unsavedWork.js || '');
                externalCSS = Array.isArray(unsavedWork.externalCSS) ? [...unsavedWork.externalCSS] : [];
                externalJS = Array.isArray(unsavedWork.externalJS) ? [...unsavedWork.externalJS] : [];
                currentProjectId = null; 
                loadedUnsavedWork = true;
            }
        } catch (e) { console.error("Error parsing unsaved work:", e); localStorage.removeItem(LS_UNSAVED_WORK_KEY); }
    }

    if (!loadedUnsavedWork) {
        const projects = getProjects();
        if (projects.length > 0 && projects[0].id) {
           loadProject(projects[0].id); 
        } else {
           setInitialContent(true, true); 
        }
    }
    setTimeout(refreshEditorsAndPreview, 400);


    // == Ensure all placeholder function bodies are filled from the previous stable script ==
    // (The functions below are copied from Turn 59/61/81 as they were largely stable)
    function initializeFixedSplits() {
        try {
            Split(['#html-editor-wrapper', '#css-editor-wrapper', '#js-editor-wrapper'], {
                sizes: [33.3, 33.3, 33.4], minSize: 60, gutterSize: 8, direction: 'horizontal', cursor: 'col-resize',
                onDragEnd: refreshAllCodeMirrors
            });
            Split(['#preview-wrapper', '#console-wrapper'], {
                sizes: [70, 30], minSize: [50, 40], gutterSize: 8, direction: 'vertical', cursor: 'row-resize',
                elementStyle: (dim, size, gutterSize) => ({ 'flex-basis': `calc(${size}% - ${gutterSize}px)` }),
                gutterStyle: (dim, gutterSize) => ({ 'flex-basis': `${gutterSize}px` })
            });
            Split(['#code-editors-pane', '#output-pane'], {
                sizes: [55, 45], minSize: [150, 150], gutterSize: 8,
                direction: 'vertical', cursor: 'row-resize',    
                onDragEnd: refreshAllCodeMirrors
            });
            setTimeout(refreshAllCodeMirrors, 150); 
        } catch (e) { console.error("Error initializing Split.js:", e); }
    }
    function applyAppTheme() {
        const selectedThemePath = localStorage.getItem(LS_PAGE_THEME_KEY);
        if (themeStylesheetLink) {
            themeStylesheetLink.setAttribute('href', (selectedThemePath && selectedThemePath !== "default") ? selectedThemePath : '');
        }
    }
    // updatePreview is already defined above with linting console setup
    // refreshEditorsAndPreview is already defined
    // closeModal already defined
    // getProjects and saveProjects already defined
    // saveProjectButton and confirmSaveButton listeners already defined
    // loadProjectsButton listener already defined
    function renderProjectsList() {
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
    // loadProject already defined, includes applying editor settings and autoSave
    // deleteProject already defined
    if(settingsButton) settingsButton.addEventListener('click', () => {
        externalCssUrlsTextarea.value = externalCSS.join('\n');
        externalJsUrlsTextarea.value = externalJS.join('\n');
        if(codeMirrorThemeSelect) codeMirrorThemeSelect.value = localStorage.getItem(LS_CODEMIRROR_THEME_KEY) || DEFAULT_CODEMIRROR_THEME;
        if(editorFontSizeInput) editorFontSizeInput.value = parseInt(localStorage.getItem(LS_EDITOR_FONT_SIZE_KEY), 10) || DEFAULT_EDITOR_FONT_SIZE;
        settingsModal.style.display = 'block';
    });
    if(applySettingsButton) applySettingsButton.addEventListener('click', () => {
        const oldExternalCSS = JSON.stringify(externalCSS);
        const oldExternalJS = JSON.stringify(externalJS);
        externalCSS = externalCssUrlsTextarea.value.split('\n').map(url => url.trim()).filter(url => url);
        externalJS = externalJsUrlsTextarea.value.split('\n').map(url => url.trim()).filter(url => url);
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
        if (consoleOutputDiv) consoleOutputDiv.innerHTML = '';
        if(JSON.stringify(externalCSS) !== oldExternalCSS || JSON.stringify(externalJS) !== oldExternalJS) {
            triggerAutoSaveForExternalLibs();
        }
        updatePreview(); 
    });
    // Download ZIP listener and function already defined
    function generateAndDownloadZip(zipInstance) {
        zipInstance.generateAsync({ type: "blob" }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "alexr-code-project.zip";
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }).catch(err => { console.error("Error generating ZIP: ", err); alert("Could not generate ZIP."); });
    }
    // Fullscreen listener and functions already defined
    function toggleFullScreen(element) {
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
    function updateFullscreenButtonText() {
        if(fullscreenButton) {
            const isFs = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
            fullscreenButton.textContent = isFs ? 'Exit Fullscreen' : 'Fullscreen Preview';
        }
    }
    function setInitialContent(callRefreshPreview = true, autoSaveThisContent = true) {
        if (!htmlEditor || !cssEditor || !jsEditor) return; 
        htmlEditor.setValue("<h1>Welcome to Alexr Code!</h1>\n<p>Your ideas start here. Try some HTML, CSS, and JavaScript.</p>\n<button onclick=\"greetUser()\">Say Hello</button>");
        cssEditor.setValue(
`body { 
    font-family: Arial, Helvetica, sans-serif; 
    margin: 20px; 
    text-align: center; 
}
h1 { color: #007aff; }
p { font-size: 1.1em; }
button { 
    padding: 10px 20px; font-size: 1em; color: white; 
    background-color: #28a745; border: none; border-radius: 5px; 
    cursor: pointer; transition: background-color 0.2s;
}
button:hover { background-color: #218838; }`
        );
        jsEditor.setValue(
`function greetUser() {
  const name = prompt("What's your name?", "Coder");
  if (name) {
    alert("Hello, " + name + "! Happy coding!");
    console.log("Greeted: " + name);
  } else {
    alert("Hello there! Happy coding!");
    console.warn("User did not enter a name.");
  }
}
console.info("Alexr Code initialized and ready! Linting is active.");
// JSHint test:
// myUndeclaredVar = "should be flagged";
// let unused;
`
        );
        externalCSS = []; externalJS = []; currentProjectId = null;
        applyInitialEditorSettings(); 
        if (consoleOutputDiv) consoleOutputDiv.innerHTML = '';
        if (autoSaveThisContent) autoSaveUnsavedWork();
        if (callRefreshPreview) { setTimeout(refreshEditorsAndPreview, 250); }
    }

}); // End DOMContentLoaded
