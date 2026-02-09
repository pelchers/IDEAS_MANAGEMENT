---
name: integrating-vscode
description: Automates VS Code via Extension API, CLI, and settings management. Use when building developer tools, custom workflows, IDE automation, or workspace configuration.
---

# Integrating VS Code

Automate Visual Studio Code through extensions, CLI commands, and API integration.

## What This Skill Does

- **Extension development**: Build custom VS Code extensions
- **CLI automation**: Automate via command line
- **Settings management**: Programmatic configuration
- **Task automation**: Custom build and test tasks
- **Snippet generation**: Dynamic code snippets
- **Workspace control**: Multi-root workspace automation

## Quick Start

### Install Extension

```bash
code --install-extension publisher.extension-name
```

### Open Workspace

```bash
code workspace.code-workspace
```

### Run Command

```bash
code --command workbench.action.files.save
```

---

## CLI Automation

### Basic Commands

```bash
# Open file
code file.txt

# Open folder
code /path/to/project

# Open diff
code --diff file1.txt file2.txt

# Install extension
code --install-extension ms-python.python

# List installed extensions
code --list-extensions

# Uninstall extension
code --uninstall-extension extension-id

# Wait for window to close
code --wait file.txt
```

### Workspace Management

```bash
# Create workspace
code --new-window --add /path/to/folder1 /path/to/folder2

# Open workspace
code workspace.code-workspace

# Settings
code --user-data-dir /custom/path
```

---

## Extension Development

### Extension Structure

```
my-extension/
├── package.json
├── src/
│   └── extension.ts
├── .vscode/
│   └── launch.json
└── tsconfig.json
```

### Basic Extension

```typescript
// src/extension.ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension activated!');

    // Register command
    let disposable = vscode.commands.registerCommand(
        'myextension.helloWorld',
        () => {
            vscode.window.showInformationMessage('Hello World!');
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {
    console.log('Extension deactivated');
}
```

### package.json

```json
{
  "name": "my-extension",
  "displayName": "My Extension",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.75.0"
  },
  "categories": ["Other"],
  "activationEvents": ["onCommand:myextension.helloWorld"],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "myextension.helloWorld",
        "title": "Hello World"
      }
    ]
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "devDependencies": {
    "@types/vscode": "^1.75.0",
    "typescript": "^4.9.0"
  }
}
```

---

## Extension Features

### File Operations

```typescript
// Read file
const uri = vscode.Uri.file('/path/to/file.txt');
const content = await vscode.workspace.fs.readFile(uri);
const text = Buffer.from(content).toString('utf8');

// Write file
const data = Buffer.from('Hello, World!', 'utf8');
await vscode.workspace.fs.writeFile(uri, data);

// Watch files
const watcher = vscode.workspace.createFileSystemWatcher('**/*.ts');

watcher.onDidChange((uri) => {
    console.log('File changed:', uri.fsPath);
});

watcher.onDidCreate((uri) => {
    console.log('File created:', uri.fsPath);
});
```

### Text Editor

```typescript
// Get active editor
const editor = vscode.window.activeTextEditor;

if (editor) {
    const document = editor.document;
    const selection = editor.selection;

    // Get selected text
    const text = document.getText(selection);

    // Replace text
    editor.edit((editBuilder) => {
        editBuilder.replace(selection, text.toUpperCase());
    });
}

// Insert text at cursor
editor.edit((editBuilder) => {
    editBuilder.insert(editor.selection.active, 'inserted text');
});
```

### Workspace Configuration

```typescript
// Get configuration
const config = vscode.workspace.getConfiguration('myextension');
const value = config.get<string>('settingName');

// Update configuration
await config.update('settingName', 'newValue', vscode.ConfigurationTarget.Global);

// Listen for configuration changes
vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('myextension.settingName')) {
        console.log('Setting changed!');
    }
});
```

### Custom Views

```typescript
// Tree view provider
class MyTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        return Promise.resolve([
            new TreeItem('Item 1'),
            new TreeItem('Item 2')
        ]);
    }
}

class TreeItem extends vscode.TreeItem {
    constructor(label: string) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.command = {
            command: 'myextension.itemClicked',
            title: 'Item Clicked',
            arguments: [this]
        };
    }
}

// Register tree view
vscode.window.createTreeView('myTreeView', {
    treeDataProvider: new MyTreeDataProvider()
});
```

---

## Language Server

### Basic Language Server

```typescript
import {
    createConnection,
    TextDocuments,
    ProposedFeatures
} from 'vscode-languageserver/node';

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

connection.onInitialize((params) => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true
            }
        }
    };
});

connection.onCompletion((textDocumentPosition) => {
    return [
        {
            label: 'TypeScript',
            kind: CompletionItemKind.Text,
            data: 1
        }
    ];
});

documents.listen(connection);
connection.listen();
```

---

## Settings Management

### Settings Schema

```json
{
  "contributes": {
    "configuration": {
      "title": "My Extension",
      "properties": {
        "myextension.enable": {
          "type": "boolean",
          "default": true,
          "description": "Enable the extension"
        },
        "myextension.maxItems": {
          "type": "number",
          "default": 10,
          "description": "Maximum items to show"
        }
      }
    }
  }
}
```

---

## Task Automation

### tasks.json

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "shell",
      "command": "npm run build",
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "test",
      "type": "shell",
      "command": "npm test",
      "group": "test"
    }
  ]
}
```

---

## Best Practices

1. **Follow VS Code guidelines**
2. **Use TypeScript** for extensions
3. **Add keyboard shortcuts** for commands
4. **Test across platforms**
5. **Provide good UX** with progress indicators

## References

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guides](https://code.visualstudio.com/api/extension-guides/overview)
- [Command Line Interface](https://code.visualstudio.com/docs/editor/command-line)

