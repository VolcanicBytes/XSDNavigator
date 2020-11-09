import * as vscode from 'vscode';
import * as path from 'path';
import { IncludesLocator } from './includesLocator';

export class XSDNavigator implements vscode.DocumentLinkProvider, vscode.DefinitionProvider {
    constructor() {
    }
    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
        const results = new Array<vscode.LocationLink>();
        const text = document.getText();
        const locator = new IncludesLocator(text);
        const matches = locator.GetMatches();
        if (matches.length > 0) {

            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                const startIndex = match[0].length - match[1].length;
                const startPos = document.positionAt(match.index + startIndex - 1);
                const endPos = document.positionAt(match.index + startIndex + match[1].length - 1);

                let targetPath = match[1];
                if (!path.isAbsolute(targetPath)) {
                    const dirName = path.dirname(document.uri.fsPath);
                    targetPath = path.resolve(dirName, targetPath);
                }
                results.push({
                    originSelectionRange: new vscode.Range(startPos, endPos),
                    targetUri: vscode.Uri.file(targetPath),
                    targetRange: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 1))
                })
            }
        }

        return results;
    }
    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        const results = new Array<vscode.DocumentLink>();
        const text = document.getText();
        const locator = new IncludesLocator(text);
        const matches = locator.GetMatches();
        if (matches.length > 0) {

            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                const startIndex = match[0].length - match[1].length;
                const startPos = document.positionAt(match.index + startIndex - 1);
                const endPos = document.positionAt(match.index + startIndex + match[1].length - 1);

                let targetPath = match[1];
                if (!path.isAbsolute(targetPath)) {
                    const dirName = path.dirname(document.uri.fsPath);
                    targetPath = path.resolve(dirName, targetPath);
                }
                results.push({
                    range: new vscode.Range(startPos, endPos),
                    target: vscode.Uri.file(targetPath)
                })
            }
        }

        return results;
    }
}