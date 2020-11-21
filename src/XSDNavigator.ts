import * as vscode from 'vscode';
import * as path from 'path';
import { DefinitionFinder } from './model/definitionFinder';
import { FileIndexer } from './model/fileIndexer';
import { JumpLocationFinder } from './model/jumpLocationFinder';

export class XSDNavigator implements vscode.DefinitionProvider {

    private indexer: FileIndexer = new FileIndexer();
    private definitionFinder: DefinitionFinder;

    constructor() {
        this.indexer.RebuildIndex();
        this.definitionFinder = new DefinitionFinder(this.indexer);
    }

    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
        return this.definitionFinder.Find(document, position, token);
    }


    public jumpTo() {
        const finder = new JumpLocationFinder(this.indexer);
        let currentDocument: vscode.TextDocument | undefined = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : undefined;

        const preselectValue = path.basename(currentDocument?.uri.fsPath ?? '');
        const locations = finder.GetLocations(preselectValue);
        const picker = vscode.window.createQuickPick();
        picker.title = "Jump To...";
        picker.placeholder = "Select a file to open";
        picker.items = locations;

        picker.onDidChangeActive(async (e) => {
            if (!e || e.length == 0)
                return;
            const item = e[0];
            const uri = vscode.Uri.file(item.detail!);
            const doc = await vscode.workspace.openTextDocument(uri);
            vscode.window.showTextDocument(doc, vscode.ViewColumn.Active, true);
        })
        picker.onDidAccept(async () => {
            if (!picker.selectedItems || picker.selectedItems.length == 0)
                return;
            const item = picker.selectedItems[0];
            const uri = vscode.Uri.file(item.detail!);
            const doc = await vscode.workspace.openTextDocument(uri);
            const textEditor = await vscode.window.showTextDocument(doc);
            if (textEditor)
                currentDocument = textEditor.document;
        });
        picker.onDidHide(async () => {
            if (currentDocument)
                await vscode.window.showTextDocument(currentDocument);
            else
                await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        });

        picker.show();
    }


    rebuild(textEditor: vscode.TextEditor | undefined, force: boolean = false) {
        if (!textEditor)
            return;

        if (force)
            this.indexer.RebuildIndex();
        else
            this.indexer.TryRebuild(textEditor.document);
    }

    update(document: vscode.TextDocument) {
        this.indexer.TryUpdate(document);
    }
}