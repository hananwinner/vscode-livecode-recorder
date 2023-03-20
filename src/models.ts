// import * as vscode from 'vscode';
import { getChangeType } from './getChangeType';
import { CodeChangeType } from './enums';


// export class CodeChangeEvent {
// 	timestamp: number;
// 	filename: string | undefined;
// 	textLength: number;
//     changeType: CodeChangeType;
//     groupNumOfChanges: number;
//     startLine: number;
//     _numLines: number;
//     _rangeLength: number;
//     _text: string;

// 	constructor(timestamp: number, event: vscode.TextDocumentChangeEvent, 
// 		change: vscode.TextDocumentContentChangeEvent) {
// 		this.timestamp = timestamp;
// 		this.filename = event.document.uri.toString().split(/[\\/]/).pop();
// 		this.textLength = change.text.length;
// 		this.changeType = getChangeType(event, change);
//         this.groupNumOfChanges = event.contentChanges.length;
//         this.startLine = change.range.start.line;
//         this._numLines = change.text.split('\n').length;
//         this._rangeLength = change.rangeLength;
//         this._text = change.text;
        
// 	}
              
// }

export class CodeChangeAttributes {
    constructor(public time: number,
        public textLength: number,
        public type : string,
        public startLine : number,
        public endLine : number) {}
}

export class Artifact {
    constructor(
        public type: string, 
        public path: string,
        public filename: string
    ) {}
}

export class ArtifactUploadProperties {
    constructor(
    public destUrl : string,
    public fields: Object) {}
}