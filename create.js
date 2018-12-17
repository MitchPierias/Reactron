const colors = require('colors');
const path = require('path');

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
        const pkg = require(path.resolve(__dirname, `${projectName}/package.json`));
        pkg.name = projectName;
        pkg.version = "1.0.0";
        // Save package file
        const { writeFileSync } = require('fs');
        writeFileSync(path.resolve(__dirname, `${projectName}/package.json`), JSON.stringify(pkg), 'utf8');
        // Output completion message
        const cmd = (await getPackageManager() === 'yarn') ? 'yarn && yarn start' : 'npm install && npm start'
        spinner.end(`Run \`${cmd}\` inside of "${projectName}" to start the app`)
    } catch (error) {
        console.log(error);
        spinner.fail('Failed to configure project');
    }
}

async function getRepositoryMeta(repo) {
    const Github = require('@octokit/rest')();
    return await Github.repos.get({owner: 'MitchPierias', repo})
    .then(response => response.data)
    .catch(error => false);
}

async function cloneRepository(repoUrl, outputPath) {
    const got = require('got');
    const tar = require('tar');

    await got.stream(repoUrl).pipe(tar.x({ cwd:outputPath, strip:1 }));
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