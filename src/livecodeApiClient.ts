import { Config } from './config';
import { logger } from './logger';
import axios from 'axios';

export async function createLiveCode(name?: string) : 
  Promise<{ livecodeId: string; remote_uri: string; autocommit_branch: string; livecodeName: string; }> {
    let livecodeId: string, remote_uri: string, autocommit_branch: string , livecodeName: string;
    const url = `${Config.getLivecodeBEUrl()}/livecodes/`;    
    const payload = name? {"name": name} : {};
    const token = await Config.getLivecodeToken();
    await axios
      .post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.status === 201) {                  
          livecodeId = response.data.id;
          livecodeName = response.data.id;
          remote_uri = response.data.git.remote_uri;
          autocommit_branch = response.data.git.autocommit_branch;
          return {livecodeId: livecodeId, remote_uri: remote_uri, autocommit_branch: autocommit_branch, livecodeName: livecodeName};
        }
      })

    throw new Error('Failed to create Livecode');            
  }