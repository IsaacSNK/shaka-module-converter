export class SourceFile {
    constructor(sourcePath) {
        this.sourcePath = sourcePath;
        this.sourceLines = [];
    }

    addLine(sourceLine) {
        this.sourceLines.push(sourceLine);
    }

    getSourceLines() {
        return this.sourceLines;
    }

    getSourcePath() {
        return this.sourcePath;
    }
}