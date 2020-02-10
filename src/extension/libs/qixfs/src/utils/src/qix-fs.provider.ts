import * as vscode from "vscode";
import { QixRouter } from "./router";
import { QixFsDirectory, QixFsFile } from "../../entry";
import { posix } from "path";


// der brauch ne Map -> URI -> Connection

/** should use enum for this ? */
export namespace QixFsCommands {
    export const DELETE_FILE_COMMAND = `vscodeQlik.qixfs.deleteFileCommand`;
}

/** 
 * Qix File System
 * 
 * soll das immer mit enigma arbeiten ?
 */
export class QixFSProvider implements vscode.FileSystemProvider {

    public readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]>;

    private emitter: vscode.EventEmitter<vscode.FileChangeEvent[]>;

    /**
     * construct new Qix file system
     */
    public constructor() {
        this.emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
        this.onDidChangeFile = this.emitter.event;
    }

    watch(_resource: vscode.Uri): vscode.Disposable {
        return new vscode.Disposable(() => void 0);
    }

    /**
     * return file or directory stats
     */
    stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat> {
        /** find entry */
        const route = QixRouter.find(uri);
        if(route?.entry) {
            return route.entry.stat(uri, route.params);
        }
        throw vscode.FileSystemError.FileNotFound();
    }

    /**
     * read directory
     */
    async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
        const route = QixRouter.find(uri);
        if (route?.entry.type === vscode.FileType.Directory) {
            return (route.entry as QixFsDirectory).readDirectory(uri, route.params);
        }
        throw vscode.FileSystemError.FileNotFound();
    }

    /**
     * create new directory
     */
    async createDirectory(uri: vscode.Uri, silent = false): Promise<void> {
        const parentUri = uri.with({path: posix.dirname(uri.path)});
        const name      = posix.basename(uri.path);

        const route = QixRouter.find(parentUri);
        if (route?.entry.type === vscode.FileType.Directory) {
            return await (route.entry as QixFsDirectory).createDirectory(uri, name, route.params);
        }

        throw vscode.FileSystemError.FileNotADirectory();
    }

    /**
     * read file
     */
    async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        const route = QixRouter.find(uri);
        if (route?.entry.type === vscode.FileType.File) {
            return (route.entry as QixFsFile).readFile(uri, route.params);
        }
        throw vscode.FileSystemError.FileNotFound();
    }

    /**
     * write file
     */
    async writeFile(uri: vscode.Uri, content: Uint8Array): Promise<void> {
        const route = QixRouter.find(uri);
        if (route?.entry.type === vscode.FileType.File) {
            return (route.entry as QixFsFile).writeFile(uri, content, route.params);
        }
        throw vscode.FileSystemError.FileNotFound();
    }

    /**
     * delete file or directory
     */
    public async delete(uri: vscode.Uri): Promise<void> {

        const parentUri = uri.with({path: posix.dirname(uri.path)});
        const name      = posix.basename(uri.path);

        const route = QixRouter.find(parentUri);
        if (route?.entry.type === vscode.FileType.Directory) {
            return await (route.entry as QixFsDirectory).delete(uri, name, route.params);
        }

        throw vscode.FileSystemError.FileNotADirectory();
    }

    rename(oldUri: vscode.Uri, newUri: vscode.Uri): void | Thenable<void> {
        const route = QixRouter.find(oldUri);
        if (route?.entry.type === vscode.FileType.File) {
            return (route.entry as QixFsFile).rename(oldUri, posix.basename(newUri.path), route.params);
        }
        throw vscode.FileSystemError.FileNotFound();
    }
}