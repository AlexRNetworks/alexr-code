document.addEventListener('DOMContentLoaded', () => {
    // Original textarea elements (will be enhanced by CodeMirror)
    const htmlCodeTextarea = document.getElementById('html-code');
    const cssCodeTextarea = document.getElementById('css-code');
    const jsCodeTextarea = document.getElementById('js-code');

    const previewFrame = document.getElementById('preview-frame');
    const runButton = document.getElementById('run-button');
    const downloadZipButton = document.getElementById('download-zip-button');
    const themeStylesheetLink = document.getElementById('theme-stylesheet');
    const fullscreenButton = document.getElementById('fullscreen-button');

    console.log("Alexr Code script loaded.");

    // --- Initialize CodeMirror Instances ---
    const codeMirrorOptions = {
        lineNumbers: true,
        theme: "material-darker", // Match the CSS theme linked in index.html
        // theme: "neat", // If you chose neat.css
        autoCloseTags: true,     // Requires addon/edit/closetag.js
        autoCloseBrackets: true, // Requires addon/edit/closebrackets.js
        lineWrapping: true,      // Optional: wrap long lines
    };

    const htmlEditor = CodeMirror.fromTextArea(htmlCodeTextarea, {
        ...codeMirrorOptions,
        mode: 'htmlmixed'
    });

    const cssEditor = CodeMirror.fromTextArea(cssCodeTextarea, {
        ...codeMirrorOptions,
        mode: 'css'
    });

    const jsEditor = CodeMirror.fromTextArea(jsCodeTextarea, {
        ...codeMirrorOptions,
        mode: 'javascript'
    });
    // --- End CodeMirror Initialization ---


    function applyTheme() {
        // ... (keep existing applyTheme function)
        console.log("applyTheme function called.");
        const selectedTheme = localStorage.getItem('selectedTheme');
        console.log("Retrieved from localStorage 'selectedTheme':", selectedTheme);

        if (!themeStylesheetLink) {
            console.error("CRITICAL: Theme stylesheet link element not found in HTML (id='theme-stylesheet').");
            return;
        }
        if (selectedTheme) {
            themeStylesheetLink.setAttribute('href', selectedTheme);
        } else {
            themeStylesheetLink.setAttribute('href', '');
        }
    }
    applyTheme();


    function updatePreview() {
        // Get code from CodeMirror instances
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
        const iframeContent = `
            <html><head><style>
                body { margin:10px; font-family:${bodyFont}; background-color:${bodyBg}; color:${bodyColor}; line-height:1.6; }
                ${cssCode}
            </style></head><body>
                ${htmlCode}
            <script>${jsCode}<\/script></body></html>`;
        iframeDoc.open();
        iframeDoc.write(iframeContent);
        iframeDoc.close();
    }

    // Refresh CodeMirror instances and then update preview
    // This is important if the editors are initially hidden or their size changes.
    function refreshEditorsAndPreview() {
        htmlEditor.refresh();
        cssEditor.refresh();
        jsEditor.refresh();
        updatePreview();
    }
    
    // Call refreshEditorsAndPreview after a short delay to ensure layout is stable
    setTimeout(refreshEditorsAndPreview, 100);


    runButton.addEventListener('click', updatePreview); // Update preview directly on run

    downloadZipButton.addEventListener('click', () => {
        // Get code from CodeMirror instances
        const htmlContent = htmlEditor.getValue();
        const cssContent = cssEditor.getValue();
        const jsContent = jsEditor.getValue();

        const zip = new JSZip();
        zip.file("index.html", htmlContent);
        zip.file("style.css", cssContent);
        zip.file("script.js", jsContent);
        generateAndDownloadZip(zip);
    });

    function generateAndDownloadZip(zipInstance) {
        // ... (keep existing generateAndDownloadZip)
        zipInstance.generateAsync({ type: "blob" })
            .then(function(content) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = "alexr-code-project.zip";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(err => { console.error("Error generating ZIP: ", err); alert("Could not generate ZIP file."); });
    }

    // Fullscreen Functionality
    if (fullscreenButton && previewFrame) {
        fullscreenButton.addEventListener('click', () => toggleFullScreen(previewFrame));
    }
    function toggleFullScreen(element) {
        // ... (keep existing toggleFullScreen function)
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (element.requestFullscreen) element.requestFullscreen();
            else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
            else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
            else if (element.msRequestFullscreen) element.msRequestFullscreen();
            if(fullscreenButton) fullscreenButton.textContent = 'Exit Fullscreen';
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
            if(fullscreenButton) fullscreenButton.textContent = 'Fullscreen Preview';
        }
    }
    function updateFullscreenButtonText() {
        // ... (keep existing updateFullscreenButtonText function)
        if(fullscreenButton) {
            if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                fullscreenButton.textContent = 'Exit Fullscreen';
            } else {
                fullscreenButton.textContent = 'Fullscreen Preview';
            }
        }
    }
    document.addEventListener('fullscreenchange', updateFullscreenButtonText);
    document.addEventListener('mozfullscreenchange', updateFullscreenButtonText);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtonText);
    document.addEventListener('msfullscreenchange', updateFullscreenButtonText);

    // Optional: Refresh CodeMirror editors when their visibility might change (e.g., if panels were collapsible)
    // For now, a refresh on load is good. If you add resizable panels later, you'll need to call .refresh() more often.
    // Also, when the theme changes, you might want to update CodeMirror's theme if you want them to match.
    // htmlEditor.setOption("theme", newThemeName);
});
