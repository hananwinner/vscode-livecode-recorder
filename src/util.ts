import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { logger } from './logger';

export class Util {
  static context: vscode.ExtensionContext;

  static getWorkspacePath() {
    const folders = vscode.workspace.workspaceFolders;
    return folders ? folders?.[0]?.uri.fsPath : undefined;
  }

  static getResource(rel: string) {
    return path.resolve(this.context.extensionPath, rel.replace(/\//g, path.sep)).replace(/\\/g, '/');
  }

  static async exec_git_command(git_command: string) : Promise<string> {
    const workspacePath = Util.getWorkspacePath();
    if (workspacePath === undefined) {      
      throw new Error("workspacePath not set");
    } else {
      const gitPath = path.join(workspacePath, '.git');
      logger.debug(`git path: ${gitPath}`);
      const _command = `git --git-dir=${gitPath} --work-tree=${workspacePath} ${git_command}`;
      logger.debug(`command: ${_command}`);
      return new Promise<string>((resolve, reject) => {
        exec(_command, (error, stdout, stderr) => {
          if (error) {
            const errMessage = `Error: ${error.message}`;
            logger.error(errMessage);
            reject(error);
          }
          else if (stderr) {
            const errMessage = `Stderr: ${stderr}`;
            logger.error(errMessage);
            reject(new Error(errMessage));
          } else {
            logger.debug(`Output: ${stdout}`);
            resolve(stdout);
          }
          }
        );
      })
      
      
    }
  }
}
