import assert from "node:assert/strict";
import test from "node:test";
import {
  DomainError,
  HostDomainEngine,
  StaleRevisionError,
} from "../dist/src/domain/index.js";
import {
  HostPersistenceService,
  JsonStoragePersistenceAdapter,
  MemoryStorage,
  PersistenceError,
} from "../dist/src/persistence/index.js";
import { baseMenu, nutAllergy, vegan, veganAdjustedMenu, vegetarian } from "./fixtures.mjs";

function eventInput(id = "persist-dinner") {
  return {
    id,
    name: "Saturday dinner",
    startAt: "2026-10-10T19:00:00.000Z",
    timezone: "Europe/London",
    guestCount: 6,
    budget: 120,
    currency: "GBP",
    constraints: [vegetarian, nutAllergy],
    preferences: ["limited same-day cooking"],
  };
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

class FailOnceStorage {
  constructor(inner, failKey) {
    this.inner = inner;
    this.failKey = failKey;
    this.failed = false;
  }

  getItem(key) {
    return this.inner.getItem(key);
  }

  setItem(key, value) {
    if (!this.failed && key === this.failKey) {
      this.failed = true;
      throw new Error(`Injected write failure for ${key}`);
    }
    this.inner.setItem(key, value);
  }

  removeItem(key) {
    this.inner.removeItem(key);
  }
}

test("initial committed event survives a fresh service/engine instance", async () => {
  const storage = new MemoryStorage();
  const adapter = new JsonStoragePersistenceAdapter(storage);
  const service = new HostPersistenceService(adapter);
  const engine = await service.create(eventInput("initial-reload"), "2026-09-01T00:00:00.000Z");

  const resumed = await new HostPersistenceService(new JsonStoragePersistenceAdapter(storage)).resume("initial-reload");
  assert.deepEqual(resumed.engine.snapshot(), engine.snapshot());
  assert.equal(resumed.persistence.source, "primary");
  assert.equal(resumed.persistence.recovered, false);
  assert.equal(resumed.engine.snapshot().event.revision, 1);
});

test("complete committed Host state survives restart/reload and can continue safely", async () => {
  const storage = new MemoryStorage();
  const adapter = new JsonStoragePersistenceAdapter(storage);
  const service = new HostPersistenceService(adapter);
  const engine = await service.create(eventInput("full-reload"), "2026-09-01T00:01:00.000Z");

  let state = engine.commitMenu(baseMenu, 1, "2026-09-01T03:42:00.000Z");
  state = engine.recordInventory(
    [
      { itemId: "pasta", name: "Pasta", quantity: 200, unit: "g", confirmedAt: "2026-09-01T03:43:00.000Z", source: "user" },
      { itemId: "lettuce", name: "Lettuce", quantity: 1, unit: "each", confirmedAt: "2026-09-01T03:43:00.000Z", source: "user" },
    ],
    state.event.revision,
  );
  state = engine.calculateShoppingPlan(state.event.revision);
  state = engine.buildPreparationPlan(state.event.revision);
  state = engine.markTaskComplete("prep-salad", state.event.revision, "2026-10-10T17:45:00.000Z");
  const impact = engine.analyseChangeImpact(
    { guestCount: 7, addConstraints: [vegan], replacementMenu: veganAdjustedMenu },
    state.event.revision,
    "2026-10-10T17:50:00.000Z",
  );
  state = engine.applyConfirmedChange(impact, "2026-10-10T17:51:00.000Z");
  await service.checkpoint(engine, "2026-10-10T17:52:00.000Z");

  const expected = engine.snapshot();
  const resumed = await new HostPersistenceService(new JsonStoragePersistenceAdapter(storage)).resume("full-reload");
  const actual = resumed.engine.snapshot();

  assert.deepEqual(actual, expected);
  assert.deepEqual(actual.event, expected.event);
  assert.deepEqual(actual.tasks, expected.tasks);
  assert.deepEqual(actual.receipts, expected.receipts);
  assert.deepEqual(actual.audit, expected.audit);
  assert.deepEqual(actual.shopping, expected.shopping);
  assert.deepEqual(actual.inventory, expected.inventory);
  assert.deepEqual(actual.menus, expected.menus);

  assert.throws(() => resumed.engine.markTaskComplete("boil-pasta", actual.event.revision - 1), (error) => {
    assert.ok(error instanceof StaleRevisionError);
    return true;
  });
  const next = resumed.engine.getNextAction();
  assert.ok(next, "resumed engine must still expose a ready next action");
  const continued = resumed.engine.markTaskComplete(next.id, actual.event.revision, "2026-10-10T18:20:00.000Z");
  assert.equal(continued.tasks[next.id]?.status, "done");
  assert.equal(continued.event.revision, expected.event.revision + 1);
});

test("uncommitted change impact is intentionally not persisted across restart", async () => {
  const storage = new MemoryStorage();
  const adapter = new JsonStoragePersistenceAdapter(storage);
  const service = new HostPersistenceService(adapter);
  const engine = await service.create(eventInput("pending-impact"));
  let state = engine.commitMenu(baseMenu, 1, "2026-09-01T03:42:00.000Z");
  state = engine.buildPreparationPlan(state.event.revision);
  const impact = engine.analyseChangeImpact(
    { guestCount: 7, addConstraints: [vegan], replacementMenu: veganAdjustedMenu },
    state.event.revision,
  );
  await service.checkpoint(engine);

  const resumed = await service.resume("pending-impact");
  assert.throws(() => resumed.engine.applyConfirmedChange(impact, "2026-09-01T03:50:00.000Z"), (error) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, "UNKNOWN_CHANGE_IMPACT");
    return true;
  });

  const refreshed = resumed.engine.analyseChangeImpact(
    { guestCount: 7, addConstraints: [vegan], replacementMenu: veganAdjustedMenu },
    resumed.engine.snapshot().event.revision,
  );
  const applied = resumed.engine.applyConfirmedChange(refreshed, "2026-09-01T03:51:00.000Z");
  assert.equal(applied.event.guestCount, 7);
});

