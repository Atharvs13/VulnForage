export interface MissionEvidence {
  method: string;
  endpoint: string;
  changedParameter: string;
  responseObservation: string;
  resourceId?: string | number;
  eventId?: number;
  explanation: string;
}

export interface MissionValidationResult {
  passed: boolean;
  eventId?: number;
  feedback: string;
}
