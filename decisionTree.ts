// 1. Define the Action interface.
export interface Action {
  execute(context?: any): void;
  toJSON(): any;
}

// 2. ActionFactory: creates actions based on a JSON schema.
export class ActionFactory {
  private static registry: { [key: string]: (json: any) => Action } = {};

  public static register(type: string, factory: (json: any) => Action): void {
    ActionFactory.registry[type] = factory;
  }

  public static createAction(json: any): Action {
    if (!json || !json.type) {
      throw new Error("Invalid JSON: missing type property.");
    }
    const factory = ActionFactory.registry[json.type];
    if (!factory) {
      throw new Error("Unknown action type: " + json.type);
    }
    return factory(json);
  }
}

// --- Action Implementations ---
// Each action here is implemented as a stub, logging its behavior.

export class SendSmsAction implements Action {
  constructor(public phone: string) {}
  execute(context?: any): void {
    console.log(`SendSmsAction: Sending SMS to ${this.phone}`);
  }
  toJSON(): any {
    return { type: "send_sms", params: { phone: this.phone } };
  }
}
ActionFactory.register("send_sms", (json: any) => {
  return new SendSmsAction(json.params.phone);
});

export class SendEmailAction implements Action {
  constructor(public sender: string, public receiver: string) {}
  execute(context?: any): void {
    console.log(`SendEmailAction: Sending email from ${this.sender} to ${this.receiver}`);
  }
  toJSON(): any {
    return { type: "send_email", params: { sender: this.sender, receiver: this.receiver } };
  }
}
ActionFactory.register("send_email", (json: any) => {
  return new SendEmailAction(json.params.sender, json.params.receiver);
});

export class ConditionAction implements Action {
  constructor(public expression: string, public trueAction: Action, public falseAction?: Action) {}
  execute(context?: any): void {
    let result = false;
    try {
      // Simplified evaluation. In a real system, consider using a secure sandbox.
      const func = new Function("context", `with(context) { return (${this.expression}); }`);
      result = Boolean(func(context || {}));
    } catch (err) {
      console.error("Error evaluating condition:", err);
    }
    console.log(`ConditionAction: Expression "${this.expression}" evaluated to ${result}`);
    if (result) {
      this.trueAction.execute(context);
    } else if (this.falseAction) {
      this.falseAction.execute(context);
    }
  }
  toJSON(): any {
    return {
      type: "condition",
      params: { expression: this.expression },
      trueAction: this.trueAction.toJSON(),
      falseAction: this.falseAction ? this.falseAction.toJSON() : undefined,
    };
  }
}
ActionFactory.register("condition", (json: any) => {
  return new ConditionAction(
    json.params.expression,
    ActionFactory.createAction(json.trueAction),
    json.falseAction ? ActionFactory.createAction(json.falseAction) : undefined
  );
});

export class LoopAction implements Action {
  constructor(public iterations: number, public action: Action) {}
  execute(context?: any): void {
    console.log(`LoopAction: Starting loop for ${this.iterations} iterations.`);
    for (let i = 0; i < this.iterations; i++) {
      console.log(`LoopAction: Iteration ${i + 1}`);
      this.action.execute(context);
    }
  }
  toJSON(): any {
    return {
      type: "loop",
      params: { iterations: this.iterations },
      action: this.action.toJSON(),
    };
  }
}
ActionFactory.register("loop", (json: any) => {
  return new LoopAction(json.params.iterations, ActionFactory.createAction(json.action));
});

export class SequenceAction implements Action {
  constructor(public actions: Action[]) {}
  execute(context?: any): void {
    console.log(`SequenceAction: Executing ${this.actions.length} actions in sequence.`);
    for (const action of this.actions) {
      action.execute(context);
    }
  }
  toJSON(): any {
    return { type: "sequence", actions: this.actions.map((action) => action.toJSON()) };
  }
}
ActionFactory.register("sequence", (json: any) => {
  const actions = json.actions.map((actionJson: any) => ActionFactory.createAction(actionJson));
  return new SequenceAction(actions);
});

// --- Backend Service ---
// This service receives a JSON decision tree and executes it.
export class DecisionTreeService {
  static processDecisionTree(json: any, context?: any): void {
    try {
      const action = ActionFactory.createAction(json);
      action.execute(context);
    } catch (err) {
      console.error("Error processing decision tree:", err);
    }
  }
}

// --- Example Decision Trees ---
// These examples serve as a demonstration and can be used in tests.

export const christmasDecisionTree = {
  type: "condition",
  params: { expression: "date === '1.1.2025'" },
  trueAction: { type: "send_sms", params: { phone: "1234567890" } },
  falseAction: { type: "sequence", actions: [] },
};

export const emailAndSmsTree = {
  type: "sequence",
  actions: [
    { type: "send_email", params: { sender: "a@example.com", receiver: "b@example.com" } },
    { type: "send_sms", params: { phone: "1234567890" } },
    { type: "send_email", params: { sender: "a@example.com", receiver: "c@example.com" } },
  ],
};

export const optionalMailsTree = {
  type: "loop",
  params: { iterations: 10 },
  action: {
    type: "condition",
    params: { expression: "Math.random() > 0.5" },
    trueAction: { type: "send_sms", params: { phone: "1234567890" } },
    falseAction: { type: "sequence", actions: [] },
  },
};