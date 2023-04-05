import * as vscode from 'vscode';
import { Util } from './util';
import { exec } from 'child_process';
import * as consts from './consts';
import { logger } from './logger';

export class CommitRecorder {
    private isRecording = false;
    
    /**
     * post-condition: the current workspace is an empty git repository
     */
    async init() {        
        await this.verifyRepoState();
        await Util.exec_git_command('checkout -b autocommit');
    }

    async verifyRepoState() {
        const output = await Util.exec_git_command('status');        
        switch (output) {
            case consts.GIT_STATUS_OUTPUT_NO_COMMITS:
                break;  //OK
            default:
                throw new Error("have to be empty git repo. other states are not implemented");               
        }
    }


    start() {
        this.isRecording = true;
    }

    async stop() {
        this.isRecording = false;
        await this.doAutoCommit("final autocommit");
    }

    /**
     * make a commit in local repo
     * TODO consider saving all editor open files.
     * if there nothing to commit, it fails.
     */
    async makeAutocommit(customMessage?: string) {
        if (this.isRecording) {
            await this.doAutoCommit(customMessage);
        }        
    }

    private async doAutoCommit(customMessage: string | undefined) {
        try {
            const gitAddAllOutput = await Util.exec_git_command('add -A');
            logger.debug(`output from git add -A : ${gitAddAllOutput}`);
            const commitMessage = customMessage ? customMessage : "autocommit";
            const gitCommitOutput = await Util.exec_git_command(`commit -m \"${commitMessage}\"`);
            logger.debug(`output from git commit : ${gitCommitOutput}`);
        } catch (e: any) {
            const errMessage = `autocommit failed: ${e.message}`;
            logger.error(errMessage);
            vscode.window.showErrorMessage(errMessage);
        }
    }

    async push(remoteUri: string, targetBranch: string) {        
        const gitPushOutput = await Util.exec_git_command(`push -f --set-upstream ${remoteUri} ${targetBranch}`);
        logger.debug(`output from git push: ${gitPushOutput}`);
    }

}