document.addEventListener('DOMContentLoaded', () => {
    let htmlEditor, cssEditor, jsEditor; // CodeMirror instances

    // UI Elements (ensure all IDs match your HTML)
    const previewFrame = document.getElementById('preview-frame');
    const runButton = document.getElementById('run-button');
    const downloadZipButton = document.getElementById('download-zip-button');
    const themeStylesheetLink = document.getElementById('theme-stylesheet');
    const fullscreenButton = document.getElementById('fullscreen-button');
    const saveProjectButton = document.getElementById('save-project-button');
    const saveAsProjectButton = document.getElementById('save-as-project-button'); // NEW
    const loadProjectsButton = document.getElementById('load-projects-button');
    const settingsButton = document.getElementById('settings-button');

    const saveProjectModal = document.getElementById('save-project-modal');
    const saveModalTitle = document.getElementById('save-modal-title'); // NEW (for Save/Save As)
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
    let isSaveAsOperation = false; // NEW flag for Save As

    // --- LocalStorage Keys ---
    const LS_PROJECTS_KEY = 'alexrCodeProjects';
    const LS_PAGE_THEME_KEY = 'selectedTheme'; 
    const LS_CODEMIRROR_THEME_KEY = 'alexrCodeMirrorTheme'; 
    const LS_EDITOR_FONT_SIZE_KEY = 'alexrCodeEditorFontSize'; 

    console.log("Alexr Code script.js: DOMContentLoaded - Linting & Save As Added");

    // --- Default Settings ---
    const DEFAULT_CODEMIRROR_THEME = 'material-darker';
    const DEFAULT_EDITOR_FONT_SIZE = 14;

    // --- Apply Initial Editor Settings from LocalStorage ---
    function applyInitialEditorSettings() { /* ... (Same as Turn 53) ... */ }
    
    const initialCodeMirrorOptions = { 
        lineNumbers: true, theme: DEFAULT_CODEMIRROR_THEME, 
        autoCloseTags: true, autoCloseBrackets: true, lineWrapping: true,
        // --- NEW: Linting options ---
        lint: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-lint-markers"]
    };
    applyInitialEditorSettings(); 

    // --- Initialize CodeMirror ---
    try {
        htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), {
            ...initialCodeMirrorOptions, 
            mode: 'htmlmixed',
            // HTMLHint options can be set globally or passed if html-lint.js supports it
            // lint: { options: { /* HTMLHint rules */ } }
        });
        cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {
            ...initialCodeMirrorOptions, 
            mode: 'css',
            // CSSLint options, often set globally or passed if css-lint.js supports it
            // lint: { options: { /* CSSLint rules */ } }
        });
        jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {
            ...initialCodeMirrorOptions, 
            mode: 'javascript',
            lint: { // JSHint options
                options: {
                    esversion: 2021, // or 11, 10 etc.
                    browser: true, // if code is for browser
                    undef: true,   // Warn on use of undefined variables
                    unused: 'vars', // Warn on unused variables (can be 'strict' or true)
                    // globals: { /* e.g., jQuery: false, $: false */ }
                }
            }
        });
        console.log("CodeMirror instances initialized with linting.");
    } catch (e) { console.error("Error initializing CodeMirror:", e); }

    // --- CodeMirror Refresh Function ---
    function refreshAllCodeMirrors() { /* ... (Same as Turn 53) ... */ }

    // --- Initialize Split.js Panes (Fixed Vertical Layout) ---
    function initializeFixedSplits() { /* ... (Same as Turn 53) ... */ }
    initializeFixedSplits(); 
    
    // --- Page Theme Application ---
    function applyAppTheme() { /* ... (Same as Turn 53) ... */ }
    applyAppTheme();

    // --- Custom Console Logging ---
    function logToCustomConsole(argsArray, type = 'log') { /* ... (Same as Turn 53) ... */ }

    // --- Preview Update ---
    function updatePreview() { /* ... (Same as Turn 53, including console override & error handling) ... */ }

    function refreshEditorsAndPreview() { refreshAllCodeMirrors(); updatePreview(); }
    setTimeout(refreshEditorsAndPreview, 350);

    // --- Event Listeners ---
    if(runButton) runButton.addEventListener('click', () => { /* ... (Same as Turn 53) ... */ });
    if(clearConsoleButton) clearConsoleButton.addEventListener('click', () => { /* ... (Same as Turn 53) ... */ });

    // --- Modal Generic Close Logic ---
    function closeModal(modalElement) { /* ... (Same as Turn 53) ... */ }
    document.querySelectorAll('.close-button, .button-alt.close-modal-action').forEach(button => { /* ... */ });
    window.onclick = function(event) { /* ... */ }

    // --- Project Save/Load Functionality ---
    function getProjects() { /* ... (Same as Turn 53) ... */ }
    function saveProjects(pA) { /* ... (Same as Turn 53) ... */ }

    function openSaveModal(isSaveAs = false) {
        isSaveAsOperation = isSaveAs; // Set flag
        const existingProject = !isSaveAs && currentProjectId ? getProjects().find(p => p.id === currentProjectId) : null;
        
        if (saveModalTitle) { // Check if element exists
            saveModalTitle.textContent = isSaveAs ? 'Save New Project As...' : (existingProject ? 'Save Changes to Project' : 'Save New Project');
        }
        projectNameInput.value = isSaveAs ? (existingProject ? `${existingProject.name} (Copy)` : '') : (existingProject ? existingProject.name : '');
        
        saveProjectModal.style.display = 'block';
        projectNameInput.focus();
        if (isSaveAs || !existingProject) { // Select text if it's a new name or copy
             setTimeout(() => projectNameInput.select(), 0);
        }
    }

    if(saveProjectButton) saveProjectButton.addEventListener('click', () => openSaveModal(false));
    if(saveAsProjectButton) saveAsProjectButton.addEventListener('click', () => openSaveModal(true)); // NEW

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

        if (!isSaveAsOperation && currentProjectId) { // Regular Save (Update existing)
            ps = ps.map(p => {
                if (p.id === currentProjectId) {
                    projectExistsAndUpdated = true;
                    return { ...p, ...projectData, name: pN }; // Ensure name can be updated too
                }
                return p;
            });
        }
        
        // If it's a "Save As" operation OR it's a "Save Project" but no current project is set (new work) OR current project wasn't found for update
        if (isSaveAsOperation || !projectExistsAndUpdated) { 
             const newId = Date.now();
             ps.push({ ...projectData, id: newId });
             currentProjectId = newId; // The newly saved/forked project becomes the current one
        }
        saveProjects(ps);
        alert(`Project "${pN}" saved!`);
        isSaveAsOperation = false; // Reset flag
        closeModal(saveProjectModal);
    });

    if(loadProjectsButton) loadProjectsButton.addEventListener('click', () => { /* ... (Same as Turn 53) ... */ });
    function renderProjectsList() { /* ... (Same as Turn 53) ... */ }
    function loadProject(pId) { /* ... (Same as Turn 53, includes applying editor settings) ... */ }
    function deleteProject(pId) { /* ... (Same as Turn 53, including setInitialContent(false) ) ... */ }
    
    // --- Settings Modal ---
    if(settingsButton) settingsButton.addEventListener('click', () => { /* ... (Same as Turn 53, populates all settings) ... */ });
    if(applySettingsButton) applySettingsButton.addEventListener('click', () => { /* ... (Same as Turn 53, applies all settings) ... */ });

    // --- Download ZIP ---
    if(downloadZipButton) downloadZipButton.addEventListener('click', () => { /* ... (Same as Turn 53) ... */ });
    function generateAndDownloadZip(zipInstance) { /* ... (Same as Turn 53) ... */ }
    
    // --- Fullscreen Preview ---
    if(fullscreenButton) fullscreenButton.addEventListener('click', () => toggleFullScreen(previewFrame));
    function toggleFullScreen(element) { /* ... (Same as Turn 53) ... */ }
    function updateFullscreenButtonText() { /* ... (Same as Turn 53) ... */ }
    ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(event => 
        document.addEventListener(event, updateFullscreenButtonText, false)
    );

    // --- Initialize with default content or last project ---
    function setInitialContent(callRefreshPreview = true) { /* ... (Same as Turn 53, applies default editor settings) ... */ }

    const projects = getProjects();
    if (projects.length > 0 && projects[0].id) {
       loadProject(projects[0].id); 
    } else {
       setInitialContent(); 
    }
    setTimeout(refreshAllCodeMirrors, 400);

    // --- Make linters available globally for CodeMirror addons ---
    // This is often needed if the CM lint addons expect these on the window object.
    // Ensure these are loaded before CodeMirror tries to use them.
    // This step might vary based on how CM addons exactly pick up linters.
    // window.JSHINT = JSHINT; // JSHINT is usually global already from its script.
    // window.CSSLint = CSSLint; // CSSLint is usually global.
    // window.HTMLHint = HTMLHint; // HTMLHint is usually global.


    // == PASTE ALL PREVIOUSLY WORKING JS FUNCTIONS FROM Turn 53 HERE that were marked with "..." ==
    // Ensure functions like:
    // applyAppTheme, logToCustomConsole, updatePreview, closeModal, getProjects, saveProjects, renderProjectsList, loadProject, 
    // deleteProject, generateAndDownloadZip, toggleFullScreen, updateFullscreenButtonText, setInitialContent
    // are complete and correctly defined as they were in Turn 53.
    // The main new parts are the linting options in CodeMirror init and the "Save As" logic.

}); // End DOMContentLoaded
