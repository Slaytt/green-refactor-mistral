import * as vscode from 'vscode';

export class GreenRefactorSidebarProvider implements vscode.TreeDataProvider<GreenItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<GreenItem | undefined | null | void> = new vscode.EventEmitter<GreenItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<GreenItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: GreenItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: GreenItem): Thenable<GreenItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            // 1. Récupérer les stats stockées
            const totalOptimizations = this.context.globalState.get<number>('ecostral.totalOptimizations') || 0;
            const totalCo2Saved = this.context.globalState.get<number>('ecostral.totalCo2Saved') || 0; // Valeur arbitraire "points"

            return Promise.resolve([
                // Section Titre
                new GreenItem(
                    "Launch Analysis 🚀",
                    vscode.TreeItemCollapsibleState.None,
                    { command: 'green-refactor.start', title: "Start" }
                ),

                // Section Séparateur
                new GreenItem("──────────────", vscode.TreeItemCollapsibleState.None),

                // Section Stats
                new GreenItem(
                    "My Eco-Impact 🌍",
                    vscode.TreeItemCollapsibleState.Expanded
                ),
                new GreenItem(
                    `Optimizations: ${totalOptimizations}`,
                    vscode.TreeItemCollapsibleState.None,
                    undefined,
                    "check"
                ),
                new GreenItem(
                    `Eco-Points: ${totalCo2Saved}`,
                    vscode.TreeItemCollapsibleState.None,
                    undefined,
                    "heart"
                )
            ]);
        }
    }
}

class GreenItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        iconName?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = label;
        if (iconName) {
            this.iconPath = new vscode.ThemeIcon(iconName);
        }
    }
}