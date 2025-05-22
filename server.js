const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

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
app.post('/execute/:toolName', (req, res) => {
    const { toolName } = req.params;
    const tool = registeredTools.get(toolName);

    if (!tool) {
        return res.status(404).json({ error: `Tool '${toolName}' not found` });
    }

    // In a real implementation, you would execute the tool here
    // For this example, we'll just echo back the request
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

// Start server
app.listen(port, () => {
    console.log(`MCP Server running on port ${port}`);
});
