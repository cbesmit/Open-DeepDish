const axios = require('axios');

const callOpenAIAPI = async (promptText) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not defined in environment variables.');
  }

/*
  const payload = {
    model: model,
    messages: [
      { role: 'user', content: promptText }
    ],
    temperature: 0.7,
  };
*/

  const payload = {
    model: model,
    messages: [
      { 
        role: 'system', 
        content: `Eres un Chef Ejecutivo experto. Genera recetas detalladas en JSON.
        REGLAS DE ESTILO:
        - Las descripciones deben ser largas, apetitosas y detalladas.
        - Los pasos de preparación deben ser explicativos, no te limites a frases cortas.
        - Queremos calidad y profundidad en el contenido culinario.
        NO uses markdown, solo JSON crudo.`
      },
      { 
        role: 'user', 
        content: promptText 
      }
    ],
    temperature: 0.3, // Más bajo = Menos alucinaciones y formato más estable
    max_tokens: 10000, // Espacio de sobra para 8-10 recetas (gpt-4o-mini soporta hasta 16k de salida)
    response_format: { type: "json_object" } // FUERZA a la IA a devolver JSON válido
  };

  try {
    // Debugging Logs
    console.log('--- [DEBUG] OpenAI Request Info ---');
    console.log('Model:', model);
    
    // Mask API Key for logging
    const maskedKey = apiKey ? 
      `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 
      'UNDEFINED';
    console.log('API Key (Masked):', maskedKey);
    console.log('Prompt Length:', promptText.length);
    console.log('-----------------------------------');

    console.log(`[OpenAI Service] Calling API with model: ${model}...`);
    
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 300000 // 5 minutos timeout
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
      console.error('[OpenAI Service] Failed to parse JSON response:', content);
      throw new Error('Invalid JSON received from OpenAI API');
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[OpenAI Service] Axios Error:', error.message);
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', error.response.data);
      } else if (error.request) {
        console.error('No response received (Timeout?)');
      }
    } else {
      console.error('[OpenAI Service] Unknown Error:', error);
    }
    throw error;
  }
};

module.exports = {
  callOpenAIAPI
};
