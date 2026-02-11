const KSR_CHATBOT_URL = process.env.NEXT_PUBLIC_KSR_CHATBOT_URL || 'https://ksr-chatbot-production-a437.up.railway.app';

// Generate or get session ID from localStorage
function getSessionId(): string {
  if (typeof window !== 'undefined') {
    let sessionId = localStorage.getItem('ksr_chat_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ksr_chat_session_id', sessionId);
    }
    return sessionId;
  }
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export async function sendMessageToChat(message: string): Promise<string> {
  try {
    const sessionId = getSessionId();
    
    const response = await fetch(`${KSR_CHATBOT_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ 
        session_id: sessionId,
        query: message 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data = (await response.json()) as { query: string; result: string };
    return data.result;
  } catch (error) {
    console.error('Chat service error:', error);
    throw error;
  }
}

export async function resetConversation(): Promise<void> {
  try {
    const sessionId = getSessionId();
    
    await fetch(`${KSR_CHATBOT_URL}/clear_chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ session_id: sessionId }),
    });
    
    // Generate new session ID after clearing
    if (typeof window !== 'undefined') {
      const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ksr_chat_session_id', newSessionId);
    }
  } catch (error) {
    console.error('Reset conversation error:', error);
    throw error;
  }
}
