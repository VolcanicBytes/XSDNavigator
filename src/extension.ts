import * as vscode from 'vscode';
import { XSDNavigator } from './XSDNavigator';

export function activate(context: vscode.ExtensionContext) {
	const navigator: XSDNavigator = new XSDNavigator();
	context.subscriptions.push(
		// vscode.languages.registerDocumentLinkProvider({ language: 'xml', scheme: 'file', pattern: '**/*.xsd' }, navigator),
		vscode.languages.registerDefinitionProvider({ language: 'xml', scheme: 'file', pattern: '**/*.xsd' }, navigator),
	);
}

export function deactivate() { }
