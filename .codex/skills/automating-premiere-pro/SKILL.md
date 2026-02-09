---
name: automating-premiere-pro
description: Automates Adobe Premiere Pro video editing via ExtendScript and CEP. Use when batch exporting videos, automating edit workflows, or creating templated video sequences.
---

# Automating Premiere Pro

Automate Adobe Premiere Pro video editing workflows with ExtendScript for batch processing and templated editing.

## What This Skill Does

- **Timeline automation**: Programmatic sequence creation
- **Batch export**: Automate rendering workflows
- **Marker management**: Script-based markers
- **Effect automation**: Apply effects via script
- **Template workflows**: Reusable edit templates
- **Proxy management**: Automate proxy workflows

## Quick Start

### Basic Script

```javascript
// Save as script.jsx
var project = app.project;
var sequence = project.activeSequence;

// Add marker
sequence.markers.createMarker(0);

// Export
sequence.exportAsMediaDirect("output.mp4");
```

---

## Project Operations

### Create Project

```javascript
// Open project
var projectPath = "/path/to/project.prproj";
app.openDocument(projectPath);

// Save project
app.project.save();

// Save As
app.project.saveAs("/path/to/new-project.prproj");

// Close project
app.project.closeDocument();
```

### Import Media

```javascript
// Import files
var filesToImport = [
    "/path/to/video1.mp4",
    "/path/to/video2.mp4",
    "/path/to/audio.mp3"
];

var suppressUI = true;
var targetBin = app.project.rootItem;

for (var i = 0; i < filesToImport.length; i++) {
    app.project.importFiles(
        [filesToImport[i]],
        suppressUI,
        targetBin,
        false
    );
}
```

---

## Sequence Automation

### Create Sequence

```javascript
// Get sequence preset
var presetPath = app.getSequencePresetPath("HDV - HDV 1080p25");

// Create sequence
var sequence = app.project.createNewSequence(
    "MySequence",
    presetPath
);

// Set as active
app.project.activeSequence = sequence;
```

### Add Clips to Timeline

```javascript
var sequence = app.project.activeSequence;
var videoTrack = sequence.videoTracks[0];
var audioTrack = sequence.audioTracks[0];

// Get clip from project
var projectItem = app.project.rootItem.children[0];

// Add to timeline
var videoClip = videoTrack.insertClip(projectItem, 0);  // time in seconds
var audioClip = audioTrack.insertClip(projectItem, 0);

// Set in/out points
videoClip.inPoint = 1.0;
videoClip.outPoint = 5.0;
```

---

## Export Automation

### Export Settings

```javascript
var sequence = app.project.activeSequence;
var outputPath = "/path/to/output.mp4";

// Get export controller
var exporter = app.getExportController();

// Set export settings
exporter.setSourceSequence(sequence);
exporter.setDestinationPath(outputPath);

// Export preset
var presetPath = app.getExportPresetPath("H.264");
exporter.setExportPresetPath(presetPath);

// Start export
exporter.startBatchExport();
```

### Batch Export Sequences

```javascript
function batchExportSequences(outputFolder) {
    var project = app.project;

    for (var i = 0; i < project.sequences.numSequences; i++) {
        var sequence = project.sequences[i];
        var outputPath = outputFolder + "/" + sequence.name + ".mp4";

        // Set active sequence
        project.activeSequence = sequence;

        // Export
        var exporter = app.getExportController();
        exporter.setSourceSequence(sequence);
        exporter.setDestinationPath(outputPath);
        exporter.setExportPresetPath(app.getExportPresetPath("H.264"));
        exporter.startBatchExport();
    }
}

batchExportSequences("/exports");
```

---

## Markers and Metadata

### Add Markers

```javascript
var sequence = app.project.activeSequence;

// Create marker at time
var marker = sequence.markers.createMarker(5.0);  // 5 seconds

// Set marker properties
marker.name = "Scene Change";
marker.comments = "Switch to wide shot";
marker.setColorByIndex(0);  // Red

// Chapter marker
var chapterMarker = sequence.markers.createMarker(10.0);
chapterMarker.type = "Chapter";
chapterMarker.name = "Chapter 1";
```

### Read Markers

```javascript
var sequence = app.project.activeSequence;
var markerCount = sequence.markers.numMarkers;

for (var i = 0; i < markerCount; i++) {
    var marker = sequence.markers[i];
    $.writeln("Marker: " + marker.name + " at " + marker.start);
}
```

---

## Effect Automation

### Apply Effects

```javascript
var clip = app.project.activeSequence.videoTracks[0].clips[0];

// Add effect
var effect = clip.components[0];  // Video component
effect.addVideoEffect(app.findComponentByName("Gaussian Blur"));

// Get effect properties
var blur = effect.properties[0];
blur.setValue(10.0);
```

---

## Best Practices

1. **Test on copies** before automation
2. **Use try/catch** for error handling
3. **Save incrementally** during batch operations
4. **Validate paths** before import/export
5. **Monitor exports** for errors

## References

- [Premiere Pro Scripting Guide](https://ppro-scripting.docsforadobe.dev/)
- [ExtendScript Toolkit](https://extendscript.docsforadobe.dev/)
- [CEP Resources](https://github.com/Adobe-CEP/)

