# Requirements Document

## Introduction

This feature adds a new node called "ModelInfoToModelListNode" that processes ModelInfoArray data from LMStudio's ListDownloadedModelsNode. The node filters models by type 'llm' and extracts their modelKey values, returning them as a string array. This enables users to easily get a list of available LLM model keys for further processing in their node workflows.

## Requirements

### Requirement 1

**User Story:** As a node editor user, I want to extract LLM model keys from ModelInfoArray, so that I can get a simple list of available LLM models for selection or processing.

#### Acceptance Criteria

1. WHEN the node receives ModelInfoArray input THEN the system SHALL filter models where type equals 'llm'
2. WHEN filtering is complete THEN the system SHALL extract the modelKey property from each filtered model
3. WHEN extraction is complete THEN the system SHALL return the modelKey values as a string array
4. IF the input ModelInfoArray is empty THEN the system SHALL return an empty string array
5. IF no models have type 'llm' THEN the system SHALL return an empty string array

### Requirement 2

**User Story:** As a node editor user, I want the ModelInfoToModelListNode to integrate seamlessly with existing LMStudio nodes, so that I can chain it with ListDownloadedModelsNode in my workflows.

#### Acceptance Criteria

1. WHEN the node is created THEN the system SHALL provide an input port that accepts ModelInfoArray type
2. WHEN the node is created THEN the system SHALL provide an output port that outputs String[] type
3. WHEN connected to ListDownloadedModelsNode THEN the system SHALL successfully receive and process ModelInfoArray data
4. WHEN processing is complete THEN the system SHALL make the string array available to downstream nodes

### Requirement 3

**User Story:** As a node editor user, I want the ModelInfoToModelListNode to follow the same patterns as other nodes, so that it behaves consistently with the rest of the system.

#### Acceptance Criteria

1. WHEN the node is instantiated THEN the system SHALL extend SerializableInputsNode with appropriate type parameters
2. WHEN the node processes data THEN the system SHALL implement the data() method to return current results
3. WHEN the node state changes THEN the system SHALL support serialization and deserialization of its data
4. WHEN the node is registered THEN the system SHALL be available in the node factory with key "ModelInfoToModelList"
5. WHEN the node is used THEN the system SHALL be exported from the Node index file for proper imports