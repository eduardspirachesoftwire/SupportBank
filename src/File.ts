import * as fs from "fs";
import {MyJSONObj} from "./main";

export class File {
    private _fileType: string;
    readonly _filePath: string;
    private _fileContents: string;
    private _fileLines: string[];
    private _fileJsonArray: MyJSONObj[];

    constructor(filePath: string) {
        this._fileType = "";
        this._filePath = filePath;
        this._fileContents = "";
        this._fileLines = [];
        this._fileJsonArray = [];
    }

    public readFileContents(): void {
        this._fileContents = fs.readFileSync(this._filePath, 'utf-8');
    }

    public parseFileCSV(): void {
        this._fileLines = this._fileContents.split('\n');
        this._fileLines.shift();
    }

    public parseFileJSON(): void {
        this._fileJsonArray = JSON.parse(this._fileContents) as MyJSONObj[];
    }

    public determineFileType(): void {
        let path: string[] = this._filePath.split(".");
        this._fileType = path[path.length - 1];
    }

    get filePath(): string {
        return this._filePath;
    }

    get fileType(): string {
        return this._fileType;
    }

    get fileJsonArray(): MyJSONObj[] {
        return this._fileJsonArray;
    }

    get fileLines(): string[] {
        return this._fileLines;
    }
}