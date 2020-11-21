import * as vscode from 'vscode';
import { Constants } from './constants';
import { XSDNavigator } from './xsdNavigator';

export function activate(context: vscode.ExtensionContext) {
	vscode.commands.executeCommand('setContext', Constants.Context, true);
	const navigator: XSDNavigator = new XSDNavigator();
	context.subscriptions.push(
		vscode.languages.registerDefinitionProvider(Constants.Selector, navigator),
		vscode.window.onDidChangeActiveTextEditor((e) => navigator.rebuild(e)),
		vscode.workspace.onDidSaveTextDocument(() => navigator.rebuild(vscode.window.activeTextEditor, true)),
		vscode.workspace.onDidChangeTextDocument((e) => navigator.update(e.document)),
		vscode.commands.registerCommand(Constants.JumpToCommand, () => navigator.jumpTo()),
	);
}

export function deactivate() {
	vscode.commands.executeCommand('setContext', Constants.Context, false);
}
