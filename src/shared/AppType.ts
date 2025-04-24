export type AppState = FileList & ActiveFileNumber & Settings;

export type FileList = {
  files: File[];
};

export type ActiveFileNumber = {
  activeFileNumber: number | null;
};

export type File = {
  data: string;
  name: string;
  isDarty: boolean;
};

export type Settings = {
  hoge: string;
} & ApiKeys;

export type ApiKeys = {
  openai: Buffer | null;
};
