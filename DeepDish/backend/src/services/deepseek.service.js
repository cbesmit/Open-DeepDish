const axios = require('axios');

const callDeepSeekAPI = async (promptText) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-reasoner';
  const apiUrl = 'https://api.deepseek.com/chat/completions';

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not defined in environment variables.');
  }

  const payload = {
    model: model,
    messages: [
      { role: 'user', content: promptText }
    ],
    temperature: 0.7,
    // response_format: { type: "json_object" } // Optional, better to rely on prompt enforcement for now as advised
  };

  try {
    // Debugging Logs
    console.log('--- [DEBUG] DeepSeek Request Info ---');
    console.log('Model:', model);
    
    // Mask API Key for logging
    const maskedKey = apiKey ? 
      `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 
      'UNDEFINED';
    console.log('API Key (Masked):', maskedKey);
    console.log('Full Prompt:', JSON.stringify(payload.messages, null, 2));
    console.log('-------------------------------------');

    console.log(`[DeepSeek Service] Calling API with model: ${model}...`);
    
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 360000 // 360 seconds timeout (6 mins)
    });

    const content = response.data.choices[0].message.content;
    
    // Debugging: Log Raw Response
    console.log('--- [DEBUG] Raw AI Response Content ---');
    console.log(content);
    console.log('---------------------------------------');
    
    // Sanitización: Extraer JSON del bloque markdown ```json ... ``` si existe
    let jsonString = content;
    const jsonBlockRegex = /```json([\s\S]*?)```/;
    const match = content.match(jsonBlockRegex);
    
    if (match && match[1]) {
      jsonString = match[1].trim();
    } else {
        // A veces viene sin markdown, pero verificar si hay texto antes o después
        // Intentar buscar el primer '{' y el último '}'
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonString = content.substring(firstBrace, lastBrace + 1);
        }
    }

    try {
      const parsedData = JSON.parse(jsonString);
      return parsedData;
    } catch (parseError) {
      console.error('[DeepSeek Service] Failed to parse JSON response:', content);
      throw new Error('Invalid JSON received from DeepSeek API');
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[DeepSeek Service] Axios Error:', error.message);
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', error.response.data);
      } else if (error.request) {
        console.error('No response received (Timeout?)');
      }
    } else {
      console.error('[DeepSeek Service] Unknown Error:', error);
    }
    throw error;
  }
};

module.exports = {
  callDeepSeekAPI
};
