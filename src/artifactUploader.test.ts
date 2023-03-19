import { ArtifactUploader } from "./artifactUploader";
import { Artifact } from "./models";

test("upload file", () => {
    const artifactUploader = new ArtifactUploader();
    const artifacts : Artifact[] = [new Artifact("txt", "1.txt", "1.txt"),];    
    artifactUploader.upload("aaa2", "hello", artifacts);


})