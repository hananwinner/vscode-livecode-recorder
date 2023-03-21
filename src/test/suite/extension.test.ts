import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

import { ArtifactUploader } from "../../artifactUploader";
import { Artifact } from "../../models";

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	// test('Sample test', () => {
	// 	assert.strictEqual(-1, [1, 2, 3].indexOf(5));
	// 	assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	// });

	test("upload file", async () => {
		const artifactUploader = new ArtifactUploader();
		const artifacts : Artifact[] = [];    
		artifacts.push(new Artifact("log", "1.log", "1.log"));
		await artifactUploader.upload("aaa5", "hello", artifacts);
	});
});
