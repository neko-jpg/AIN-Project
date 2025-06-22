export interface UserPayload {
  purpose: string;
  project_type: string;
  budget: number;
  experience_level: string;
  weekly_hours: string;
  development_time?: number;
  language?: string;
}

export interface ApiResponse {
  suggestion: string;
}

export interface RefinementRequest {
  user_payload: UserPayload;
  current_proposal: string;
  refinement_request: string;
}

export interface RefinementResponse {
  type: 'answer' | 'proposal' | 'rejection';
  content: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Helper function to check if backend is accessible
const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Enhanced error handling function
const handleApiError = async (error: any, endpoint: string) => {
  console.error(`API Error at ${endpoint}:`, error);
  
  // Check if it's a network error
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    // Try to check backend health
    const isBackendHealthy = await checkBackendHealth();
    
    if (!isBackendHealthy) {
      throw new Error(
        `Backend server is not accessible at ${API_BASE_URL}. ` +
        `Please ensure the backend is running. ` +
        `If using a remote server, check if it's deployed and healthy. ` +
        `For local development, run: uvicorn app.main:app --host 0.0.0.0 --port 8000`
      );
    }
  }
  
  // Re-throw the original error if it's not a connection issue
  throw error;
};

export const analyzeProject = async (payload: UserPayload): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze_purpose/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    await handleApiError(error, '/analyze_purpose/');
    throw error; // This line won't be reached, but TypeScript needs it
  }
};

export const generateFullProposal = async (payload: UserPayload): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate_full_proposal/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    await handleApiError(error, '/generate_full_proposal/');
    throw error;
  }
};

export const refineProposal = async (request: RefinementRequest): Promise<RefinementResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/refine_proposal/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    await handleApiError(error, '/refine_proposal/');
    throw error;
  }
};

// Enhanced API function for custom prompts
export const executeCustomPrompt = async (prompt: string, language: 'en' | 'ja' = 'en'): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/execute_custom_prompt/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        language
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    await handleApiError(error, '/execute_custom_prompt/');
    throw error;
  }
};

// NEW: Generate optimized prompt from user requirements
export const generatePrompt = async (payload: UserPayload): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate_prompt/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    await handleApiError(error, '/generate_prompt/');
    throw error;
  }
};