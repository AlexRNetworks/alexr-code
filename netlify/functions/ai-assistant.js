// This is our secure, server-side Netlify Function

exports.handler = async function (event, context) {
    // We only allow POST requests to this function
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Get the user's code and requested action from the front-end
        const { code, action } = JSON.parse(event.body);
        
        // Access the secret API key from the Netlify environment variables
        const OPENAI_API_KEY = process.env.API_KEY;

        if (!OPENAI_API_KEY) {
            throw new Error("API Key is not configured.");
        }

        let systemMessage = "You are an expert code assistant. You provide clear, concise, and accurate information. When providing code, use Markdown code blocks.";
        let userMessage = "";

        // Create a specific prompt based on the button clicked
        if (action === "explain") {
            userMessage = `Please explain the following code in simple terms. Describe its purpose, inputs, and outputs.\n\n\`\`\`javascript\n${code}\n\`\`\``;
        } else if (action === "findBugs") {
            userMessage = `Analyze the following code for potential bugs, errors, or performance issues. If no bugs are found, say so. List any issues you find clearly.\n\n\`\`\`javascript\n${code}\n\`\`\``;
        } else if (action === "refactor") {
            userMessage = `Please refactor the following code to be more efficient, readable, or to use modern syntax. Provide only the refactored code inside a single markdown code block.\n\n\`\`\`javascript\n${code}\n\`\`\``;
        }

        const apiURL = "https://api.openai.com/v1/chat/completions";

        const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.5,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenAI API Error:", errorData);
            throw new Error(errorData.error.message);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Send the AI's response back to the front-end
        return {
            statusCode: 200,
            body: JSON.stringify({ response: aiResponse })
        };

    } catch (error) {
        console.error("Netlify Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
