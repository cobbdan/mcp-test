const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Store registered tools
const registeredTools = new Map();

// Lorem ipsum text fragments for generating random text
const loremIpsumFragments = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Nullam eget felis eget nunc lobortis mattis aliquam faucibus.",
  "Phasellus vestibulum lorem sed risus ultricies tristique.",
  "Pellentesque habitant morbi tristique senectus et netus et malesuada.",
  "Nulla facilisi etiam dignissim diam quis enim lobortis scelerisque.",
  "Odio pellentesque diam volutpat commodo sed egestas egestas.",
  "Sit amet consectetur adipiscing elit pellentesque habitant morbi.",
  "Viverra nam libero justo laoreet sit amet cursus sit.",
  "Egestas sed sed risus pretium quam vulputate dignissim.",
  "Cursus in hac habitasse platea dictumst quisque sagittis purus.",
  "Vitae suscipit tellus mauris a diam maecenas sed enim ut.",
  "Turpis egestas pretium aenean pharetra magna ac placerat vestibulum.",
  "Egestas integer eget aliquet nibh praesent tristique magna sit.",
  "Nibh mauris cursus mattis molestie a iaculis at erat pellentesque.",
  "Vel eros donec ac odio tempor orci dapibus ultrices in."
];

/**
 * Generates lorem ipsum text
 * @param {Object} options - Configuration options
 * @param {number} options.paragraphs - Number of paragraphs to generate (default: 1)
 * @param {number} options.minSentences - Minimum sentences per paragraph (default: 3)
 * @param {number} options.maxSentences - Maximum sentences per paragraph (default: 7)
 * @returns {string} Generated lorem ipsum text
 */
function generateLoremIpsum(options = {}) {
  const paragraphs = options.paragraphs || 1;
  const minSentences = options.minSentences || 3;
  const maxSentences = options.maxSentences || 7;
  
  let result = [];
  
  for (let i = 0; i < paragraphs; i++) {
    const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
    let paragraph = [];
    
    for (let j = 0; j < sentenceCount; j++) {
      const randomIndex = Math.floor(Math.random() * loremIpsumFragments.length);
      paragraph.push(loremIpsumFragments[randomIndex]);
    }
    
    result.push(paragraph.join(' '));
  }
  
  return result.join('\n\n');
}

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
        try {
            const text = generateLoremIpsum(req.body);
            return res.json({
                tool: toolName,
                result: text,
                timestamp: new Date().toISOString(),
                status: 'success'
            });
        } catch (error) {
            return res.status(400).json({
                tool: toolName,
                error: error.message,
                timestamp: new Date().toISOString(),
                status: 'error'
            });
        }
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
    
    // Register built-in tools
    registerBuiltInTools();
});

/**
 * Register built-in tools that come with the server
 */
function registerBuiltInTools() {
    // Register the lorem ipsum tool
    registeredTools.set('loremIpsum', {
        description: 'Generates lorem ipsum placeholder text',
        parameters: [
            {
                name: 'paragraphs',
                type: 'number',
                description: 'Number of paragraphs to generate',
                required: false,
                default: 1
            },
            {
                name: 'minSentences',
                type: 'number',
                description: 'Minimum sentences per paragraph',
                required: false,
                default: 3
            },
            {
                name: 'maxSentences',
                type: 'number',
                description: 'Maximum sentences per paragraph',
                required: false,
                default: 7
            }
        ],
        timestamp: new Date().toISOString()
    });
    
    console.log('Built-in tools registered successfully');
}
