const colors = require('colors');

async function createBoilerplate(args) {
    const spinner = require('./spinner');
    const projectName = args['--name'] || args._[0];

    console.log(colors.cyan("Creating project '"+projectName+"'"));

    getPackageManager();
    console.log(colors.green("Success"));
}

async function getPackageManager() {

    const { promisify } = require('util');
    const { exec: defaultExec } = require('child_process');

    let packageManager = 'npm';
    const cwd = process.cwd();
    const exec = promisify(defaultExec);

    try {
        await exec(`${packageManager} -v`, { cwd });
    } catch(error) {
        packageManager = 'npm';

        try {
            await exec(`${pm} -v`, { cwd });
        } catch (error) {
            packageManager = null;
        }
    }

    if (packageManager == null) {
        console.log(colors.red(`
            No available package manager!

            Install Yarn: https://yarnpkg.com/lang/en/docs/install
             or
            Install NPM: https://www.npmjs.com/get-npm
        `));
    }

    return packageManager;
}

module.exports = createBoilerplate;