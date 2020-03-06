const assert = require("assert");
const SourceMap = require("../");

describe("SourceMap - Find", () => {
  it("Should be able to find closest mapping to a generated position", async () => {
    let map = new SourceMap(
      "AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA",
      ["helloworld.coffee"],
      []
    );

    let mapping = map.findClosestMapping(1, 14);
    assert.deepEqual(mapping, {
      generated: { line: 1, column: 14 },
      original: { line: 0, column: 12 },
      source: 0
    });

    mapping = map.findClosestMapping(1, 12);
    assert.deepEqual(mapping, {
      generated: { line: 1, column: 13 },
      original: { line: 0, column: 0 },
      source: 0
    });
  });
});