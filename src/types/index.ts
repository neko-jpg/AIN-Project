export interface PromptBlock {
  id: string;
  content: string;
  priority: number;
  timestamp: Date;
  type: 'text' | 'voice' | 'template';
}

export interface VoiceMemo {
  id: string;
  audioBlob: Blob;
  transcription: string;
  timestamp: Date;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  blocks: string[];
}

export interface AppSettings {
  language: 'en' | 'ja';
  developmentTime: number; // in months
  promptBlocks: PromptBlock[];
  voiceMemos: VoiceMemo[];
}

export interface UserPayload {
  purpose: string;
  project_type: string;
  budget: number;
  experience_level: string;
  weekly_hours: string;
  development_time?: number;
  language?: string;
}