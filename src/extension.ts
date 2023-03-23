import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';

import { Recorder } from './recorder';
import { RecordingStatus } from './status';

import { Util } from './util';
import { RecordingOptions } from './types';
import { Config } from './config';
import { logger } from './logger';
import { CodeChangeRecorder } from './codeChangeRecorder';
import { Artifact } from './models';
import { ArtifactType } from './enums';
import { ArtifactUploader } from './artifactUploader';
import { CommitRecorder } from './commitRecorder';
import * as cron from 'node-cron';
import { createLiveCode } from './livecodeApiClient';


export async function activate(context: vscode.ExtensionContext) {

  Util.context = context;

  const recorder = new Recorder();
  const status = new RecordingStatus();
  const codeChangeRecorder = new CodeChangeRecorder();
  const uploader = new ArtifactUploader();
  const commitRecorder = new CommitRecorder();

  let autocommitJob: cron.ScheduledTask | undefined;

  function init_job() {
    if ( autocommitJob == undefined) {
      const cronIntervalSetting = `*/${Config.getAutocommitInterval()} * * * * *`;
      logger.debug(cronIntervalSetting);
      autocommitJob = cron.schedule(cronIntervalSetting, () => {
        commitRecorder.makeAutocommit();
      });
    }
  }

  async function stop() {
    await new Promise(resolve => setTimeout(resolve, 125)); // Allows for click to be handled properly
    if (status.counting) {
      status.stop();
    } else if (recorder.active) {      
      status.stop();
      recorder.stop();  // this will result in stopping the rest of recording components   
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

  

  async function record(opts: Partial<RecordingOptions> = {}) {
    try {
      if (!(await initRecording())) {
        return;
      }
      codeChangeRecorder.init();
      await commitRecorder.init();
      init_job();

      //starts the recording, the run.output is used to wait for completion and get the output.
      const run = await recorder.run(opts); 

      // activate the rest of recording componenets: autocmmit, code-change recorder
      status.start();
      codeChangeRecorder.start();
      commitRecorder.start();
      if (autocommitJob !== undefined) {
        autocommitJob.start();
      }
      
      // wait for completion (usually triggered by stop)
      const { file } = await run.output();
      status.stop();  // should be stopped in most cases, but its ok to call stop() again.
      

      if (autocommitJob !== undefined) {
        autocommitJob.stop();
      }
      commitRecorder.stop()
      
      codeChangeRecorder.stop();
      commitRecorder.stop()

      const choice0 = await vscode.window.showInformationMessage(`Livecode Recording Finished Succesfully`, 'OK', 'Delete');
      switch (choice0) {
        case 'OK': {          
          const givenLivecodeName =
          
          await vscode.window.showInputBox({ placeHolder: 'Livecode Name' });
          const { livecodeId, remote_uri, autocommit_branch, livecodeName } = await createLiveCode(givenLivecodeName);
          const ccnga = await codeChangeRecorder.output(livecodeId);
          
          //preparing artifacts metadata
          const video = new Artifact(ArtifactType.video, file, path.basename(file));
          const artifacts = [video];      
          artifacts.push(ccnga);

          commitRecorder.push(remote_uri);
          await uploader.upload(livecodeId, livecodeName, artifacts);          
          break;
        };
        case 'Delete': {
          await fs.unlink(file);
          break;
        };
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