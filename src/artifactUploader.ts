import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { Artifact, ArtifactUploadProperties } from "./models";
// import { Config } from './config';
import { logger } from './logger';

export class ArtifactUploader {

    public async upload(livecodeId: string, livecodeName: string, artifacts: Artifact[]) : Promise<void> {
        for (const a of artifacts) {
            const {destUrl, fields} = await this.getUploadUri(livecodeId, a.type, a.filename);
            await this.uploadFile(a.path, destUrl, fields);
        }

    }

    private async getUploadUri(livecodeId: string, artifactType: string, filename: string) : Promise<ArtifactUploadProperties>
    {
        const url  = `http://localhost:8000/livecodes/${livecodeId}/artifacts/${artifactType}/generate_presigned_url`
        const payload = {
          filename: filename
        };
        const response = await axios.post(url, payload);
        
        if (response.status === 200) {
            return new ArtifactUploadProperties(response.data.url, response.data.fields);
        } else {
          throw new Error("Failed to generate")
        }
        
        
    }


    private async uploadFile(filePath: string, targetUrl: string, fields: Object) {
      const fileStream = fs.createReadStream(filePath);
      const formData = new FormData();          
      let k : keyof typeof fields;
      for (k in fields) {
        formData.append(k, fields[k]);
      }
      formData.append('file', fileStream);
  
      const response = await axios.post(targetUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      })  
    }
}