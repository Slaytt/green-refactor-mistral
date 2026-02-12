import * as vscode from 'vscode';
import { GreenAnalysis } from './GreenAnalysisService';

export class GreenReportPanel {
    public static currentPanel: GreenReportPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, analysis: GreenAnalysis, editor: vscode.TextEditor) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update(analysis); // Set initial content

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'showDiff':
                        const doc = await vscode.workspace.openTextDocument({
                            content: analysis.optimized_code,
                            language: editor.document.languageId
                        });
                        vscode.commands.executeCommand(
                            'vscode.diff',
                            editor.document.uri,
                            doc.uri,
                            'Original ↔️ Green Optimized 🌿'
                        );
                        this.dispose(); // Close panel after showing diff
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri, analysis: GreenAnalysis, editor: vscode.TextEditor) {
        const column = vscode.ViewColumn.Beside;

        // If we already have a panel, show it.
        if (GreenReportPanel.currentPanel) {
            GreenReportPanel.currentPanel._panel.reveal(column);
            GreenReportPanel.currentPanel._update(analysis);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            'greenReport',
            '🌿 Green IT Report',
            column,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'resources')]
            }
        );

        GreenReportPanel.currentPanel = new GreenReportPanel(panel, extensionUri, analysis, editor);
    }

    public dispose() {
        GreenReportPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update(analysis: GreenAnalysis) {
        this._panel.webview.html = this._getHtmlForWebview(analysis);
    }

    private _getHtmlForWebview(data: GreenAnalysis): string {
        const isWin = data.score_optimized > data.score_original;
        const color = isWin ? '#4caf50' : '#ff9800'; // Green or Orange

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Green Report</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: var(--vscode-editor-foreground); background-color: var(--vscode-editor-background); }
                .card { background: var(--vscode-editor-selectionBackground); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid var(--vscode-focusBorder); }
                h1 { font-size: 1.5em; margin-top: 0; display: flex; align-items: center; gap: 10px;}
                .metrics { display: flex; justify-content: space-around; margin: 20px 0; align-items: center; }
                .metric { text-align: center; }
                .value { font-size: 2.5em; font-weight: bold; color: ${color}; }
                .label { font-size: 0.8em; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;}
                .arrow { font-size: 2em; opacity: 0.5; }
                
                .tech-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;}
                .tech-item { background: rgba(0,0,0,0.1); padding: 8px; border-radius: 4px; text-align: center;}
                .big-o { font-family: 'Courier New', monospace; font-weight: bold; }
                
                button { background-color: #2da44e; color: white; border: none; padding: 12px 20px; font-size: 1em; cursor: pointer; border-radius: 6px; width: 100%; font-weight: bold; transition: background 0.2s;}
                button:hover { background-color: #2c974b; transform: translateY(-1px); }
                
                h3 { margin-top: 0; margin-bottom: 10px; font-size: 1.1em;}
                p { line-height: 1.5; margin: 0; opacity: 0.9;}
            </style>
        </head>
        <body>
            <h1>🌿 Eco-Code Audit</h1>
            
            <div class="card">
                <h3>Diagnostic</h3>
                <p>${data.analysis_summary}</p>
            </div>

            <div class="metrics">
                <div class="metric">
                    <div class="value" style="color: inherit; opacity: 0.7">${data.score_original}</div>
                    <div class="label">Current</div>
                </div>
                <div class="arrow">➜</div>
                <div class="metric">
                    <div class="value">${data.score_optimized}</div>
                    <div class="label">Potential</div>
                </div>
            </div>

            <div class="card">
                <h3>Technical Impact</h3>
                <div class="tech-details">
                    <div class="tech-item">
                        <span class="label">Complexity</span><br>
                        <span class="big-o">${data.complexity_before} ➔ <span style="color:${color}">${data.complexity_after}</span></span>
                    </div>
                    <div class="tech-item">
                        <span class="label">Est. Gain</span><br>
                        <strong>${data.estimated_gain}</strong>
                    </div>
                </div>
            </div>

            <div class="card" style="border-left: 4px solid ${color}">
                <h3>💡 Optimization Strategy</h3>
                <p>${data.explanation}</p>
            </div>

            <button onclick="applyFix()">Show Code Diff</button>

            <script>
                const vscode = acquireVsCodeApi();
                function applyFix() {
                    vscode.postMessage({ command: 'showDiff' });
                }
            </script>
        </body>
        </html>`;
    }
}
