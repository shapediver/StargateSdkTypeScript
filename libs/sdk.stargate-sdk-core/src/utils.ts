/** Creates a new type for a string enum that enables to iterate through its keys */
export function enumKeys<O extends object, K extends keyof O = keyof O>(o: O): K[] {
    return Object.keys(o).filter((k) => Number.isNaN(+k)) as K[];
}

/** Returns all values of the given enum */
export function enumValues(o: object): (string | number)[] {
    return enumKeys(o).map((k) => o[k]);
}

/** Helper function to wait for the specified time */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extracts the specified version type of the given semantic version string.
 * When the given string is not a semantic version string, undefined is returned instead
 */
export function extractVersion(
    version: string,
    type: 'major' | 'minor' | 'patch'
): string | undefined {
    const parts = version.split('.');

    if (parts.length === 3) {
        switch (type) {
            case 'major':
                return parts[0];
            case 'minor':
                return parts[1];
            case 'patch':
                return parts[0];
        }
    } else return undefined;
}
