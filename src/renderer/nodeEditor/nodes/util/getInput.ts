// inputのcontrolか、dataflowからの値を取得
export function getInputValue(
  nodeInputs: any,
  inputName: string,
  dataflowInputs: any
): any | undefined {
  const reteInput = nodeInputs[inputName];

  if (reteInput?.control && reteInput.showControl) {
    return reteInput.control.getValue();
  }

  const values = dataflowInputs[inputName];
  if (Array.isArray(values) && values.length > 0) {
    return values[0];
  }

  return undefined;
}
