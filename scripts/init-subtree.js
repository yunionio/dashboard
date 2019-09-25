#!/usr/bin/env node
const inquirer = require('inquirer')
const execa = require('execa')

const REPO_OPTIONS = require('../conf/repo.json')

async function promptSelectSubs () {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      message: '选择要使用的子模块: ',
      name: 'selectedSubs',
      choices: Object.keys(REPO_OPTIONS).map(key => {
        return {
          name: REPO_OPTIONS[key].label,
          value: key,
          checked: true,
        }
      }),
    },
  ])
  promptRepo(answers)
}

async function promptRepo (answers) {
  const { selectedSubs } = answers
  const questions = selectedSubs.map(key => {
    const item = REPO_OPTIONS[key]
    return {
      type: 'input',
      name: key,
      message: `${item.label}模块仓库地址（默认: ${item.repo}）: `,
      filter: val => {
        return val || item.repo
      },
    }
  })
  const repos = await inquirer.prompt(questions)
  for (let key in repos) {
    await execa('git', ['remote', 'add', key, repos[key]])
    await execa('git', ['subtree', 'add', `--prefix=${REPO_OPTIONS[key].dir}`, key, 'master'])
  }
}

function setup () {
  promptSelectSubs()
}

setup()
