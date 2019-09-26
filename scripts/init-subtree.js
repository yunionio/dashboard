#!/usr/bin/env node
const minimist = require('minimist')
const inquirer = require('inquirer')
const execa = require('execa')
const {
  logWithSpinner,
  stopSpinner,
} = require('@vue/cli-shared-utils')

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
  initRepos(repos)
}

async function initRepos (repos) {
  logWithSpinner(`🗃`, `开始初始化子模块...`)
  for (let key in repos) {
    await execa('git', ['remote', 'add', key, repos[key]])
    await execa('git', ['subtree', 'add', `--prefix=${REPO_OPTIONS[key].dir}`, key, 'master'])
  }
  stopSpinner()
}

function setup () {
  const args = minimist(process.argv.slice(2))
  if (args.noconfirm) {
    const repos = {}
    for (let key in REPO_OPTIONS) {
      repos[key] = REPO_OPTIONS[key].repo
    }
    initRepos(repos)
  } else {
    promptSelectSubs()
  }
}

setup()
