const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { generateLoremIpsum, textToSpeech } = require('./loremIpsumTool');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Store registered tools
const registeredTools = new Map();

// Tool registration endpoint
app.post('/register-tool', (req, res) => {
    const { name, description, parameters } = req.body;
    
    if (!name || !description) {
        return res.status(400).json({ error: 'Tool name and description are required' });
    }

    registeredTools.set(name, {
        description,
        parameters: parameters || [],
        timestamp: new Date().toISOString()
    });

    res.json({ message: `Tool '${name}' registered successfully` });
});

// List registered tools
app.get('/tools', (req, res) => {
    const tools = Array.from(registeredTools.entries()).map(([name, details]) => ({
        name,
        ...details
    }));
    res.json(tools);
});

// Execute tool endpoint
app.post('/execute/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const tool = registeredTools.get(toolName);

    if (!tool) {
        return res.status(404).json({ error: `Tool '${toolName}' not found` });
    }

    // Handle Lorem Ipsum generator tool
    if (toolName === 'lorem-ipsum') {
        try {
            const { units = 'paragraphs', count = 1, tts = false } = req.body;
            
            // Validate parameters
            if (!['paragraphs', 'sentences', 'words'].includes(units)) {
                return res.status(400).json({ error: "Units must be 'paragraphs', 'sentences', or 'words'" });
            }
            
            if (isNaN(count) || count < 1 || count > 100) {
                return res.status(400).json({ error: "Count must be a number between 1 and 100" });
            }
            
            // Generate Lorem Ipsum text
            const text = generateLoremIpsum(units, count);
            
            // Generate audio if requested
            let audioUrl = null;
            if (tts) {
                audioUrl = await textToSpeech(text);
            }
            
            return res.json({
                tool: toolName,
                parameters: req.body,
                timestamp: new Date().toISOString(),
                result: {
                    text,
                    audioUrl
                }
            });
        } catch (error) {
            console.error('Error executing lorem-ipsum tool:', error);
            return res.status(500).json({ error: 'Failed to execute lorem-ipsum tool' });
        }
    }

    // For other tools, just echo back the request
    res.json({
        tool: toolName,
        parameters: req.body,
        timestamp: new Date().toISOString(),
        status: 'executed'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        registeredTools: registeredTools.size
    });
});

// Register the Lorem Ipsum tool on startup
registeredTools.set('lorem-ipsum', {
    description: 'Generates Lorem Ipsum placeholder text with optional text-to-speech',
    parameters: [
        {
            name: 'units',
            type: 'string',
            description: 'Type of text units to generate (paragraphs, sentences, words)',
            required: false,
            default: 'paragraphs'
        },
        {
            name: 'count',
            type: 'number',
            description: 'Number of units to generate (1-100)',
            required: false,
            default: 1
        },
        {
            name: 'tts',
            type: 'boolean',
            description: 'Whether to generate text-to-speech audio',
            required: false,
            default: false
        }
    ],
    timestamp: new Date().toISOString()
});

// Start server
app.listen(port, () => {
    console.log(`MCP Server running on port ${port}`);
});

module.exports = app; // Export for testing
