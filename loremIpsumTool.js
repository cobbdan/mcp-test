const { LoremIpsum } = require('lorem-ipsum');
const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Lorem Ipsum generator
const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
});

/**
 * Generate Lorem Ipsum text based on specified parameters
 * @param {string} units - Type of units (paragraphs, sentences, words)
 * @param {number} count - Number of units to generate
 * @returns {string} Generated Lorem Ipsum text
 */
function generateLoremIpsum(units, count) {
    switch (units) {
        case 'paragraphs':
            return lorem.generateParagraphs(count);
        case 'sentences':
            return lorem.generateSentences(count);
        case 'words':
            return lorem.generateWords(count);
        default:
            return lorem.generateParagraphs(1);
    }
}

/**
 * Convert text to speech and save as audio file
 * @param {string} text - Text to convert to speech
 * @returns {Promise<string>} Path to the generated audio file
 */
async function textToSpeech(text) {
    return new Promise((resolve, reject) => {
        const filename = `${uuidv4()}.mp3`;
        const filepath = path.join(uploadsDir, filename);
        
        const gtts = new gTTS(text, 'en');
        gtts.save(filepath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(`/uploads/${filename}`);
            }
        });
    });
}

module.exports = {
    generateLoremIpsum,
    textToSpeech
};