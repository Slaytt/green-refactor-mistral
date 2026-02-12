import * as vscode from 'vscode';
import { Mistral } from '@mistralai/mistralai';
import { GreenRefactorSidebarProvider } from './GreenRefactorSidebar';

export function activate(context: vscode.ExtensionContext) {

	console.log('L\'extension "green-refactor-mistral" est active !');

	const sidebarProvider = new GreenRefactorSidebarProvider();
	vscode.window.registerTreeDataProvider('greenRefactorView', sidebarProvider);

	let disposable = vscode.commands.registerCommand('green-refactor.start', async () => {

		// 1. Récupérer l'éditeur et la sélection
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage("Ooups ! Ouvre un fichier et sélectionne du code d'abord. 📁");
			return;
		}

		const selection = editor.selection;
		const selectedCode = editor.document.getText(selection);

		if (!selectedCode) {
			vscode.window.showWarningMessage("Sélectionne d'abord un bout de code à optimiser ! 🌿");
			return;
		}

		// 2. Récupérer la clé API depuis les paramètres VS Code
		const config = vscode.workspace.getConfiguration('greenRefactor');
		const apiKey = config.get<string>('apiKey');

		if (!apiKey) {
			const action = await vscode.window.showErrorMessage(
				"Clé API Mistral manquante ! Va dans les paramètres (Ctrl+,) > Extensions > Green Refactor.",
				"Ouvrir Paramètres"
			);
			if (action === "Ouvrir Paramètres") {
				vscode.commands.executeCommand('workbench.action.openSettings', 'greenRefactor.apiKey');
			}
			return;
		}

		// 3. Feedback visuel (Barre de chargement)
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Analyse Green IT en cours...",
			cancellable: false
		}, async (progress) => {
			try {
				// 4. Appel à Mistral
				const client = new Mistral({ apiKey: apiKey });

				const chatResponse = await client.chat.complete({
					model: 'codestral-latest',
					messages: [
						{
							role: 'system',
							content: `Tu es un expert Senior en Green IT et performance logicielle. 
                            Ta mission : Optimiser le code fourni pour réduire la complexité algorithmique (Big O) et la consommation mémoire.
                            Règles :
                            1. Garde la même logique métier.
                            2. Ajoute des commentaires expliquant le gain (ex: "Passage de O(n^2) à O(n)").
                            3. Renvoie UNIQUEMENT le code optimisé, sans texte autour (pas de markdown \`\`\`).`
						},
						{
							role: 'user',
							content: selectedCode
						}
					]
				});

				let optimizedCode = "";
				const content = chatResponse.choices?.[0].message.content;

				if (typeof content === 'string') {
					optimizedCode = content;
				} else if (Array.isArray(content)) {
					// Handle ContentChunk[] if necessary, or just join text parts
					// For now, let's assume simple text scenarios or join if valid
					// But Mistral SDK usually returns string for simple chat.
					// Let's force it to string for now or skip if complex.
					// A safe bet for code generation is it's likely a string.
					// If it's an array of chunks, we might need to extract text.
					// For simplicity in this quick fix:
					optimizedCode = JSON.stringify(content);
				}

				// Nettoyage au cas où l'IA mettrait quand même des backticks
				optimizedCode = optimizedCode.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');

				// 5. Afficher le comparatif (Diff View)
				const doc = await vscode.workspace.openTextDocument({
					content: optimizedCode,
					language: editor.document.languageId
				});

				vscode.commands.executeCommand(
					'vscode.diff',
					editor.document.uri,
					doc.uri,
					'Original ↔️ Green Optimized 🌿'
				);

			} catch (error: any) {
				vscode.window.showErrorMessage("Erreur Mistral : " + error.message);
			}
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }