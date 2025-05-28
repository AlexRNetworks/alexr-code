document.addEventListener('DOMContentLoaded', () => {
    const htmlCodeTextarea = document.getElementById('html-code');
    const cssCodeTextarea = document.getElementById('css-code');
    const jsCodeTextarea = document.getElementById('js-code');
    const previewFrame = document.getElementById('preview-frame');
    const runButton = document.getElementById('run-button');
    const downloadZipButton = document.getElementById('download-zip-button');
    const themeStylesheetLink = document.getElementById('theme-stylesheet');
    
    // --- NEW: FULLSCREEN ELEMENTS ---
    const fullscreenButton = document.getElementById('fullscreen-button');
    // --- END NEW ---

    console.log("Alexr Code script loaded.");

    function applyTheme() {
        // ... (your existing applyTheme function)
        console.log("applyTheme function called.");
        const selectedTheme = localStorage.getItem('selectedTheme');
        console.log("Retrieved from localStorage 'selectedTheme':", selectedTheme);

        if (!themeStylesheetLink) {
            console.error("CRITICAL: Theme stylesheet link element not found in HTML (id='theme-stylesheet').");
            return;
        }
        if (selectedTheme) {
            themeStylesheetLink.setAttribute('href', selectedTheme);
            console.log("Applied theme stylesheet:", selectedTheme);
        } else {
            themeStylesheetLink.setAttribute('href', ''); 
            console.log("No theme selected or 'default' chosen. Using default styles from style.css.");
        }
    }
    applyTheme();

    function updatePreview() {
        // ... (your existing updatePreview function)
        const htmlCode = htmlCodeTextarea.value;
        const cssCode = cssCodeTextarea.value;
        const jsCode = jsCodeTextarea.value;
        const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        let bodyBg = '#ffffff';
        let bodyColor = '#333333';
        let bodyFont = 'Inter, sans-serif'; 
        if (document.body && typeof getComputedStyle === 'function') {
            const computedBodyStyle = getComputedStyle(document.body);
            bodyBg = computedBodyStyle.getPropertyValue('--color-background-preview').trim() || bodyBg;
            bodyColor = computedBodyStyle.getPropertyValue('--color-text-main').trim() || bodyColor;
            bodyFont = computedBodyStyle.getPropertyValue('--font-primary').trim() || bodyFont;
        }
        const iframeContent = `
            <html>
            <head>
                <style>
                    body { 
                        margin: 10px; 
                        font-family: ${bodyFont};
                        background-color: ${bodyBg};
                        color: ${bodyColor};
                        line-height: 1.6;
                    }
                    ${cssCode}
                </style>
            </head>
            <body>
                ${htmlCode}
                <script>${jsCode}<\/script> 
            </body>
            </html>
        `;
        iframeDoc.open();
        iframeDoc.write(iframeContent);
        iframeDoc.close();
    }
    updatePreview();

    runButton.addEventListener('click', updatePreview);

    downloadZipButton.addEventListener('click', () => {
        // ... (your existing downloadZipButton logic)
        const htmlContent = htmlCodeTextarea.value;
        const cssContent = cssCodeTextarea.value;
        const jsContent = jsCodeTextarea.value;
        const zip = new JSZip();
        zip.file("index.html", htmlContent);
        zip.file("style.css", cssContent);
        zip.file("script.js", jsContent);
        generateAndDownloadZip(zip);
    });

    function generateAndDownloadZip(zipInstance) {
        // ... (your existing generateAndDownloadZip function)
        zipInstance.generateAsync({ type: "blob" })
            .then(function(content) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = "alexr-code-project.zip";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(err => {
                console.error("Error generating ZIP: ", err);
                alert("Could not generate ZIP file. Check console for errors.");
            });
    }

    // --- NEW: FULLSCREEN FUNCTIONALITY ---
    if (fullscreenButton && previewFrame) {
        fullscreenButton.addEventListener('click', () => {
            toggleFullScreen(previewFrame);
        });
    }

    function toggleFullScreen(element) {
        if (!document.fullscreenElement &&    // Standard property
            !document.mozFullScreenElement && // Firefox
            !document.webkitFullscreenElement && // Chrome, Safari and Opera
            !document.msFullscreenElement) {  // IE/Edge

            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) { /* Firefox */
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) { /* IE/Edge */
                element.msRequestFullscreen();
            }
            if(fullscreenButton) fullscreenButton.textContent = 'Exit Fullscreen';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
            }
            if(fullscreenButton) fullscreenButton.textContent = 'Fullscreen Preview';
        }
    }

    // Event listener for when fullscreen mode changes (e.g., user presses Esc)
    // This helps keep the button text in sync.
    document.addEventListener('fullscreenchange', updateFullscreenButtonText);
    document.addEventListener('mozfullscreenchange', updateFullscreenButtonText);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtonText);
    document.addEventListener('msfullscreenchange', updateFullscreenButtonText);

    function updateFullscreenButtonText() {
        if(fullscreenButton) {
            if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                fullscreenButton.textContent = 'Exit Fullscreen';
            } else {
                fullscreenButton.textContent = 'Fullscreen Preview';
            }
        }
    }
    // --- END NEW FULLSCREEN FUNCTIONALITY ---
});
