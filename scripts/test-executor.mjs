/**
 * Executor unit tests with mocked commands (no KAPLAY).
 */
import {
  runProgram,
  stopProgram,
  isProgramRunning,
  MAX_EXECUTED_STEPS,
  DEBUG_EXECUTOR,
} from "../src/blockly/executor.js";

/** @type {import("../src/game/commands.js").commands} */
const realCommands = (await import("../src/game/commands.js")).commands;

/** @type {Array<{ type: string, blockId: string }>} */
const executed = [];

/** @type {import("../src/game/commands.js").commands} */
const mockCommands = {
  async forward() {
    executed.push({ type: "forward", blockId: "mock" });
    return { ok: true };
  },
  async turnLeft() {
    executed.push({ type: "turnLeft", blockId: "mock" });
    return { ok: true };
  },
  async turnRight() {
    executed.push({ type: "turnRight", blockId: "mock" });
    return { ok: true };
  },
  async grab() {
    executed.push({ type: "grab", blockId: "mock" });
    return { ok: true };
  },
  async release() {
    executed.push({ type: "release", blockId: "mock" });
    return { ok: true };
  },
};

/** @param {boolean} cond @param {string} name */
function assert(cond, name) {
  if (!cond) {
    console.error("FAIL:", name);
    process.exitCode = 1;
    return false;
  }
  console.log("OK:", name);
  return true;
}

/** @param {import("../src/game/commands.js").commands} commands */
async function withMockCommands(commands, fn) {
  const mod = await import("../src/game/commands.js");
  const original = { ...mod.commands };
  Object.assign(mod.commands, commands);
  try {
    await fn();
  } finally {
    Object.assign(mod.commands, original);
  }
}

// TEST A — sequential order
await withMockCommands(mockCommands, async () => {
  executed.length = 0;
  const program = {
    version: 1,
    commands: [
      { type: "forward", blockId: "a1" },
      { type: "forward", blockId: "a2" },
      { type: "turnRight", blockId: "a3" },
      { type: "forward", blockId: "a4" },
    ],
  };
  const result = await runProgram(program);
  assert(result.ok === true, "A: completed");
  assert(
    executed.map((e) => e.type).join(",") === "forward,forward,turnRight,forward",
    "A: order",
  );
});

// TEST B — repeat 3 forward
await withMockCommands(mockCommands, async () => {
  executed.length = 0;
  const result = await runProgram({
    version: 1,
    commands: [
      {
        type: "repeat",
        times: 3,
        blockId: "b1",
        commands: [{ type: "forward", blockId: "b2" }],
      },
    ],
  });
  assert(result.ok === true, "B: completed");
  assert(executed.length === 3, "B: three forwards");
});

// TEST C — nested repeat rotations
await withMockCommands(mockCommands, async () => {
  executed.length = 0;
  const result = await runProgram({
    version: 1,
    commands: [
      {
        type: "repeat",
        times: 2,
        blockId: "c1",
        commands: [
          {
            type: "repeat",
            times: 2,
            blockId: "c2",
            commands: [{ type: "turnRight", blockId: "c3" }],
          },
        ],
      },
    ],
  });
  assert(result.ok === true, "C: completed");
  assert(executed.length === 4, "C: four turnRight");
});

// TEST D — collision stops program
await withMockCommands(
  {
    ...mockCommands,
    async forward() {
      executed.push({ type: "forward", blockId: "d" });
      if (executed.length === 3) {
        return {
          ok: false,
          error: { code: "MOVEMENT_BLOCKED", message: "Movimento bloccato." },
        };
      }
      return { ok: true };
    },
  },
  async () => {
    executed.length = 0;
    const result = await runProgram({
      version: 1,
      commands: [
        { type: "forward", blockId: "d1" },
        { type: "forward", blockId: "d2" },
        { type: "forward", blockId: "d3" },
        { type: "turnRight", blockId: "d4" },
      ],
    });
    assert(result.ok === false, "D: failed");
    assert(result.error?.code === "MOVEMENT_BLOCKED", "D: code");
    assert(result.error?.blockId === "d3", "D: blockId");
    assert(executed.length === 3, "D: two ok + blocked third");
  },
);

// TEST E — stop after current command
await withMockCommands(
  {
    ...mockCommands,
    async turnRight() {
      executed.push({ type: "turnRight", blockId: "e" });
      if (executed.length === 2) {
        stopProgram();
      }
      return { ok: true };
    },
  },
  async () => {
    executed.length = 0;
    const result = await runProgram({
      version: 1,
      commands: [
        {
          type: "repeat",
          times: 10,
          blockId: "e1",
          commands: [{ type: "turnRight", blockId: "e2" }],
        },
      ],
    });
    assert(result.ok === false, "E: stopped");
    assert(result.error?.code === "PROGRAM_STOPPED", "E: code");
    assert(executed.length === 2, "E: current finishes, next not started");
  },
);

// TEST F — double run rejected
await withMockCommands(
  {
    ...mockCommands,
    async forward() {
      await new Promise((r) => setTimeout(r, 50));
      return { ok: true };
    },
  },
  async () => {
    const program = {
      version: 1,
      commands: [{ type: "forward", blockId: "f1" }],
    };
    const first = runProgram(program);
    assert(isProgramRunning() === true, "F: running");
    const second = await runProgram(program);
    assert(second.error?.code === "ALREADY_RUNNING", "F: second rejected");
    await first;
    assert(isProgramRunning() === false, "F: idle after finish");
  },
);

// TEST H — grab/release as elemental steps
await withMockCommands(mockCommands, async () => {
  executed.length = 0;
  const result = await runProgram({
    version: 1,
    commands: [
      { type: "grab", blockId: "h1" },
      { type: "forward", blockId: "h2" },
      { type: "release", blockId: "h3" },
    ],
  });
  assert(result.ok === true, "H: completed");
  assert(
    executed.map((e) => e.type).join(",") === "grab,forward,release",
    "H: grab/release steps",
  );
});

// TEST I — terminal success stops program
await withMockCommands(
  {
    ...mockCommands,
    async release() {
      executed.push({ type: "release", blockId: "mock" });
      return { ok: true, terminal: true, event: "MISSION_COMPLETED" };
    },
  },
  async () => {
    executed.length = 0;
    const result = await runProgram({
      version: 1,
      commands: [
        { type: "release", blockId: "i1" },
        { type: "forward", blockId: "i2" },
      ],
    });
    assert(result.ok === true, "I: success");
    assert(result.terminal === true, "I: terminal");
    assert(result.event === "MISSION_COMPLETED", "I: event");
    assert(executed.length === 1, "I: forward not run");
  },
);

// Step limit
await withMockCommands(mockCommands, async () => {
  executed.length = 0;
  const result = await runProgram({
    version: 1,
    commands: [
      {
        type: "repeat",
        times: MAX_EXECUTED_STEPS + 1,
        blockId: "s1",
        commands: [{ type: "forward", blockId: "s2" }],
      },
    ],
  });
  assert(result.ok === false, "step limit: failed");
  assert(result.error?.code === "PROGRAM_TOO_LONG", "step limit: code");
  assert(executed.length === MAX_EXECUTED_STEPS, "step limit: capped");
});

void realCommands;
void DEBUG_EXECUTOR;

if (process.exitCode) {
  console.error("\nSome executor tests failed.");
} else {
  console.log("\nAll executor tests passed.");
}
