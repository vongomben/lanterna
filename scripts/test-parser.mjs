/**
 * Parser unit tests (mock Blockly chains — no DOM).
 */
import {
  parseBlockChain,
  parseWorkspace,
  buildMockChain,
} from "../src/blockly/parser.js";

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

// TEST A — AVANTI
{
  const chain = buildMockChain([{ id: "a1", type: "lanterna_forward" }]);
  const result = parseBlockChain(chain);
  assert(result.ok === true, "A: ok");
  if (result.ok) {
    assert(result.commands.length === 1, "A: one command");
    assert(result.commands[0].type === "forward", "A: forward");
    assert(result.commands[0].blockId === "a1", "A: blockId");
  }
}

// TEST B — order preserved
{
  const chain = buildMockChain([
    { id: "b1", type: "lanterna_forward" },
    { id: "b2", type: "lanterna_turn_right" },
    { id: "b3", type: "lanterna_forward" },
  ]);
  const result = parseBlockChain(chain);
  if (result.ok) {
    assert(
      result.commands.map((c) => c.type).join(",") === "forward,turnRight,forward",
      "B: order",
    );
  }
}

// TEST C — RIPETI 3 AVANTI
{
  const chain = buildMockChain([
    {
      id: "c1",
      type: "lanterna_repeat",
      times: 3,
      inner: [{ id: "c2", type: "lanterna_forward" }],
    },
  ]);
  const result = parseBlockChain(chain);
  if (result.ok) {
    const rep = result.commands[0];
    assert(rep.type === "repeat", "C: repeat");
    assert(rep.times === 3, "C: times");
    assert(rep.commands.length === 1 && rep.commands[0].type === "forward", "C: inner");
  }
}

// TEST D — nested repeat
{
  const chain = buildMockChain([
    {
      id: "d1",
      type: "lanterna_repeat",
      times: 2,
      inner: [
        {
          id: "d2",
          type: "lanterna_repeat",
          times: 3,
          inner: [{ id: "d3", type: "lanterna_forward" }],
        },
      ],
    },
  ]);
  const result = parseBlockChain(chain);
  if (result.ok) {
    const outer = result.commands[0];
    assert(outer.type === "repeat" && outer.times === 2, "D: outer");
    const inner = outer.commands[0];
    assert(inner.type === "repeat" && inner.times === 3, "D: inner repeat");
    assert(inner.commands[0].type === "forward", "D: inner forward");
  }
}

// TEST E — grab, forward, release
{
  const chain = buildMockChain([
    { id: "e1", type: "lanterna_grab" },
    { id: "e2", type: "lanterna_forward" },
    { id: "e3", type: "lanterna_release" },
  ]);
  const result = parseBlockChain(chain);
  if (result.ok) {
    assert(
      result.commands.map((c) => c.type).join(",") === "grab,forward,release",
      "E: types",
    );
  }
}

// TEST F — multiple top stacks (mock workspace)
{
  const ws = {
    getTopBlocks: () => [
      buildMockChain([{ id: "f1", type: "lanterna_forward" }]),
      buildMockChain([{ id: "f2", type: "lanterna_turn_right" }]),
    ],
  };
  const result = parseWorkspace(/** @type {import("blockly").Workspace} */ (ws));
  assert(result.ok === false, "F: not ok");
  if (!result.ok) {
    assert(result.error.code === "MULTIPLE_TOP_LEVEL_STACKS", "F: code");
  }
}

// TEST G — empty workspace
{
  const ws = { getTopBlocks: () => [] };
  const result = parseWorkspace(/** @type {import("blockly").Workspace} */ (ws));
  assert(result.ok === false, "G: not ok");
  if (!result.ok) {
    assert(result.error.code === "EMPTY_PROGRAM", "G: code");
  }
}

// Unsupported block
{
  const chain = buildMockChain([{ id: "x1", type: "unknown_block" }]);
  const result = parseBlockChain(chain);
  assert(result.ok === false, "unsupported: not ok");
  if (!result.ok) {
    assert(result.error.code === "UNSUPPORTED_BLOCK", "unsupported: code");
  }
}

// Empty repeat body
{
  const chain = buildMockChain([
    { id: "r1", type: "lanterna_repeat", times: 2, inner: [] },
  ]);
  const result = parseBlockChain(chain);
  if (result.ok) {
    assert(result.commands[0].commands.length === 0, "empty repeat body");
  }
}

// Starter program — grab + release only
{
  const chain = buildMockChain([
    { id: "starter_grab", type: "lanterna_grab" },
    { id: "starter_release", type: "lanterna_release" },
  ]);
  const result = parseBlockChain(chain);
  if (result.ok) {
    assert(result.commands.length === 2, "starter: two commands");
    assert(
      result.commands.map((c) => c.type).join(",") === "grab,release",
      "starter: grab,release",
    );
  }
}

if (process.exitCode) {
  console.error("\nSome parser tests failed.");
} else {
  console.log("\nAll parser tests passed.");
}
