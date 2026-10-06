import chalk from 'chalk';
import fs from 'fs';

/** Stores information about previous user inputs and selections. */
export interface CliMemory {
    userId?: string;

    awsProfile?: string;
}

const CLI_MEMORY_PATH: string = './.memory.json';

/** Memory singleton */
let memory: CliMemory | undefined = undefined;

/** Tries to read a stored memory object from file. If not found, default values are returned. */
export async function readCliMemory(): Promise<CliMemory> {
    if (memory === undefined) {
        let data: Partial<CliMemory> = {};

        // Try to read file and parse content if file exists
        if (fs.existsSync(CLI_MEMORY_PATH)) {
            try {
                const file = await fs.readFileSync(CLI_MEMORY_PATH);
                data = JSON.parse(file.toString());
            } catch (e) {
                console.error(
                    chalk.red(
                        `${chalk.bold(
                            `Could not read and parse to file ${CLI_MEMORY_PATH}.`
                        )}\n${e instanceof Error ? e.message : String(e)}`
                    )
                );
            }
        }

        // Update memory singleton
        memory = {};
        if (data.userId) memory.userId = data.userId;
        if (data.awsProfile) memory.awsProfile = data.awsProfile;
    }

    return memory;
}

/** Writes the content of the given memory object to a file; overwriting if it already exists. */
export async function updateCliMemory(newMemory: CliMemory): Promise<void> {
    memory = newMemory;

    try {
        await fs.writeFileSync(CLI_MEMORY_PATH, JSON.stringify(memory, null, 2));
    } catch (e) {
        console.error(
            chalk.red(
                `${chalk.bold(`Could not write to file ${CLI_MEMORY_PATH}.`)}\n${
                    e instanceof Error ? e.message : String(e)
                }`
            )
        );
    }
}
