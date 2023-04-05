import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

import { ArtifactUploader } from "../../artifactUploader";
import { Artifact } from "../../models";
import { Util } from '../../util';
import { logger } from '../../logger';
import { createLiveCode } from '../../livecodeApiClient';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	


	test('create live code', async () => {
		const givenLivecodeName = "test1";
		const { livecodeId, remote_uri, autocommit_branch, livecodeName } = await createLiveCode(givenLivecodeName);
		logger.debug(livecodeId);		
	});

	// test("upload file", async () => {
	// 	const artifactUploader = new ArtifactUploader();
	// 	const artifacts : Artifact[] = [];    
	// 	artifacts.push(new Artifact("log", "1.log", "1.log"));
	// 	await artifactUploader.upload("aaa5", "hello", artifacts);
	// });

	// test("check workspace git", async () => {
	// 	// await new Promise<void>((resolve) => {
	// 	// 	setTimeout(() => {				
	// 	// 	resolve();
	// 	// 	}, 5000);
	// 	// });		  
	// 	const path  = Util.getWorkspacePath();
	// 	if (path === undefined) {
	// 		logger.debug('workspace not set');
	// 		throw new Error('workspace not set');
	// 	} else {
	// 		logger.debug(`workspace folder ${path}`);
	// 	}

	// 	GitUtils.check_workspace_folder();

		

	// });
});
