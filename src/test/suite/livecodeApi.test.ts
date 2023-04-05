import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as myExtension from '../../extension';

import { logger } from '../../logger';
import { createLiveCode } from '../../livecodeApiClient';
import { v4 as uuidv4 } from 'uuid';


suite('Extension Test Suite', () => {

	test('create live code', async () => {		
        const givenLivecodeName = `test${uuidv4().substring(0,7)}`
		const { livecodeId, remote_uri, autocommit_branch, livecodeName } = await createLiveCode(givenLivecodeName);
		logger.debug(livecodeId);		
	});	
});
