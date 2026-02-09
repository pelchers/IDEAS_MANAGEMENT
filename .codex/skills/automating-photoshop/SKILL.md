---
name: automating-photoshop
description: Automates Adobe Photoshop via UXP (Unified Extensibility Platform) and ExtendScript. Use when batch processing images, automating design workflows, or creating custom Photoshop tools.
---

# Automating Photoshop

Automate Adobe Photoshop workflows with UXP plugins and ExtendScript for batch processing and custom tools.

## What This Skill Does

- **Batch processing**: Automate repetitive image tasks
- **Layer manipulation**: Programmatic layer operations
- **Filter automation**: Apply effects via script
- **Export workflows**: Custom export presets
- **Action recording**: Script-based actions
- **Plugin development**: Build custom tools

## Quick Start

### Run ExtendScript

```javascript
// Save as script.jsx, run from File > Scripts
var doc = app.activeDocument;
doc.flatten();
doc.saveAs(new File("output.psd"));
```

### Batch Process

```javascript
// Process folder of images
var folder = Folder.selectDialog("Select folder");
var files = folder.getFiles("*.jpg");

for (var i = 0; i < files.length; i++) {
    open(files[i]);
    // ... process ...
    activeDocument.close(SaveOptions.SAVECHANGES);
}
```

---

## ExtendScript Basics

### Document Operations

```javascript
// Create new document
var doc = app.documents.add(
    UnitValue(800, "px"),  // width
    UnitValue(600, "px"),  // height
    72,                    // resolution
    "MyDocument",          // name
    NewDocumentMode.RGB
);

// Open document
var fileRef = new File("/path/to/image.psd");
open(fileRef);

// Save
doc.save();

// Save As
var saveFile = new File("/path/to/output.psd");
doc.saveAs(saveFile);

// Export as PNG
var pngFile = new File("/path/to/output.png");
var pngOptions = new PNGSaveOptions();
pngOptions.compression = 9;
doc.exportDocument(pngFile, ExportType.SAVEFORWEB, pngOptions);
```

### Layer Operations

```javascript
// Create layer
var layer = doc.artLayers.add();
layer.name = "New Layer";
layer.blendMode = BlendMode.NORMAL;
layer.opacity = 100;

// Duplicate layer
var duplicateLayer = layer.duplicate();

// Delete layer
layer.remove();

// Merge layers
doc.mergeVisibleLayers();

// Flatten
doc.flatten();

// Access layers
for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];
    alert(layer.name);
}
```

### Selection and Masks

```javascript
// Select all
doc.selection.selectAll();

// Deselect
doc.selection.deselect();

// Select region
var region = [
    [100, 100],
    [300, 100],
    [300, 300],
    [100, 300]
];
doc.selection.select(region);

// Feather selection
doc.selection.feather(10);

// Create layer mask from selection
activeDocument.activeLayer.add();
```

---

## Batch Processing

### Resize Images

```javascript
function resizeImages(folderPath, width, height) {
    var folder = new Folder(folderPath);
    var files = folder.getFiles(/\\.(jpg|jpeg|png)$/i);

    for (var i = 0; i < files.length; i++) {
        var doc = open(files[i]);

        // Resize
        doc.resizeImage(
            UnitValue(width, "px"),
            UnitValue(height, "px"),
            null,
            ResampleMethod.BICUBIC
        );

        // Save
        var saveFile = new File(files[i].fsName.replace(/\\.[^.]+$/, "_resized.jpg"));
        var jpegOptions = new JPEGSaveOptions();
        jpegOptions.quality = 10;
        doc.saveAs(saveFile, jpegOptions);

        doc.close(SaveOptions.DONOTSAVECHANGES);
    }
}

resizeImages("/path/to/images", 1920, 1080);
```

### Apply Watermark

```javascript
function addWatermark(imagePath, watermarkPath) {
    var doc = open(new File(imagePath));
    var watermark = open(new File(watermarkPath));

    // Copy watermark
    watermark.selection.selectAll();
    watermark.selection.copy();
    watermark.close(SaveOptions.DONOTSAVECHANGES);

    // Paste into main document
    doc.paste();

    // Position watermark
    var layer = doc.activeLayer;
    layer.opacity = 50;

    // Move to bottom right
    layer.translate(
        doc.width - layer.bounds[2] - 20,
        doc.height - layer.bounds[3] - 20
    );

    doc.flatten();
    doc.save();
}
```

---

## UXP Plugin Development

### Plugin Structure

```
my-plugin/
├── manifest.json
├── index.html
├── index.js
└── style.css
```

### manifest.json

```json
{
  "id": "com.mycompany.myplugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "host": {
    "app": "PS",
    "minVersion": "23.0.0"
  },
  "entrypoints": [
    {
      "type": "panel",
      "id": "mainPanel",
      "label": "My Plugin Panel"
    }
  ],
  "requiredPermissions": [
    "webview",
    "network"
  ]
}
```

### index.html

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>My Plugin</h1>
    <button id="processBtn">Process Image</button>
    <script src="index.js"></script>
</body>
</html>
```

### index.js

```javascript
const { app } = require('photoshop');
const { executeAsModal } = require('photoshop').core;

document.getElementById('processBtn').addEventListener('click', async () => {
    await executeAsModal(async () => {
        const doc = app.activeDocument;

        // Apply filter
        await doc.flatten();

        alert('Processing complete!');
    });
});
```

---

## Automation Examples

### Color Correction Batch

```javascript
function autoColorCorrect(folderPath) {
    var folder = new Folder(folderPath);
    var files = folder.getFiles("*.jpg");

    for (var i = 0; i < files.length; i++) {
        var doc = open(files[i]);

        // Auto levels
        doc.activeLayer.autoLevels();

        // Auto contrast
        doc.activeLayer.autoContrast();

        // Save
        doc.save();
        doc.close();
    }
}
```

### Create Thumbnails

```javascript
function createThumbnails(sourcePath, outputPath, size) {
    var sourceFolder = new Folder(sourcePath);
    var outputFolder = new Folder(outputPath);
    var files = sourceFolder.getFiles(/\\.(jpg|jpeg|png)$/i);

    for (var i = 0; i < files.length; i++) {
        var doc = open(files[i]);

        // Resize to thumbnail
        var ratio = Math.min(size / doc.width, size / doc.height);
        doc.resizeImage(
            doc.width * ratio,
            doc.height * ratio,
            null,
            ResampleMethod.BICUBIC
        );

        // Save thumbnail
        var thumbName = files[i].name.replace(/\\.[^.]+$/, "_thumb.jpg");
        var saveFile = new File(outputFolder + "/" + thumbName);
        var jpegOptions = new JPEGSaveOptions();
        jpegOptions.quality = 8;
        doc.saveAs(saveFile, jpegOptions);

        doc.close(SaveOptions.DONOTSAVECHANGES);
    }
}

createThumbnails("/source", "/thumbs", 200);
```

---

## Best Practices

1. **Use executeAsModal** for UXP operations
2. **Handle errors** with try/catch
3. **Close documents** to free memory
4. **Test scripts** on copies
5. **Save intermediate** results

## References

- [ExtendScript Toolkit](https://extendscript.docsforadobe.dev/)
- [UXP Documentation](https://developer.adobe.com/photoshop/uxp/)
- [Photoshop Scripting Guide](https://www.adobe.com/devnet/photoshop/scripting.html)