test("corrupt primary snapshot falls back to the last verified backup", async () => {
  const storage = new MemoryStorage();
  const adapter = new JsonStoragePersistenceAdapter(storage);
  const service = new HostPersistenceService(adapter);
  const engine = await service.create(eventInput("backup-recovery"), "2026-09-01T00:00:00.000Z");
  const revisionOne = engine.snapshot();
  engine.commitMenu(baseMenu, 1, "2026-09-01T03:42:00.000Z");
  await service.checkpoint(engine, "2026-09-01T03:43:00.000Z");

  storage.setItem(adapter.keyFor("backup-recovery"), "{broken-json");
  const loaded = await adapter.load("backup-recovery");
  assert.ok(loaded);
  assert.equal(loaded.source, "backup");
  assert.equal(loaded.recovered, true);
  assert.deepEqual(loaded.state, revisionOne);
});

test("checksum tampering is rejected when no recovery snapshot exists", async () => {
  const storage = new MemoryStorage();
  const adapter = new JsonStoragePersistenceAdapter(storage);
  const service = new HostPersistenceService(adapter);
  await service.create(eventInput("tamper-check"));

  const key = adapter.keyFor("tamper-check");
  const envelope = JSON.parse(storage.getItem(key));
  envelope.state.event.guestCount = 999;
  storage.setItem(key, JSON.stringify(envelope));

  await assert.rejects(adapter.load("tamper-check"), (error) => {
    assert.ok(error instanceof PersistenceError);
    assert.equal(error.code, "SNAPSHOT_UNRECOVERABLE");
    assert.match(error.message, /SHA-256 integrity verification/);
    return true;
  });
});

test("unsupported snapshot schema is rejected rather than guessed", async () => {
  const storage = new MemoryStorage();
  const adapter = new JsonStoragePersistenceAdapter(storage);
  const service = new HostPersistenceService(adapter);
  await service.create(eventInput("schema-check"));

  const key = adapter.keyFor("schema-check");
  const envelope = JSON.parse(storage.getItem(key));
  envelope.schemaVersion = 99;
  storage.setItem(key, JSON.stringify(envelope));

  await assert.rejects(adapter.load("schema-check"), (error) => {
    assert.ok(error instanceof PersistenceError);
    assert.equal(error.code, "SNAPSHOT_UNRECOVERABLE");
    assert.match(error.message, /Unsupported persistence schema version/);
    return true;
  });
});

test("domain-invalid state is rejected before it can be saved", async () => {
  const storage = new MemoryStorage();
  const adapter = new JsonStoragePersistenceAdapter(storage);
  const engine = new HostDomainEngine(eventInput("invalid-save"));
  const invalid = engine.snapshot();
  invalid.event.revision = 50;

  await assert.rejects(adapter.save(invalid), (error) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, "INVALID_PERSISTED_STATE");
    return true;
  });
  assert.equal(storage.getItem(adapter.keyFor("invalid-save")), null);
});

