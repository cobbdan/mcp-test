const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Store registered tools
const registeredTools = new Map();

// Lorem ipsum paragraphs for the lorem ipsum tool
const loremIpsumParagraphs = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
  "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident."
];

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

    // Handle specific tools
    if (toolName === 'loremIpsum') {
        const { paragraphs = 1, maxParagraphs = 5 } = req.body;
        
        // Validate parameters
        const numParagraphs = Math.min(
            Math.max(1, parseInt(paragraphs) || 1), 
            Math.min(maxParagraphs, loremIpsumParagraphs.length)
        );
        
        // Generate lorem ipsum text
        const selectedParagraphs = loremIpsumParagraphs.slice(0, numParagraphs);
        
        return res.json({
            tool: toolName,
            result: selectedParagraphs.join('\n\n'),
            paragraphs: numParagraphs,
            timestamp: new Date().toISOString(),
            status: 'success'
        });
    }

    // For other tools, just echo back the request (default behavior)
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
    
    // Auto-register the lorem ipsum tool
    registeredTools.set('loremIpsum', {
        description: 'Generates lorem ipsum placeholder text',
        parameters: [
            {
                name: 'paragraphs',
                description: 'Number of paragraphs to generate (default: 1)',
                type: 'number',
                required: false
            },
            {
                name: 'maxParagraphs',
                description: 'Maximum number of paragraphs allowed (default: 5)',
                type: 'number',
                required: false
            }
        ],
        timestamp: new Date().toISOString()
    });
    
    console.log('Lorem ipsum tool registered automatically');
});
