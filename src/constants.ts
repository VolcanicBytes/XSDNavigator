import * as vscode from 'vscode';

export module Constants {

    export const JumpToCommand: string = 'xsd-navigator.jumpTo';
    export const Context: string = 'xsdNavigatorActive';

    export const Scheme: string = 'file';
    export const LanguageId: string = 'xml';
    export const Extension: string = '.xsd';

    export const Glob: string = `**/*${Constants.Extension}`;
    export const Selector: vscode.DocumentFilter = { language: Constants.LanguageId, scheme: Constants.Scheme, pattern: Constants.Glob };
}

export enum FileItemKind {
    Name,
    Type,
    File,
    Base
}