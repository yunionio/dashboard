
import Vue from 'vue'

const requireDirectives = require.context('.', false, /\w+\.js$/)

requireDirectives.keys().forEach(fileName => {
  if (fileName === './index.js') return
  const config = requireDirectives(fileName)
  const name = fileName.replace(/^\.\/(.*)\.\w+$/, '$1')
  Vue.directive(
    name,
    config.default || config
  )
})
