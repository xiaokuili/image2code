figma.showUI(__html__, { width: 360, height: 240 });

const SUPPORTED_NODE_TYPES = {
  FRAME: true,
  TEXT: true,
  RECTANGLE: true,
  IMAGE: true,
  SVG: true,
};

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function assertPayload(payload) {
  assertObject(payload, "Payload");

  const root = getRootNode(payload);
  if (!root) {
    throw new Error("JSON must include a root FRAME node");
  }

  if (root.type !== "FRAME") {
    throw new Error("root.type must be FRAME");
  }
}

function getRootNode(payload) {
  if (payload && payload.root) {
    return payload.root;
  }

  if (payload && payload.type === "FRAME") {
    return payload;
  }

  return null;
}

function getPageInfo(payload) {
  if (payload && payload.page) {
    return payload.page;
  }

  return {
    name: (payload && payload.name) || "Image2Figma Import",
  };
}

function normalizeColor(color, fallback = { r: 0, g: 0, b: 0 }) {
  return {
    r: color && typeof color.r === "number" ? color.r : fallback.r,
    g: color && typeof color.g === "number" ? color.g : fallback.g,
    b: color && typeof color.b === "number" ? color.b : fallback.b,
  };
}

function normalizePaint(paint) {
  return {
    type: "SOLID",
    visible: paint.visible !== false,
    opacity: typeof paint.opacity === "number" ? paint.opacity : 1,
    color: normalizeColor(paint.color),
  };
}

function normalizeEffect(effect) {
  const color = normalizeColor(effect.color);

  return {
    type: effect.type || "DROP_SHADOW",
    visible: effect.visible !== false,
    blendMode: effect.blendMode || "NORMAL",
    offset: effect.offset || { x: 0, y: 4 },
    radius: typeof effect.radius === "number" ? effect.radius : 12,
    color: {
      r: color.r,
      g: color.g,
      b: color.b,
      a: effect.color && typeof effect.color.a === "number" ? effect.color.a : 0.2,
    },
  };
}

function fontStyleFromWeight(fontWeight) {
  if (fontWeight >= 700) return "Bold";
  if (fontWeight >= 600) return "Semi Bold";
  if (fontWeight >= 500) return "Medium";
  return "Regular";
}

async function loadNodeFont(node) {
  const style = node.text && node.text.style ? node.text.style : {};
  const family = style.fontFamily || "Inter";
  const fontName = {
    family,
    style: fontStyleFromWeight(style.fontWeight || 400),
  };

  await figma.loadFontAsync(fontName);
  return fontName;
}

function validateNode(node, path = "root") {
  assertObject(node, path);

  if (!SUPPORTED_NODE_TYPES[node.type]) {
    throw new Error(`${path}.type is not supported: ${node.type}`);
  }

  if (!node.name || typeof node.name !== "string") {
    throw new Error(`${path}.name is required`);
  }

  if ((node.type === "FRAME" || node.type === "RECTANGLE" || node.type === "IMAGE" || node.type === "SVG") && node.size) {
    if (typeof node.size.width !== "number" || typeof node.size.height !== "number") {
      throw new Error(`${path}.size must include numeric width and height`);
    }
  }

  if (node.type === "SVG" && typeof node.svg !== "string") {
    throw new Error(`${path}.svg must be a string`);
  }

  if (node.type === "TEXT") {
    assertObject(node.text, `${path}.text`);
    if (typeof node.text.characters !== "string") {
      throw new Error(`${path}.text.characters must be a string`);
    }
  }

  const children = node.children || [];
  for (let index = 0; index < children.length; index += 1) {
    validateNode(children[index], `${path}.children[${index}]`);
  }
}

function applySize(figmaNode, node) {
  if (!("resize" in figmaNode) || !node.size) return;
  figmaNode.resize(node.size.width, node.size.height);
}

function applyPosition(figmaNode, node) {
  if (!node.position) return;
  figmaNode.x = node.position.x;
  figmaNode.y = node.position.y;
}

