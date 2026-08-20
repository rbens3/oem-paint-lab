#!/usr/bin/env python3
"""Generate the static OEM Paint Lab archive from the canonical XLSX workbook."""

from __future__ import annotations

import argparse
import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_WORKBOOK = REPO_ROOT / "data/source/Car_Paint_Colors_v4.xlsx"
DEFAULT_OUTPUT = REPO_ROOT / "src/data/paints.generated.json"

MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"

COLLECTIONS = {"OEM": "oem", "Motorsport": "motorsport", "Other": "other"}
SERIES = {"F1": "f1", "Heritage": "heritage"}
ROLES = {"Primary": "primary", "Secondary": "secondary"}
EFFECTS = {
    "Solid": "solid",
    "Metallic": "metallic",
    "Pearl": "pearl",
    "Multi-layer": "multi-layer",
}
SHEENS = {"Gloss": "gloss", "Satin": "satin", "Matte": "matte"}
STATUSES = {"Reference": "reference", "Estimated": "estimated"}
SOURCE_TYPES = {
    "Dealer catalogue": "dealer-catalogue",
    "Digital color reference": "digital-color-reference",
    "Heritage reference": "heritage-reference",
    "In-game swatch": "in-game-swatch",
    "Manufacturer / OEM": "manufacturer-oem",
    "Mixed reference": "mixed-reference",
    "Motorsport reference": "motorsport-reference",
    "Paint database": "paint-database",
    "Press / launch material": "press-launch-material",
    "Specialist paint reference": "specialist-paint-reference",
    "Unspecified": "unspecified",
    "User supplied": "user-supplied",
}


def column_index(reference: str) -> int:
    letters = re.match(r"[A-Z]+", reference)
    if not letters:
        raise ValueError(f"Invalid cell reference: {reference}")
    value = 0
    for letter in letters.group(0):
        value = value * 26 + ord(letter) - ord("A") + 1
    return value - 1


def shared_strings(archive: zipfile.ZipFile) -> list[str]:
    try:
        root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    except KeyError:
        return []
    return [
        "".join(node.text or "" for node in item.findall(f".//{{{MAIN_NS}}}t"))
        for item in root.findall(f"{{{MAIN_NS}}}si")
    ]


def sheet_path(archive: zipfile.ZipFile, sheet_name: str) -> str:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    relations = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    targets = {
        relation.attrib["Id"]: relation.attrib["Target"]
        for relation in relations.findall(f"{{{PKG_REL_NS}}}Relationship")
    }
    for sheet in workbook.findall(f".//{{{MAIN_NS}}}sheet"):
        if sheet.attrib.get("name") == sheet_name:
            relation_id = sheet.attrib[f"{{{REL_NS}}}id"]
            target = targets[relation_id].lstrip("/")
            return target if target.startswith("xl/") else f"xl/{target}"
    raise ValueError(f"Workbook has no {sheet_name!r} sheet")


def cell_value(cell: ET.Element, strings: list[str]):
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        return "".join(
            node.text or "" for node in cell.findall(f".//{{{MAIN_NS}}}t")
        )
    value_node = cell.find(f"{{{MAIN_NS}}}v")
    if value_node is None or value_node.text is None:
        return None
    raw = value_node.text
    if cell_type == "s":
        return strings[int(raw)]
    if cell_type in {"str", "e"}:
        return raw
    number = float(raw)
    return int(number) if number.is_integer() else number


def read_sheet(workbook_path: Path, sheet_name: str) -> list[list[object | None]]:
    with zipfile.ZipFile(workbook_path) as archive:
        strings = shared_strings(archive)
        root = ET.fromstring(archive.read(sheet_path(archive, sheet_name)))
        rows: list[list[object | None]] = []
        for row in root.findall(f".//{{{MAIN_NS}}}row"):
            values: list[object | None] = []
            for cell in row.findall(f"{{{MAIN_NS}}}c"):
                index = column_index(cell.attrib["r"])
                values.extend([None] * (index - len(values) + 1))
                values[index] = cell_value(cell, strings)
            rows.append(values)
        return rows


def color_family(hex_value: str) -> str:
    red, green, blue = (
        int(hex_value[index : index + 2], 16) / 255 for index in (1, 3, 5)
    )
    maximum = max(red, green, blue)
    minimum = min(red, green, blue)
    delta = maximum - minimum
    saturation = 0 if maximum == 0 else delta / maximum

    if maximum <= 0.18:
        return "black"
    if saturation <= 0.1:
        return "white" if maximum >= 0.86 else "grey"

    if maximum == red:
        hue = 60 * (((green - blue) / delta) % 6)
    elif maximum == green:
        hue = 60 * ((blue - red) / delta + 2)
    else:
        hue = 60 * ((red - green) / delta + 4)
    if hue < 0:
        hue += 360

    if 15 <= hue < 50 and maximum < 0.82 and saturation < 0.65:
        return "brown"
    if hue < 18 or hue >= 345:
        return "red"
    if hue < 47:
        return "orange"
    if hue < 70:
        return "yellow"
    if hue < 180:
        return "green"
    if hue < 255:
        return "blue"
    if hue < 295:
        return "purple"
    if hue < 345:
        return "pink"
    return "other"


