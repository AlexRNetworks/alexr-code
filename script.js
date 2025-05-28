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

    const saveProjectModal = document.getElementById('save-project-modal');
    const projectNameInput = document.getElementById('project-name-input');
    const confirmSaveButton = document.getElementById('confirm-save-button');

    const loadProjectsModal = document.getElementById('load-projects-modal');
    const projectsListContainer = document.getElementById('projects-list-container');

    const settingsModal = document.getElementById('settings-modal');
    const externalCssUrlsTextarea = document.getElementById('external-css-urls');
    const externalJsUrlsTextarea = document.getElementById('external-js-urls');
    const codeMirrorThemeSelect = document.getElementById('codemirror-theme-select'); // NEW
    const editorFontSizeInput = document.getElementById('editor-font-size-input'); // NEW
    const applySettingsButton = document.getElementById('apply-settings-button');
    
    const consoleOutputDiv = document.getElementById('console-output');
    const clearConsoleButton = document.getElementById('clear-console-button');
    
    let externalCSS = []; 
    let externalJS = [];  
    let currentProjectId = null; 

    // --- LocalStorage Keys ---
    const LS_PROJECTS_KEY = 'alexrCodeProjects';
    const LS_PAGE_THEME_KEY = 'selectedTheme'; // Existing key for page theme
    const LS_CODEMIRROR_THEME_KEY = 'alexrCodeMirrorTheme'; // NEW
    const LS_EDITOR_FONT_SIZE_KEY = 'alexrCodeEditorFontSize'; // NEW

    console.log("Alexr Code script.js: DOMContentLoaded - Editor Settings Added");

    // --- Default Settings ---
    const DEFAULT_CODEMIRROR_THEME = 'material-darker';
    const DEFAULT_EDITOR_FONT_SIZE = 14; // in px

    // --- Initialize CodeMirror ---
    let currentCodeMirrorTheme = localStorage.getItem(LS_CODEMIRROR_THEME_KEY) || DEFAULT_CODEMIRROR_THEME;
    let currentEditorFontSize = parseInt(localStorage.getItem(LS_EDITOR_FONT_SIZE_KEY), 10) || DEFAULT_EDITOR_FONT_SIZE;
    
    // Apply initial font size via CSS variable
    document.documentElement.style.setProperty('--editor-font-size', `${currentEditorFontSize}px`);

    const codeMirrorOptions = {
        lineNumbers: true,
        theme: currentCodeMirrorTheme, 
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        // Note: font-size is handled by the CSS variable :root { --editor-font-size: ... }
        // and the .CodeMirror { font-size: var(--editor-font-size); } rule
    };
    try {
        htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), {...codeMirrorOptions, mode: 'htmlmixed'});
        cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {...codeMirrorOptions, mode: 'css'});
        jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {...codeMirrorOptions, mode: 'javascript'});
        console.log("CodeMirror instances initialized with theme:", currentCodeMirrorTheme, "and font-size:", currentEditorFontSize + "px");
    } catch (e) { console.error("Error initializing CodeMirror:", e); }

    // --- CodeMirror Refresh Function ---
    function refreshAllCodeMirrors() {
        if (htmlEditor) htmlEditor.refresh();
        if (cssEditor) cssEditor.refresh();
        if (jsEditor) jsEditor.refresh();
    }

    // --- Initialize Split.js Panes for Fixed Vertical Layout ---
    function initializeFixedSplits() { /* ... (Same as Turn 45) ... */ }
    initializeFixedSplits(); 
    
    // --- Page Theme Application ---
    function applyAppTheme() {
        const selectedThemePath = localStorage.getItem(LS_PAGE_THEME_KEY);
        if (themeStylesheetLink) {
            themeStylesheetLink.setAttribute('href', (selectedThemePath && selectedThemePath !== "default") ? selectedThemePath : '');
        }
    }
    applyAppTheme();

    // --- Custom Console Logging ---
    function logToCustomConsole(argsArray, type = 'log') { /* ... (Same as Turn 45) ... */ }

    // --- Preview Update ---
    function updatePreview() { /* ... (Same as Turn 45, ensure console override logic) ... */ }

    function refreshEditorsAndPreview() {
        refreshAllCodeMirrors();
        updatePreview();
    }
    setTimeout(refreshEditorsAndPreview, 350);

    // --- Event Listeners ---
    if(runButton) runButton.addEventListener('click', () => { /* ... (Same as Turn 45) ... */ });
    if(clearConsoleButton) clearConsoleButton.addEventListener('click', () => { /* ... (Same as Turn 45) ... */ });

    // --- Modal Generic Close Logic ---
    function closeModal(modalElement) { /* ... (Same as Turn 45) ... */ }
    document.querySelectorAll('.close-button, .close-modal-action.button-alt').forEach(button => { /* ... */ });
    window.onclick = function(event) { /* ... */ }

    // --- Project Save/Load Functionality ---
    function getProjects() { /* ... (Same as Turn 45) ... */ }
    function saveProjects(pA) { /* ... (Same as Turn 45) ... */ }
    if(saveProjectButton) saveProjectButton.addEventListener('click', () => { /* ... (Same as Turn 45) ... */ });
    if(confirmSaveButton) confirmSaveButton.addEventListener('click', () => { /* ... (Same as Turn 45 - ensures externalCSS/JS are saved) ... */ });
    if(loadProjectsButton) loadProjectsButton.addEventListener('click', () => { /* ... (Same as Turn 45) ... */ });
    function renderProjectsList() { /* ... (Same as Turn 45) ... */ }
    function loadProject(pId) { /* ... (Same as Turn 45 - ensures externalCSS/JS are loaded) ... */ }
    function deleteProject(pId) { /* ... (Same as Turn 45, including setInitialContent(false) ) ... */ }
    
    // --- Settings Modal (External Resources AND NEW EDITOR SETTINGS) ---
    if(settingsButton) {
        settingsButton.addEventListener('click', () => {
            // Populate external resources
            externalCssUrlsTextarea.value = externalCSS.join('\n');
            externalJsUrlsTextarea.value = externalJS.join('\n');
            
            // Populate editor settings
            codeMirrorThemeSelect.value = localStorage.getItem(LS_CODEMIRROR_THEME_KEY) || DEFAULT_CODEMIRROR_THEME;
            editorFontSizeInput.value = parseInt(localStorage.getItem(LS_EDITOR_FONT_SIZE_KEY), 10) || DEFAULT_EDITOR_FONT_SIZE;
            
            settingsModal.style.display = 'block';
        });
    }

    if(applySettingsButton) {
        applySettingsButton.addEventListener('click', () => {
            // Apply external resources
            externalCSS = externalCssUrlsTextarea.value.split('\n').map(url => url.trim()).filter(url => url);
            externalJS = externalJsUrlsTextarea.value.split('\n').map(url => url.trim()).filter(url => url);
            console.log("[script.js] Settings: External CSS Updated:", externalCSS);
            console.log("[script.js] Settings: External JS Updated:", externalJS);

            // Apply editor settings
            const newCmTheme = codeMirrorThemeSelect.value;
            const newFontSize = parseInt(editorFontSizeInput.value, 10);

            localStorage.setItem(LS_CODEMIRROR_THEME_KEY, newCmTheme);
            if (htmlEditor) htmlEditor.setOption('theme', newCmTheme);
            if (cssEditor) cssEditor.setOption('theme', newCmTheme);
            if (jsEditor) jsEditor.setOption('theme', newCmTheme);
            console.log("[script.js] Settings: CodeMirror theme set to:", newCmTheme);

            if (!isNaN(newFontSize) && newFontSize >= 8 && newFontSize <= 30) {
                localStorage.setItem(LS_EDITOR_FONT_SIZE_KEY, newFontSize);
                document.documentElement.style.setProperty('--editor-font-size', `${newFontSize}px`);
                console.log("[script.js] Settings: Editor font size set to:", newFontSize + "px");
                refreshAllCodeMirrors(); // Font size change might require CM refresh
            } else {
                alert("Invalid font size. Please enter a number between 8 and 30.");
                editorFontSizeInput.value = localStorage.getItem(LS_EDITOR_FONT_SIZE_KEY) || DEFAULT_EDITOR_FONT_SIZE; // Reset to valid
            }
            
            closeModal(settingsModal); 
            if (consoleOutputDiv) consoleOutputDiv.innerHTML = ''; // Clear console as preview will re-render
            updatePreview(); 
        });
    }

    // --- Download ZIP ---
    if(downloadZipButton) downloadZipButton.addEventListener('click', () => { /* ... (Same as Turn 45) ... */ });
    function generateAndDownloadZip(zipInstance) { /* ... (Same as Turn 45) ... */ }
    
    // --- Fullscreen Preview ---
    if(fullscreenButton) fullscreenButton.addEventListener('click', () => toggleFullScreen(previewFrame));
    function toggleFullScreen(element) { /* ... (Same as Turn 45) ... */ }
    function updateFullscreenButtonText() { /* ... (Same as Turn 45) ... */ }
    ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(event => 
        document.addEventListener(event, updateFullscreenButtonText, false)
    );

    // --- Initialize with default content or last project ---
    function setInitialContent(callRefreshPreview = true) { /* ... (Same as Turn 45) ... */ }

    // Initial Page Setup
    const projects = getProjects();
    if (projects.length > 0 && projects[0].id) {
       loadProject(projects[0].id); 
    } else {
       setInitialContent(); 
    }
    // Final refresh after all initial setup, including applying font size from LS
    setTimeout(refreshAllCodeMirrors, 400);


    // == PASTE ALL PREVIOUSLY WORKING JS FUNCTIONS FROM Turn 45 HERE that were marked with "..." ==
    // Ensure functions like:
    // logToCustomConsole, updatePreview, closeModal,
    // getProjects, saveProjects (updated to include editor settings if desired for project-specific settings - not done yet),
    // renderProjectsList, loadProject (updated to apply global editor settings or project-specific ones - current applies global),
    // deleteProject, generateAndDownloadZip, toggleFullScreen, updateFullscreenButtonText, setInitialContent
    // are complete and correctly defined as they were in Turn 45.
    // The main new parts are the LS keys for editor settings, initialization of CM with these settings,
    // and the `applySettingsButton` logic.
}); // End DOMContentLoaded
