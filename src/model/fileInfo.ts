import * as vscode from 'vscode';
import * as path from 'path';
import { NameLocator } from '../locators/nameLocator';
import { FileItemLocation } from './fileItemLocation';
import { TypeLocator } from '../locators/typeLocator';
import { FileItemKind } from '../constants';
import { IncludesLocator } from '../locators/includesLocator';

export class FileInfo {

    private externalRefs: Array<FileItemLocation>;
    private typeLocations: Array<FileItemLocation>;
    private nameLocations: Array<FileItemLocation>;
    constructor(public uri: vscode.Uri, public document: vscode.TextDocument, public text: string) {
        this.externalRefs = new Array();
        this.typeLocations = new Array();
        this.nameLocations = new Array();

        this.Parse(document);
    }
    public Parse(document: vscode.TextDocument) {
        this.document = document;
        this.parseTypes(document);
        this.parseNames(document);
        this.parseExternalRefs(document);
    }

    private parseExternalRefs(document: vscode.TextDocument) {
        const locator = new IncludesLocator(this.text);
        const locations = locator.GetMatches();
        if (locations.length > 0) {
            for (let i = 0; i < locations.length; i++) {
                const match = locations[i];
                const element = match[1];
                let targetPath = element;
                const startIndex = match[0].length - targetPath.length;
                const startPos = document.positionAt(match.index + startIndex - 1);
                const endPos = document.positionAt(match.index + startIndex + targetPath.length - 1);

                if (!path.isAbsolute(targetPath)) {
                    const dirName = path.dirname(document.uri.fsPath);
                    targetPath = path.resolve(dirName, targetPath);
                }


                const location = new FileItemLocation(element, FileItemKind.File, vscode.Uri.file(targetPath), new vscode.Range(startPos, endPos));
                location.resolved = true;
                location.originSelectionRange = new vscode.Range(startPos, endPos);
                location.targetUri = vscode.Uri.file(targetPath);
                location.targetRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 1));
                this.externalRefs.push(
                    location
                    //     {
                    //     originSelectionRange: new vscode.Range(startPos, endPos),
                    //     targetUri: vscode.Uri.file(targetPath),
                    //     targetRange: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 1))
                    // }
                )
            }
        }

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