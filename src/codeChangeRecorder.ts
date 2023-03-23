import * as vscode from 'vscode';
import { Config } from './config';
import { v4 as uuidv4 } from 'uuid';
import { ArtifactType, CodeChangeType } from './enums';
import { getChangeTypeInternal, getChangeType, ChangeTypeInternalInput, ChangeTypeInternalInputResult} from './getChangeType';
import { Artifact, CodeChangeAttributes } from './models';
import { logger } from './logger';
import { createObjectCsvWriter } from 'csv-writer';



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
        { id: 'textLength', title: 'textLength' },
        { id: 'type', title: 'type' },
        { id: 'startLine', title: 'startLine' },
        { id: 'endLine', title: 'endLine' }
      ];

      const path = `${livecode_id}.cca.csv`;

      const csvWriter = createObjectCsvWriter({
        path: path,
        header: header
      });

      await csvWriter.writeRecords(this.changeAttributesList);
      
      return new Artifact(ArtifactType.codeChangesAttributes, path, path);
  }

  handleCodeChange(event: vscode.TextDocumentChangeEvent) { //TODO - add file path
    if (this.isRecording) {
        event.contentChanges.forEach(change => {		
            // logger.debug(`Change`);			
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
            const codeChangeAttributes  = new CodeChangeAttributes(
                timestamp, 
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