// inputのcontrolか、dataflowからの値を取得
export function getInputValue(
  inputs: any,
  inputName: string,
  nodeInputsFromDataflow: any
) {
  const reteInput = inputs[inputName];

  if (reteInput?.control && reteInput.showControl) {
    return reteInput.control.getValue();
  }

  const values = nodeInputsFromDataflow[inputName];
  if (Array.isArray(values) && values.length > 0) {
    return values[0];
  }

  return undefined;
}
