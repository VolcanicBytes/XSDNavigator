import * as vscode from 'vscode';
import * as path from 'path';
import { Constants } from '../constants';

export class DocumentSelectorComparer {

    public static CheckIfMatch(document: vscode.TextDocument, selector: vscode.DocumentFilter): boolean {

        const schemesAreEquals: boolean = document.uri.scheme == selector.scheme!;
        const languagesAreEquals: boolean = document.languageId == selector.language!;
        const extensionsAreEquals: boolean = path.extname(document.uri.fsPath) == Constants.Extension;
        return schemesAreEquals && languagesAreEquals && extensionsAreEquals;
    }

}
