# Design Document

## Overview

The ModelInfoToModelListNode is a data transformation node that processes ModelInfoArray input and extracts modelKey values from models with type 'llm'. It follows the established SerializableInputsNode pattern used throughout the application and integrates seamlessly with the existing LMStudio node ecosystem.

## Architecture

The node follows the standard node architecture pattern:
- Extends `SerializableInputsNode` with typed input/output ports
- Implements data transformation logic in the `data()` method
- Supports serialization/deserialization for state persistence
- Integrates with the node factory system for instantiation

## Components and Interfaces

### Node Class Structure
```typescript
export class ModelInfoToModelListNode extends SerializableInputsNode<
  { list: TypedSocket },           // Input: ModelInfoArray
  { list: TypedSocket },           // Output: String[]
  {}                               // No controls needed
>
```

### Input/Output Ports
- **Input Port**: 
  - Key: "list"
  - Type: "ModelInfoArray" 
  - Label: "ModelInfo"
- **Output Port**:
  - Key: "list"
  - Type: "String[]"
  - Label: "ModelKeys"

### Data Processing Logic
The core transformation logic:
1. Receive ModelInfoArray from input
2. Filter models where `model.type === 'llm'`
3. Extract `modelKey` property from filtered models
4. Return as string array

## Data Models

### Input Data
- **Type**: `ModelInfoArray` (array of `ModelInfo`)
- **Source**: Typically from `ListDownloadedModelsNode`
- **Structure**: Each `ModelInfo` contains:
  - `type`: 'llm' | 'embedding'
  - `modelKey`: string
  - Other properties (not used in this node)

### Output Data
- **Type**: `string[]`
- **Content**: Array of modelKey values from LLM models only
- **Usage**: Can be consumed by other nodes requiring model selection

### Internal State
- `modelKeys`: string[] - Cached result of the transformation
- Updated whenever input data changes

## Error Handling

### Input Validation
- Handle undefined/null input gracefully by returning empty array
- Handle empty ModelInfoArray by returning empty array
- No explicit error states needed as transformation is always valid

### Edge Cases
- Empty input array → Empty output array
- No LLM models in input → Empty output array
- All models are LLM type → All modelKeys returned

## Testing Strategy

### Unit Tests
1. **Basic Transformation Test**
   - Input: ModelInfoArray with mixed LLM and embedding models
   - Expected: Only LLM modelKeys in output

2. **Empty Input Test**
   - Input: Empty ModelInfoArray
   - Expected: Empty string array

3. **No LLM Models Test**
   - Input: ModelInfoArray with only embedding models
   - Expected: Empty string array

4. **All LLM Models Test**
   - Input: ModelInfoArray with only LLM models
   - Expected: All modelKeys in output

5. **Serialization Test**
   - Verify state can be serialized and deserialized correctly

### Integration Tests
1. **Chain with ListDownloadedModelsNode**
   - Verify data flows correctly from ListDownloadedModelsNode
   - Verify output can be consumed by downstream nodes

## Implementation Details

### File Location
- Path: `src/renderer/nodeEditor/nodes/Node/LMStudio/ModelInfoToModelListNode.tsx`
- Follows existing LMStudio node organization

### Registration Requirements
1. Add to `src/renderer/nodeEditor/nodes/Node/index.ts` exports
2. Add to `src/renderer/nodeEditor/types/Schemes.ts` union type
3. Add to `src/renderer/nodeEditor/nodes/nodeFactories.ts` factory map

### Dependencies
- Inherits from `SerializableInputsNode`
- Uses `ModelInfo` and `ModelInfoArray` types from existing schemas
- No additional external dependencies required