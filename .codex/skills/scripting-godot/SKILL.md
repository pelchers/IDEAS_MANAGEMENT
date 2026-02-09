---
name: scripting-godot
description: Automates Godot game engine workflows via GDScript and command-line tools. Use when generating game assets, automating builds, procedural level generation, or testing game logic.
---

# Scripting Godot

Automate Godot game development with GDScript, editor tools, and CLI automation.

## What This Skill Does

- **Scene generation**: Create scenes programmatically
- **Node manipulation**: Build scene trees via script
- **Asset automation**: Import and process game assets
- **Build automation**: Export to multiple platforms
- **Testing**: Headless testing and CI/CD
- **Tool scripts**: Extend Godot editor

## Quick Start

### Run Headless

```bash
godot --headless --script automate.gd
```

### Export Game

```bash
godot --headless --export "Windows Desktop" game.exe
```

### Generate Scene

```gdscript
# scripts/generate_level.gd
tool
extends EditorScript

func _run():
    var scene = preload("res://scenes/tile.tscn")
    for x in range(10):
        for y in range(10):
            var tile = scene.instance()
            tile.position = Vector2(x * 64, y * 64)
            get_scene().add_child(tile)
            tile.owner = get_scene()
```

---

## CLI Automation

### Headless Mode

```bash
# Run without window
godot --headless

# Run specific scene
godot --headless res://main.tscn

# Run script
godot --headless --script res://scripts/automation.gd

# Quit after running
godot --headless --quit --script res://automation.gd
```

### Exporting

```bash
# Export to Windows
godot --headless --export "Windows Desktop" builds/game.exe

# Export to Linux
godot --headless --export "Linux/X11" builds/game.x86_64

# Export to Web
godot --headless --export "HTML5" builds/index.html

# Export debug build
godot --headless --export-debug "Windows Desktop" builds/game-debug.exe
```

---

## GDScript Automation

### Editor Scripts

```gdscript
# scripts/level_generator.gd
tool
extends EditorScript

func _run():
    randomize()
    var root = get_scene()

    # Clear existing children
    for child in root.get_children():
        root.remove_child(child)
        child.queue_free()

    # Generate level
    var tile_scene = load("res://prefabs/tile.tscn")

    for x in range(20):
        for y in range(20):
            var tile = tile_scene.instance()
            tile.position = Vector2(x * 64, y * 64)

            # Random variation
            if randf() > 0.8:
                tile.modulate = Color(1, 0.5, 0.5)

            root.add_child(tile)
            tile.owner = root

    print("Generated ", root.get_child_count(), " tiles")
```

### Node Creation

```gdscript
# Create nodes programmatically
func create_player():
    var player = Sprite.new()
    player.name = "Player"
    player.texture = preload("res://sprites/player.png")
    player.position = Vector2(320, 240)

    # Add script
    var script = load("res://scripts/player.gd")
    player.set_script(script)

    # Add collision
    var collision = CollisionShape2D.new()
    var shape = RectangleShape2D.new()
    shape.extents = Vector2(32, 32)
    collision.shape = shape
    player.add_child(collision)

    add_child(player)
    return player
```

---

## Asset Processing

### Import Automation

```gdscript
# addons/asset_processor/plugin.gd
tool
extends EditorPlugin

func _enter_tree():
    var import_plugin = preload("res://addons/asset_processor/importer.gd").new()
    add_import_plugin(import_plugin)

func process_textures():
    var dir = Directory.new()
    if dir.open("res://raw_assets/") == OK:
        dir.list_dir_begin()
        var file_name = dir.get_next()

        while file_name != "":
            if file_name.ends_with(".png"):
                process_texture(file_name)
            file_name = dir.get_next()

func process_texture(filename):
    # Load and process
    var texture = load("res://raw_assets/" + filename)
    # ... processing logic
```

---

## Testing Automation

### Unit Testing

```gdscript
# tests/test_player.gd
extends "res://addons/gut/test.gd"

func test_player_movement():
    var player = Player.new()
    add_child_autofree(player)

    player.velocity = Vector2(100, 0)
    player._physics_process(1.0)

    assert_gt(player.position.x, 0, "Player should move right")

func test_player_damage():
    var player = Player.new()
    add_child_autofree(player)

    var initial_health = player.health
    player.take_damage(10)

    assert_eq(player.health, initial_health - 10)
```

### CI/CD Integration

```yaml
# .github/workflows/godot-test.yml
name: Godot Tests

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Download Godot
        run: |
          wget https://downloads.tuxfamily.org/godotengine/3.5/Godot_v3.5-stable_linux_headless.64.zip
          unzip Godot_v3.5-stable_linux_headless.64.zip

      - name: Run Tests
        run: |
          ./Godot_v3.5-stable_linux_headless.64 --headless --path . res://tests/run_tests.gd

      - name: Export Game
        run: |
          ./Godot_v3.5-stable_linux_headless.64 --headless --export "HTML5" build/index.html
```

---

## Best Practices

1. **Use tool mode** for editor scripts
2. **Automate exports** in CI/CD
3. **Version control** export templates
4. **Test headless** before deploying
5. **Document scripts** with comments

## References

- [Godot CLI Reference](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html)
- [GDScript Reference](https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/)
- [EditorScript](https://docs.godotengine.org/en/stable/classes/class_editorscript.html)

