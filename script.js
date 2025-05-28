document.addEventListener('DOMContentLoaded', () => {
    // CodeMirror Editor Instances
    let htmlEditor, cssEditor, jsEditor;

    // UI Elements
    const previewFrame = document.getElementById('preview-frame');
    const runButton = document.getElementById('run-button');
    const downloadZipButton = document.getElementById('download-zip-button');
    const themeStylesheetLink = document.getElementById('theme-stylesheet');
    const fullscreenButton = document.getElementById('fullscreen-button');

    // Save/Load Project UI Elements (existing)
    const saveProjectButton = document.getElementById('save-project-button');
    const loadProjectsButton = document.getElementById('load-projects-button');
    const saveProjectModal = document.getElementById('save-project-modal');
    const closeSaveModalButton = document.getElementById('close-save-modal');
    const projectNameInput = document.getElementById('project-name-input');
    const confirmSaveButton = document.getElementById('confirm-save-button');
    const cancelSaveButton = document.getElementById('cancel-save-button');
    const loadProjectsModal = document.getElementById('load-projects-modal');
    const closeLoadModalButton = document.getElementById('close-load-modal');
    const projectsListContainer = document.getElementById('projects-list-container');
    const cancelLoadButton = document.getElementById('cancel-load-button');

    // --- NEW: Settings Modal (External Resources) UI Elements ---
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalButton = document.getElementById('close-settings-modal');
    const externalCssUrlsTextarea = document.getElementById('external-css-urls');
    const externalJsUrlsTextarea = document.getElementById('external-js-urls');
    const applySettingsButton = document.getElementById('apply-settings-button');
    const cancelSettingsButton = document.getElementById('cancel-settings-button');

    // Arrays to store external resource URLs (session-based for now)
    let externalCSS = [];
    let externalJS = [];
    // --- END NEW ---


    console.log("Alexr Code script loaded.");

    // --- Initialize CodeMirror Instances ---
    // ... (keep existing CodeMirror initialization)
    const codeMirrorOptions = {lineNumbers:true,theme:"material-darker",autoCloseTags:true,autoCloseBrackets:true,lineWrapping:true};
    htmlEditor=CodeMirror.fromTextArea(document.getElementById('html-code'),{...codeMirrorOptions,mode:'htmlmixed'});
    cssEditor=CodeMirror.fromTextArea(document.getElementById('css-code'),{...codeMirrorOptions,mode:'css'});
    jsEditor=CodeMirror.fromTextArea(document.getElementById('js-code'),{...codeMirrorOptions,mode:'javascript'});


    function applyTheme() { /* ... (keep existing applyTheme) ... */ }
    applyTheme();

    function updatePreview() {
        const htmlCode = htmlEditor.getValue();
        const cssCode = cssEditor.getValue();
        const jsCode = jsEditor.getValue();

        const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body></body></html>'); // Basic structure
        iframeDoc.close(); // Close before appending to head/body to ensure they exist

        const head = iframeDoc.head;
        const body = iframeDoc.body;

        // --- NEW: Inject External CSS ---
        externalCSS.forEach(url => {
            if (url.trim() === '') return;
            const linkTag = iframeDoc.createElement('link');
            linkTag.rel = 'stylesheet';
            linkTag.href = url.trim();
            head.appendChild(linkTag);
        });
        // --- END NEW ---

        // Inject user's CSS
        const styleTag = iframeDoc.createElement('style');
        styleTag.textContent = `
            body { 
                margin:10px; 
                font-family: ${getComputedStyle(document.body).getPropertyValue('--font-primary').trim() || 'Inter, sans-serif'}; 
                background-color: ${getComputedStyle(document.body).getPropertyValue('--color-background-preview').trim() || '#ffffff'}; 
                color: ${getComputedStyle(document.body).getPropertyValue('--color-text-main').trim() || '#333333'}; 
                line-height:1.6; 
            }
            ${cssCode}
        `;
        head.appendChild(styleTag);
        
        // Inject user's HTML
        body.innerHTML = htmlCode;

        // --- NEW: Inject External JS (before user's JS) ---
        externalJS.forEach(url => {
            if (url.trim() === '') return;
            const scriptTag = iframeDoc.createElement('script');
            scriptTag.src = url.trim();
            // scriptTag.defer = true; // Or async, depending on desired behavior
            body.appendChild(scriptTag); // Append to body to ensure DOM is available if scripts need it
        });
        // --- END NEW ---

        // Inject user's JS
        const userScriptTag = iframeDoc.createElement('script');
        userScriptTag.textContent = jsCode;
        body.appendChild(userScriptTag);
    }


    function refreshEditorsAndPreview() { /* ... (keep existing) ... */
        htmlEditor.refresh(); cssEditor.refresh(); jsEditor.refresh();
        updatePreview();
    }
    setTimeout(refreshEditorsAndPreview, 150);

    runButton.addEventListener('click', updatePreview);
    // ... (keep existing downloadZipButton, generateAndDownloadZip, fullscreen logic) ...
    if (fullscreenButton) fullscreenButton.addEventListener('click', () => toggleFullScreen(previewFrame));
    function toggleFullScreen(element) { /* ... */ }
    function updateFullscreenButtonText() { /* ... */ }
    document.addEventListener('fullscreenchange', updateFullscreenButtonText); // and prefixed versions


    // --- Project Save/Load Functionality (existing) ---
    // ... (keep all existing save/load project functions: getProjects, saveProjects, modal listeners, renderProjectsList, loadProject, deleteProject) ...
    const LS_PROJECTS_KEY='alexrCodeProjects';function getProjects(){const p=localStorage.getItem(LS_PROJECTS_KEY);return p?JSON.parse(p):[]}
    function saveProjects(pA){localStorage.setItem(LS_PROJECTS_KEY,JSON.stringify(pA))}
    saveProjectButton.addEventListener('click',()=>{projectNameInput.value='';saveProjectModal.style.display='block';projectNameInput.focus();});
    closeSaveModalButton.addEventListener('click',()=>{saveProjectModal.style.display='none'});cancelSaveButton.addEventListener('click',()=>{saveProjectModal.style.display='none'});
    confirmSaveButton.addEventListener('click',()=>{const pN=projectNameInput.value.trim();if(!pN){alert('Please enter a project name.');projectNameInput.focus();return}
    const nP={id:Date.now(),name:pN,html:htmlEditor.getValue(),css:cssEditor.getValue(),js:jsEditor.getValue(),savedAt:new Date().toISOString()};
    const ps=getProjects();ps.push(nP);saveProjects(ps);alert(`Project "${pN}" saved!`);saveProjectModal.style.display='none'});
    loadProjectsButton.addEventListener('click',()=>{renderProjectsList();loadProjectsModal.style.display='block'});
    closeLoadModalButton.addEventListener('click',()=>{loadProjectsModal.style.display='none'});cancelLoadButton.addEventListener('click',()=>{loadProjectsModal.style.display='none'});
    function renderProjectsList(){const ps=getProjects();projectsListContainer.innerHTML='';if(ps.length===0){projectsListContainer.innerHTML='<p>No projects saved yet.</p>';return}
    ps.sort((a,b)=>new Date(b.savedAt)-new Date(a.savedAt));ps.forEach(p=>{const pD=document.createElement('div');pD.className='project-item';
    const nS=document.createElement('span');nS.className='project-item-name';nS.textContent=p.name;const aD=document.createElement('div');
    aD.className='project-item-actions';const lB=document.createElement('button');lB.textContent='Load';lB.className='load-button';
    lB.onclick=()=>loadProject(p.id);const dB=document.createElement('button');dB.textContent='Delete';dB.className='delete-button';
    dB.onclick=()=>deleteProject(p.id);aD.appendChild(lB);aD.appendChild(dB);pD.appendChild(nS);pD.appendChild(aD);projectsListContainer.appendChild(pD)})}
    function loadProject(pId){const ps=getProjects();const pTL=ps.find(p=>p.id===pId);if(pTL){htmlEditor.setValue(pTL.html);cssEditor.setValue(pTL.css);
    jsEditor.setValue(pTL.js);setTimeout(()=>{htmlEditor.refresh();cssEditor.refresh();jsEditor.refresh();updatePreview()},50);
    alert(`Project "${pTL.name}" loaded!`);loadProjectsModal.style.display='none'}else{alert('Error: Project not found.')}}
    function deleteProject(pId){if(!confirm('Delete this project?'))return;let ps=getProjects();ps=ps.filter(p=>p.id!==pId);saveProjects(ps);
    renderProjectsList();alert('Project deleted.')}


    // --- NEW: Settings Modal Logic (External Resources) ---
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            // Populate textareas with current URLs
            externalCssUrlsTextarea.value = externalCSS.join('\n');
            externalJsUrlsTextarea.value = externalJS.join('\n');
            settingsModal.style.display = 'block';
        });
    }

    if (closeSettingsModalButton) {
        closeSettingsModalButton.addEventListener('click', () => settingsModal.style.display = 'none');
    }
    if (cancelSettingsButton) {
        cancelSettingsButton.addEventListener('click', () => settingsModal.style.display = 'none');
    }

    if (applySettingsButton) {
        applySettingsButton.addEventListener('click', () => {
            // Get URLs from textareas, split by newline, filter out empty lines, trim whitespace
            externalCSS = externalCssUrlsTextarea.value.split('\n').map(url => url.trim()).filter(url => url);
            externalJS = externalJsUrlsTextarea.value.split('\n').map(url => url.trim()).filter(url => url);

            console.log("External CSS Applied:", externalCSS);
            console.log("External JS Applied:", externalJS);

            settingsModal.style.display = 'none';
            updatePreview(); // Re-render the preview with new resources
        });
    }
    // --- END NEW ---

    // Close modals on outside click (existing)
    window.onclick = function(event) {
        if (event.target == saveProjectModal) saveProjectModal.style.display = "none";
        if (event.target == loadProjectsModal) loadProjectsModal.style.display = "none";
        if (event.target == settingsModal) settingsModal.style.display = "none"; // Add for settings modal
    }

}); // End DOMContentLoaded