test("interrupted update leaves the previous verified primary snapshot loadable", async () => {
  const backing = new MemoryStorage();
  const stableAdapter = new JsonStoragePersistenceAdapter(backing);
  const stableService = new HostPersistenceService(stableAdapter);
  const engine = await stableService.create(eventInput("interrupted-update"));
  const previous = engine.snapshot();
  engine.commitMenu(baseMenu, 1, "2026-09-01T03:42:00.000Z");

  const primaryKey = stableAdapter.keyFor("interrupted-update");
  const failingStorage = new FailOnceStorage(backing, primaryKey);
  const failingAdapter = new JsonStoragePersistenceAdapter(failingStorage);
  await assert.rejects(failingAdapter.save(engine.snapshot()), (error) => {
    assert.ok(error instanceof PersistenceError);
    assert.equal(error.code, "SNAPSHOT_SAVE_FAILED");
    return true;
  });

  const loaded = await stableAdapter.load("interrupted-update");
  assert.ok(loaded);
  assert.equal(loaded.source, "primary");
  assert.deepEqual(loaded.state, previous);
});

test("interrupted first save can recover its verified temporary snapshot", async () => {
  const backing = new MemoryStorage();
  const stableAdapter = new JsonStoragePersistenceAdapter(backing);
  const primaryKey = stableAdapter.keyFor("first-save-interruption");
  const failingStorage = new FailOnceStorage(backing, primaryKey);
  const failingAdapter = new JsonStoragePersistenceAdapter(failingStorage);
  const engine = new HostDomainEngine(eventInput("first-save-interruption"));

  await assert.rejects(failingAdapter.save(engine.snapshot()), (error) => {
    assert.ok(error instanceof PersistenceError);
    assert.equal(error.code, "SNAPSHOT_SAVE_FAILED");
    return true;
  });

  const loaded = await stableAdapter.load("first-save-interruption");
  assert.ok(loaded);
  assert.equal(loaded.source, "temporary");
  assert.equal(loaded.recovered, true);
  assert.deepEqual(loaded.state, engine.snapshot());
});

test("domain-invalid but checksum-valid stored snapshot is rejected on restore", async () => {
  const storage = new MemoryStorage();
  const adapter = new JsonStoragePersistenceAdapter(storage);
  const service = new HostPersistenceService(adapter);
  const engine = await service.create(eventInput("domain-tamper"));
  engine.commitMenu(baseMenu, 1, "2026-09-01T03:42:00.000Z");
  await service.checkpoint(engine);

  const primaryKey = adapter.keyFor("domain-tamper");
  const backupKey = adapter.keyFor("domain-tamper", "backup");
  storage.removeItem(backupKey);
  const envelope = JSON.parse(storage.getItem(primaryKey));
  envelope.state.event.revision = 99;
  envelope.stateSha256 = await sha256(JSON.stringify(envelope.state));
  storage.setItem(primaryKey, JSON.stringify(envelope));

  await assert.rejects(adapter.load("domain-tamper"), (error) => {
    assert.ok(error instanceof PersistenceError);
    assert.equal(error.code, "SNAPSHOT_UNRECOVERABLE");
    assert.match(error.message, /domain-state validation/);
    return true;
  });
});

test("remove clears primary, backup and temporary snapshots", async () => {
  const storage = new MemoryStorage();
  const adapter = new JsonStoragePersistenceAdapter(storage);
  const service = new HostPersistenceService(adapter);
  const engine = await service.create(eventInput("remove-check"));
  engine.commitMenu(baseMenu, 1, "2026-09-01T03:42:00.000Z");
  await service.checkpoint(engine);
  assert.ok(storage.keys().some((key) => key.includes("remove-check")));

  await service.remove("remove-check");
  assert.equal(storage.keys().some((key) => key.includes("remove-check")), false);
  await assert.rejects(service.resume("remove-check"), (error) => {
    assert.ok(error instanceof PersistenceError);
    assert.equal(error.code, "SNAPSHOT_NOT_FOUND");
    return true;
  });
});

test("backup write failure aborts update and preserves the previous primary", async () => {
  const backing = new MemoryStorage();
  const stableAdapter = new JsonStoragePersistenceAdapter(backing);
  const stableService = new HostPersistenceService(stableAdapter);
  const engine = await stableService.create(eventInput("backup-write-failure"));
  const previous = engine.snapshot();
  engine.commitMenu(baseMenu, 1, "2026-09-01T03:42:00.000Z");

  const backupKey = stableAdapter.keyFor("backup-write-failure", "backup");
  const failingStorage = new FailOnceStorage(backing, backupKey);
  const failingAdapter = new JsonStoragePersistenceAdapter(failingStorage);
  await assert.rejects(failingAdapter.save(engine.snapshot()), (error) => {
    assert.ok(error instanceof PersistenceError);
    assert.equal(error.code, "SNAPSHOT_SAVE_FAILED");
    return true;
  });

  const loaded = await stableAdapter.load("backup-write-failure");
  assert.ok(loaded);
  assert.equal(loaded.source, "primary");
  assert.deepEqual(loaded.state, previous);
});
