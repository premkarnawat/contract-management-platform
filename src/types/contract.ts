export type FieldType = 'text' | 'date' | 'signature' | 'checkbox';

export type ContractStatus = 'draft' | 'active' | 'pending' | 'signed' | 'revoked';

export interface BlueprintField {
  id: string;
  type: FieldType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string | boolean;
  signatureUrl?: string;
}

export interface Blueprint {
  id: string;
  name: string;
  fields: BlueprintField[];
  createdAt: Date;
}

export interface Contract {
  id: string;
  blueprintId: string;
  blueprintName: string;
  title: string;
  status: ContractStatus;
  parties: string[];
  createdAt: Date;
  updatedAt: Date;
  signedAt?: Date;
  fieldValues: Record<string, string | boolean>;
}
