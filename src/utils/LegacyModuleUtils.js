const provideRegex = /^goog\.provide\(\'(.*)\'\);$/;
const requireRegex = /^goog\.require\(\'(.*)\'\);$/;

export const isProvideDeclaration = (sourceLine) => {
    return sourceLine.match(provideRegex);
};

export const extractModuleName = (sourceLine) => {
    const match = sourceLine.match(provideRegex);
    return match[1];
};

export const isRequireDeclaration = (sourceLine) => {
    return sourceLine.match(requireRegex);
};

export const extractDependencyName = (sourceLine) => {
    const match = sourceLine.match(requireRegex);
    return match[1];
};