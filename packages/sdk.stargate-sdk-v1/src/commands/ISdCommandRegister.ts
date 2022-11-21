export interface ISdCommandRegister {

    /**
     * Registers a new command for bidirectional communication. The returned promise gets
     * resolved when reply messages from all target clients have been received. However, when at
     * least one client does not reply before {@link timeout} is reached, the promise is rejected.
     * @param topic The identifier of this command.
     * @param clientIds The IDs of the target clients for this command.
     * @param timeout Delay in milliseconds until all clients must have responded, otherwise reject.
     * @throws {@link SdStargateError} when an open request with the specified {@link topic} has
     * already been registered.
     */
    registerCommand (topic: string, clientIds: string[], timeout: number): Promise<any[]>

    /**
     * Updates the previously registered command of this {@link topic} with the received client
     * reply. When this client reply is the last missing reply message, the promise that has
     * been returned by the previous {@link registerCommand} call is resolved.
     * @param topic The identifier of the command to update.
     * @param clientId The ID of the client to update.
     * @param data Either the data object of an ok-reply, or the message of an error-reply.
     * @throws {@link SdStargateError} when {@link clientId} is not part of the open request.
     */
    updateCommand (topic: string, clientId: string, data: Record<string, any> | string): void

}
