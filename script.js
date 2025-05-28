document.addEventListener('DOMContentLoaded', () => {
    // CodeMirror Editor Instances
    let htmlEditor, cssEditor, jsEditor;

    // UI Elements
    const previewFrame = document.getElementById('preview-frame');
    const runButton = document.getElementById('run-button');
    const downloadZipButton = document.getElementById('download-zip-button');
    const themeStylesheetLink = document.getElementById('theme-stylesheet');
    const fullscreenButton = document.getElementById('fullscreen-button');

    // Save/Load Project UI Elements
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


    console.log("Alexr Code script loaded.");

    // --- Initialize CodeMirror Instances ---
    const codeMirrorOptions = {
        lineNumbers: true,
        theme: "material-darker",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineWrapping: true,
    };

    htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), {
        ...codeMirrorOptions, mode: 'htmlmixed'
    });
    cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {
        ...codeMirrorOptions, mode: 'css'
    });
    jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {
        ...codeMirrorOptions, mode: 'javascript'
    });
    // --- End CodeMirror Initialization ---

    function applyTheme() { /* ... (keep existing applyTheme) ... */
        const selectedTheme = localStorage.getItem('selectedTheme');
        if (themeStylesheetLink) {
            themeStylesheetLink.setAttribute('href', selectedTheme || '');
        }
    }
    applyTheme();

    function updatePreview() { /* ... (keep existing updatePreview) ... */
        const htmlCode = htmlEditor.getValue();
        const cssCode = cssEditor.getValue();
        const jsCode = jsEditor.getValue();
        const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        let bodyBg = '#ffffff'; let bodyColor = '#333333'; let bodyFont = 'Inter, sans-serif';
        if (document.body && typeof getComputedStyle === 'function') {
            const computedBodyStyle = getComputedStyle(document.body);
            bodyBg = computedBodyStyle.getPropertyValue('--color-background-preview').trim() || bodyBg;
            bodyColor = computedBodyStyle.getPropertyValue('--color-text-main').trim() || bodyColor;
            bodyFont = computedBodyStyle.getPropertyValue('--font-primary').trim() || bodyFont;
        }
        const iframeContent = `<html><head><style>body{margin:10px;font-family:${bodyFont};background-color:${bodyBg};color:${bodyColor};line-height:1.6;}${cssCode}</style></head><body>${htmlCode}<script>${jsCode}<\/script></body></html>`;
        iframeDoc.open();
        iframeDoc.write(iframeContent);
        iframeDoc.close();
    }

    function refreshEditorsAndPreview() {
        htmlEditor.refresh(); cssEditor.refresh(); jsEditor.refresh();
        updatePreview();
    }
    setTimeout(refreshEditorsAndPreview, 150); // Increased delay slightly

    runButton.addEventListener('click', updatePreview);
    downloadZipButton.addEventListener('click', () => { /* ... (keep existing downloadZipButton logic) ... */
        const zip = new JSZip();
        zip.file("index.html", htmlEditor.getValue());
        zip.file("style.css", cssEditor.getValue());
        zip.file("script.js", jsEditor.getValue());
        generateAndDownloadZip(zip);
    });
    function generateAndDownloadZip(zipInstance) { /* ... (keep existing) ... */
        zipInstance.generateAsync({ type: "blob" }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "alexr-code-project.zip";
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }).catch(err => { console.error("Error ZIP: ", err); alert("Could not generate ZIP."); });
    }

    // Fullscreen Functionality (keep existing)
    if (fullscreenButton) fullscreenButton.addEventListener('click', () => toggleFullScreen(previewFrame));
    function toggleFullScreen(element) { /* ... */ }
    function updateFullscreenButtonText() { /* ... */ }
    document.addEventListener('fullscreenchange', updateFullscreenButtonText); // and prefixed versions

    // --- Project Save/Load Functionality ---

    const LS_PROJECTS_KEY = 'alexrCodeProjects';

    function getProjects() {
        const projects = localStorage.getItem(LS_PROJECTS_KEY);
        return projects ? JSON.parse(projects) : [];
    }

    function saveProjects(projectsArray) {
        localStorage.setItem(LS_PROJECTS_KEY, JSON.stringify(projectsArray));
    }

    // Open Save Modal
    saveProjectButton.addEventListener('click', () => {
        projectNameInput.value = ''; // Clear previous name
        saveProjectModal.style.display = 'block';
        projectNameInput.focus();
    });

    // Close Save Modal
    closeSaveModalButton.addEventListener('click', () => saveProjectModal.style.display = 'none');
    cancelSaveButton.addEventListener('click', () => saveProjectModal.style.display = 'none');

    // Confirm Save Project
    confirmSaveButton.addEventListener('click', () => {
        const projectName = projectNameInput.value.trim();
        if (!projectName) {
            alert('Please enter a project name.');
            projectNameInput.focus();
            return;
        }

        const newProject = {
            id: Date.now(), // Simple unique ID
            name: projectName,
            html: htmlEditor.getValue(),
            css: cssEditor.getValue(),
            js: jsEditor.getValue(),
            savedAt: new Date().toISOString()
        };

        const projects = getProjects();
        projects.push(newProject);
        saveProjects(projects);

        alert(`Project "${projectName}" saved!`);
        saveProjectModal.style.display = 'none';
    });

    // Open Load Modal and Render Projects
    loadProjectsButton.addEventListener('click', () => {
        renderProjectsList();
        loadProjectsModal.style.display = 'block';
    });

    // Close Load Modal
    closeLoadModalButton.addEventListener('click', () => loadProjectsModal.style.display = 'none');
    cancelLoadButton.addEventListener('click', () => loadProjectsModal.style.display = 'none');


    function renderProjectsList() {
        const projects = getProjects();
        projectsListContainer.innerHTML = ''; // Clear current list

        if (projects.length === 0) {
            projectsListContainer.innerHTML = '<p>No projects saved yet.</p>';
            return;
        }

        projects.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)); // Show newest first

        projects.forEach(project => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'project-item';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'project-item-name';
            nameSpan.textContent = project.name;
            // Could add (new Date(project.savedAt).toLocaleDateString()) for date

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'project-item-actions';

            const loadBtn = document.createElement('button');
            loadBtn.textContent = 'Load';
            loadBtn.className = 'load-button';
            loadBtn.onclick = () => loadProject(project.id);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-button';
            deleteBtn.onclick = () => deleteProject(project.id);

            actionsDiv.appendChild(loadBtn);
            actionsDiv.appendChild(deleteBtn);
            projectDiv.appendChild(nameSpan);
            projectDiv.appendChild(actionsDiv);
            projectsListContainer.appendChild(projectDiv);
        });
    }

    function loadProject(projectId) {
        const projects = getProjects();
        const projectToLoad = projects.find(p => p.id === projectId);

        if (projectToLoad) {
            htmlEditor.setValue(projectToLoad.html);
            cssEditor.setValue(projectToLoad.css);
            jsEditor.setValue(projectToLoad.js);
            
            // Ensure CodeMirror instances refresh their display fully
            setTimeout(() => {
                htmlEditor.refresh();
                cssEditor.refresh();
                jsEditor.refresh();
                updatePreview(); // Also update preview after loading
            }, 50); 


            alert(`Project "${projectToLoad.name}" loaded!`);
            loadProjectsModal.style.display = 'none';
        } else {
            alert('Error: Project not found.');
        }
    }

    function deleteProject(projectId) {
        if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) {
            return;
        }

        let projects = getProjects();
        projects = projects.filter(p => p.id !== projectId);
        saveProjects(projects);
        renderProjectsList(); // Re-render the list in the modal
        alert('Project deleted.');
    }

    // Close modals if user clicks outside the modal content
    window.onclick = function(event) {
        if (event.target == saveProjectModal) {
            saveProjectModal.style.display = "none";
        }
        if (event.target == loadProjectsModal) {
            loadProjectsModal.style.display = "none";
        }
    }
    
    // Optional: Load last worked on project or a default?
    // For now, it starts blank or with HTML placeholders.

}); // End DOMContentLoaded
