import * as vscode from 'vscode';
import { Mistral } from '@mistralai/mistralai';
import { GreenRefactorSidebarProvider } from './GreenRefactorSidebar';
import { GreenAnalysisService } from './GreenAnalysisService';
import { GreenReportPanel } from './GreenReportPanel';



export function activate(context: vscode.ExtensionContext) {

	console.log('Extension "green-refactor-mistral" is active!');

	const sidebarProvider = new GreenRefactorSidebarProvider(context);
	vscode.window.registerTreeDataProvider('greenRefactorView', sidebarProvider);

	let disposable = vscode.commands.registerCommand('green-refactor.start', async () => {

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage("Please open a file first! 📁");
			return;
		}

		const selection = editor.selection;
		const selectedCode = editor.document.getText(selection);

		if (!selectedCode || selectedCode.trim().length === 0) {
			vscode.window.showWarningMessage("Please select some code to analyze! 🌿");
			return;
		}

		const config = vscode.workspace.getConfiguration('greenRefactor');
		const apiKey = config.get<string>('apiKey');

		if (!apiKey) {
			vscode.window.showErrorMessage("API Key missing. Please check your settings.");
			return;
		}

		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "🌿 Eco-Audit in progress...",
			cancellable: false
		}, async (progress) => {
			try {
				const analysisService = new GreenAnalysisService(apiKey);
				const analysis = await analysisService.analyzeCode(selectedCode);

				if (analysis.score_optimized > analysis.score_original) {
					const pointsGained = analysis.score_optimized - analysis.score_original;

					const currentTotal = context.globalState.get<number>('ecostral.totalOptimizations') || 0;
					const currentPoints = context.globalState.get<number>('ecostral.totalCo2Saved') || 0;

					await context.globalState.update('ecostral.totalOptimizations', currentTotal + 1);
					await context.globalState.update('ecostral.totalCo2Saved', currentPoints + pointsGained);

					sidebarProvider.refresh();
				}

				GreenReportPanel.createOrShow(context.extensionUri, analysis, editor);

			} catch (error: any) {
				console.error(error);
				vscode.window.showErrorMessage("Analysis failed: " + error.message);
			}
		});
	});

	context.subscriptions.push(disposable);
}



export function deactivate() { }