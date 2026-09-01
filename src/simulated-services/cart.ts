import type { CartActionAdapter, CartCheckoutResult, SimulatedCartLine } from "../tools/types.js";

export interface DeterministicCartOptions {
  failNext?: { errorCode: string; message: string };
}

export class DeterministicSimulatedCartAdapter implements CartActionAdapter {
  private failure: { errorCode: string; message: string } | undefined;
  private readonly completed = new Map<string, CartCheckoutResult>();

  constructor(options: DeterministicCartOptions = {}) {
    this.failure = options.failNext;
  }

  failNext(errorCode: string, message: string): void {
    this.failure = { errorCode, message };
  }

  async checkout(params: {
    eventId: string;
    revision: number;
    idempotencyKey: string;
    lines: SimulatedCartLine[];
    currency: string;
  }): Promise<CartCheckoutResult> {
    const previous = this.completed.get(params.idempotencyKey);
    if (previous) return structuredClone(previous);

    if (this.failure) {
      const failure: CartCheckoutResult = { ok: false, ...this.failure };
      this.failure = undefined;
      return failure;
    }

    const total = Math.round(params.lines.reduce((sum, line) => sum + line.linePrice, 0) * 100) / 100;
    const success: CartCheckoutResult = {
      ok: true,
      reference: `SIM-${params.eventId}-${params.revision}-${params.idempotencyKey.slice(0, 8)}`,
      total,
      currency: params.currency,
    };
    this.completed.set(params.idempotencyKey, structuredClone(success));
    return success;
  }
}
