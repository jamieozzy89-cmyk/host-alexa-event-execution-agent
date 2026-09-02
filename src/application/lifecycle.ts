import type { EventOperatingSource } from "./event-operating-state.js";

export type CustomerEventStage =
  | "intake"
  | "plan"
  | "shop"
  | "prep"
  | "live"
  | "ready"
  | "hosting"
  | "complete"
  | "cancelled";

/**
 * Maps committed Host state into a customer-facing lifecycle without creating
 * a second authoritative status machine. `hosting` is intentionally reserved
 * for the later time-aware phase; Phase B does not infer it from wall-clock
 * time or persist it into EventStatus.
 */
export function deriveCustomerStage(source: EventOperatingSource | null): CustomerEventStage {
  if (!source) return "intake";

  if (source.event.status === "cancelled") return "cancelled";
  if (source.event.status === "complete") return "complete";

  const activeTasks = source.tasks.filter((task) => task.status !== "cancelled");
  if (activeTasks.length > 0 && activeTasks.every((task) => task.status === "done")) return "ready";

  if (source.event.status === "live") return "live";
  if (!source.selectedMenu) return "plan";

  if (activeTasks.length > 0 || source.event.status === "preparing") return "prep";

  const unresolvedShopping = source.shopping.filter(
    (item) => item.toBuyQuantity > 0 && item.status !== "simulated_purchased",
  );
  if (source.shopping.length === 0 || unresolvedShopping.length > 0 || source.event.status === "sourcing") return "shop";

  return "prep";
}
