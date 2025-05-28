document.addEventListener('DOMContentLoaded', () => {
    const htmlCodeTextarea = document.getElementById('html-code');
    const cssCodeTextarea = document.getElementById('css-code');
    const jsCodeTextarea = document.getElementById('js-code');
    const previewFrame = document.getElementById('preview-frame');
    const runButton = document.getElementById('run-button');
    const downloadZipButton = document.getElementById('download-zip-button');
    const themeStylesheetLink = document.getElementById('theme-stylesheet');

    console.log("Alexr Code script loaded."); // 1. Script loaded?

    function applyTheme() {
        console.log("applyTheme function called."); // 2. Function called?
        const selectedTheme = localStorage.getItem('selectedTheme');
        console.log("Retrieved from localStorage 'selectedTheme':", selectedTheme); // 3. What's in localStorage?

        if (!themeStylesheetLink) {
            console.error("CRITICAL: Theme stylesheet link element not found in HTML (id='theme-stylesheet').");
            return;
        }

        if (selectedTheme) {
            themeStylesheetLink.setAttribute('href', selectedTheme);
            console.log("Applied theme stylesheet:", selectedTheme); // 4. HREF set?
        } else {
            themeStylesheetLink.setAttribute('href', ''); // Remove theme to use default
            console.log("No theme selected or 'default' chosen. Using default styles from style.css."); // 5. Default case
        }
    }
    applyTheme();

    function updatePreview() {
        const htmlCode = htmlCodeTextarea.value;
        const cssCode = cssCodeTextarea.value;
        const jsCode = jsCodeTextarea.value;
        const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;

        // Attempt to get some base styles from the currently applied theme for the iframe
        let bodyBg = '#ffffff';
        let bodyColor = '#333333';
        let bodyFont = 'Inter, sans-serif'; // Default fallback

        // Check if document.body has computed styles available
        if (document.body && typeof getComputedStyle === 'function') {
            const computedBodyStyle = getComputedStyle(document.body);
            bodyBg = computedBodyStyle.getPropertyValue('--color-background-preview').trim() || bodyBg;
            bodyColor = computedBodyStyle.getPropertyValue('--color-text-main').trim() || bodyColor;
            bodyFont = computedBodyStyle.getPropertyValue('--font-primary').trim() || bodyFont;
        }
        
        console.log("iFrame theme hints - BG:", bodyBg, "Color:", bodyColor, "Font:", bodyFont);


        const iframeContent = `
            <html>
            <head>
                <style>
                    body { 
                        margin: 10px; /* Basic padding */
                        font-family: ${bodyFont};
                        background-color: ${bodyBg};
                        color: ${bodyColor};
                        line-height: 1.6;
                    }
                    /* User's CSS from textarea */
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

    // Apply theme first, then update preview to reflect theme (if preview depends on it)
    applyTheme(); // Already called above, ensure this is not duplicated if not needed.
                 // It's fine here to ensure it runs after all DOM is ready.

    // Initial preview update (now potentially with themed iframe hints)
    updatePreview();

    runButton.addEventListener('click', updatePreview);

    downloadZipButton.addEventListener('click', () => {
        // ... (rest of your ZIP function, ensure it's not causing unrelated errors)
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
});
