document.addEventListener('DOMContentLoaded', () => {
    const htmlCodeTextarea = document.getElementById('html-code');
    const cssCodeTextarea = document.getElementById('css-code');
    const jsCodeTextarea = document.getElementById('js-code');
    const previewFrame = document.getElementById('preview-frame');
    const runButton = document.getElementById('run-button');
    const downloadZipButton = document.getElementById('download-zip-button');
    const themeStylesheetLink = document.getElementById('theme-stylesheet'); // Get the theme link

    // --- THEME LOADING LOGIC ---
    function applyTheme() {
        const selectedTheme = localStorage.getItem('selectedTheme');
        if (selectedTheme && themeStylesheetLink) {
            themeStylesheetLink.setAttribute('href', selectedTheme);
            console.log("Applied theme:", selectedTheme);
        } else if (themeStylesheetLink) {
            // No theme selected or link not found, ensure it's cleared (or set to a default if you have one here)
            themeStylesheetLink.setAttribute('href', '');
            console.log("No theme selected, using default styles.");
        }
    }
    // Apply theme on initial load
    applyTheme();
    // --- END THEME LOADING LOGIC ---


    function updatePreview() {
        const htmlCode = htmlCodeTextarea.value;
        const cssCode = cssCodeTextarea.value;
        const jsCode = jsCodeTextarea.value;

        const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;

        // Get current theme's variables to pass to iframe if possible
        // This is a simplified way; a more robust solution might involve
        // parsing the theme CSS or having JS-accessible theme variables.
        // For now, the preview will use its own defined styles + user CSS.
        const currentThemeStyles = `
            body {
                font-family: ${getComputedStyle(document.body).getPropertyValue('--font-primary') || 'sans-serif'};
                background-color: ${getComputedStyle(document.body).getPropertyValue('--color-background-preview') || '#ffffff'};
                color: ${getComputedStyle(document.body).getPropertyValue('--color-text-main') || '#212529'};
            }
        `;

        iframeDoc.open();
        iframeDoc.write(`
            <html>
            <head>
                <style>
                    /* Basic reset and theme-like defaults for iframe */
                    body { margin: 0; padding: 8px; }
                    ${currentThemeStyles} 
                    /* User's CSS from textarea */
                    ${cssCode}
                </style>
            </head>
            <body>
                ${htmlCode}
                <script>${jsCode}<\/script>
            </body>
            </html>
        `);
        iframeDoc.close();
    }

    // Initial preview update
    // We need to ensure theme is applied before first updatePreview if it relies on theme vars.
    // Since applyTheme is called above, this should be fine.
    updatePreview();


    runButton.addEventListener('click', updatePreview);

    downloadZipButton.addEventListener('click', () => {
        const htmlContent = htmlCodeTextarea.value;
        const cssContent = cssCodeTextarea.value;
        const jsContent = jsCodeTextarea.value;

        // Optional: Include the active theme CSS in the ZIP
        // This is a bit more complex as you'd need to fetch the content of the theme CSS file.
        // For now, we'll keep it simple and only include user's HTML, CSS, JS.

        const zip = new JSZip();
        zip.file("index.html", htmlContent);
        zip.file("style.css", cssContent); // User's CSS
        zip.file("script.js", jsContent);

        // To add the theme to the zip (more advanced):
        // const selectedThemePath = localStorage.getItem('selectedTheme');
        // if (selectedThemePath) {
        //     fetch(selectedThemePath)
        //         .then(response => response.text())
        //         .then(themeCssContent => {
        //             zip.file(selectedThemePath.split('/').pop(), themeCssContent); // e.g., "dark-mode.css"
        //             generateAndDownloadZip(zip);
        //         })
        //         .catch(err => {
        //             console.warn("Could not fetch theme for ZIP:", err);
        //             generateAndDownloadZip(zip); // Download without theme if fetch fails
        //         });
        // } else {
        //     generateAndDownloadZip(zip);
        // }
        generateAndDownloadZip(zip); // Simplified for now
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
