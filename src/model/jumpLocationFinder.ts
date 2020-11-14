import * as vscode from 'vscode';
import * as path from 'path';
import { FileIndexer } from './fileIndexer';

export class JumpLocationFinder {
    constructor(private indexer: FileIndexer) {

    }

    GetLocations(preselectValue: string) {
        const results: Array<vscode.QuickPickItem> = new Array();
        if (this.indexer.busy)
            return results;
        const index = this.indexer.index;
        const indexCount = index.length;

        for (let i = 0; i < indexCount; i++) {
            const fileInfo = index[i];
            const label = path.basename(fileInfo.uri.path);
            const picked = label == preselectValue;
            results.push({ label, detail: fileInfo.uri.fsPath, picked });
        }

        return results;
    }

}