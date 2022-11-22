import { SdStargateError, SdStargateErrorTypes } from "../SdStargateError"

export abstract class SdBaseValidator {

    /**
     * Type guard of custom command payload DTOs.
     * @protected
     * @throws {@link SdStargateError} when the validation fails.
     */
    protected static validate<T> (
        fn: (data: any) => data is T,
        data: unknown,
    ): asserts data is T {
        if (!fn(data)) {
            // Unfortunately, importing Ajv types does not work, so we have to use a work-around
            const errors = (<any>fn).errors || undefined

            const msg = (errors) ?
                `${ errors[0]?.instancePath } ${ errors[0]?.message }` :
                `Unknown validation error`

            throw new SdStargateError(SdStargateErrorTypes.InvalidCommandPayload, msg)
        }
    }

}
