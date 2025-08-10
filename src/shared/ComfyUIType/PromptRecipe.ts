export type PromptRecipe<
  T extends object = Record<string, unknown>,
  I extends string = string,
  O extends string = string
> = {
  endpoint: string;
  workflow: T;
  opts?: {
    forceWs?: boolean;
    wsTimeout?: number;
    maxTries?: number;
    delayTime?: number;
  };
  inputs: Record<
    I,
    {
      path: string;
      default?: any;
    }
  >;
  outputs: Record<
    O,
    {
      path: string;
    }
  >;
  bypass?: Array<keyof T>; // 生成時にバイパスするノード
};
