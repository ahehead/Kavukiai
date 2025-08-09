export type PromptRecipe<
  T extends object,
  I extends string,
  O extends string
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
