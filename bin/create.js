/**
 * Created by yinshipeng on 2018/3/6
 */
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const rimraf = require('rimraf')
const inquirer = require('inquirer')
const ora = require('ora')
const download = require('download-git-repo')

module.exports = async function create (template, projectName) {
    const targetDir = path.resolve(process.cwd(), projectName)
    if (fs.existsSync(targetDir)) {
        const {action} = await inquirer.prompt([
            {
                name: 'action',
                type: 'list',
                message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
                choices: [
                    {name: 'Overwrite', value: 'overwrite'},
                    {name: 'Cancel', value: false}
                ]
            }
        ])
        if (!action) {
            return
        } else if (action === 'overwrite') {
            rimraf.sync(targetDir)
        }
    }

    fs.mkdirSync(targetDir)

    await downloadAndGenerate(template, targetDir)
    createPkg(targetDir, projectName)
}

/**
 * 下载模板
 * @param template
 * @param templateDir
 */
function downloadAndGenerate (template, templateDir) {
    const templateList = {
        'wxos-template': 'yinshipeng/wxos-template'
    }

    if (!templateList.hasOwnProperty(template)) {
        throw new Error('This template cannot be found.')
    }
    const spinner = ora('downloading template').start()
    return new Promise((resolve, reject) => {
        download(templateList[template], templateDir, {clone: true}, function (err) {
            spinner.stop()
            if (err) {
                console.log('Failed to download repo ' + template + ': ' + err.message.trim())
                reject()
            }
            resolve()
        })
    })

}

/**
 * 生成package.json文件
 * @param templateDir
 * @param projectName
 */
function createPkg (templateDir, projectName) {
    const pkg_path = path.join(templateDir, '/package.json')
    const package = require(pkg_path)

    const targetPackage = {
        name: projectName,
        version: package.version,
        description: `A ${projectName} project`,
        author: '',
        license: '',
        repository: {},
        scripts: package.scripts,
        keywords: package.keywords,
        dependencies: package.dependencies,
        devDependencies: package.devDependencies,
        optionalDependencies: package.optionalDependencies
    }

    const pkgFileContent = JSON.stringify(targetPackage, null, 4)
    fs.writeFile(pkg_path, pkgFileContent, function (err) {
        if (err) {
            console.error(err)
        } else {
            console.log(`The project has been generated，please perform ${chalk.cyan(`cd ${projectName} && npm install`)}`)
        }
    })
}

process.on('unhandledRejection', error => {
    console.error('unhandledRejection', error)
    process.exit(1)
})