function parseJSON(content) {
    try {
        let cleaned = content;
        if (content.includes('```')) {
            const matches = content.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (matches && matches[1]) {
                cleaned = matches[1];
            }
        }
        cleaned = cleaned.trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error('Parse error:', error.message);
        return null;
    }
}

// Test cases
const tests = [
    { name: 'Plain JSON', input: '{"score": 1}' },
    { name: 'Markdown JSON', input: '```json\n{"score": 1}\n```' },
    { name: 'Markdown No Lang', input: '```\n{"score": 1}\n```' },
    { name: 'Surrounding Text', input: 'Here is the JSON:\n```json\n{"score": 1}\n```\nHope that helps.' },
    { name: 'Malformed', input: 'Wait, this isn\'t json' }
];

console.log('Running JSON Extraction Tests...\n');

tests.forEach(test => {
    const result = parseJSON(test.input);
    const success = result && result.score === 1;
    console.log(`${success ? '✅' : '❌'} ${test.name}: ${success ? 'Passed' : result ? 'Failed (wrong content)' : 'Failed (parse error)'}`);
});
