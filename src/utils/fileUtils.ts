import * as path from 'path';
import * as fs from 'fs';

export class FileUtils {

    /**
     * CheckIfFileExist
     */
    public static CheckIfFileExist(filePath: string) {
        return fs.existsSync(filePath)
    }

    public static GetAbsolutePath(targetPath: string, baseFilePath: string): string {
        if (!path.isAbsolute(targetPath))
            targetPath = this.ResolvePath(baseFilePath, targetPath);
        return targetPath;
    }


    /**
     * ResolvePath
     */
    public static ResolvePath(basePath: string, targetPath: string) {
        const dirName = path.dirname(basePath);
        return path.resolve(dirName, targetPath);
    }

    public static GetFileName(filePath: string) {
        let fileName = filePath;
        const pos = fileName.lastIndexOf(path.sep);
        if (pos != -1)
            fileName = fileName.substring(pos);
        return fileName;
    }

    /**
     * TranslateLocation
     */
    public static TranslateLocation(oldPath: string, newFolderPath: string) {
        const fileName = this.GetFileName(oldPath);
        const filePath = path.join(newFolderPath, fileName);
        return filePath;
    }
}