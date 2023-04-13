import * as vscode from 'vscode';
import { Config } from './config';
import { v4 as uuidv4 } from 'uuid';
import { ArtifactType, CodeChangeType } from './enums';
import { getChangeTypeInternal, getChangeType, ChangeTypeInternalInput, ChangeTypeInternalInputResult} from './getChangeType';
import { Artifact, CodeChangeAttributes } from './models';
import { logger } from './logger';
import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import * as os from 'os';
import path = require('path');
import { Util } from './util';


export class CodeChangeRecorder {
  private isRecording = false;
  private changeAttributesList: any[] = [];

  init() {
    this.changeAttributesList = [];
  }

  start() {    
    this.isRecording = true;      
  }

  stop() {    
    this.isRecording = false;
  }

  async output(livecode_id: string) : Promise<Artifact>{
    const header = [      
        { id: 'time', title: 'time' },
        { id: 'file', title: 'file' },
        { id: 'textLength', title: 'textLength' },
        { id: 'type', title: 'type' },
        { id: 'startLine', title: 'startLine' },
        { id: 'endLine', title: 'endLine' }
      ];

      const filename = `${livecode_id}.cca.csv`;
      const outputPath = path.join(os.tmpdir(), filename);      

      const csvWriter = createObjectCsvWriter({
        path: outputPath,
        header: header
      });

      await csvWriter.writeRecords(this.changeAttributesList);
      
      return new Artifact(ArtifactType.codeChangesAttributes, outputPath, filename);
  }

  

  handleCodeChange(event: vscode.TextDocumentChangeEvent) { //TODO - add file path
    if (this.isRecording) {
        if (event.document.fileName.endsWith('.git')) return;

        event.contentChanges.forEach(change => {		            
            const numEventChanges = event.contentChanges.length;
            const eventReason = event.reason?.toString();
            const rangeLength = change.rangeLength;
            const text = change.text;
            const changeType : CodeChangeType = getChangeTypeInternal(
                numEventChanges, eventReason, rangeLength, text);
            // const changeTypeResult : ChangeTypeInternalInputResult = 
            //     new ChangeTypeInternalInputResult(numEventChanges, eventReason, rangeLength, text, changeType);
            // changesList.push(changeTypeResult);

            //store data for code changes time series analysis
            //codeChangeAttributes
            const uuid = uuidv4();
            const timestamp = new Date().getTime();					
            const relPath = path.relative(
              Util.getWorkspacePath() || 
              Util.throwsExression("unsopputed state: code change when no workspace")
              , event.document.fileName);
            const codeChangeAttributes  = new CodeChangeAttributes(
                timestamp, 
                relPath,
                text.length,
                changeType,
                change.range.start.line,
                change.range.end.line);
            
            this.changeAttributesList.push(codeChangeAttributes);
        }
    );
    }
  }
}