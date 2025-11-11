<template>
  <div class="d-flex flex-column flex-fill h-100">
    <template v-if="optionsLoaded">
      <div style="padding-left: 5px;">
        <dashboard-header
          :tabs="allOptions"
          :current="currentOption"
          :data="dashboard"
          :check-options-created="checkCustomOptionsCreated"
          :init-options="initCustomOptions"
          :is-default-option="isDefault"
          @select="handleCurrentOptionSelect"
          @update-options="updateOptions"
          @refresh="refresh" />
      </div>
      <div class="flex-fill position-relative">
        <div class="position-absolute" style="top: 0; left: 0; right: 0; bottom: 0;">
          <dashboard-content ref="content" :data="dashboard" />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="pt-4 pb-4 text-center"><a-spin :tip="$t('dashboard.text_117')" /></div>
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters, mapState } from 'vuex'
import store from '@/store'
import storage from '@/utils/storage'
import { addClass, removeClass, hasClass } from '@/utils/dom'
import publicDefaultConfig from './config/public-default'
import defaultConfig from './config/default'
import DashboardHeader from './components/Header'
import DashboardContent from './components/Content'

// option
// [{ id: 'xxx', name: 'xxx', index: 2, hidden: true, type: 'default' }]

export default {
  name: 'Dashboard',
  components: {
    DashboardHeader,
    DashboardContent,
  },
  data () {
    const isPrivate = process.env.VUE_APP_IS_PRIVATE
    return {
      isPrivate,
      loading: false,
      // 面板配置是否加载完毕
      optionsLoaded: false,
      // 默认面板配置 -> [{ id: 'xxx', name: 'xxx' }]
      defaultOptions: isPrivate && !store.getters.isSysCE ? defaultConfig[this.$store.getters.scope].options : publicDefaultConfig[this.$store.getters.scope].options,
      // 自定义面板配置
      customOptions: [],
      // 当前面板配置 -> { id: 'xxx', name: 'xxx' }
      currentOption: {},
      // 面板卡片的配置 Object, Array;
      dashboard: {},
    }
  },
  computed: {
    ...mapGetters(['scope', 'globalConfig']),
    ...mapState('setting', {
      l2MenuVisible: state => state.l2MenuVisible,
    }),
    // 当前选择面板是否为默认面板
    isDefault () {
      return this.currentOption.id && this.currentOption.id === `dashboard-${this.scope}-default`
    },
    // 选择的面板信息存储到storage的key
    optionStorageKey () {
      return `__oc_dashboard_${this.scope}__`
    },
    // custom options的配置key
    optionsConfigKey () {
      return `dashboard_${this.scope}`
    },
    // 所有的面板配置
    allOptions () {
      /* const customOptions = this.customOptions.map((v) => {
        if (!v.name) {
          v.name = this.$t('dashboard.text_121')
        }
        return v
      }) */
      return R.unionWith(R.eqBy(R.prop('id')), this.customOptions, this.defaultOptions)
    },
  },
  watch: {
    l2MenuVisible (val) {
      this.addAppPageClass()
    },
  },
  beforeDestroy () {
    this.pm = null
    removeClass(this.$appPage, this.appPageAddedClass.join(' '))
    this.$appPage = null
  },
  async created () {
    this.pm = new this.$Manager('parameters', 'v1')
    try {
      this.customOptions = await this.getCustomOptions()
    } catch (error) {
      this.customOptions = []
    }
    // 获取以往选择的面板
    let selected = storage.get(this.optionStorageKey)
    const matched = selected && this.allOptions.find(obj => obj.id === selected.id)
    if (!matched) {
      selected = this.allOptions[0]
    }
    this.handleCurrentOptionSelect(selected)
  },
  mounted () {
    this.addAppPageClass()
  },
  methods: {
    addAppPageClass () {
      if (!this.$appPage) this.$appPage = document.getElementById('app-page')
      if (!this.$appPage) return
      const toBeAddedClass = ['h-100', 'd-flex', 'flex-column', 'mb-0']
      this.appPageAddedClass = []
      for (let i = 0, len = toBeAddedClass.length; i < len; i++) {
        if (!hasClass(this.$appPage, toBeAddedClass[i])) {
          addClass(this.$appPage, toBeAddedClass[i])
          this.appPageAddedClass.push(toBeAddedClass[i])
        }
      }
    },
    // 选择面板
    async handleCurrentOptionSelect (option) {
      this.currentOption = option
      // 按scope维度记录选择的面板信息
      storage.set(this.optionStorageKey, option)
      const dashboard = await this.getDashboard()
      this.dashboard = dashboard
    },
    // 获取自定义面板配置
    async getCustomOptions () {
      this.loading = true
      try {
        const response = await this.pm.get({ id: this.optionsConfigKey })
        if (response.data && response.data.value) {
          return response.data.value
        }
        return []
      } catch (error) {
        throw error
      } finally {
        this.loading = false
        this.optionsLoaded = true
      }
    },
    // 获取面板卡片配置
    async getDashboard () {
      // 当前选择的面板id
      const id = this.currentOption.id
      this.loading = true
      try {
        const response = await this.pm.get({ id })
        if (response.data && response.data.value) {
          return response.data.value
        }
        return {}
      } catch (error) {
        if (error.isAxiosError && error.response && error.response.status === 404 && this.isDefault) {
          // not found system default dashboard, reinit one
          const shareConfig = await this.initWidgetParamter()
          const config = this.isPrivate && !this.$store.getters.isSysCE ? (shareConfig || defaultConfig[this.scope][id]) : publicDefaultConfig[this.scope][id]
          if (!this.globalConfig.enable_quota_check) {
            // remove quota widgets
            for (var i = 0; i < config.length; i++) {
              if (config[i].layout.component === 'Quota' || config[i].layout.component === 'ProjectQuota') {
                config.splice(i, 1)
                i--
              }
            }
          }
          await this.pm.create({
            data: {
              name: id,
              value: config,
            },
          })
          return config
        }
        throw error
      } finally {
        this.loading = false
      }
    },
    // 更新面板配置
    async updateOptions (newOptions) {
      const options = [...this.allOptions]
      try {
        this.customOptions = newOptions
        const response = await this.pm.update({
          id: this.optionsConfigKey,
          data: {
            value: newOptions,
          },
        })
        this.customOptions = response.data.value || []
      } catch (error) {
        this.customOptions = options
        throw error
      }
    },
    // 检查是否已经创建过控制面板的配置
    checkCustomOptionsCreated () {
      return new Promise((resolve, reject) => {
        this.pm.get({ id: this.optionsConfigKey }).then(() => {
          resolve(true)
        }).catch(error => {
          if (error.response && error.response.status === 404) {
            resolve(false)
          } else {
            reject(error)
          }
        })
      })
    },
    // 初始化控制面板配置
    initCustomOptions () {
      return this.pm.create({
        data: {
          name: this.optionsConfigKey,
          value: [],
        },
      })
    },
    refresh () {
      this.$refs.content.refresh()
    },
    async initWidgetParamter () {
      try {
        const response = await this.$store.dispatch('widgetSetting/getFetchWidgetSetting')

        if (response?.value && response.value[`dashboard-${this.scope}`]) {
          return response.value[`dashboard-${this.scope}`]
        }
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>
