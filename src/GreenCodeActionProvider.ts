import * as vscode from 'vscode';

export class GreenCodeActionProvider implements vscode.CodeActionProvider {

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {

        if (range.isEmpty) {
            return [];
        }

        const action = new vscode.CodeAction('🌿 Green Refactor (Mistral)', vscode.CodeActionKind.RefactorRewrite);
        action.command = {
            command: 'green-refactor.start',
            title: 'Green Refactor',
            tooltip: 'Optimize code for energy efficiency'
        };
        action.isPreferred = true;

        return [action];
    }
}