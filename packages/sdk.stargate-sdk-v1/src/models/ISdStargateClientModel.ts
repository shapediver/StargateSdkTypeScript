export interface ISdStargateClientModel {
    /* The ID of the registered client */
    id: string;

    /* The type of the registered client */
    clientType: 'frontend' | 'backend';

    /* The name of the client software */
    clientName: string;

    /* The version of the client software */
    clientVersion: string;

    /* The platform identifier and version number of the host system */
    hostOs: string;

    /* The name of the host system */
    hostName: string;

    /* Gets the username of the person who is associated with the host system */
    hostUser: string;
}
