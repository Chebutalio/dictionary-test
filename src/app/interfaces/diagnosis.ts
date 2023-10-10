export interface Diagnosis {
  id: number;
  code: string;
  name: string;
}

export interface Coding {
  system: string;
  code: string;
}

export interface Identifier {
  type: {
    coding: Coding[];
  };
  value: string;
}

export interface Context {
  identifier: Identifier;
}

export interface Code {
  coding: Coding[];
}

export interface Condition {
  id: string;
  context: Context;
  code: Code;
  notes: string;
  onset_date: string;
}

export interface JsonObject {
  encounter: {
    date: string,
  },
  conditions: Condition[] | '',
}

export interface SelectControl {
  id: string;
  code: string;
  name: string;
}

export interface DynamicControl {
  selectControl: SelectControl;
  textControl: string;
}

export interface FormData {
  date: Date;
  dynamicControls: DynamicControl[];
}
