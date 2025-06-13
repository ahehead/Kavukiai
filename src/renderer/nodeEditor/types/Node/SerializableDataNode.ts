export interface SerializableDataNode {
  serializeControlValue(): { data: any };
  deserializeControlValue(data: any): void;
}
