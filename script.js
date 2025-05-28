document.addEventListener('DOMContentLoaded', () => {
    let htmlEditor, cssEditor, jsEditor; // CodeMirror instances

    // UI Elements
    const previewFrame = document.getElementById('preview-frame');
    const runButton = document.getElementById('run-button');
    const downloadZipButton = document.getElementById('download-zip-button');
    const themeStylesheetLink = document.getElementById('theme-stylesheet');
    const fullscreenButton = document.getElementById('fullscreen-button');
    const saveProjectButton = document.getElementById('save-project-button');
    const saveAsProjectButton = document.getElementById('save-as-project-button'); // NEW
    const loadProjectsButton = document.getElementById('load-projects-button');
    const settingsButton = document.getElementById('settings-button');

    // Modals & their content
    const saveProjectModal = document.getElementById('save-project-modal');
    const saveModalTitle = document.getElementById('save-modal-title'); // NEW
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
    let isSaveAsOperation = false; // NEW flag for Save As operation

    // --- LocalStorage Keys ---
    const LS_PROJECTS_KEY = 'alexrCodeProjects';
    const LS_PAGE_THEME_KEY = 'selectedTheme'; 
    const LS_CODEMIRROR_THEME_KEY = 'alexrCodeMirrorTheme'; 
    const LS_EDITOR_FONT_SIZE_KEY = 'alexrCodeEditorFontSize'; 

    console.log("Alexr Code script.js: DOMContentLoaded - Save As Added");

    // --- Default Settings ---
    const DEFAULT_CODEMIRROR_THEME = 'material-darker';
    const DEFAULT_EDITOR_FONT_SIZE = 14;

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
        lineNumbers: true,
        theme: DEFAULT_CODEMIRROR_THEME, 
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineWrapping: true,
    };
    applyInitialEditorSettings(); 


    // --- Initialize CodeMirror ---
    try {
        htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), {...initialCodeMirrorOptions, mode: 'htmlmixed'});
        cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {...initialCodeMirrorOptions, mode: 'css'});
        jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {...initialCodeMirrorOptions, mode: 'javascript'});
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

    // --- Initialize Split.js Panes (Fixed Vertical Layout from your base) ---
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
            
            // Your provided script (Turn 57) had this as 'horizontal'.
            // If you want Editors Top | Output Bottom, this should be 'vertical'.
            // I will keep it as 'horizontal' to match your provided script's Split.js config.
            // If you intended fixed vertical, change direction here to 'vertical' and cursor to 'row-resize'.
            Split(['#code-editors-pane', '#output-pane'], {
                sizes: [60, 40], 
                minSize: [150, 150], 
                gutterSize: 8,
                direction: 'horizontal', // Main layout direction from your provided script
                cursor: 'col-resize',    
                onDragEnd: refreshAllCodeMirrors
            });
            console.log("Split.js panes initialized.");
            setTimeout(refreshAllCodeMirrors, 100); 
        } catch (e) {
            console.error("Error initializing Split.js:", e);
        }
    }
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
    function logToCustomConsole(argsArray, type = 'log') {
        if (!consoleOutputDiv) return;
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('console-message', type);
        const messageContent = document.createElement('span');
        messageContent.textContent = argsArray.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
                if (arg instanceof Error) return arg.stack || arg.message;
                try { return JSON.stringify(arg, (key, value) => typeof value === 'function' ? '[Function]' : value, 2); }
                catch (e) { return String(arg); }
            }
            return String(arg);
        }).join(' ');
        messageContainer.appendChild(messageContent);
        consoleOutputDiv.appendChild(messageContainer);
        consoleOutputDiv.scrollTop = consoleOutputDiv.scrollHeight;
    }

    // --- Preview Update ---
    function updatePreview() {
        if (!htmlEditor || !cssEditor || !jsEditor || !previewFrame) {
            console.error("Editor or previewFrame not initialized.");
            return;
        }
        const htmlCode = htmlEditor.getValue();
        const cssCode = cssEditor.getValue();
        const jsCode = jsEditor.getValue();
        const iframe = previewFrame;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        iframeDoc.open();
        iframeDoc.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Preview</title></head><body></body></html>');
        iframeDoc.close();

        const head = iframeDoc.head;
        const body = iframeDoc.body;
        const iWindow = iframe.contentWindow;

        if (iWindow) {
            const originalConsole = {log: iWindow.console.log, error: iWindow.console.error, warn: iWindow.console.warn, info: iWindow.console.info, debug: iWindow.console.debug, clear: iWindow.console.clear};
            iWindow.console = {};
            Object.keys(originalConsole).forEach(key => {
                iWindow.console[key] = (...args) => {
                    logToCustomConsole(args, key);
                    if (typeof originalConsole[key] === 'function') {
                        originalConsole[key].apply(null, args);
                    }
                };
            });
            if (clearConsoleButton && typeof originalConsole.clear === 'function') { // Make custom clear also clear browser console for iframe
                iWindow.console.clear = () => { if (consoleOutputDiv) consoleOutputDiv.innerHTML = ''; originalConsole.clear.apply(null);};
            }
            
            iWindow.onerror = (message, source, lineno, colno, errorObj) => {
                let Sfilename = source ? source.substring(source.lastIndexOf('/') + 1) : "script";
                if (Sfilename === "") Sfilename = "inline script";
                logToCustomConsole([`Error: ${message} (${Sfilename}:${lineno}:${colno})`], 'error');
                if(typeof originalConsole.error === 'function') originalConsole.error.call(null, `Error: ${message}`, source, lineno, colno, errorObj);
                return true; 
            };
        }

        externalCSS.forEach(url => {
            if (!url.trim()) return;
            const linkTag = iframeDoc.createElement('link'); linkTag.rel = 'stylesheet'; linkTag.href = url.trim();
            head.appendChild(linkTag);
        });

        const styleTag = iframeDoc.createElement('style');
        let bodyBg = getComputedStyle(document.body).getPropertyValue('--color-background-preview').trim() || '#ffffff';
        let bodyColor = getComputedStyle(document.body).getPropertyValue('--color-text-main').trim() || '#333333';
        let bodyFont = getComputedStyle(document.body).getPropertyValue('--font-primary').trim() || 'Inter, sans-serif';
        styleTag.textContent = `body{margin:15px;padding:0;box-sizing:border-box;font-family:${bodyFont};background-color:${bodyBg};color:${bodyColor};line-height:1.6;} ${cssCode}`;
        head.appendChild(styleTag);
        
        body.innerHTML = htmlCode;

        externalJS.forEach(url => {
            if (!url.trim()) return;
            const scriptTag = iframeDoc.createElement('script'); scriptTag.src = url.trim();
            body.appendChild(scriptTag); 
        });
        const userScriptTag = iframeDoc.createElement('script');
        userScriptTag.textContent = jsCode;
        body.appendChild(userScriptTag);
    }

    function refreshEditorsAndPreview() {
        refreshAllCodeMirrors();
        updatePreview();
    }
    setTimeout(refreshEditorsAndPreview, 350);

    // --- Event Listeners ---
    if(runButton) runButton.addEventListener('click', () => {
        if (consoleOutputDiv) consoleOutputDiv.innerHTML = ''; 
        updatePreview();
    });

    if(clearConsoleButton) clearConsoleButton.addEventListener('click', () => {
        if (consoleOutputDiv) consoleOutputDiv.innerHTML = '';
    });

    // --- Modal Generic Close Logic ---
    function closeModal(modalElement) {
        if (modalElement) modalElement.style.display = 'none';
    }
    document.querySelectorAll('.close-button, .button-alt.close-modal-action').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal-id');
            const modalToClose = document.getElementById(modalId);
            if (modalToClose) closeModal(modalToClose);
        });
    });
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    }

    // --- Project Save/Load Functionality ---
    function getProjects() { const p = localStorage.getItem(LS_PROJECTS_KEY); return p ? JSON.parse(p) : []; }
    function saveProjects(pA) { localStorage.setItem(LS_PROJECTS_KEY, JSON.stringify(pA)); }

    // Helper function to open the save modal
    function openSaveModal(isSaveAs = false) {
        isSaveAsOperation = isSaveAs; // Set global flag
        const projects = getProjects();
        const existingProject = !isSaveAs && currentProjectId ? projects.find(p => p.id === currentProjectId) : null;
        
        if (saveModalTitle) {
            saveModalTitle.textContent = isSaveAs ? 'Save New Project As...' : (existingProject ? 'Update Project' : 'Save New Project');
        }
        
        if (isSaveAs) {
            // If there's content in editors and a current project name, suggest a copy name
            const currentNameInEditor = existingProject ? existingProject.name : projectNameInput.value; // Or get from loaded project name if available
            projectNameInput.value = currentNameInEditor ? `${currentNameInEditor} (Copy)` : '';
        } else {
            projectNameInput.value = existingProject ? existingProject.name : '';
        }
        
        saveProjectModal.style.display = 'block';
        projectNameInput.focus();
        if (isSaveAs || !existingProject) {
             setTimeout(() => projectNameInput.select(), 0);
        }
    }

    if(saveProjectButton) saveProjectButton.addEventListener('click', () => openSaveModal(false));
    if(saveAsProjectButton) saveAsProjectButton.addEventListener('click', () => openSaveModal(true));


    if(confirmSaveButton) confirmSaveButton.addEventListener('click', () => {
        const pN = projectNameInput.value.trim(); 
        if(!pN){
            alert('Project name required.'); 
            projectNameInput.focus(); 
            return;
        }
        
        const cmThemeToSave = localStorage.getItem(LS_CODEMIRROR_THEME_KEY) || DEFAULT_CODEMIRROR_THEME;
        const editorFontSizeToSave = parseInt(localStorage.getItem(LS_EDITOR_FONT_SIZE_KEY), 10) || DEFAULT_EDITOR_FONT_SIZE;

        const projectData = {
            name:pN, html:htmlEditor.getValue(), css:cssEditor.getValue(), js:jsEditor.getValue(),
            externalCSS: [...externalCSS], externalJS: [...externalJS], 
            cmTheme: cmThemeToSave, 
            editorFontSize: editorFontSizeToSave,
            savedAt:new Date().toISOString()
        };
        
        let ps = getProjects();
        
        if (isSaveAsOperation || !currentProjectId) { // Always save as new for "Save As" or if no current project
             const newId = Date.now() + Math.random(); // Add random to ensure uniqueness even if saved in same ms
             ps.push({ ...projectData, id: newId });
             currentProjectId = newId; // The newly saved/forked project becomes the current one
             console.log("Project saved as new with ID:", currentProjectId);
        } else { // Update existing project (not a "Save As" operation and currentProjectId exists)
            let projectFoundAndUpdated = false;
            ps = ps.map(p => {
                if (p.id === currentProjectId) {
                    projectFoundAndUpdated = true;
                    return { ...p, ...projectData, name: pN }; // Update existing, keeping original ID but allowing name change
                }
                return p;
            });
            if (!projectFoundAndUpdated) { // Should not happen if currentProjectId is valid
                console.error("Error: Tried to update a project that was not found. Saving as new instead.");
                const newId = Date.now() + Math.random();
                ps.push({ ...projectData, id: newId });
                currentProjectId = newId;
            } else {
                console.log("Project updated with ID:", currentProjectId);
            }
        }
        saveProjects(ps);
        alert(`Project "${pN}" saved!`);
        isSaveAsOperation = false; // Reset flag
        closeModal(saveProjectModal);
    });

    if(loadProjectsButton) loadProjectsButton.addEventListener('click', () => { renderProjectsList(); loadProjectsModal.style.display = 'block'; });
    
    function renderProjectsList() { /* ... (Same as Turn 53) ... */ }
    function loadProject(pId) { /* ... (Same as Turn 53) ... */ }
    function deleteProject(pId) { /* ... (Same as Turn 53, but ensure setInitialContent(false) doesn't cause issues) ... */ }
    
    // --- Settings Modal (External Resources AND Editor Settings) ---
    if(settingsButton) settingsButton.addEventListener('click', () => { /* ... (Same as Turn 53) ... */ });
    if(applySettingsButton) applySettingsButton.addEventListener('click', () => { /* ... (Same as Turn 53) ... */ });

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
    function setInitialContent(callRefreshPreview = true) { /* ... (Same as Turn 53, including applying editor settings) ... */ }

    // Load initial state
    const projects = getProjects();
    if (projects.length > 0 && projects[0].id) {
       loadProject(projects[0].id); 
    } else {
       setInitialContent(); 
    }
    setTimeout(refreshAllCodeMirrors, 400);


    // == Ensure all the functions below this line are correctly copied from your working Turn 53 script.js ==
    // (These are just stubs here for completeness of the full structure)

    // function renderProjectsList() { // FULL IMPLEMENTATION FROM TURN 53/YOUR SCRIPT
    //     const ps = getProjects(); projectsListContainer.innerHTML = '';
    //     if(ps.length === 0){projectsListContainer.innerHTML='<p>No projects saved yet.</p>'; return;}
    //     ps.sort((a,b) => new Date(b.savedAt) - new Date(a.savedAt));
    //     ps.forEach(p => { /* ... create list items ... */ });
    // }
    // function loadProject(pId) { // FULL IMPLEMENTATION FROM TURN 53/YOUR SCRIPT
    //     /* ... find project, set editors, set externalCSS/JS, set currentProjectId, apply editor settings ... */
    // }
    // function deleteProject(pId) { // FULL IMPLEMENTATION FROM TURN 53/YOUR SCRIPT
    //     /* ... confirm, filter, save, update UI, call setInitialContent(false) if current deleted ... */
    // }
    // function setInitialContent(callRefreshPreview = true) { // FULL IMPLEMENTATION FROM TURN 53/YOUR SCRIPT
    //     /* ... set default HTML/CSS/JS, reset externalCSS/JS, reset currentProjectId, apply default editor settings ... */
    // }
    // ... any other helper functions from your script ...

}); // End DOMContentLoaded
