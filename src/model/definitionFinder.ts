import * as vscode from 'vscode';
import { FileIndexer } from './fileIndexer';
import { FileItemLocation } from './fileItemLocation';

export class DefinitionFinder {
    constructor(public indexer: FileIndexer) {

    }

    /**
     * Process
     */
    public Find(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
        const results = new Array<vscode.LocationLink>();
        if (this.indexer.busy || token.isCancellationRequested)
            return results;
        const fileInfo = this.getFileInfo(document, token);
        if (!fileInfo || token.isCancellationRequested)
            return results;

        const typeElement = fileInfo.TryGetHoveredType(position, token);
        if (typeElement) {
            if (!typeElement.resolved)
                this.tryResolve(typeElement, fileInfo.uri, token);

            if (typeElement.resolved)
                results.push(typeElement);
        }
        else {
            const externalRefElement = fileInfo.TryGetHoveredExternalRef(position, token);
            if (externalRefElement) {
                results.push(externalRefElement);
            }
            else {
                const baseElement = fileInfo.TryGetHoveredBase(position, token);
                if (baseElement) {
                    if (!baseElement.resolved)
                        this.tryResolve(baseElement, fileInfo.uri, token);

                    if (baseElement.resolved)
                        results.push(baseElement);
                }

            }
        }

        return results;
    }

    public getFileInfo(document: vscode.TextDocument, token: vscode.CancellationToken) {
        const index = this.indexer.index;
        const indexCount = index.length;

        for (let i = 0; i < indexCount && !token.isCancellationRequested; i++) {
            const fileInfo = index[i];
            if (fileInfo.uri == document.uri)
                return fileInfo;
        }

        return undefined;
    }

    public tryResolve(typeElement: FileItemLocation, uriToSkip: vscode.Uri, token: vscode.CancellationToken) {
        const index = this.indexer.index;
        const indexCount = index.length;

        for (let i = 0; i < indexCount && !token.isCancellationRequested; i++) {
            const fileInfo = index[i];
            if (fileInfo.uri == uriToSkip)
                continue;
            fileInfo.TryResolveWithNameElements(typeElement, token);
        }

        return undefined;
    }
}