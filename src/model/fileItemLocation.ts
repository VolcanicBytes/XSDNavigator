import * as vscode from 'vscode';
import { FileItemKind } from '../constants';

export class FileItemLocation implements vscode.LocationLink {

    range: vscode.Range;
    currentUri: vscode.Uri;
    originSelectionRange?: vscode.Range | undefined;
    targetSelectionRange?: vscode.Range | undefined;
    resolved: boolean;

    constructor(public name: string, public kind: FileItemKind, public targetUri: vscode.Uri, public targetRange: vscode.Range) {
        this.currentUri = targetUri;
        this.originSelectionRange = this.range = targetRange;
        this.resolved = false;
    }

    TryResolve(locations: FileItemLocation[], token: vscode.CancellationToken) {
        const locationsCount = locations.length;
        for (let i = 0; i < locationsCount; i++) {
            const location = locations[i];
            if (location.name == this.name) {
                this.targetUri = location.targetUri;
                this.targetRange = location.range;
                this.resolved = true;
            }
            else if (token.isCancellationRequested)
                return;
        }
    }

}