document.addEventListener('DOMContentLoaded', () => {
    const htmlCodeTextarea = document.getElementById('html-code');
    const cssCodeTextarea = document.getElementById('css-code');
    const jsCodeTextarea = document.getElementById('js-code');
    const previewFrame = document.getElementById('preview-frame');
    const runButton = document.getElementById('run-button');
    const downloadZipButton = document.getElementById('download-zip-button');

    function updatePreview() {
        const htmlCode = htmlCodeTextarea.value;
        const cssCode = cssCodeTextarea.value;
        const jsCode = jsCodeTextarea.value;

        const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;

        iframeDoc.open();
        iframeDoc.write(`
            <html>
            <head>
                <style>${cssCode}</style>
            </head>
            <body>
                ${htmlCode}
                <script>${jsCode}<\/script> 
            </body>
            </html>
        `);
        // Note: Using '</script>' above to avoid breaking the parent script tag if jsCode itself contains </script>
        iframeDoc.close();
    }

    // Initial preview update
    updatePreview();

    // Update preview on "Run Code" button click
    runButton.addEventListener('click', updatePreview);

    // Optional: Real-time preview (can be resource-intensive for complex code)
    // htmlCodeTextarea.addEventListener('input', updatePreview);
    // cssCodeTextarea.addEventListener('input', updatePreview);
    // jsCodeTextarea.addEventListener('input', updatePreview);


    // Download ZIP functionality
    downloadZipButton.addEventListener('click', () => {
        const htmlContent = htmlCodeTextarea.value;
        const cssContent = cssCodeTextarea.value;
        const jsContent = jsCodeTextarea.value;

        const zip = new JSZip();
        zip.file("index.html", htmlContent);
        zip.file("style.css", cssContent);
        zip.file("script.js", jsContent);

        zip.generateAsync({ type: "blob" })
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
    });
});
