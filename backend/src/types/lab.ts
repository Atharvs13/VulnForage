export type LabDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type LabResetStrategy = 'DATABASE_FIXTURES' | 'DATABASE_AND_FILES' | 'STATELESS';

export interface LabDefinition {
  id: string;
  missionId: string;
  owaspCategory: `A${string}:2025`;
  title: string;
  difficulty: LabDifficulty;
  description: string;
  targetEndpoints: string[];
  objectives: string[];
  prerequisites: string[];
  eventTypes: string[];
  resetStrategy: LabResetStrategy;
}

export interface LabEventInput {
  eventType: string;
  userId: number;
  labId: string;
  requestId?: string;
  endpoint: string;
  method: string;
  metadata?: Record<string, unknown>;
}

export interface LabEventRecord extends LabEventInput {
  id: number;
  timestamp: string;
}
