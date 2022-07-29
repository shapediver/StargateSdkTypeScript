/** Use this in default-block to force the compiler to make the switch statement exhaustive */
export function assertUnreachable (_: never): never {
    throw new Error("Reached unreachable block")
}
