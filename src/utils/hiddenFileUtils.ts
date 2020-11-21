import * as vscode from 'vscode';
import * as hidefile from 'hidefile';
import * as path from 'path';
import * as fs from 'fs';

export class HiddenFileUtils {

    public static MakeSureHiddenFolderExists(document: vscode.TextDocument) {
        let dest = HiddenFileUtils.GetHiddenFolderPath(document.uri.fsPath);
        if (!fs.existsSync(dest)) {
            let hiddenLocalDest = HiddenFileUtils.GetHiddenFileName(dest);
            if (!fs.existsSync(hiddenLocalDest)) {
                fs.mkdirSync(dest);
                dest = hidefile.hideSync(dest).toString();
            }
            else {
                dest = hiddenLocalDest;
            }
        }
        return dest;
    }
    
    /**
     * GetHiddenFolderPath
     */
    public static GetHiddenFolderPath(visibleFileLocation: string) {
        const folderName = '_external';
        return path.join(path.dirname(visibleFileLocation), folderName);
    }

    /**
     * GetHiddenFileName
     */
    public static GetHiddenFileName(visibleFileName: string) {
        return this.stringifyPath(this.parsePath(visibleFileName), true);
    }

    private static stringifyPath(pathObj: any, shouldHavePrefix: boolean) {
        let result = "";

        if (pathObj.basename !== "") {
            if (shouldHavePrefix && !pathObj.prefixed) {
                const prefix = ".";
                result = prefix + pathObj.basename;
            }
            else if (!shouldHavePrefix && pathObj.prefixed) {
                result = pathObj.basename.slice(1);
            }
            else {
                result = pathObj.basename;
            }
        }

        if (pathObj.dirname !== "") {
            if (result !== "" && pathObj.dirname !== "/" && pathObj.dirname[pathObj.dirname.length - 1] !== "/") {
                result = pathObj.dirname + "/" + result;
            }
            else {
                result = pathObj.dirname + result;
            }
        }

        return result;
    };

    private static parsePath(thePath: string) {
        const basename = path.basename(thePath);
        let dirname = path.dirname(thePath);

        // Omit current dir marker
        if (dirname === ".") dirname = "";

        return {
            basename: basename,
            dirname: dirname,
            prefixed: basename[0] === thePath
        };
    };
}