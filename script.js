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
    
    let externalCSS = [];
    let externalJS = [];

    console.log("Alexr Code script.js: DOMContentLoaded");

    // --- Initialize CodeMirror ---
    const codeMirrorOptions = {lineNumbers:true,theme:"material-darker",autoCloseTags:true,autoCloseBrackets:true,lineWrapping:true};
    htmlEditor=CodeMirror.fromTextArea(document.getElementById('html-code'),{...codeMirrorOptions,mode:'htmlmixed'});
    cssEditor=CodeMirror.fromTextArea(document.getElementById('css-code'),{...codeMirrorOptions,mode:'css'});
    jsEditor=CodeMirror.fromTextArea(document.getElementById('js-code'),{...codeMirrorOptions,mode:'javascript'});

    // --- Theme Application for index.html ---
    function applyAppTheme() {
        const selectedThemePath = localStorage.getItem('selectedTheme'); // Expects "themes/theme-name.css" or null
        console.log("[script.js] applyAppTheme: Retrieved from localStorage 'selectedTheme':", selectedThemePath);
        if (themeStylesheetLink) {
            if (selectedThemePath && selectedThemePath !== "default") { // "default" is not a file path
                themeStylesheetLink.setAttribute('href', selectedThemePath);
                console.log("[script.js] applyAppTheme: Applied app theme stylesheet:", selectedThemePath);
            } else {
                themeStylesheetLink.setAttribute('href', ''); // Use main style.css (default theme)
                console.log("[script.js] applyAppTheme: No theme selected or 'default', using main style.css.");
            }
        } else {
            console.error("[script.js] applyAppTheme: CRITICAL - themeStylesheetLink not found!");
        }
    }
    applyAppTheme(); // Apply theme on initial load of index.html

    // --- Preview Update ---
    function updatePreview() {
        const htmlCode = htmlEditor.getValue();
        const cssCode = cssEditor.getValue();
        const jsCode = jsEditor.getValue();
        const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;

        iframeDoc.open();
        iframeDoc.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Preview</title></head><body></body></html>');
        iframeDoc.close();

        const head = iframeDoc.head;
        const body = iframeDoc.body;

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
        const userScriptTag = iframeDoc.createElement('script'); userScriptTag.textContent = jsCode;
        body.appendChild(userScriptTag);
    }

    function refreshEditorsAndPreview() {
        htmlEditor.refresh(); cssEditor.refresh(); jsEditor.refresh();
        updatePreview();
    }
    setTimeout(refreshEditorsAndPreview, 200); // Slightly longer delay

    // --- Event Listeners ---
    if(runButton) runButton.addEventListener('click', updatePreview);

    // Modals Generic Close Logic
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

    // Save Project
    if(saveProjectButton) saveProjectButton.addEventListener('click', () => {
        projectNameInput.value = ''; saveProjectModal.style.display = 'block'; projectNameInput.focus();
    });
    if(confirmSaveButton) confirmSaveButton.addEventListener('click', () => {
        const pN = projectNameInput.value.trim(); if(!pN){alert('Project name required.'); projectNameInput.focus(); return;}
        const nP = {id:Date.now(),name:pN,html:htmlEditor.getValue(),css:cssEditor.getValue(),js:jsEditor.getValue(),savedAt:new Date().toISOString(), externalCSS, externalJS}; // Save external resources too
        const ps = getProjects(); ps.push(nP); saveProjects(ps);
        alert(`Project "${pN}" saved!`); closeModal(saveProjectModal);
    });

    // Load Project
    if(loadProjectsButton) loadProjectsButton.addEventListener('click', () => { renderProjectsList(); loadProjectsModal.style.display = 'block'; });
    
    const LS_PROJECTS_KEY = 'alexrCodeProjects';
    function getProjects() { const p = localStorage.getItem(LS_PROJECTS_KEY); return p ? JSON.parse(p) : []; }
    function saveProjects(pA) { localStorage.setItem(LS_PROJECTS_KEY, JSON.stringify(pA)); }

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
            externalCSS = pTL.externalCSS || []; // Load external resources
            externalJS = pTL.externalJS || [];   // Load external resources
            setTimeout(()=>{refreshEditorsAndPreview();},50);
            alert(`Project "${pTL.name}" loaded!`); closeModal(loadProjectsModal);
        } else { alert('Error: Project not found.'); }
    }
    function deleteProject(pId) {
        if(!confirm('Are you sure you want to delete this project?')) return;
        let ps=getProjects(); ps=ps.filter(p=>p.id!==pId); saveProjects(ps);
        renderProjectsList(); alert('Project deleted.');
    }
    
    // Settings Modal (External Resources)
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
        closeModal(settingsModal); updatePreview();
    });

    // Download ZIP (ensure this is defined)
    if(downloadZipButton) downloadZipButton.addEventListener('click', () => {
        const zip = new JSZip();
        zip.file("index.html", htmlEditor.getValue());
        zip.file("style.css", cssEditor.getValue());
        zip.file("script.js", jsEditor.getValue());
        // Consider adding external resources to ZIP? For now, no.
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
    
    // Fullscreen (ensure this is defined)
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

}); // End DOMContentLoaded
