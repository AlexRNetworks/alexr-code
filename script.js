document.addEventListener('DOMContentLoaded', () => {
    let htmlEditor, cssEditor, jsEditor; // CodeMirror instances
    // Removed: mainSplitInstance, editorSplitInstance, outputSplitInstance (will be local to init if not needed globally)

    // UI Elements
    // Removed: layoutHorizontalButton, layoutVerticalButton
    // const editorLayoutContainer = document.getElementById('editor-layout-container'); // Still needed for class if any, but direction is fixed by CSS

    const previewFrame = document.getElementById('preview-frame');
    const runButton = document.getElementById('run-button');
    const downloadZipButton = document.getElementById('download-zip-button');
    const themeStylesheetLink = document.getElementById('theme-stylesheet');
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
    const applySettingsButton = document.getElementById('apply-settings-button');
    
    const consoleOutputDiv = document.getElementById('console-output');
    const clearConsoleButton = document.getElementById('clear-console-button');
    
    let externalCSS = []; 
    let externalJS = [];  
    let currentProjectId = null; 
    // Removed: const LS_LAYOUT_KEY = 'alexrCodeLayout';

    console.log("Alexr Code script.js: DOMContentLoaded - Fixed Vertical Layout");

    // --- Initialize CodeMirror ---
    const codeMirrorOptions = {
        lineNumbers: true, theme: "material-darker", autoCloseTags: true,
        autoCloseBrackets: true, lineWrapping: true,
    };
    try {
        htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), {...codeMirrorOptions, mode: 'htmlmixed'});
        cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {...codeMirrorOptions, mode: 'css'});
        jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {...codeMirrorOptions, mode: 'javascript'});
        console.log("CodeMirror instances initialized.");
    } catch (e) { console.error("Error initializing CodeMirror:", e); }

    // --- CodeMirror Refresh Function ---
    function refreshAllCodeMirrors() {
        if (htmlEditor) htmlEditor.refresh();
        if (cssEditor) cssEditor.refresh();
        if (jsEditor) jsEditor.refresh();
    }

    // --- Initialize Split.js Panes for Fixed Vertical Layout ---
    function initializeFixedSplits() {
        try {
            // Horizontal split for code editors (HTML, CSS, JS) - remains the same
            Split(['#html-editor-wrapper', '#css-editor-wrapper', '#js-editor-wrapper'], {
                sizes: [33.3, 33.3, 33.4], minSize: 60, gutterSize: 8, direction: 'horizontal', cursor: 'col-resize',
                onDragEnd: refreshAllCodeMirrors
            });

            // Vertical split for output area (Preview vs Console) - remains the same
            Split(['#preview-wrapper', '#console-wrapper'], {
                sizes: [70, 30], minSize: [50, 40], gutterSize: 8, direction: 'vertical', cursor: 'row-resize',
                elementStyle: (dim, size, gutterSize) => ({ 'flex-basis': `calc(${size}% - ${gutterSize}px)` }),
                gutterStyle: (dim, gutterSize) => ({ 'flex-basis': `${gutterSize}px` })
            });
            
            // Main split (Code Editors Pane vs Output Pane) - NOW FIXED TO VERTICAL
            Split(['#code-editors-pane', '#output-pane'], {
                sizes: [55, 45], // Editors take 55%, Output 45% height initially
                minSize: [150, 150], 
                gutterSize: 8,
                direction: 'vertical', // Main direction is now vertical
                cursor: 'row-resize',    // Cursor for vertical drag
                onDragEnd: function() {
                    refreshAllCodeMirrors(); 
                }
            });
            console.log("Split.js panes initialized for fixed vertical layout.");
            setTimeout(refreshAllCodeMirrors, 100); // Initial refresh after splits are set
        } catch (e) {
            console.error("Error initializing Split.js:", e);
        }
    }
    initializeFixedSplits(); // Initialize splits once on load
    
    // --- Theme Application for index.html ---
    function applyAppTheme() { /* ... (Same as Turn 41 - no changes needed here) ... */ }
    applyAppTheme();

    // --- Custom Console Logging ---
    function logToCustomConsole(argsArray, type = 'log') { /* ... (Same as Turn 41) ... */ }

    // --- Preview Update ---
    function updatePreview() { /* ... (Same as Turn 41 - no changes needed here) ... */ }

    function refreshEditorsAndPreview() {
        refreshAllCodeMirrors();
        updatePreview();
    }
    // Initial call with a delay to allow layout, CodeMirror, and Split.js to settle
    setTimeout(refreshEditorsAndPreview, 350); // Adjusted delay slightly

    // --- Event Listeners ---
    if(runButton) runButton.addEventListener('click', () => { /* ... (Same as Turn 41) ... */ });
    if(clearConsoleButton) clearConsoleButton.addEventListener('click', () => { /* ... (Same as Turn 41) ... */ });

    // --- Modal Generic Close Logic ---
    function closeModal(modalElement) { /* ... (Same as Turn 41) ... */ }
    document.querySelectorAll('.close-button, .close-modal-action.button-alt').forEach(button => { /* ... */ });
    window.onclick = function(event) { /* ... */ }

    // --- Project Save/Load Functionality ---
    const LS_PROJECTS_KEY = 'alexrCodeProjects';
    function getProjects() { /* ... (Same as Turn 41) ... */ }
    function saveProjects(pA) { /* ... (Same as Turn 41) ... */ }
    if(saveProjectButton) saveProjectButton.addEventListener('click', () => { /* ... (Same as Turn 41) ... */ });
    if(confirmSaveButton) confirmSaveButton.addEventListener('click', () => { /* ... (Same as Turn 41 - ensures externalCSS/JS are saved) ... */ });
    if(loadProjectsButton) loadProjectsButton.addEventListener('click', () => { /* ... (Same as Turn 41) ... */ });
    function renderProjectsList() { /* ... (Same as Turn 41) ... */ }
    function loadProject(pId) { /* ... (Same as Turn 41 - ensures externalCSS/JS are loaded) ... */ }
    function deleteProject(pId) { /* ... (Same as Turn 41, including setInitialContent(false) ) ... */ }
    
    // --- Settings Modal (External Resources) ---
    if(settingsButton) settingsButton.addEventListener('click', () => { /* ... (Same as Turn 41) ... */ });
    if(applySettingsButton) applySettingsButton.addEventListener('click', () => { /* ... (Same as Turn 41) ... */ });

    // --- Download ZIP ---
    if(downloadZipButton) downloadZipButton.addEventListener('click', () => { /* ... (Same as Turn 41) ... */ });
    function generateAndDownloadZip(zipInstance) { /* ... (Same as Turn 41) ... */ }
    
    // --- Fullscreen Preview ---
    if(fullscreenButton) fullscreenButton.addEventListener('click', () => toggleFullScreen(previewFrame));
    function toggleFullScreen(element) { /* ... (Same as Turn 41) ... */ }
    function updateFullscreenButtonText() { /* ... (Same as Turn 41) ... */ }
    ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(event => 
        document.addEventListener(event, updateFullscreenButtonText, false)
    );

    // --- Initialize with default content or last project ---
    function setInitialContent(callRefreshPreview = true) { /* ... (Same as Turn 41) ... */ }

    // Initial Page Setup
    // Removed: const savedLayout = localStorage.getItem(LS_LAYOUT_KEY) || 'horizontal';
    // Removed: applyLayout(savedLayout); 
    // Split.js is now initialized directly via initializeFixedSplits()

    const projects = getProjects();
    if (projects.length > 0 && projects[0].id) {
       loadProject(projects[0].id); 
    } else {
       setInitialContent(); 
    }
    // An extra refresh after content load and split init can sometimes help.
    setTimeout(refreshAllCodeMirrors, 400);

}); // End DOMContentLoaded

// == PASTE ALL PREVIOUSLY WORKING JS FUNCTIONS FROM TURN 41 HERE ==
// To avoid making this response excessively long by repeating ~250 lines,
// please ensure all the function definitions from Turn 41's script.js are included here,
// such as: applyAppTheme, logToCustomConsole, updatePreview, closeModal,
// getProjects, saveProjects, renderProjectsList, loadProject, deleteProject,
// generateAndDownloadZip, toggleFullScreen, updateFullscreenButtonText, setInitialContent.
// The structure above shows WHERE the new layout logic is integrated/removed.
// The main change is initializeFixedSplits() and removal of layout switching.
