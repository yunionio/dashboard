import Vue from 'vue'

Vue.config.productionTip = false
Vue.config.devtools = process.env.NODE_ENV === 'development'

// import scope vue全局配置
const scopeConfig = require.context('../scope', false, /.\/vue.scope.config.js/)
scopeConfig.keys().forEach(scopeConfig)
