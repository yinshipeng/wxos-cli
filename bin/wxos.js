#!/usr/bin/env node

const chalk = require('chalk')
const program = require('commander')
const create = require('./create')

program
    .version(require('../package').version)
    .usage('<command> [options]')

program
    .command('init <template> <app-name>')
    .description('generate a project from a remote template')
    .action((template, appName) => {
        create(template, appName)
    })

program
    .command('list')
    .description('list available official templates')
    .action(() => {
        console.log()
        console.log('   Available official templates:')
        console.log()
        console.log(`   ${chalk.yellowBright(`★`)}  ${chalk.greenBright(`wxos-template`)} - A simple weex application quick template.`)
        console.log()
    })

// add some useful info on help
program.on('--help', () => {
    console.log()
    console.log(`  Run ${chalk.cyan(`wxos <command> --help`)} for detailed usage of given command.`)
    console.log()
})

program.commands.forEach(c => c.on('--help', () => console.log()))

// enhance common error messages
const enhanceErrorMessages = (methodName, log) => {
    program.Command.prototype[methodName] = function (...args) {
        if (methodName === 'unknownOption' && this._allowUnknownOption) {
            return
        }
        this.outputHelp()
        console.log(`  ` + chalk.red(log(...args)))
        console.log()
        process.exit(1)
    }
}

enhanceErrorMessages('missingArgument', argName => {
    return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', optionName => {
    return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
    return `Missing required argument for option ${chalk.yellow(option.flags)}` + (
        flag ? `, got ${chalk.yellow(flag)}` : ``
    )
})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
    program.outputHelp()
}
