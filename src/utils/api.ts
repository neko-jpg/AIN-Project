export interface UserPayload {
  purpose: string;
  project_type: string;
  budget: number;
  experience_level: string;
  weekly_hours: string;
}

export interface ApiResponse {
  suggestion: string;
}

export interface RefinementRequest {
  user_payload: UserPayload;
  current_proposal: string;
  refinement_request: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000';

export const analyzeProject = async (payload: UserPayload): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/analyze_purpose/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const generateFullProposal = async (payload: UserPayload): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/generate_full_proposal/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const refineProposal = async (request: RefinementRequest): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/refine_proposal/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};