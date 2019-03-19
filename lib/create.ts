import arg from 'arg';
import colors from 'colors';
import path from 'path';
import fs from 'fs';

interface ProjectConfig {
    name:string;
    version:string;
}

export const createBoilerplate = async (args:arg.Result<arg.Spec>): Promise<void> => {

    const spinner = require('./spinner');
    const projectName = args['--name'] || args._[0];
    const outputPath = path.resolve(process.cwd(), projectName);

    spinner.create('Searching for repository...');
    try {
        await validateRepository('React-Electron-Boilerplate');
        spinner.end();
    } catch (error) {
        spinner.fail('Failed to find repository')
    }

    spinner.create('Creating directory');
    try {
        initializeDirectory(projectName);
        spinner.end();
    } catch (err) {
        spinner.end();
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
        await configureProjectPackage({ name:projectName, version:"0.1.0" }, outputPath);
        // Output completion message
        const cmd = (await getPackageManager() === 'yarn') ? 'yarn && yarn start' : 'npm install && npm start'
        spinner.end(`Run \`${cmd}\` inside of "${projectName}" to start the app`)
    } catch (error) {
        console.log(error);
        spinner.fail('Failed to configure project');
    }
}

/**
 * Intialize Directory
 * @desc Creates a directory when it doesn't exist
 * @dev [Mitch Pierias](github.com/MitchPierias)
 * @param {string} projectName Name of project folder
 */
export const initializeDirectory = (projectName:string): void => {
    const outputPath = path.resolve(process.cwd(), projectName);
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    } else {
        throw new Error("Directory exists");
    }
}

/**
 * Validate Repository
 * 
 * @desc Retreives metadata for the specified repository if it exists
 * @dev [Mitch Pierias](github.com/MitchPierias)
 * @param {string} repo - Repository name
 * @returns {object|boolean} meta - Repository data or false
 */
export const validateRepository = async (repo:string): Promise<any> => {
    const Github = require('@octokit/rest')();
    return new Promise((resolve, reject) => {
        Github.repos.get({owner:'MitchPierias', repo}).then((response:any) => {
            resolve(response.data);
        }).catch((err:Error) => {
            reject("Repo couldn't be found");
        });
    });
}

/**
 * Clone Repository
 * @desc Downloads and unpacks the specified repository to the location provided
 * @dev [Mitch Pierias](github.com/MitchPierias)
 * @param {string} repoUrl - Repository tar url
 * @param {string} outputPath - Path to unpack tar
 * @returns {Promise<string>} Completed message
 */
export const cloneRepository = (repoUrl:string, toPath:string): Promise<string> => {

    const got = require('got');
    const tar = require('tar');
    
    return new Promise((resolve, reject) => {
        got.stream(repoUrl).pipe(tar.extract({ cwd:toPath, strip:1 })).on('error', (error:Error) => {
            reject(error);
        }).on('end', () => {
            resolve('Done');
        });
    });
}

/**
 * Configure Project
 * @desc Configures the package.json with the specified configuration options
 * @dev [Mitch Pierias](github.com/MitchPierias)
 * @param config Configuration settings for the package.json
 * @param atPath Path of the package.json
 */
export const configureProjectPackage = (config:ProjectConfig, atPath:string): void => {
    const pkgPath = path.resolve(atPath, 'package.json');
    const pkg = require(pkgPath);
    pkg.name = config.name;
    return fs.writeFileSync(pkgPath, JSON.stringify(pkg));
}

const getPackageManager = async (): Promise<string|null> => {

    const { promisify } = require('util');
    const { exec: defaultExec } = require('child_process');

    let packageManager:string|null = 'npm';
    const cwd = process.cwd();
    const exec = promisify(defaultExec);

    try {
        await exec(`${packageManager} -v`, { cwd });
    } catch(error) {
        packageManager = 'npm';

        try {
            await exec(`${packageManager} -v`, { cwd });
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

    return Promise.resolve(packageManager);
}