import { readFileSync } from "node:fs";

const records = JSON.parse(
  readFileSync(new URL("../src/data/paints.generated.json", import.meta.url), "utf8"),
);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const countBy = (field) =>
  Object.fromEntries(
    [...new Set(records.map((record) => record[field]))].map((value) => [
      value,
      records.filter((record) => record[field] === value).length,
    ]),
  );

const ids = records.map((record) => record.id);
const expectedIds = [
  ...Array.from({ length: 47 }, (_, index) => index + 1),
  ...Array.from({ length: 256 }, (_, index) => index + 58),
];
assert(records.length === 303, `Expected 303 records; found ${records.length}`);
assert(new Set(ids).size === 303, "Record IDs must be unique");
const idSet = new Set(ids);
assert(expectedIds.every((id) => idSet.has(id)), "Archive IDs must preserve the complete 1–47 and 58–313 set");
assert(!ids.some((id) => id >= 48 && id <= 57), "Retired IDs 48–57 must remain absent");
assert(records.every((record) => /^#[0-9A-F]{6}$/.test(record.hex)), "Every HEX value must use canonical uppercase #RRGGBB syntax");
const provenanceCounts = countBy("confidence");
assert(provenanceCounts.reference === 200 && provenanceCounts.estimated === 103, "Provenance totals must be 200 Reference and 103 Estimated");
const collectionCounts = countBy("collection");
assert(collectionCounts.oem === 264 && collectionCounts.motorsport === 38 && collectionCounts.other === 1, "Collection totals must be 264 OEM, 38 Motorsport, and 1 Other");

const brilliantBlue = records.filter((record) => record.manufacturer === "Mercedes-Benz" && record.name === "Brilliant Blue Metallic");
assert(brilliantBlue.length === 2, "Expected two Mercedes-Benz Brilliant Blue records");
assert(brilliantBlue.some((record) => record.paintCode === "368") && brilliantBlue.some((record) => record.paintCode === "362"), "Mercedes-Benz Brilliant Blue records must retain codes 368 and 362");

const astonMartinRacingGreen = records.filter((record) => record.manufacturer === "Aston Martin" && record.name === "Aston Martin Racing Green");
assert(astonMartinRacingGreen.length === 1 && astonMartinRacingGreen[0].hex === "#1C3D2C", "Aston Martin Racing Green must occur once at #1C3D2C");

const bluChina = records.find((record) => record.manufacturer === "Ferrari" && record.name === "Blu China");
assert(bluChina?.hex === "#1B3D7A" && bluChina.confidence === "estimated", "Ferrari Blu China must remain the estimated #1B3D7A record");
assert(bluChina?.derivationNote, "Ferrari Blu China must retain its derivation note");

const hethelYellow = records.find((record) => record.name === "Hethel Yellow (Heritage)");
assert(hethelYellow?.manufacturer === "Lotus" && hethelYellow.confidence === "estimated" && hethelYellow.derivationNote, "Lotus Hethel Yellow must retain its estimated status and derivation note");

for (const name of ["JPS Black", "JPS Gold"]) {
  const matches = records.filter((record) => record.name.startsWith(name));
  assert(matches.length === 1 && matches[0].collection === "motorsport" && matches[0].series === "heritage", `${name} must exist only in Motorsport Heritage`);
}

assert(!records.some((record) => record.manufacturer === "Alfa Romeo" && /logo|badge/i.test(record.name)), "No Alfa Romeo logo or badge record should be active");
assert(!records.some((record) => record.series === "f1" && record.season !== 2026), "All active F1 records must be from the 2026 season");
assert(records.filter((record) => record.series === "f1").length === 22, "Expected 22 2026 F1 records");
assert(records.filter((record) => record.series === "heritage").length === 16, "Expected 16 Motorsport Heritage records");
assert(records.every((record) => record.collection !== "oem" || record.manufacturer), "Every OEM record must retain its manufacturer");
assert(records.every((record) => record.collection !== "motorsport" || !record.manufacturer), "Motorsport records must not invent a manufacturer");
assert(records.every((record) => !record.sourceUrl || /^https?:\/\//.test(record.sourceUrl)), "Source URLs must be blank or use http/https");

const requiredFields = [
  "id", "collection", "manufacturer", "series", "season", "team", "role",
  "name", "paintCode", "hex", "sourceName", "sourceType", "sourceUrl",
  "effect", "sheen", "derivationNote", "confidence", "colorFamily", "tags",
];
assert(records.every((record) => requiredFields.every((field) => Object.hasOwn(record, field))), "Every generated record must preserve the complete archive schema");

const duplicateKeys = new Set();
for (const record of records) {
  const key = [record.collection, record.manufacturer, record.series, record.season, record.team, record.role, record.name, record.paintCode].join("|");
  assert(!duplicateKeys.has(key), `Duplicate archive identity: ${key}`);
  duplicateKeys.add(key);
}

console.log("Paint archive validation passed");
console.log(`Records: ${records.length} · Unique IDs: ${new Set(ids).size}`);
console.log("Collections: 264 OEM · 38 Motorsport · 1 Other");
console.log("Provenance: 200 Reference · 103 Estimated");