function applyVisualStyle(figmaNode, node) {
  figmaNode.name = node.name || node.type;

  if ("fills" in figmaNode) {
    figmaNode.fills = Array.isArray(node.fills) ? node.fills.map(normalizePaint) : [];
  }

  if ("strokes" in figmaNode && Array.isArray(node.strokes)) {
    figmaNode.strokes = node.strokes.map(normalizePaint);
  }

  if ("strokeWeight" in figmaNode && typeof node.strokeWeight === "number") {
    figmaNode.strokeWeight = node.strokeWeight;
  }

  if ("cornerRadius" in figmaNode && typeof node.cornerRadius === "number") {
    figmaNode.cornerRadius = node.cornerRadius;
  }

  if ("effects" in figmaNode && Array.isArray(node.effects)) {
    figmaNode.effects = node.effects.map(normalizeEffect);
  }

  if ("layoutAlign" in figmaNode && node.layoutAlign) {
    figmaNode.layoutAlign = node.layoutAlign;
  }
}

function applyAutoLayout(figmaNode, node) {
  if (!("layoutMode" in figmaNode) || !node.layout) return;

  const layout = node.layout;
  const padding = layout.padding || {};
  figmaNode.layoutMode = layout.mode || "NONE";
  figmaNode.primaryAxisSizingMode = layout.primaryAxisSizingMode || "AUTO";
  figmaNode.counterAxisSizingMode = layout.counterAxisSizingMode || "AUTO";
  figmaNode.itemSpacing = typeof layout.gap === "number" ? layout.gap : 0;
  figmaNode.paddingTop = padding.top || 0;
  figmaNode.paddingRight = padding.right || 0;
  figmaNode.paddingBottom = padding.bottom || 0;
  figmaNode.paddingLeft = padding.left || 0;

  if (layout.primaryAxisAlignItems) {
    figmaNode.primaryAxisAlignItems = layout.primaryAxisAlignItems;
  }

  if (layout.counterAxisAlignItems) {
    figmaNode.counterAxisAlignItems = layout.counterAxisAlignItems;
  }
}

async function buildNode(node) {
  let figmaNode;

  if (node.type === "FRAME") {
    figmaNode = figma.createFrame();
    figmaNode.clipsContent = false;
    applySize(figmaNode, node);
    applyAutoLayout(figmaNode, node);
  } else if (node.type === "TEXT") {
    figmaNode = figma.createText();
    const fontName = await loadNodeFont(node);
    const style = node.text.style || {};
    figmaNode.fontName = fontName;
    figmaNode.fontSize = style.fontSize || 14;

    if (typeof style.lineHeightPx === "number") {
      figmaNode.lineHeight = { unit: "PIXELS", value: style.lineHeightPx };
    }

    if (style.textAlignHorizontal) {
      figmaNode.textAlignHorizontal = style.textAlignHorizontal;
    }

    if (style.textAlignVertical) {
      figmaNode.textAlignVertical = style.textAlignVertical;
    }

    figmaNode.characters = node.text.characters;
    applySize(figmaNode, node);
  } else if (node.type === "SVG") {
    figmaNode = figma.createNodeFromSvg(node.svg);
    applySize(figmaNode, node);
  } else {
    figmaNode = figma.createRectangle();
    applySize(figmaNode, node);
  }

  applyVisualStyle(figmaNode, node);

  if (node.type === "IMAGE" && (!node.fills || node.fills.length === 0)) {
    figmaNode.fills = [{ type: "SOLID", color: { r: 0.88, g: 0.9, b: 0.94 } }];
  }

  applyPosition(figmaNode, node);

  const children = node.children || [];
  for (let index = 0; index < children.length; index += 1) {
    figmaNode.appendChild(await buildNode(children[index]));
  }

  return figmaNode;
}

async function importPayload(payload) {
  assertPayload(payload);
  const root = getRootNode(payload);
  const pageInfo = getPageInfo(payload);
  validateNode(root);

  const page = figma.currentPage;

  if (pageInfo.background) {
    page.backgrounds = [
      {
        type: "SOLID",
        color: normalizeColor(pageInfo.background),
        opacity: typeof pageInfo.background.a === "number" ? pageInfo.background.a : 1,
      },
    ];
  }

  const rootNode = await buildNode(root);
  page.appendChild(rootNode);

  if (!root.position) {
    rootNode.x = 80;
    rootNode.y = 80;
  }

  figma.currentPage.selection = [rootNode];
  figma.viewport.scrollAndZoomIntoView([rootNode]);
  return rootNode;
}

figma.ui.onmessage = async (message) => {
  if (!message || message.type !== "import-json") return;

  try {
    const rootNode = await importPayload(message.payload);
    figma.ui.postMessage({ type: "import-complete", rootName: rootNode.name });
  } catch (error) {
    figma.ui.postMessage({
      type: "import-error",
      message: error instanceof Error ? error.message : "Import failed",
    });
  }
};
