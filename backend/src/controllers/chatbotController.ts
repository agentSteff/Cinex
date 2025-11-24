import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  conversation: ChatMessage[];
}

export const handleChatMessage = async (req: Request, res: Response) => {
  try {
    const { message, conversation = [] }: ChatRequest = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'El mensaje es requerido' 
      });
    }

    // Construir el historial de conversación
    const messages = [
      {
        role: "system" as const,
        content: `Eres un asistente de cine amigable y conocedor. 
        Ayudas a los usuarios a encontrar películas perfectas según sus preferencias.
        Cuando recomiendes películas, proporciona:
        - Título exacto
        - Año de lanzamiento  
        - Género principal
        - Director
        - Rating (1-10)
        - Breve descripción
        - Razón específica de por qué la recomiendas
        
        Mantén un tono entusiasta y amigable.`
      },
      ...conversation.slice(-6), // Últimos 6 mensajes para contexto
      {
        role: "user" as const,
        content: message
      }
    ];

    // Convert messages to Gemini format
    const history = conversation.slice(-6).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const botResponse = result.response.text();
    
    if (!botResponse) {
      throw new Error('No se recibió respuesta del asistente');
    }

    // Intentar extraer recomendaciones estructuradas si las hay
    let movies = [];
    try {
      const jsonMatch = botResponse.match(/\[.*\]/s);
      if (jsonMatch) {
        movies = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.log('No se pudieron extraer recomendaciones estructuradas');
    }

    res.json({
      response: botResponse,
      movies: movies,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chatbot:', error);
    res.status(500).json({
      response: "Lo siento, estoy teniendo problemas para procesar tu mensaje. ¿Podrías intentarlo de nuevo?",
      movies: [],
      timestamp: new Date().toISOString()
    });
  }
};