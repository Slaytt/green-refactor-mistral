import * as vscode from 'vscode';

export class GreenCodeActionProvider implements vscode.CodeActionProvider {

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {

        // Si rien n'est sélectionné, on ne propose rien (pour ne pas polluer)
        // Tu peux enlever cette condition si tu veux que ça marche juste avec le curseur
        if (range.isEmpty) {
            return [];
        }

        // Création de l'action "Refactor"
        const action = new vscode.CodeAction('🌿 Green Refactor (Mistral)', vscode.CodeActionKind.RefactorRewrite);

        // On relie cette action à notre commande existante
        action.command = {
            command: 'green-refactor.start',
            title: 'Green Refactor',
            tooltip: 'Optimize code for energy efficiency'
        };

        // isPreferred = true met l'action en haut de la liste (souvent par défaut avec Cmd+.)
        action.isPreferred = true;

        return [action];
    }
}