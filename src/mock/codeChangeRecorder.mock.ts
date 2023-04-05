import * as vscode from 'vscode';
import { Config } from '../config';
import { v4 as uuidv4 } from 'uuid';
import { ArtifactType, CodeChangeType } from '../enums';
import { getChangeTypeInternal, getChangeType, ChangeTypeInternalInput, ChangeTypeInternalInputResult} from '../getChangeType';
import { Artifact, CodeChangeAttributes } from '../models';
import { logger } from '../logger';
import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import * as os from 'os';
import path = require('path');
import { Util } from '../util';


export class CodeChangeRecorder {

  init() {
  }

  start() {    
  }

  stop() {    
  }

  async output(livecode_id: string) : Promise<Artifact>{    
    const filename = `${livecode_id}.cca.csv`;
    const outputPath = path.join(os.tmpdir(), filename);      

    Util.execShell('cp', [path.join('src', 'test', 'resources', '1234.cca.csv'), outputPath])
    
    return new Artifact(ArtifactType.codeChangesAttributes, outputPath, filename);
  }

  handleCodeChange(event: vscode.TextDocumentChangeEvent) {     
  }
}