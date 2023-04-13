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

  /**
   * Exceute the given git subcommand in the workspace (by using the --git-dir and --work-tree options)
   * @param git_command 
   * @returns 
   */
  static async exec_git_command(git_command: string) : Promise<string> {    
    const workspacePath = Util.getWorkspacePath();    
    logger.debug(`workspacePath ${workspacePath}`);
    if (workspacePath === undefined) {      
      throw new Error("workspacePath not set");
    } else {
      const gitPath = path.join(workspacePath, '.git');
      logger.debug(`git path: ${gitPath}`);
      const _command = `git --git-dir=${gitPath} --work-tree=${workspacePath} ${git_command}`;
      logger.debug(`command: ${_command}`);
      return this.tryCommand(_command);
    }
  }

  static tryCommand(command: string) {
    return new Promise<string>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          const errMessage = `Error: ${error.message}`;
          logger.error(errMessage);
          reject(error);
        }
        else if (stderr) {
          if (stderr.includes('Switched to a new branch')) {
            logger.debug(`Stderr: ${stderr}`);
            resolve(stderr);
          } else {
            const errMessage = `Stderr: ${stderr}`;
            logger.error(errMessage);
            reject(new Error(errMessage));
          }          
        } else {
          logger.debug(`Output: ${stdout}`);
          resolve(stdout);
        }
      });
    });
  }

  static execShell(command: string, parameters?: string[]) {
    let _command = command;
    if (parameters) {
      _command =  `${command} ${parameters.join(' ')}`;  
    }     
    logger.debug(`fullCommand: ${_command}`);
    return this.tryCommand(_command);
  }

  static throwsExression(message? :string) {
    return (() => {throw new Error(message);})();
  }
}
