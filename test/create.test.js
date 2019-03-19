const fs = require('fs');
const rimraf = require('rimraf');
const path = require('path');
const { assert } = require('chai');
const {
    createBoilerplate,
    initializeDirectory,
    validateRepository,
    cloneRepository,
    configureProject
} = require('./../build/lib/create');
const ROOT_PATH = path.resolve(__dirname, '..');

describe('Create', () => {

    const projectName = 'sample';
    const sampleDirectory = path.join(ROOT_PATH, projectName);
    const repoName = 'React-Electron-Boilerplate';
    const repoSource = 'https://codeload.github.com/MitchPierias/React-Electron-Boilerplate/tar.gz/master';

    before(() => {
        // Remove existing sample directory
        if (fs.existsSync(sampleDirectory)) rimraf.sync(sampleDirectory);
    });

    it("Should find required repository", () => {
        return validateRepository(repoName).then(meta => {
            assert.isOk(meta, 'Meta object should be returned');
            assert.equal(meta.name, repoName, `Meta name '${meta.name}' doens't match repository name ${repoName}`);
        }).catch(err => {
            assert.equal(err, "Repo couldn't be found");
        });
    });

    it("Should create a new project folder", () => {
        initializeDirectory(projectName);
        assert.isTrue(fs.existsSync(sampleDirectory), "Should create directory");
    });

    it("Should match existing project folder");

    it("Should download repository to folder", () => {
        return cloneRepository(repoSource, sampleDirectory).then(success => {
            assert.isOk(success, "Success value should be returned");
            assert.isAbove(fs.readdirSync(sampleDirectory).length, 0, `Directory ${sampleDirectory} shouldn't be empty`);
        }).catch(err => {
            assert.instanceOf(Error);
        });
    }).timeout(20000);

    it("Should configure the template for project input", () => {
        configureProject({ name:projectName }, sampleDirectory);
        const package = require(path.join(sampleDirectory, 'package.json'));
        assert.equal(package.name, projectName, `Package name '${package.name}' should be '${projectName}'`);
    });

    after(() => {
        // Remove sample directory
        if (fs.existsSync(sampleDirectory)) rimraf.sync(sampleDirectory);
    });
})