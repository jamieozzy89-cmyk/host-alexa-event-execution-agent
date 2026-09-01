export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class StaleRevisionError extends DomainError {
  constructor(expected: number, actual: number) {
    super(`Expected revision ${expected}, but current revision is ${actual}.`, "STALE_REVISION");
    this.name = "StaleRevisionError";
  }
}
