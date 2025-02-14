# Decision Tree Processing Backend

This project implements a decision tree processing backend in TypeScript. The primary focus is on clean code design, readability, testability, and extensibility rather than detailed business logic. The implementations are minimal (stubbed with log messages) to illustrate the design and structure.

## Overview

The system allows clients to define decision trees using JSON. Each decision tree is composed of actions that implement a common interface. The key components are:

- **Action Interface & Implementations:**  
  Actions such as sending an SMS, sending an email, evaluating a condition, looping a set number of iterations, or executing a sequence of actions implement a common `Action` interface. Each action logs its behavior for demonstration purposes.

- **Action Factory:**  
  The `ActionFactory` creates actions based on the JSON representation. This factory pattern enables easy registration of new action types, ensuring that the system is open to extensions.

- **Decision Tree Service:**  
  The `DecisionTreeService` deserializes a JSON decision tree into corresponding action objects and executes the tree. This decouples the core logic from the delivery mechanism.

- **HTTP Endpoint:**  
  An Express-based HTTP server exposes a POST endpoint (`/process-decision-tree`) to process decision trees via HTTP requests. The server also runs example decision trees on startup to display sample output.

- **Example Decision Trees:**  
  Several sample trees are provided:
  - **Christmas Decision Tree:** Checks a condition based on the date and sends an SMS if true.
  - **Email and SMS Sequence:** Executes a sequence of actions (send email, send SMS, send email).
  - **Optional Mails Tree:** Runs a loop that conditionally sends SMS messages.

## Project Structure

- **`decisionTree.ts`**  
  Contains the core logic:
  - The `Action` interface.
  - Concrete action implementations: `SendSmsAction`, `SendEmailAction`, `ConditionAction`, `LoopAction`, and `SequenceAction`.
  - The `ActionFactory` for instantiating actions.
  - The `DecisionTreeService` for processing decision trees.
  - Example decision tree definitions.

- **`server.ts`**  
  Sets up an Express HTTP server that:
  - Executes example decision trees on startup (to display sample output).
  - Provides a POST endpoint for processing custom decision trees.

## Setup & Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/LukaDut7/decision_tree_processing.git
   cd decision-tree-processing

2. **Install Dependencies**

  npm install
  npm install -g typescript ts-node
  npm install express @types/express

3. **Running the Application**

  ts-node server.ts

## Testing the HTTP Endpoint

To process a decision tree via HTTP, send a POST request to:
  http://localhost:3000/process-decision-tree

with a JSON payload. For example, using curl:
  curl -X POST http://localhost:3000/process-decision-tree \
  -H "Content-Type: application/json" \
  -d '{
  "decisionTree": {
    "type": "send_sms",
    "params": { "phone": "1234567890" }
    },
  "context": {}
  }'

You should receive a JSON response:
  { "status": "success" }


