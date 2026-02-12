import * as vscode from 'vscode';

export class GreenRefactorSidebarProvider implements vscode.TreeDataProvider<GreenRefactorItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<GreenRefactorItem | undefined | null | void> = new vscode.EventEmitter<GreenRefactorItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<GreenRefactorItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor() { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: GreenRefactorItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: GreenRefactorItem): Thenable<GreenRefactorItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            return Promise.resolve([
                new GreenRefactorItem("Lancer l'analyse Green IT 🌿", vscode.TreeItemCollapsibleState.None, {
                    command: 'green-refactor.start',
                    title: "Lancer l'analyse"
                }, "Analyze Selection currently active in the editor")
            ]);
        }
    }
}

export class GreenRefactorItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public readonly tooltip?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.iconPath = new vscode.ThemeIcon('play');
    }
}
