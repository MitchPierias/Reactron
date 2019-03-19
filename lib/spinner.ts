import ora from 'ora';
import colors from 'colors';

interface Cache {
    spinner?:any
}

const cache:Cache = {};
const isTTY:boolean = process.env.CI ? false : process.stdout.isTTY!;

/**
 * Create Spinner
 * 
 * @description Creates a new spinner instance with the given message.
 * @dev [Mitch Pierias](github.com/MitchPierias)
 * @param {string} text - Spinner display message
 */
export const create = (text:string) => {
    // Handle process piping
    if (!isTTY) {
        console.log(`create-reactron-app - ${text}`);
        return;
    }
    // Fetch existing spinner
    if (cache.spinner) {
        cache.spinner.succeed();
        delete cache.spinner;
    }
    // Create and cache spinner
    cache.spinner = ora({
        text,
        color: 'magenta'
    }).start();
}

/**
 * Stop Spinner
 * 
 * @description Stops the current spinner and outputs message
 * @dev [Mitch Pierias](github.com/MitchPierias)
 * @param {string} message - Spinner message.
 * @param {boolean} isError - Outputs messsage as error if true
 */
export const end = (message:string, isError:boolean = false) => {
    // Handle process piping
    if (!isTTY) {
        console.log(`create-react-app - ${message}`);
        return;
    }
    // Handle existing spinner
    if (cache.spinner) {
        (isError ? cache.spinner.fail() : cache.spinner.succeed());
        delete cache.spinner;
    }
    // Output closure message
    if (!message || message == '') return;
    const prefix = isError ? colors.red('ERROR:') : colors.green('DONE!');
    console.log("")
    console.log(`${prefix} ${message}`);
}

/**
 * Fail Spinner
 * 
 * @description Stops the spinner with error message.
 * @dev [Mitch Pierias](github.com/MitchPierias)
 * @param {string} message - Spinner message.
 */
export const fail = (message:string) => {
    end(message, true);
    process.exit(1);
}