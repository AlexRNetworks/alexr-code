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
    const cancelSaveButton = saveProjectModal.querySelector('.close-modal-action[data-modal-id="save-project-modal"]');

    const loadProjectsModal = document.getElementById('load-projects-modal');
    const closeLoadModalButton = loadProjectsModal.querySelector('.close-button[data-modal-id="load-projects-modal"]');
    const projectsListContainer = document.getElementById('projects-list-container');
    const cancelLoadButton = loadProjectsModal.querySelector('.close-modal-action[data-modal-id="load-projects-modal"]');

    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalButton = settingsModal.querySelector('.close-button[data-modal-id="settings-modal"]');
    const externalCssUrlsTextarea = document.getElementById('external-css-urls');
    const externalJsUrlsTextarea = document.getElementById('external-js-urls');
    const applySettingsButton = document.getElementById('apply-settings-button');
    const cancelSettingsButton = settingsModal.querySelector('.close-modal-action[data-modal-id="settings-modal"]');
    
    const consoleOutputDiv = document.getElementById('console-output');
    const clearConsoleButton = document.getElementById('clear-console-button');
    
    let externalCSS = []; // Stores current session's external CSS URLs
    let externalJS = [];  // Stores current session's external JS URLs
    let currentProjectId = null; // To track if we are editing an existing project

    console.log("Alexr Code script.js: DOMContentLoaded");

    // --- Initialize CodeMirror ---
    const codeMirrorOptions = {
        lineNumbers: true,
        theme: "material-darker",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineWrapping: true,
    };
    htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), {...codeMirrorOptions, mode: 'htmlmixed'});
    cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {...codeMirrorOptions, mode: 'css'});
    jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {...codeMirrorOptions, mode: 'javascript'});

    // --- Theme Application for index.html ---
    function applyAppTheme() {
        const selectedThemePath = localStorage.getItem('selectedTheme');
        console.log("[script.js] applyAppTheme: Stored theme path:", selectedThemePath);
        if (themeStylesheetLink) {
            if (selectedThemePath && selectedThemePath !== "default") {
                themeStylesheetLink.setAttribute('href', selectedThemePath);
                console.log("[script.js] applyAppTheme: Applied:", selectedThemePath);
            } else {
                themeStylesheetLink.setAttribute('href', '');
                console.log("[script.js] applyAppTheme: Using default styles.");
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
                try { return JSON.stringify(arg, null, 2); }
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
        const iframe = previewFrame; // Ensure previewFrame is used
        
        // It's crucial to wait for the iframe to be loaded, or re-create it
        // For simplicity, we assume it's there. If issues, might need to remove and append a new iframe.
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        iframeDoc.open();
        iframeDoc.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Preview</title></head><body></body></html>');
        iframeDoc.close();

        const head = iframeDoc.head;
        const body = iframeDoc.body;
        const iWindow = iframe.contentWindow;

        // Override iframe's console & error handling
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
            // iWindow.console.clear = () => { originalConsole.clear(); if (consoleOutputDiv) consoleOutputDiv.innerHTML = ''; };
            
            iWindow.onerror = (message, source, lineno, colno, error) => {
                let Sfilename = source ? source.substring(source.lastIndexOf('/') + 1) : "script";
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
            body.appendChild(scriptTag); // Append to body
        });
        const userScriptTag = iframeDoc.createElement('script');
        userScriptTag.textContent = jsCode;
        body.appendChild(userScriptTag);
    }

    function refreshEditorsAndPreview() {
        htmlEditor.refresh(); cssEditor.refresh(); jsEditor.refresh();
        updatePreview();
    }
    setTimeout(refreshEditorsAndPreview, 250); // Increased delay for stability

    // --- Event Listeners ---
    if(runButton) runButton.addEventListener('click', () => {
        if (consoleOutputDiv) consoleOutputDiv.innerHTML = ''; // Clear console on manual "Run"
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
        projectNameInput.value = existingProject ? existingProject.name : ''; // Pre-fill name if editing
        saveProjectModal.style.display = 'block';
        projectNameInput.focus();
    });

    if(confirmSaveButton) confirmSaveButton.addEventListener('click', () => {
        const pN = projectNameInput.value.trim(); if(!pN){alert('Project name required.'); projectNameInput.focus(); return;}
        const projectData = {
            name:pN, html:htmlEditor.getValue(), css:cssEditor.getValue(), js:jsEditor.getValue(),
            externalCSS: [...externalCSS], externalJS: [...externalJS], // Save current external resources
            savedAt:new Date().toISOString()
        };
        
        let ps = getProjects();
        if (currentProjectId) { // Update existing project
            ps = ps.map(p => p.id === currentProjectId ? { ...p, ...projectData } : p);
        } else { // Save new project
            ps.push({ ...projectData, id: Date.now() });
        }
        saveProjects(ps);
        alert(`Project "${pN}" saved!`);
        if (!currentProjectId) currentProjectId = ps.find(p=>p.name === pN && p.savedAt === projectData.savedAt)?.id; // Try to get ID of newly saved
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
            externalCSS = Array.isArray(pTL.externalCSS) ? [...pTL.externalCSS] : []; // Load external resources
            externalJS = Array.isArray(pTL.externalJS) ? [...pTL.externalJS] : [];   // Load external resources
            currentProjectId = pTL.id; // Set current project ID
            
            if (consoleOutputDiv) consoleOutputDiv.innerHTML = ''; // Clear console on project load
            
            setTimeout(()=>{refreshEditorsAndPreview();},100); // Refresh editors and then preview
            alert(`Project "${pTL.name}" loaded!`); closeModal(loadProjectsModal);
        } else { alert('Error: Project not found.'); currentProjectId = null; }
    }

    function deleteProject(pId) {
        if(!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
        let ps=getProjects(); ps=ps.filter(p=>p.id!==pId); saveProjects(ps);
        if (currentProjectId === pId) { // If deleting current project, clear editors
            htmlEditor.setValue(''); cssEditor.setValue(''); jsEditor.setValue('');
            externalCSS = []; externalJS = [];
            currentProjectId = null;
            if (consoleOutputDiv) consoleOutputDiv.innerHTML = '';
            setTimeout(refreshEditorsAndPreview, 50);
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
        if (consoleOutputDiv) consoleOutputDiv.innerHTML = ''; // Clear console
        updatePreview(); // Re-render the preview with new resources
    });

    // --- Download ZIP ---
    if(downloadZipButton) downloadZipButton.addEventListener('click', () => {
        const zip = new JSZip();
        zip.file("index.html", htmlEditor.getValue());
        zip.file("style.css", cssEditor.getValue());
        zip.file("script.js", jsEditor.getValue());
        // For future: could include external resource links in a comment or a manifest file in the ZIP
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
            else if (element.mozRequestFullScreen) element.mozRequestFullScreen(); // Firefox
            else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen(); // Chrome, Safari, Opera
            else if (element.msRequestFullscreen) element.msRequestFullscreen(); // IE/Edge
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

    // --- Initialize with a blank slate or last project (optional) ---
    // To load the most recently saved project on startup:
    // const projects = getProjects();
    // if (projects.length > 0) {
    //    loadProject(projects[0].id); // projects are sorted newest first in renderProjectsList, so projects[0] is newest
    // } else {
       // Set default "hello world" content if no projects
       htmlEditor.setValue("<h1>Hello, Alexr Code!</h1>\n<p>Start coding your ideas.</p>\n<button onclick=\"sayHi()\">Click Me</button>");
       cssEditor.setValue("body { font-family: sans-serif; text-align: center; padding-top: 50px; }\nh1 { color: steelblue; }\nbutton { padding: 10px 20px; background-color: lightgreen; border: none; cursor: pointer; }");
       jsEditor.setValue("function sayHi() {\n  alert('Welcome to Alexr Code!');\n  console.log('Button clicked at ' + new Date().toLocaleTimeString());\n}");
       setTimeout(refreshEditorsAndPreview, 250); // Ensure this default content is previewed
    // }


}); // End DOMContentLoaded
