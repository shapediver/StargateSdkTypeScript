import chalk from 'chalk';
import dayjs from 'dayjs';
import { createSpinner } from 'nanospinner';

/** Use this in default-block to force the compiler to make the switch statement exhaustive */
export function assertUnreachable(_: never): never {
    throw new Error('Reached unreachable block');
}

/** Prettifies the given message and returns the result */
export function prettifyMsg(msg: unknown): unknown {
    let pretty = msg;

    if (typeof msg === 'object' && msg !== null)
        pretty = require('util').inspect(pretty, false, null);

    return pretty;
}

/** Helper function to wait for the specified time */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns the current timestamp without dates */
export function nowTime(): string {
    return dayjs().format('HH:mm:ss.SSS');
}

/** Get random number from interval (`min` and `max` are included!)  */
export function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/** Helper function to simulate waiting time. */
export async function waitToSimulate(
    min: number,
    max: number,
    description: string
): Promise<void> {
    const seconds = randomIntFromInterval(min, max);
    const spinner = createSpinner(
        chalk.magenta(`Waiting ${seconds} seconds to simulate ${description} ...`)
    ).start();

    await sleep(seconds * 1000);
    spinner.success();
}
