import { ArtifactUploader } from "./artifactUploader";
import { Artifact } from "./models";

test("upload file", async () => {
    const artifactUploader = new ArtifactUploader();
    const artifacts : Artifact[] = [];    
    artifacts.push(new Artifact("txt", "1.txt", "1.txt"));
    artifactUploader.upload("aaa5", "hello", artifacts);
});