/** Creates a new type for a string enum that enables to iterate through its keys */
export function enumKeys<O extends object, K extends keyof O = keyof O> (o: O): K[] {
    return Object
        .keys(o)
        .filter(k => Number.isNaN(+k)) as K[]
}

/** Returns all values of the given enum */
export function enumValues (o: object): (string | number)[] {
    return enumKeys(o).map(k => o[k])
}

/** Helper function to wait for the specified time */
export function sleep (ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}
