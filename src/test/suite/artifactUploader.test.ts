import { ArtifactUploader } from "../../artifactUploader";
import { Artifact } from "../../models";
import { ArtifactType } from "../../enums";
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

suite('Artifact Uploader Test Suite', () => {
    const uploader = new ArtifactUploader();

    test("Upload", async () => {
        //preparing artifacts metadata
        const livecodeId = uuidv4().substring(0,7);
        const livecodeName = `test${livecodeId}`
        const file = path.join('/home/dw/Recordings', 'test3-1679497584899.mp4');
        const ccnga = undefined;
        const video = new Artifact(ArtifactType.video, file, path.basename(file));
        const artifacts = [video, ccnga];      
        
        await uploader.upload(livecodeId, livecodeName, artifacts);

    });

    

});