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
    const closeSaveModalButton = saveProjectModal.querySelector('.close-button[data-modal-id="save-project-modal"]');
    const projectNameInput = document.getElementById('project-name-input');
    const confirmSaveButton = document.getElementById('confirm-save-button');
    // const cancelSaveButton = saveProjectModal.querySelector('.close-modal-action[data-modal-id="save-project-modal"]'); // Covered by generic close

    const loadProjectsModal = document.getElementById('load-projects-modal');
    const closeLoadModalButton = loadProjectsModal.querySelector('.close-button[data-modal-id="load-projects-modal"]');
    const projectsListContainer = document.getElementById('projects-list-container');
    // const cancelLoadButton = loadProjectsModal.querySelector('.close-modal-action[data-modal-id="load-projects-modal"]'); // Covered by generic close

    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalButton = settingsModal.querySelector('.close-button[data-modal-id="settings-modal"]');
    const externalCssUrlsTextarea = document.getElementById('external-css-urls');
    const externalJsUrlsTextarea = document.getElementById('external-js-urls');
    const applySettingsButton = document.getElementById('apply-settings-button');
    // const cancelSettingsButton = settingsModal.querySelector('.close-modal-action[data-modal-id="settings-modal"]'); // Covered by generic close
    
    const consoleOutputDiv = document.getElementById('console-output');
    const clearConsoleButton = document.getElementById('clear-console-button');
    
    let externalCSS = []; // Stores current session's/project's external CSS URLs
    let externalJS = [];  // Stores current session's/project's external JS URLs
    let currentProjectId = null; // To track if we are editing an existing project

    console.log("Alexr Code script.js: DOMContentLoaded");

    // --- Initialize CodeMirror ---
    const codeMirrorOptions = {
        lineNumbers: true,
        theme: "material-darker", // Default CodeMirror theme
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineWrapping: true,
    };
    htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), {...codeMirrorOptions, mode: 'htmlmixed'});
    cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {...codeMirrorOptions, mode: 'css'});
    jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {...codeMirrorOptions, mode: 'javascript'});

    // --- CodeMirror Refresh Function ---
    function refreshAllCodeMirrors() {
        if (htmlEditor) htmlEditor.refresh();
        if (cssEditor) cssEditor.refresh();
        if (jsEditor) jsEditor.refresh();
        console.log("CodeMirror instances refreshed.");
    }

    // --- Initialize Split.js Panes ---
    try {
        const editorSplit = Split(['#html-editor-wrapper', '#css-editor-wrapper', '#js-editor-wrapper'], {
            sizes: [33.3, 33.3, 33.4], minSize: 80, gutterSize: 8, direction: 'horizontal', cursor: 'col-resize',
            onDragEnd: refreshAllCodeMirrors
        });

        const outputSplit = Split(['#preview-wrapper', '#console-wrapper'], {
            sizes: [70, 30], minSize: [80, 50], gutterSize: 8, direction: 'vertical', cursor: 'row-resize',
            elementStyle: (dim, size, gutterSize) => ({ 'flex-basis': `calc(${size}% - ${gutterSize}px)` }),
            gutterStyle: (dim, gutterSize) => ({ 'flex-basis': `${gutterSize}px` })
        });
        
        const mainSplit = Split(['#code-editors-pane', '#output-pane'], {
            sizes: [60, 40], minSize: [200, 200], gutterSize: 8, direction: 'horizontal', cursor: 'col-resize',
            onDragEnd: function() {
                refreshAllCodeMirrors();
                // outputSplit and editorSplit might also need a nudge if their container changes significantly,
                // but usually flex-basis recalculation handles it. Forcing it can be done if needed.
                // For example: outputSplit.setSizes(outputSplit.getSizes());
            }
        });
        console.log("Split.js panes initialized.");
    } catch (e) {
        console.error("Error initializing Split.js:", e);
        alert("Error setting up resizable panes. Some layout features might not work.");
    }


    // --- Theme Application for index.html ---
    function applyAppTheme() {
        const selectedThemePath = localStorage.getItem('selectedTheme');
        console.log("[script.js] applyAppTheme: Stored theme path:", selectedThemePath);
        if (themeStylesheetLink) {
            if (selectedThemePath && selectedThemePath !== "default") {
                themeStylesheetLink.setAttribute('href', selectedThemePath);
            } else {
                themeStylesheetLink.setAttribute('href', '');
            }
        } else {
            console.error("[script.js] applyAppTheme: themeStylesheetLink not found!");
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
                try { return JSON.stringify(arg, (key, value) => typeof value === 'function' ? 'Function' : value, 2); }
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
            const originalConsole = {
                log: iWindow.console.log, error: iWindow.console.error,
                warn: iWindow.console.warn, info: iWindow.console.info,
                debug: iWindow.console.debug, clear: iWindow.console.clear
            };
            iWindow.console.log = (...args) => { originalConsole.log.apply(iWindow.console, args); logToCustomConsole(args, 'log'); };
            iWindow.console.error = (...args) => { originalConsole.error.apply(iWindow.console, args); logToCustomConsole(args, 'error'); };
            iWindow.console.warn = (...args) => { originalConsole.warn.apply(iWindow.console, args); logToCustomConsole(args, 'warn'); };
            iWindow.console.info = (...args) => { originalConsole.info.apply(iWindow.console, args); logToCustomConsole(args, 'info'); };
            iWindow.console.debug = (...args) => { originalConsole.debug.apply(iWindow.console, args); logToCustomConsole(args, 'debug'); };
            
            iWindow.onerror = (message, source, lineno, colno, error) => {
                let Sfilename = source ? source.substring(source.lastIndexOf('/') + 1) : "script";
                if (Sfilename === "") Sfilename = "inline script"; // Handle data URLs or empty source
                logToCustomConsole([`Error: ${message} (${Sfilename}:${lineno}:${colno})`], 'error');
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
        console.log("[script.js] Preview updated.");
    }

    function refreshEditorsAndPreview() {
        refreshAllCodeMirrors();
        updatePreview();
    }
    // Initial call with a delay to allow layout, CodeMirror, and Split.js to settle
    setTimeout(refreshEditorsAndPreview, 300);

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
    document.querySelectorAll('.close-button, .close-modal-action.button-alt').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal-id');
            if (modalId) closeModal(document.getElementById(modalId));
        });
    });
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    }

    // --- Project Save/Load Functionality ---
    const LS_PROJECTS_KEY = 'alexrCodeProjects';
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
        const projectData = {
            name:pN, html:htmlEditor.getValue(), css:cssEditor.getValue(), js:jsEditor.getValue(),
            externalCSS: [...externalCSS], externalJS: [...externalJS],
            savedAt:new Date().toISOString()
        };
        
        let ps = getProjects();
        let projectExists = false;
        if (currentProjectId) {
            ps = ps.map(p => {
                if (p.id === currentProjectId) {
                    projectExists = true;
                    return { ...p, ...projectData };
                }
                return p;
            });
        }
        
        if (!projectExists && !currentProjectId) { // Saving as new
             const newId = Date.now();
             ps.push({ ...projectData, id: newId });
             currentProjectId = newId; // Set current project ID for new save
        } else if (!projectExists && currentProjectId) {
             // This case implies currentProjectId was set, but project not found in list (e.g., after deletion and not clearing currentProjectId)
             // Treat as a new save or re-evaluate logic for currentProjectId
             console.warn("Saving with currentProjectId but project not found in list. Treating as new save.");
             const newId = Date.now();
             ps.push({ ...projectData, id: newId });
             currentProjectId = newId;
        }


        saveProjects(ps);
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
            
            if (consoleOutputDiv) consoleOutputDiv.innerHTML = '';
            
            // Ensure CodeMirror textareas are populated before refreshing preview
            // Setting value is synchronous, but refresh and updatePreview should happen after.
            setTimeout(()=>{
                refreshEditorsAndPreview();
                console.log(`Project "${pTL.name}" loaded with externalCSS:`, externalCSS, "externalJS:", externalJS);
            },100); 
            alert(`Project "${pTL.name}" loaded!`); closeModal(loadProjectsModal);
        } else { alert('Error: Project not found.'); currentProjectId = null; }
    }

    function deleteProject(pId) {
        if(!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
        let ps=getProjects(); ps=ps.filter(p=>p.id!==pId); saveProjects(ps);
        if (currentProjectId === pId) {
            htmlEditor.setValue(''); cssEditor.setValue(''); jsEditor.setValue('');
            externalCSS = []; externalJS = [];
            currentProjectId = null;
            if (consoleOutputDiv) consoleOutputDiv.innerHTML = '';
            setInitialContent(); // Set default content after deleting current project
        }
        renderProjectsList(); alert('Project deleted.');
    }
    
    // --- Settings Modal (External Resources) ---
    if(settingsButton) settingsButton.addEventListener('click', () => {
        externalCssUrlsTextarea.value = externalCSS.join('\n');
        externalJsUrlsTextarea.value = externalJS.join('\n');
        settingsModal.style.display = 'block';
    });

    if(applySettingsButton) applySettingsButton.addEventListener('click', () => {
        externalCSS = externalCssUrlsTextarea.value.split('\n').map(url => url.trim()).filter(url => url);
        externalJS = externalJsUrlsTextarea.value.split('\n').map(url => url.trim()).filter(url => url);
        console.log("[script.js] Settings Applied - External CSS:", externalCSS);
        console.log("[script.js] Settings Applied - External JS:", externalJS);
        closeModal(settingsModal); 
        if (consoleOutputDiv) consoleOutputDiv.innerHTML = '';
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

    // --- Initialize with default content or last project ---
    function setInitialContent() {
        htmlEditor.setValue("<h1>Welcome to Alexr Code!</h1>\n<p>Your ideas start here. Try some HTML, CSS, and JavaScript.</p>\n<button onclick=\"greetUser()\">Say Hello</button>");
        cssEditor.setValue(
`body { 
    font-family: Arial, Helvetica, sans-serif; 
    margin: 20px; 
    text-align: center; 
    background-color: #f0f2f5; 
    color: #333;
}
h1 { color: #007aff; }
p { font-size: 1.1em; color: #555; }
button { 
    padding: 10px 20px; 
    font-size: 1em;
    color: white; 
    background-color: #28a745; 
    border: none; 
    border-radius: 5px; 
    cursor: pointer; 
    transition: background-color 0.2s;
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

console.info("Alexr Code initialized and ready!");
// Try an error:
// undefinedFunction(); 
`
        );
        externalCSS = []; // Reset external libs for default content
        externalJS = [];
        currentProjectId = null;
        setTimeout(refreshEditorsAndPreview, 250);
    }

    const projects = getProjects();
    if (projects.length > 0) {
       loadProject(projects[0].id); // Load the most recently saved project
    } else {
       setInitialContent(); // Set default content if no projects
    }

}); // End DOMContentLoaded
