import * as vscode from 'vscode';
import { FileInfo } from './fileInfo';
import { Constants } from '../constants';
import { DocumentSelectorComparer } from '../utils/documentSelectorComparer';

export class FileIndexer {

    public busy: boolean = false;
    public index: Array<FileInfo> = new Array();

    constructor() {

    }

    public async RebuildIndex() {
        const self = this;
        FileInfo.diagnosticList = [];
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'rebuilding xsd index...' }, async (progress) => {
            progress.report({ message: 'checking current file...', increment: 20 });
            const editor = vscode.window.activeTextEditor;
            if (!editor || !editor.document || !DocumentSelectorComparer.CheckIfMatch(editor.document, Constants.Selector)) {
                progress.report({ message: 'no xsd detected', increment: 90 });
                return;
            }

            progress.report({ message: 'clearing previous index...' });
            self.ClearIndex();
            self.busy = true;
            progress.report({ message: 'scanning documents', increment: 40 });
            await self.recursiveScan(editor.document);
            progress.report({ message: 'scanning completed', increment: 90 });
            self.busy = false;
        });
    }

    private async recursiveScan(document: vscode.TextDocument) {
        if (document.languageId == Constants.LanguageId && document.uri.scheme == Constants.Scheme) {
            if (this.index.find(x => x.uri == document.uri))
                return;
            const text = document.getText();
            const fileInfo = new FileInfo(document.uri, document, text);
            this.index.push(fileInfo);

            const refs = fileInfo.GetExternalRefs();
            const refsCount = refs.length;
            for (let i = 0; i < refsCount; i++) {
                const ref = refs[i];
                const doc = await vscode.workspace.openTextDocument(ref.targetUri);
                await this.recursiveScan(doc);
            }

        }
    }

    TryRebuild(document: vscode.TextDocument) {
        const uri = document.uri;
        const fileInfo = this.index.find(x => x.uri == uri);
        if (!fileInfo)
            this.RebuildIndex();
    }

    TryUpdate(document: vscode.TextDocument) {
        const uri = document.uri;
        const fileInfo = this.index.find(x => x.uri == uri);
        if (fileInfo)
            fileInfo.Parse(document);
        else
            this.RebuildIndex();
    }


    /**
     * ClearIndex
     */
    public ClearIndex() {
        this.index = new Array();
    }
}