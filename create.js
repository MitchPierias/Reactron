const colors = require('colors');
const path = require('path');
const fs = require('fs');

async function createBoilerplate(args) {
    const spinner = require('./spinner');
    const projectName = args['--name'] || args._[0];
    const outputPath = path.resolve(process.cwd(),projectName);

    spinner.create('Searching for repository...');
    try {
        await getRepositoryMeta('React-Electron-Boilerplate');
        spinner.end();
    } catch (error) {
        spinner.fail('Failed to find repository')
    }

    spinner.create('Creating directory');
    try {
        await require('make-dir')(outputPath)
        spinner.end();
    } catch (err) {
        spinner.fail('Directory exists');
    }

    spinner.create('Downloading template...');
    try {
        await cloneRepository('https://codeload.github.com/MitchPierias/React-Electron-Boilerplate/tar.gz/master', outputPath);
        spinner.end();
    } catch(err) {
        spinner.fail('Failed to clone template');
    }

    spinner.create('Configuring project...');
    try {
        // Update package file
        await updatePackage(`${outputPath}/package.json`, { name:projectName, version:"0.1.0" });
        // Output completion message
        const cmd = (await getPackageManager() === 'yarn') ? 'yarn && yarn start' : 'npm install && npm start'
        spinner.end(`Run \`${cmd}\` inside of "${projectName}" to start the app`)
    } catch (error) {
        console.log(error);
        spinner.fail('Failed to configure project');
    }
}

/**
 * Get Repository Meta
 * 
 * @desc Retreives metadata for the specified repository if it exists
 * @dev [Mitch Pierias](github.com/MitchPierias)
 * @param {string} repo - Repository name
 * @returns {string|boolean} meta - Repository data or false
 */
async function getRepositoryMeta(repo) {
    // Request repository data from GitHub
    const Github = require('@octokit/rest')();
    return await Github.repos.get({owner: 'MitchPierias', repo})
    .then(response => response.data)
    .catch(() => false);
}

/**
 * Clone repository
 * 
 * @desc Downloads and unpacks the specified repository to the location provided
 * @dev [Mitch Pierias](github.com/MitchPierias)
 * @param {string} repoUrl - Repository tar url
 * @param {string} outputPath - Path to unpack tar
 */
async function cloneRepository(repoUrl, outputPath) {
    
    const got = require('got');
    const tar = require('tar');

    return new Promise((resolve, reject) => {
        got.stream(repoUrl)
        .on('error', error => reject(error))
        .on('response', () => resolve('Done!'))
        .pipe(tar.extract({ cwd:outputPath, strip:1 }))
    });
}

/**
 * Update Package
 * 
 * @desc Updates the configuration of the `package.json` at the specified location
 * @param {string} packagePath - Path to `package.json`
 * @param {object} config - Configuration arguments
 */
async function updatePackage(packagePath, config) {
    // Read package and configure
    const fileBuffer = fs.readFileSync(packagePath);
    const pkg = JSON.parse(fileBuffer);
    return Promise.resolve(fs.writeFileSync(packagePath, JSON.stringify({...pkg, ...config})));
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