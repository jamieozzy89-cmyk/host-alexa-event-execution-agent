export class ToolInputError extends Error {
  constructor(message: string, public readonly code = "TOOL_INPUT_INVALID") {
    super(message);
    this.name = "ToolInputError";
  }
}

export class ToolRuntimeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable = false,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ToolRuntimeError";
  }
}
