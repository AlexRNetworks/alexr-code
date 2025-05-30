document.addEventListener('DOMContentLoaded', () => {
    let htmlEditor, cssEditor, jsEditor; // CodeMirror instances

    // UI Elements (Ensure these match your index.html from Turn 79)
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
    const codeMirrorThemeSelect = document.getElementById('codemirror-theme-select'); 
    const editorFontSizeInput = document.getElementById('editor-font-size-input'); 
    const applySettingsButton = document.getElementById('apply-settings-button');
    
    const consoleOutputDiv = document.getElementById('console-output');
    const clearConsoleButton = document.getElementById('clear-console-button');
    
    let externalCSS = []; 
    let externalJS = [];  
    let currentProjectId = null; 

    const LS_PROJECTS_KEY = 'alexrCodeProjects';
    const LS_PAGE_THEME_KEY = 'selectedTheme'; 
    const LS_CODEMIRROR_THEME_KEY = 'alexrCodeMirrorTheme'; 
    const LS_EDITOR_FONT_SIZE_KEY = 'alexrCodeEditorFontSize'; 
    const LS_UNSAVED_WORK_KEY = 'alexrCodeUnsavedWork';

    console.log("Alexr Code script.js: DOMContentLoaded - Enhanced Linting Config.");

    const DEFAULT_CODEMIRROR_THEME = 'material-darker';
    const DEFAULT_EDITOR_FONT_SIZE = 14;

    let autoSaveTimeout;
    function autoSaveUnsavedWork() { /* ... (Keep from Turn 89) ... */ }
    function setupAutoSave(editorInstance) { /* ... (Keep from Turn 89) ... */ }
    function triggerAutoSaveForExternalLibs() { /* ... (Keep from Turn 89) ... */ }
    
    function applyInitialEditorSettings() { /* ... (Keep from Turn 89) ... */ }
    
    const baseCodeMirrorOptions = { 
        lineNumbers: true, theme: DEFAULT_CODEMIRROR_THEME, 
        autoCloseTags: true, autoCloseBrackets: true, lineWrapping: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-lint-markers"] 
        // `lint: true` or specific lint options will be merged per editor
    };
    applyInitialEditorSettings(); 

    // --- Initialize CodeMirror with more specific linting configurations ---
    try {
        // HTMLHint Rules - you can customize these. Find rule IDs on HTMLHint documentation.
        // This passes options directly to the html-lint addon which should use HTMLHint
        const htmlHintOptions = {
            "tagname-lowercase": true,
            "attr-lowercase": true,
            "attr-value-double-quotes": true,
            "doctype-first": true, // Check for a doctype
            "tag-pair": true, // Check for unclosed tags
            "spec-char-escape": true,
            "id-unique": true,
            "src-not-empty": true,
            "alt-require": true,
            "attr-no-duplication": true,
            // Add more rules as needed
        };

        htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), {
            ...baseCodeMirrorOptions, 
            mode: 'htmlmixed',
            lint: { options: htmlHintOptions, async: true } // Pass options to html-lint connector
        });

        // CSSLint Rules - you can customize these. Find rule IDs on CSSLint wiki/documentation.
        // CSSLint categorizes rules into errors, warnings etc.
        // Passing options to css-lint.js can be tricky; it often relies on global CSSLint.
        // However, some versions of the connector might accept an options object.
        // We enable common error-checking rules. 1 = warning, 2 = error.
        // Not all CSSLint rules translate directly to CodeMirror severities without custom handling.
        // The css-lint.js connector does its best.
        const cssLintOptions = {
            "errors": true,                     // Report parsing errors (usually severity 'error')
            "important": true,                  // Disallow !important (often a warning)
            "known-properties": true,           // Disallow unknown properties (error)
            "duplicate-properties": true,       // Warn about duplicate properties
            "empty-rules": true,                // Warn about empty rules
            "zero-units": true,                 // Warn about 0 with units (e.g., 0px)
            "font- बम": true,           // Disallow "font-bombing" (too many web fonts)
            "floats": false,                    // Don't warn about floats (can be noisy)
            "ids": false,                       // Don't warn about IDs in selectors
             // "universal-selector": true,      // Warn about universal selector *
             // "unqualified-attributes": true,  // Warn about unqualified attribute selectors
        };
        // For CSSLint, the connector expects rules to be passed such that it can construct what CSSLint.verify expects.
        // Often, just `lint:true` is enough and CSSLint picks up default severities.
        // If direct options passing doesn't work as expected for custom severities,
        // one might need to write a custom lint function for CSS.
        // Let's try with just enabling it and relying on CSSLint's default severities first.
        cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {
            ...baseCodeMirrorOptions, 
            mode: 'css',
            lint: true // Let css-lint.js use global CSSLint and its default rules/severities.
                       // If this is not enough, a more complex options object or custom linter is needed.
        });
        
        jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {
            ...baseCodeMirrorOptions, 
            mode: 'javascript',
            lint: { 
                options: { // JSHint options
                    esversion: 2021, 
                    browser: true,   
                    undef: true,     
                    unused: 'vars',  
                    // eqeqeq: true, // Uncomment to enforce ===
                    // curly: true,   // Uncomment to enforce {} for blocks
                    // latedef: "nofunc", // Allow defining functions after use
                    globals: { /* "$": false, "jQuery": false */ }
                }
            }
        });
        
        setupAutoSave(htmlEditor); 
        setupAutoSave(cssEditor); 
        setupAutoSave(jsEditor);
        console.log("CodeMirror instances initialized with refined linting configurations.");
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
        if (!htmlEditor || !cssEditor || !jsEditor || !previewFrame) { return; }
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

        if (iWindow) { // Setup console and error handling for the iframe
            const originalConsole = {log: iWindow.console.log, error: iWindow.console.error, warn: iWindow.console.warn, info: iWindow.console.info, debug: iWindow.console.debug, clear: iWindow.console.clear};
            iWindow.console = {};
            Object.keys(originalConsole).forEach(key => {
                iWindow.console[key] = (...args) => {
                    logToCustomConsole(args, key);
                    if (typeof originalConsole[key] === 'function') { originalConsole[key].apply(null, args); }
                };
            });
            if (typeof originalConsole.clear === 'function') {
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
        styleTag.textContent = `body { margin: 8px; padding: 0; box-sizing: border-box; line-height: 1.6; } ${cssCode} `;
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
    // Initial call handled after loading content

    // --- Event Listeners ---
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

    // --- Project Save/Load ---
    function getProjects() { const p = localStorage.getItem(LS_PROJECTS_KEY); return p ? JSON.parse(p) : []; }
    function saveProjects(pA) { localStorage.setItem(LS_PROJECTS_KEY, JSON.stringify(pA)); }

    if(saveProjectButton) saveProjectButton.addEventListener('click', () => {
        const existingProject = currentProjectId ? getProjects().find(p => p.id === currentProjectId) : null;
        projectNameInput.value = existingProject ? existingProject.name : '';
        const saveModalTitleEl = document.getElementById('save-modal-title'); 
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
            autoSaveUnsavedWork();
            setTimeout(()=>{ refreshEditorsAndPreview(); },100); 
            alert(`Project "${pTL.name}" loaded!`); closeModal(loadProjectsModal);
        } else { alert('Error: Project not found.'); currentProjectId = null; }
    }

    function deleteProject(pId) {
        if(!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
        let ps=getProjects(); ps=ps.filter(p=>p.id!==pId); saveProjects(ps);
        if (currentProjectId === pId) {
            setInitialContent(false, true); 
            currentProjectId = null; 
        }
        renderProjectsList(); alert('Project deleted.');
    }
    
    // --- Settings Modal ---
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

    // --- Download ZIP ---
    if(downloadZipButton) downloadZipButton.addEventListener('click', () => {
        const zip = new JSZip();
        zip.file("index.html", htmlEditor.getValue());
        zip.file("style.css", cssEditor.getValue());
        zip.file("script.js", jsEditor.getValue());
        let manifestContent = "External Resources:\n";
        if(externalCSS.length > 0) manifestContent += "\nCSS:\n" + externalCSS.join("\n");
        if(externalJS.length > 0) manifestContent += "\n\nJS:\n" + externalJS.join("\n");
        if(externalCSS.length > 0 || externalJS.length > 0) zip.file("external_resources.txt", manifestContent);
        generateAndDownloadZip(zip);
    });
    function generateAndDownloadZip(zipInstance) {
        zipInstance.generateAsync({ type: "blob" }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "alexr-code-project.zip";
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }).catch(err => { console.error("Error generating ZIP: ", err); alert("Could not generate ZIP."); });
    }
    
    // --- Fullscreen Preview ---
    if(fullscreenButton) fullscreenButton.addEventListener('click', () => toggleFullScreen(previewFrame));
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
    ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(event => 
        document.addEventListener(event, updateFullscreenButtonText, false)
    );

    // --- Initialize with default content, unsaved work, or last project ---
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
// JSHint test: (uncomment to see linting)
// myUndeclaredVar = "should be flagged";
// let anUnusedVarInInitialContent;
// if (1 == "1") { console.log("Loose comparison"); }
`
        );
        externalCSS = []; externalJS = []; currentProjectId = null;
        applyInitialEditorSettings(); 
        if (consoleOutputDiv) consoleOutputDiv.innerHTML = '';
        if (autoSaveThisContent) autoSaveUnsavedWork();
        if (callRefreshPreview) { setTimeout(refreshEditorsAndPreview, 250); }
    }

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
    setTimeout(refreshEditorsAndPreview, 400); // Final ensure refresh

}); // End DOMContentLoaded
