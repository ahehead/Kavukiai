import { useState, type JSX } from "react";
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types";
import type { ResponseInput, ResponseInputContent, ResponseInputItem, ResponseInputMessageItem, ResponseInputText, ResponseInputImage, ResponseInputFile, ResponseInputAudio } from "renderer/nodeEditor/types/Schemas/InputSchemas";

export interface ResponseInputControlParams extends ControlOptions<ResponseInput> {
  value: ResponseInput;
}

// チャット入力用コントロール
export class ResponseInputControl extends BaseControl<ResponseInput, ResponseInputControlParams> {
  responseInput: ResponseInput;
  totalTokens = 0;

  constructor(
    options: ResponseInputControlParams,
  ) {
    super();
    this.responseInput = options.value ?? [];
  }
  setValue(value: ResponseInput): void {
    this.responseInput = value;
    this.opts.onChange?.(value);
  }

  getValue(): ResponseInput {
    return this.responseInput;
  }

}




// カスタムコンポーネント
export function ResponseInputView(props: {
  data: ResponseInputControl;
}): JSX.Element {
  const control = props.data;
  const [value, setValue] = useState(control.getValue());
  return (
    <div>
      {value.map((inputItem, index) => (
        <div key={index}>
          {/* メッセージ入力 */}
          {isMessageItem(inputItem) ? (
            <>
              <strong>{inputItem.role}</strong>
              {inputItem.content.map((contentItem, contentIndex) => (
                <div key={contentIndex}>
                  {isContentText(contentItem) && <span>{contentItem.text}</span>}
                  {isContentImage(contentItem) && contentItem.image_url && (
                    <img src={contentItem.image_url} alt="message-image" />
                  )}
                  {isContentFile(contentItem) && contentItem.filename && (
                    <a href={`data:application/octet-stream;base64,${contentItem.file_data}`} download={contentItem.filename}>
                      {contentItem.filename}
                    </a>
                  )}
                </div>
              ))}
            </>
          ) : isItemText(inputItem) ? (
            <div>テキスト入力: {inputItem.text}</div>
          ) : isItemImage(inputItem) ? (
            inputItem.image_url ? <img src={inputItem.image_url} alt="input-image" /> : null
          ) : isItemFile(inputItem) ? (
            <a href={`data:application/octet-stream;base64,${inputItem.file_data}`} download={inputItem.filename}>
              {inputItem.filename}
            </a>
          ) : isItemAudio(inputItem) ? (
            <audio controls>
              <source src={`data:audio/${inputItem.format};base64,${inputItem.data}`} />
              <track kind="captions" label="" />
            </audio>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// メッセージ判別
function isMessageItem(inputItem: ResponseInputItem): inputItem is ResponseInputMessageItem {
  return inputItem.type === "message";
}

// メッセージ内コンテンツ判別
function isContentText(item: ResponseInputContent): item is ResponseInputText {
  return item.type === "input_text";
}
function isContentImage(item: ResponseInputContent): item is ResponseInputImage {
  return item.type === "input_image";
}
function isContentFile(item: ResponseInputContent): item is ResponseInputFile {
  return item.type === "input_file";
}

// トップレベル入力アイテム判別
function isItemText(item: ResponseInputItem): item is ResponseInputText {
  return item.type === "input_text";
}
function isItemImage(item: ResponseInputItem): item is ResponseInputImage {
  return item.type === "input_image";
}
function isItemFile(item: ResponseInputItem): item is ResponseInputFile {
  return item.type === "input_file";
}
function isItemAudio(item: ResponseInputItem): item is ResponseInputAudio {
  return item.type === "input_audio";
}
