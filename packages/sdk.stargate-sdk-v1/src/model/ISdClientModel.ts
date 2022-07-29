export interface ISdClientModel {
    // The ID of the registered client
    id: string,

    // The type of the registered client
    clientType: "frontend" | "backend",

    // The name of the client software
    name: string,

    // The version of the client software
    version: string,
}
