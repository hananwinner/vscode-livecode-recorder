import { CommitRecorder } from "../../commitRecorder";
import { createLiveCode } from "../../livecodeApiClient";
import { Util } from "../../util";
import { v4 as uuidv4 } from 'uuid';
import { exec } from "child_process";
import * as path from 'path';
import { assert } from "console";
import { before, after, suite } from "mocha";
import * as Mocha from 'mocha';
import * as vscode from 'vscode';
import { logger } from "../../logger";
import * as MyExtension from '../../extension';


suite("Commit Recorder Autocommit Test Suite", () => {
    const commitRecorder = new CommitRecorder();
    let subDir = "";
    let givenLivecodeName = `test${uuidv4().substring(0,7)}`;
    // let extension: vscode.Extension<MyExtension>;
    // let context: vscode.ExtensionContext;

    // function handleWorkspaceFoldersChangeEvent(event :vscode.WorkspaceFoldersChangeEvent) {
    //     logger.debug('WorkspaceFoldersChangeEvent');
    //     logger.debug("added:");
    //     logger.debug(event.added);
    //     logger.debug("removed:");
    //     logger.debug(event.removed);
    // }

    // suiteSetup(async () => {
    //     // testContext = vscode.TestExtensionContext.createStub();
    //     const ext = vscode.extensions.getExtension("arcsine.chronicler");
    //     context = await ext?.activate();
    // });


    /**
     * test a sequece of autocommits
     * 
     * pre: started form empty git repo
     * 
     * added a file. the autocmmmit should include that file in the commit.
     */
    before(async () => {
        // run the clean_worksace script and set it as workspace
        
        subDir = '';
        let workspacePath = Util.getWorkspacePath();
        if ( workspacePath == undefined) {
            throw new Error("workspacePath == undefined");
        } else {
            if (path.basename(workspacePath).includes('test')) {
                await Util.execShell(`rm -rf ${workspacePath}`);            
                await Util.execShell('./src/test/suite/init_workspace.sh', [workspacePath, subDir] );
                // const folderPath = path.join(workspacePath, subDir);
                // const uri = vscode.Uri.file(folderPath);
                // context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(
                //     handleWorkspaceFoldersChangeEvent));
                // vscode.workspace.updateWorkspaceFolders(0, null, {uri: uri});                        
                // workspacePath = Util.getWorkspacePath();
                // logger.debug(`workspacePath after change: ${workspacePath}`)
            } else {
                throw new Error("workspacePath is not test");
            }            
        }  
    });

    test("Autocommit", async () => {
        commitRecorder.init();
        commitRecorder.start();
        // create a new file in the workspace
        let workspacePath = Util.getWorkspacePath();      
        logger.debug(`workspacePath ${workspacePath}`);
        assert(workspacePath != undefined);
        if (workspacePath == undefined) {
            throw new Error("workspacePath == undefined");            
        }                
        //create new_file1
        await Util.execShell('cp', ['src/test/resources/new_file1.py', workspacePath])        
        await commitRecorder.makeAutocommit("create new_file1");

        //add to new_file1
        const editString1 = `\'\ndef goodbye():\n    return \"esther!\"\n\'`;        
        await Util.execShell(`echo ${editString1} >> ${path.join(workspacePath, 'new_file1.py')}`)
        await commitRecorder.makeAutocommit("add to new_file1");

        //create new_file2 and add the calc_tetris func at the same commit
        await Util.execShell('cp', ['src/test/resources/new_file2.py', workspacePath])
        const editString2 = `\'\ndef calc_tetris():\n    return \"not implemented!\"\n\'`;
        await Util.execShell(`echo ${editString2} >> ${path.join(workspacePath, 'new_file2.py')}`)
        await commitRecorder.makeAutocommit("create new_file2 and add the calc_tetris func at the same commit");

        //replace all code in new_file2
        const editString3 = `\'# lets refactor completely\nclass Life(object):\n    meaning=42\n\n    def get_meaning(self):\n        return self.meaning\n\n\'`;
        await Util.execShell(`echo ${editString3} > ${path.join(workspacePath, 'new_file2.py')}`);
        await commitRecorder.makeAutocommit("replace all code in new_file2");

        //remove new_file1
        await Util.execShell(`rm ${path.join(workspacePath, 'new_file1.py')}`);        
        await commitRecorder.stop();   

        const { livecodeId, remote_uri, autocommit_branch, livecodeName } = await createLiveCode(givenLivecodeName); 
        logger.debug(`remote_uri: ${remote_uri}`);


        // await Util.execShell(`echo gaga >> ${path.join(workspacePath, 'new_file2.py')}`)

        // await commitRecorder.makeAutocommit();

        await commitRecorder.push(remote_uri, autocommit_branch);
    });    
});

// suite("Commit Recorder Push Test Suite", () => {
//     let livecodeId, remote_uri, autocommit_branch, livecodeName;
//     const commitRecorder = new CommitRecorder();
//     before(async () => {        
//         const { livecodeId, remote_uri, autocommit_branch, livecodeName } = await createLiveCode();
//     });

//     /**
//      * test push
//      * pre: given a git repo that is not empty
//      * can push to a remote that has just been created with the Livecode API
//      */
//     test("Push to Empty Remote Repo", async () => {
        
//     });

// });

// export function run(): Promise<void> {
// 	// Create the mocha test
// 	const mocha = new Mocha({
// 		ui: 'tdd',
// 		color: true
// 	});

// 	const testsRoot = path.resolve(__dirname, '..');

// 	return new Promise((c, e) => {
//         // Add files to the test suite
//         mocha.addFile(__filename);

//         try {
//             // Run the mocha test
//             mocha.run(failures => {
//                 if (failures > 0) {
//                     e(new Error(`${failures} tests failed.`));
//                 } else {
//                     c();
//                 }
//             });
//         } catch (err) {
//             console.error(err);
//             e(err);
//         }		
// 	});
// }