export enum CodeChangeType {
    additions = 'A',
    deletions = 'D',
    editions = 'E',
    cleanups = 'C',
    paste = 'P',
    pastePlusEditions = 'P+E',
    automaticRefactoring = 'AR',
    undo = 'U',
    redo = 'R',
    autoComplete = 'AC',
    indentations = 'I',
}

export enum ArtifactType {
    video = 'VIDEO',
    codeChangesAttributes = 'CCNGA',
    // codeChanges = 'CCNG',
}