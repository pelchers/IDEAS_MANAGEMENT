---
name: automating-after-effects
description: Automates Adobe After Effects motion graphics via ExtendScript. Use when generating data-driven animations, batch rendering compositions, or creating templated motion graphics.
---

# Automating After Effects

Automate Adobe After Effects motion graphics and compositing with ExtendScript for templates and batch workflows.

## What This Skill Does

- **Composition creation**: Build comps programmatically
- **Layer animation**: Automate keyframes and expressions
- **Data-driven graphics**: Template-based animations
- **Render automation**: Batch render queue
- **Text animation**: Dynamic text replacement
- **Expression generation**: Programmatic expressions

## Quick Start

### Basic Script

```javascript
// Save as script.jsx
var comp = app.project.activeItem;
var layer = comp.layers.addText("Hello World");
layer.property("Position").setValue([960, 540]);
```

---

## Project and Composition

### Create Project

```javascript
// New project
var project = app.newProject();

// Open project
app.open(new File("/path/to/project.aep"));

// Save project
app.project.save();

// Save as
app.project.save(new File("/path/to/new-project.aep"));
```

### Create Composition

```javascript
// Create comp
var comp = app.project.items.addComp(
    "MyComp",           // name
    1920,               // width
    1080,               // height
    1.0,                // pixel aspect ratio
    10,                 // duration (seconds)
    30                  // frame rate
);

// Set background color
comp.bgColor = [0, 0, 0];  // Black

// Set as active
app.project.activeItem = comp;
```

---

## Layer Operations

### Add Layers

```javascript
var comp = app.project.activeItem;

// Add solid layer
var solid = comp.layers.addSolid(
    [1, 0, 0],  // Red
    "RedSolid",
    1920,
    1080,
    1.0
);

// Add text layer
var textLayer = comp.layers.addText("Hello World");

// Add shape layer
var shapeLayer = comp.layers.addShape();

// Add null object
var nullLayer = comp.layers.addNull();
```

### Import and Add Footage

```javascript
// Import file
var footage = app.project.importFile(
    new ImportOptions(new File("/path/to/video.mp4"))
);

// Add to comp
var layer = comp.layers.add(footage);
```

---

## Animation

### Keyframes

```javascript
var layer = comp.layer(1);
var position = layer.property("ADBE Transform Group").property("ADBE Position");

// Enable keyframes
position.setValueAtTime(0, [960, 540]);
position.setValueAtTime(2, [200, 200]);
position.setValueAtTime(4, [1720, 880]);

// Set interpolation
for (var i = 1; i <= position.numKeys; i++) {
    position.setInterpolationTypeAtKey(
        i,
        KeyframeInterpolationType.BEZIER,
        KeyframeInterpolationType.BEZIER
    );
}
```

### Expressions

```javascript
var layer = comp.layer(1);
var position = layer.property("Transform").property("Position");

// Add expression
position.expression = "wiggle(5, 50)";

// Expression with variables
var scale = layer.property("Transform").property("Scale");
scale.expression = [
    "var freq = 2;",
    "var amp = 20;",
    "[value[0] + Math.sin(time * freq) * amp, value[1]]"
].join("\n");
```

---

## Text Automation

### Text Layers

```javascript
// Create text layer
var textLayer = comp.layers.addText("Dynamic Text");
var textDocument = textLayer.property("Source Text").value;

// Modify text properties
textDocument.fontSize = 72;
textDocument.font = "Arial";
textDocument.fillColor = [1, 1, 1];  // White
textDocument.applyStroke = true;
textDocument.strokeColor = [0, 0, 0];
textDocument.strokeWidth = 2;

// Update layer
textLayer.property("Source Text").setValue(textDocument);
```

### Template with Data

```javascript
function createTitleCard(name, title, imageFile) {
    var comp = app.project.items.addComp(name, 1920, 1080, 1.0, 5, 30);

    // Add background image
    var bgFootage = app.project.importFile(new ImportOptions(new File(imageFile)));
    var bgLayer = comp.layers.add(bgFootage);

    // Add text
    var textLayer = comp.layers.addText(title);
    var textDoc = textLayer.property("Source Text").value;
    textDoc.fontSize = 100;
    textDoc.fillColor = [1, 1, 1];
    textLayer.property("Source Text").setValue(textDoc);

    // Center text
    textLayer.property("Position").setValue([960, 540]);

    return comp;
}

// Generate multiple title cards
var data = [
    { name: "Intro", title: "Welcome", image: "/images/intro.jpg" },
    { name: "Chapter1", title: "Getting Started", image: "/images/ch1.jpg" }
];

for (var i = 0; i < data.length; i++) {
    createTitleCard(data[i].name, data[i].title, data[i].image);
}
```

---

## Render Automation

### Render Queue

```javascript
// Add comp to render queue
var comp = app.project.item(1);
var renderQueueItem = app.project.renderQueue.items.add(comp);

// Set output module
var outputModule = renderQueueItem.outputModule(1);
outputModule.applyTemplate("H.264");

// Set output path
outputModule.file = new File("/path/to/output.mp4");

// Render
app.project.renderQueue.render();
```

### Batch Render

```javascript
function batchRenderComps(outputFolder) {
    var project = app.project;
    var renderQueue = project.renderQueue;

    // Clear render queue
    while (renderQueue.numItems > 0) {
        renderQueue.item(1).remove();
    }

    // Add all comps to queue
    for (var i = 1; i <= project.numItems; i++) {
        var item = project.item(i);

        if (item instanceof CompItem) {
            var rqItem = renderQueue.items.add(item);
            var outputModule = rqItem.outputModule(1);

            outputModule.applyTemplate("H.264");
            outputModule.file = new File(outputFolder + "/" + item.name + ".mp4");
        }
    }

    // Render all
    renderQueue.render();
}

batchRenderComps("/renders");
```

---

## Best Practices

1. **Use templates** for repeated work
2. **Validate inputs** before processing
3. **Handle errors** with try/catch
4. **Save before** rendering
5. **Monitor render** queue

## References

- [After Effects Scripting Guide](https://ae-scripting.docsforadobe.dev/)
- [ExtendScript Toolkit](https://extendscript.docsforadobe.dev/)
- [Expression Reference](https://helpx.adobe.com/after-effects/using/expression-language-reference.html)

