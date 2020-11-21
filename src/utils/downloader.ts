import * as vscode from 'vscode';
import * as fs from 'fs';
import { FileInfo } from '../model/fileInfo';
import * as http from 'http';
import * as https from 'https';
import { FileItemLocation } from '../model/fileItemLocation';

export class Downloader {

    public static downloadFile(targetPath: string, filePath: string, startPos: vscode.Position, endPos: vscode.Position, uri: vscode.Uri, fullElement: string, externalRefs: Array<FileItemLocation>) {
        const asker = targetPath.startsWith('https:') ? https : http;
        let request = asker.get(targetPath, function (response) {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(filePath);
                response.pipe(file);
            } else {
                FileInfo.diagnosticList.push(FileInfo.createDiagnoseResult(`Cannot download ${targetPath}`, new vscode.Range(startPos, endPos), vscode.DiagnosticSeverity.Warning));
                FileInfo.diag.set(uri, FileInfo.diagnosticList);
            }
            response.on("end", function () {
                FileInfo.appendLocation(fullElement, filePath, startPos, endPos, externalRefs);
            });

            request.setTimeout(1000, function () {
                request.abort();
            });

        }).on('error', function (e) {
            FileInfo.diagnosticList.push(FileInfo.createDiagnoseResult(`Cannot download ${targetPath}`, new vscode.Range(startPos, endPos), vscode.DiagnosticSeverity.Warning));
            FileInfo.diag.set(uri, FileInfo.diagnosticList);
        });
    }
}