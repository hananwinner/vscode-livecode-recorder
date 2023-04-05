import { Config } from './config';
import { logger } from './logger';
import axios from 'axios';

export async function createLiveCode(name?: string) {
    let livecodeId = "";
    let remote_uri = "";
    let autocommit_branch = ""; 
    let livecodeName = ""; 
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
        } else {
          throw new Error(`Failed to create livecode`);
        }
      })
    
      return { livecodeId, remote_uri, autocommit_branch, livecodeName };
  }