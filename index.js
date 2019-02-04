#!/usr/bin/env node

const path = require('path');
const arg = require('arg');
const colors = require('colors');
const pkg = require(path.resolve(__dirname, './package.json'));
const { createBoilerplate } = require('./create');
// Flag Creation
const args = arg({
    // Types
    '--help': Boolean,
    '--version': Boolean,
    '--name': String,
    // Aliases
    '-h': '--help',
    '-v': '--version',
    '-n': '--name'
});

// Handle version request
if (args['--version']) {
    console.log(colors.white(`${pkg.name} v${pkg.version}`));
    process.exit(0);
}

// Handle help or empty request
if (args['--help'] || (!args._[0])) {
    console.log(`
        ${pkg.name} - ${pkg.description}

        ${colors.cyan("USAGE:")}
            ${pkg.name} myapp

        ${colors.cyan("OPTIONS:")}
            --help,     -h      Displays this help message.
            --version,  -v      Outputs the current ${pkg.name} version.
            --name,     -n      Your project name
    `)

    process.exit(0);
}

createBoilerplate(args);