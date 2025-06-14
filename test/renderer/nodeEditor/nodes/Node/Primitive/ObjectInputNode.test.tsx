import { test, expect, vi } from 'vitest';
import { ObjectInputNode } from 'renderer/nodeEditor/nodes/Node/Primitive/ObjectInputNode';
import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaPlugin } from 'rete-area-plugin';
import type { ControlFlowEngine, DataflowEngine } from 'rete-engine';
import type { Schemes } from 'renderer/nodeEditor/types';
import { Type } from '@sinclair/typebox';

const history = {} as HistoryPlugin<Schemes>;
const area = {} as AreaPlugin<Schemes, any>;
const clearCacheSpy = vi.fn();
const dataflow = ({ reset: clearCacheSpy } as unknown) as DataflowEngine<Schemes>;
const controlflow = {} as ControlFlowEngine<Schemes>;



