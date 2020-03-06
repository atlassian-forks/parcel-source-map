const ParcelSourceMap = require("./parcel-source-map").default;
const Benchmark = require("tiny-benchy");
const assert = require("assert");
const SourceMap = require("../");

const ITERATIONS = 10;

const test_maps = [
  {
    version: 3,
    file: "helloworld.js",
    sources: ["helloworld.coffee"],
    names: [],
    mappings: "AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA"
  },
  require("./maps/angular")
];
const suite = new Benchmark(ITERATIONS);

let mappings = new Array(10000).fill("").map((item, index) => {
  return {
    source: "index.js",
    name: "A",
    original: {
      line: index,
      column: 0 + 10 * index
    },
    generated: {
      line: 1,
      column: 15 + 10 * index
    }
  };
});

let sourcemapBuffer = new SourceMap(mappings).toBuffer();
let parcelSourceMap = new ParcelSourceMap(mappings).serialize();
let jsonStringParcelSourceMap = JSON.stringify(new ParcelSourceMap(mappings).serialize());

suite.add("@parcel/source-map#consume", async () => {
  for (let testMap of test_maps) {
    await ParcelSourceMap.fromRawSourceMap(testMap);
  }
});

suite.add("@parcel/source-map#consume->serialize->JSON.stringify", async () => {
  for (let testMap of test_maps) {
    let map = await ParcelSourceMap.fromRawSourceMap(testMap);
    JSON.stringify(map.serialize());
  }
});

suite.add(
  "@parcel/source-map#consume->serialize->JSON.stringify->JSON.parse->new SourceMap",
  async () => {
    for (let testMap of test_maps) {
      let map = await ParcelSourceMap.fromRawSourceMap(testMap);
      let parsed = JSON.parse(JSON.stringify(map.serialize()));
      map = new ParcelSourceMap(parsed);
    }
  }
);

suite.add("@parcel/source-map#combine 1000 maps", async () => {
  let map = new ParcelSourceMap([...mappings]);
  for (let i = 0; i < 1000; i++) {
    map.addMap(ParcelSourceMap.deserialize(parcelSourceMap), i * 4);
  }
});

suite.add("@parcel/source-map#combine 1000 maps from JSON", async () => {
  let map = new ParcelSourceMap([...mappings]);
  for (let i = 0; i < 1000; i++) {
    map.addMap(ParcelSourceMap.deserialize(JSON.parse(jsonStringParcelSourceMap)), i * 4);
  }
});

suite.add("cpp#consume", async () => {
  for (let testMap of test_maps) {
    let map = new SourceMap(testMap.mappings, testMap.sources, testMap.names);
  }
});

suite.add("cpp#consume->stringify", async () => {
  for (let testMap of test_maps) {
    let map = new SourceMap(testMap.mappings, testMap.sources, testMap.names);
    await map.stringify({
      file: "index.js.map",
      sourceRoot: "/"
    })
  }
});

suite.add("cpp#consume->toBuffer", async () => {
  for (let testMap of test_maps) {
    let map = new SourceMap(testMap.mappings, testMap.sources, testMap.names);
    let buff = map.toBuffer();
  }
});

suite.add("cpp#consume->toBuffer->fromBuffer", async () => {
  for (let testMap of test_maps) {
    let map = new SourceMap(testMap.mappings, testMap.sources, testMap.names);
    let buff = map.toBuffer();
    map = new SourceMap(buff);
  }
});

suite.add("cpp#combine 1000 maps", async () => {
  let map = new SourceMap(sourcemapBuffer);
  for (let i = 0; i < 1000; i++) {
    map.addBufferMappings(sourcemapBuffer, i * 4);
  }
});

suite.add("cpp#combine 1000 maps->toBuffer", async () => {
  let map = new SourceMap(sourcemapBuffer);
  for (let i = 0; i < 1000; i++) {
    map.addBufferMappings(sourcemapBuffer, i * 4);
  }
  map.toBuffer();
});

suite.add("cpp#combine 1000 maps->stringify", async () => {
  let map = new SourceMap(sourcemapBuffer);
  for (let i = 0; i < 1000; i++) {
    map.addBufferMappings(sourcemapBuffer, i * 4);
  }
  await map.stringify({
    file: "index.js.map",
    sourceRoot: "/"
  })
});

suite.run();
