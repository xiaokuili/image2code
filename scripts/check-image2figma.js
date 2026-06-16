#!/usr/bin/env node

const fs = require("fs");

const filePath = process.argv[2];
const args = process.argv.slice(3);
const thresholds = {
  FRAME: 0,
  TEXT: 0,
  RECTANGLE: 0,
  IMAGE: 0,
  SVG: 0,
};
let expectedIconsPath = null;
let minimumIconCoverage = 0;
const coveredImportance = new Set(["high", "medium"]);
let expectedIcons = [];

if (!filePath) {
  console.error("Usage: node scripts/check-image2figma.js <file.image2figma.json> [--min-text 25] [--min-frame 8] [--expected-icons icons.json --icon-importance high --min-icon-coverage 0.8]");
  process.exit(1);
}

for (let index = 0; index < args.length; index += 2) {
  const flag = args[index];
  const rawValue = args[index + 1];
  const value = Number(rawValue);

  if (flag === "--expected-icons") {
    expectedIconsPath = rawValue;
  } else if (flag === "--icon-importance") {
    coveredImportance.clear();
    rawValue.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean).forEach((item) => {
      coveredImportance.add(item);
    });
  } else if (flag === "--min-icon-coverage") {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      console.error(`Invalid threshold value for ${flag}`);
      process.exit(1);
    }
    minimumIconCoverage = value;
  } else if (flag === "--min-frame") thresholds.FRAME = value;
  else if (flag === "--min-text") thresholds.TEXT = value;
  else if (flag === "--min-rectangle") thresholds.RECTANGLE = value;
  else if (flag === "--min-image") thresholds.IMAGE = value;
  else if (flag === "--min-svg") thresholds.SVG = value;
  else {
    console.error(`Unknown option: ${flag}`);
    process.exit(1);
  }

  if (flag !== "--expected-icons" && flag !== "--icon-importance" && flag !== "--min-icon-coverage" && !Number.isFinite(value)) {
    console.error(`Invalid threshold value for ${flag}`);
    process.exit(1);
  }
}

let payload;

try {
  payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
} catch (error) {
  console.error(`Failed to read or parse JSON: ${error.message}`);
  process.exit(1);
}

const supportedTypes = new Set(["FRAME", "TEXT", "RECTANGLE", "IMAGE", "SVG"]);
const counts = {
  FRAME: 0,
  TEXT: 0,
  RECTANGLE: 0,
  IMAGE: 0,
  SVG: 0,
  other: 0,
};
const issues = [];
const svgIconNames = [];

if (expectedIconsPath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(expectedIconsPath, "utf8"));
    expectedIcons = Array.isArray(parsed) ? parsed : parsed.icons || [];
    if (!Array.isArray(expectedIcons)) {
      throw new Error("expected icon file must be an array or an object with an icons array");
    }
    expectedIcons = expectedIcons.filter((icon) => {
      if (typeof icon === "string") return true;
      if (!icon.importance) return true;
      return coveredImportance.has(String(icon.importance).toLowerCase());
    });
  } catch (error) {
    console.error(`Failed to read expected icons: ${error.message}`);
    process.exit(1);
  }
}

function checkSize(value, path) {
  if (!value) return;
  if (typeof value.width !== "number" || typeof value.height !== "number") {
    issues.push(`${path}.size must include numeric width and height`);
  }
}

function walk(node, path) {
  if (!node || typeof node !== "object" || Array.isArray(node)) {
    issues.push(`${path} must be an object`);
    return;
  }

  if (!supportedTypes.has(node.type)) {
    counts.other += 1;
    issues.push(`${path}.type is unsupported: ${node.type}`);
  } else {
    counts[node.type] += 1;
  }

  if (!node.name || typeof node.name !== "string") {
    issues.push(`${path}.name is required`);
  }

  checkSize(node.size, path);

  if (node.position) {
    if (typeof node.position.x !== "number" || typeof node.position.y !== "number") {
      issues.push(`${path}.position must include numeric x and y`);
    }
  }

  if (node.type === "TEXT") {
    if (!node.text || typeof node.text.characters !== "string") {
      issues.push(`${path}.text.characters is required for TEXT nodes`);
    }
  }

  if (node.type === "SVG") {
    svgIconNames.push(node.name || "");
    if (typeof node.svg !== "string" || !node.svg.trim()) {
      issues.push(`${path}.svg is required for SVG nodes`);
    }
  }

  const children = node.children || [];
  if (!Array.isArray(children)) {
    issues.push(`${path}.children must be an array when present`);
    return;
  }

  children.forEach((child, index) => {
    walk(child, `${path}.children[${index}]`);
  });
}

if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
  issues.push("Payload must be an object");
}

if (!payload.schema) {
  issues.push("schema is required");
}

if (!payload.page || typeof payload.page !== "object") {
  issues.push("page is required");
}

if (!payload.root || payload.root.type !== "FRAME") {
  issues.push("root FRAME is required");
} else {
  walk(payload.root, "root");
}

Object.entries(thresholds).forEach(([type, minimum]) => {
  if (minimum > 0 && counts[type] < minimum) {
    issues.push(`${type} count is too low: expected >= ${minimum}, got ${counts[type]}`);
  }
});

const normalizedSvgNames = svgIconNames.map((name) => name.toLowerCase());
const iconCoverage = {
  expected: expectedIcons.length,
  matched: 0,
  coverage: expectedIcons.length > 0 ? 0 : null,
  missing: [],
};

if (expectedIcons.length > 0) {
  expectedIcons.forEach((icon) => {
    const terms = Array.isArray(icon.match) ? icon.match : [icon.name || icon];
    const normalizedTerms = terms.map((term) => String(term).toLowerCase());
    const matched = normalizedSvgNames.some((svgName) => normalizedTerms.some((term) => svgName.includes(term)));

    if (matched) {
      iconCoverage.matched += 1;
    } else {
      iconCoverage.missing.push(typeof icon === "string" ? icon : icon.name);
    }
  });

  iconCoverage.coverage = iconCoverage.matched / iconCoverage.expected;

  if (minimumIconCoverage > 0 && iconCoverage.coverage < minimumIconCoverage) {
    issues.push(
      `Icon coverage is too low: expected >= ${minimumIconCoverage}, got ${Number(iconCoverage.coverage.toFixed(3))}`
    );
  }
}

const summary = {
  file: filePath,
  schema: payload && payload.schema,
  page: payload && payload.page && payload.page.name,
  rootSize: payload && payload.root && payload.root.size,
  counts,
  iconCoverage,
  issueCount: issues.length,
  issues: issues.slice(0, 50),
};

console.log(JSON.stringify(summary, null, 2));

if (issues.length > 0) {
  process.exit(1);
}
