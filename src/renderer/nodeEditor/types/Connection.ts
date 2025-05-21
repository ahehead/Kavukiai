import { ClassicPreset } from "rete";
import type { NodeInterface } from "./Schemes";

export class Connection<
  A extends NodeInterface,
  B extends NodeInterface
> extends ClassicPreset.Connection<A, B> {
  isLoop?: boolean;
  isExec?: boolean;
}