def optional_text(value: object | None) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def required_mapping(mapping: dict[str, str], value: object, field: str) -> str:
    key = str(value)
    try:
        return mapping[key]
    except KeyError as error:
        raise ValueError(f"Unsupported {field}: {key!r}") from error


def optional_mapping(
    mapping: dict[str, str], value: object | None, field: str
) -> str | None:
    text = optional_text(value)
    return None if text is None else required_mapping(mapping, text, field)


def normalize_records(rows: list[list[object | None]]) -> list[dict[str, object]]:
    if len(rows) < 3:
        raise ValueError("All Colors sheet does not contain archive rows")
    headers = [str(value) if value is not None else "" for value in rows[1]]
    expected_headers = [
        "Record ID", "Collection", "Manufacturer", "Series", "Season", "Team",
        "Role", "Paint Name", "Paint Code", "HEX", "Source Name", "Source Type",
        "Source URL", "Effect", "Sheen", "Derivation Note", "Status",
    ]
    if headers[: len(expected_headers)] != expected_headers:
        raise ValueError("All Colors headers do not match the expected schema")

    records: list[dict[str, object]] = []
    for values in rows[2:]:
        if not values or values[0] is None:
            continue
        padded = values + [None] * (len(expected_headers) - len(values))
        row = dict(zip(expected_headers, padded))
        hex_value = str(row["HEX"]).upper()
        collection = required_mapping(COLLECTIONS, row["Collection"], "collection")
        manufacturer = optional_text(row["Manufacturer"])
        series = optional_mapping(SERIES, row["Series"], "series")
        season = int(row["Season"]) if row["Season"] is not None else None
        team = optional_text(row["Team"])
        role = optional_mapping(ROLES, row["Role"], "role")
        name = str(row["Paint Name"]).strip()
        paint_code = optional_text(row["Paint Code"])
        source_name = optional_text(row["Source Name"])
        source_type = required_mapping(SOURCE_TYPES, row["Source Type"], "source type")
        source_url = optional_text(row["Source URL"])
        effect = optional_mapping(EFFECTS, row["Effect"], "effect")
        sheen = optional_mapping(SHEENS, row["Sheen"], "sheen")
        derivation_note = optional_text(row["Derivation Note"])
        confidence = required_mapping(STATUSES, row["Status"], "status")

        tag_values = [
            collection, manufacturer, series, str(season) if season is not None else None,
            team, role, name, paint_code, hex_value, source_name,
            str(row["Source Type"]), effect, sheen, confidence,
        ]
        tags = list(dict.fromkeys(value.lower() for value in tag_values if value))
        records.append({
            "id": int(row["Record ID"]), "collection": collection,
            "manufacturer": manufacturer, "series": series, "season": season,
            "team": team, "role": role, "name": name, "paintCode": paint_code,
            "hex": hex_value, "sourceName": source_name, "sourceType": source_type,
            "sourceUrl": source_url, "effect": effect, "sheen": sheen,
            "derivationNote": derivation_note, "confidence": confidence,
            "colorFamily": color_family(hex_value), "tags": tags,
        })
    return records


def validate(records: list[dict[str, object]]) -> None:
    ids = [record["id"] for record in records]
    if len(records) != 303 or len(set(ids)) != 303:
        raise ValueError("Expected exactly 303 records with 303 unique IDs")
    if any(identifier in ids for identifier in range(48, 58)):
        raise ValueError("Retired IDs 48–57 must be absent")
    if any(not re.fullmatch(r"#[0-9A-F]{6}", str(record["hex"])) for record in records):
        raise ValueError("Every HEX value must be canonical #RRGGBB")
    status_counts = {
        status: sum(record["confidence"] == status for record in records)
        for status in ("reference", "estimated")
    }
    if status_counts != {"reference": 200, "estimated": 103}:
        raise ValueError(f"Unexpected provenance counts: {status_counts}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("workbook", nargs="?", type=Path, default=DEFAULT_WORKBOOK)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    records = normalize_records(read_sheet(args.workbook, "All Colors"))
    validate(records)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n")
    print(f"Generated {len(records)} paint records at {args.output}")


if __name__ == "__main__":
    main()
