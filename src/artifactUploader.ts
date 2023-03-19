import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { Artifact } from "./models";
// import { Config } from './config';

export class ArtifactUploader {

    public async upload(livecodeId: string, livecodeName: string, artifacts: Artifact[]) : Promise<void> {
        for (const a of artifacts) {
            const {destUrl, fields} = await this.getUploadUri(livecodeId, a.type);
            await this.uploadFile(a.path, destUrl, fields);
        }

    }

    private async getUploadUri(livecodeId: string, artifactType: string) :
    Promise<{ destUrl: string; fields: Object }>{
        const url  = `http://localhost:8000/livecodes/${livecodeId}}/artifacts/${artifactType}/generate_presigned_url`
        await axios.post(url)
        .then(response => {
            if (response.status === 200) {
                return {destUrl: response.data.url, fields: response.data.fields}
            }
        });   
        throw new Error('Failed to generate presigned URL');
    }


    private async uploadFile(filePath: string, targetUrl: string, fields: Object): Promise<void> {
        try {
          const fileStream = fs.createReadStream(filePath);
          const formData = new FormData();
          formData.append('file', fileStream);
      
          const response = await axios.post(targetUrl, formData, {
            headers: {
              ...formData.getHeaders(),
            },
          });
      
          console.log(`File uploaded successfully: ${response.data.message}`);
        } catch (error) {
          console.error(`Error uploading file`);
        }
      }
}