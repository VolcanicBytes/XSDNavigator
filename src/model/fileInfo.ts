import * as vscode from 'vscode';
import { NameLocator } from '../locators/nameLocator';
import { FileItemLocation } from './fileItemLocation';
import { TypeLocator } from '../locators/typeLocator';
import { FileItemKind } from '../constants';
import { IncludesLocator } from '../locators/includesLocator';
import { HiddenFileUtils } from '../utils/hiddenFileUtils';
import { Downloader } from '../utils/downloader';
import { FileUtils } from '../utils/fileUtils';

export class FileInfo {
    static diag: vscode.DiagnosticCollection;
    static diagnosticList: vscode.Diagnostic[] = [];
    private externalRefs: Array<FileItemLocation>;
    private typeLocations: Array<FileItemLocation>;
    private nameLocations: Array<FileItemLocation>;
    spaceCount = 1;
    schemeLocationLength = 24;

    constructor(public uri: vscode.Uri, public document: vscode.TextDocument, public text: string) {
        this.externalRefs = new Array();
        this.typeLocations = new Array();
        this.nameLocations = new Array();

        this.Parse(document);
        FileInfo.diag = vscode.languages.createDiagnosticCollection('XSD-Navigator');
    }
    public Parse(document: vscode.TextDocument) {
        this.document = document;
        this.parseTypes(document);
        this.parseNames(document);
        this.parseExternalRefs(document, this.externalRefs);
    }

    private parseExternalRefs(document: vscode.TextDocument, externalRefs: Array<FileItemLocation>) {
        const locator = new IncludesLocator(this.text);
        const locationList = locator.GetMatches();
        for (let locationIndex = 0; locationIndex < locationList.length; locationIndex++) {
            const location = locationList[locationIndex];
            const fullElement = location[1];

            const subElements = fullElement.split(' ');
            const subElementsCount = subElements.length;

            let offset = this.schemeLocationLength;
            for (let index = 0; index < subElementsCount; index++) {
                let elementPath = subElements[index];
                const startIndex = location.index + offset;
                const startPos = document.positionAt(startIndex);
                const endPos = document.positionAt(startIndex + elementPath.length);
                const uri = vscode.Uri.parse(elementPath);
                const scheme = uri.scheme;
                if (scheme != 'file') {
                    const dest = HiddenFileUtils.MakeSureHiddenFolderExists(document);
                    const filePath = FileUtils.TranslateLocation(uri.path, dest);
                    if (FileUtils.CheckIfFileExist(filePath)) {
                        FileInfo.appendLocation(elementPath, filePath, startPos, endPos, externalRefs);
                    }
                    else {
                        Downloader.downloadFile(elementPath, filePath, startPos, endPos, document.uri, elementPath, externalRefs);
                    }
                }
                else {
                    const targetPath = FileUtils.GetAbsolutePath(elementPath, document.uri.fsPath);
                    FileInfo.appendLocation(elementPath, targetPath, startPos, endPos, externalRefs);
                }
                offset += elementPath.length + this.spaceCount;
            }
        }

    }

    public static createDiagnoseResult(message: string, range: vscode.Range, severity: vscode.DiagnosticSeverity = vscode.DiagnosticSeverity.Information): vscode.Diagnostic {
        let diag = new vscode.Diagnostic(range, message);
        diag.severity = severity;
        return diag;
    }

    public static appendLocation(element: string, filePath: string, startPos: vscode.Position, endPos: vscode.Position, externalRefs: Array<FileItemLocation>) {
        const location = new FileItemLocation(element, FileItemKind.File, vscode.Uri.file(filePath), new vscode.Range(startPos, endPos));
        location.resolved = true;
        location.originSelectionRange = new vscode.Range(startPos, endPos);
        location.targetUri = vscode.Uri.file(filePath);
        location.targetRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 1));
        externalRefs.push(location);
    }

    private parseNames(document: vscode.TextDocument) {
        const locator = new NameLocator(this.text);
        const locations = locator.GetMatches();
        if (locations.length > 0) {
            for (let i = 0; i < locations.length; i++) {
                const match = locations[i];
                const element = match[1];
                const startIndex = match[0].length - element.length;
                const startPos = document.positionAt(match.index + startIndex - 1);
                const endPos = document.positionAt(match.index + startIndex + element.length - 1);

                this.nameLocations.push(new FileItemLocation(element, FileItemKind.Name, document.uri, new vscode.Range(startPos, endPos)));
            }
        }
    }
    private parseTypes(document: vscode.TextDocument) {
        const locator = new TypeLocator(this.text);
        const locations = locator.GetMatches();
        if (locations.length > 0) {
            for (let i = 0; i < locations.length; i++) {
                const match = locations[i];
                const element = match[1];
                const startIndex = match[0].length - element.length;
                const startPos = document.positionAt(match.index + startIndex - 1);
                const endPos = document.positionAt(match.index + startIndex + element.length - 1);

                this.typeLocations.push(new FileItemLocation(element, FileItemKind.Type, document.uri, new vscode.Range(startPos, endPos)));
            }
        }
    }

    public TryGetHoveredType(position: vscode.Position, token: vscode.CancellationToken) {
        const locationList = this.typeLocations;
        const LocationCount = locationList.length;
        for (let i = 0; i < LocationCount; i++) {
            const typeElement = locationList[i];
            if (token.isCancellationRequested)
                return;
            if (typeElement.range.contains(position)) {
                if (!typeElement.resolved) {
                    typeElement.TryResolve(this.nameLocations, token);
                }
                return typeElement;
            }
        }
        return undefined;
    }

    public TryGetHoveredExternalRef(position: vscode.Position, token: vscode.CancellationToken) {
        const locationList = this.externalRefs;
        const LocationCount = locationList.length;
        for (let i = 0; i < LocationCount; i++) {
            const refElement = locationList[i];
            if (token.isCancellationRequested)
                return;
            if (refElement.range.contains(position)) {
                if (!refElement.resolved) {
                    refElement.TryResolve(this.nameLocations, token);
                }
                return refElement;
            }
        }
        return undefined;
    }

    public TryResolveWithNameElements(typeElement: FileItemLocation, token: vscode.CancellationToken) {
        typeElement.TryResolve(this.nameLocations, token);
    }
    public GetExternalRefs() {
        return this.externalRefs;
    }
}