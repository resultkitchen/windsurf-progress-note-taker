require('dotenv').config();
const axios = require('axios');

async function testGeminiAPI() {
    try {
        console.log('Testing Gemini API...');
        console.log('API URL:', process.env.GEMINI_API_URL);
        
        const response = await axios.post(
            `${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: `You are an AI that assists mental health clinicians in creating best-practice progress notes.

Sample Guidelines:
1. Include session date and time
2. Document client's mood and affect
3. Note interventions used
4. Record progress toward goals

Sample Progress Note:
Met with client on 12/22/23. Client reported feeling anxious about work. Used CBT techniques to address negative thought patterns. Client was receptive to interventions.

Please provide:
1) Missing details (if incomplete)
2) Revised note (if complete)
3) Additional feedback`
                    }]
                }]
            }
        );

        console.log('\nAPI Response:');
        console.log(JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('\nError testing Gemini API:');
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testGeminiAPI();
