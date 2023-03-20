import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';

import { OSUtil } from '@arcsine/screen-recorder/lib/os';

import { Recorder } from './recorder';
import { RecordingStatus } from './status';

import { Util } from './util';
import { RecordingOptions } from './types';
import { Config } from './config';
import { logger } from './logger';
import { CodeChangeRecorder } from './codeChangeRecorder';
import axios from 'axios';
import { Artifact } from './models';



export async function activate(context: vscode.ExtensionContext) {

  Util.context = context;

  const recorder = new Recorder();
  const status = new RecordingStatus();
  const codeChangeRecorder = new CodeChangeRecorder();


  async function stop() {
    await new Promise(resolve => setTimeout(resolve, 125)); // Allows for click to be handled properly
    if (status.counting) {
      status.stop();
    } else if (recorder.active) {
      status.stopping();
      recorder.stop();
    } else if (recorder.running) {
      status.stop();
      recorder.stop(true);
    }
  }

  async function initRecording() {
    if (!(await Config.getFFmpegBinary())) {
      vscode.window.showWarningMessage('FFmpeg binary location not defined, cannot record unless path is set.');
      return;
    }

    if (!(await Config.getDestFolder())) {
      vscode.window.showWarningMessage('Cannot record video without setting destination folder');
      return;
    }

    const livecodeToken = await Config.getLivecodeToken();
    if (!livecodeToken) {
      vscode.window.showWarningMessage('Cannot record without logging in to Livecode');
      return;
    }
    

    try {
      await status.countDown();
    } catch (err) {
      vscode.window.showWarningMessage('Recording cancelled');
      return;
    }

    return true;
  }

  async function createLiveCode(name?: string) : 
  Promise<{ livecodeId: string; remote_uri: string; autocommit_branch: string; livecodeName: string; }> {
    let livecodeId: string, remote_uri: string, autocommit_branch: string , livecodeName: string;
    const url = `${Config.getLivecodeBEUrl()}/livecodes/`;    
    const payload = name? {"name": name} : {};
    await axios
      .post(url, payload)
      .then(response => {
        if (response.status === 200) {                  
          livecodeId = response.data.id;
          livecodeName = response.data.id;
          remote_uri = response.data.git.remote_uri;
          autocommit_branch = response.data.git.autocommit_branch;
          return {livecodeId: livecodeId, remote_uri: remote_uri, autocommit_branch: autocommit_branch, livecodeName: livecodeName};
        }
      })

    throw new Error('Failed to create Livecode');            
  }

  async function finalize(artifacts: Artifact[]) {
    const givenLivecodeName = await vscode.window.showInputBox({ placeHolder: 'Livecode Name' });
    const { livecodeId, remote_uri, autocommit_branch, livecodeName } = await createLiveCode(givenLivecodeName);
    // commitRecorder.push(autocommit_branch, remote_uri);
    // artifactUploader.upload(livecodeId, livecodeName, artifacts);
  }

  async function record(opts: Partial<RecordingOptions> = {}) {
    try {
      if (!(await initRecording())) {
        return;
      }

      const run = await recorder.run(opts);
      status.start();
      codeChangeRecorder.start();


      const { file } = await run.output();
      status.stop();
      codeChangeRecorder.stop();

      const choice0 = await vscode.window.showInformationMessage(`Livecode Recording Finished Succesfully`, 'OK', 'Delete');
      switch (choice0) {
        case 'OK': {

          break;
        };
        case 'Delete': {
          await fs.unlink(file);
          break;
        };
      }


      const choice = await vscode.window.showInformationMessage(`Session output ${file}`, 'View', 'Copy', 'Delete', 'Folder');
      switch (choice) {
        case 'View': await OSUtil.openFile(file); break;
        case 'Folder': await OSUtil.openFile(path.dirname(file)); break;
        case 'Copy': vscode.env.clipboard.writeText(file); break;
        case 'Delete': await fs.unlink(file); break;
      }
    } catch (e: any) {
      vscode.window.showErrorMessage(e.message);
      if (!recorder.active) {
        status.stop();
      }
    }
  }

  async function initializeLiveShare() {
    if (Config.getAutoRecordLiveShare()) {
      const vsls = await import('vsls');
      const liveShare = await vsls.getApi();

      if (liveShare) {
        liveShare.onDidChangeSession((e) => {
          if (e.session.role === vsls.Role.None) {
            stop();
          } else {
            record();
          }
        });
      }
    }
  }

  vscode.commands.registerCommand('chronicler.stop', stop);
  vscode.commands.registerCommand('chronicler.record', () => record());
  vscode.commands.registerCommand('chronicler.recordGif', () => record({ animatedGif: true }));
  vscode.commands.registerCommand('chronicler.recordWithAudio', () => record({ audio: true }));
  vscode.commands.registerCommand('chronicler.recordWithDuration', async () => {
    const time = await vscode.window.showInputBox({
      prompt: 'Duration of recording (time in seconds)',
      placeHolder: '120'
    });
    if (time) {
      record({ duration: parseInt(time, 10) });
    }
  });

  context.subscriptions.push(recorder, status);
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => codeChangeRecorder.handleCodeChange(event)));


  initializeLiveShare();
}