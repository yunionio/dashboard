<template>
  <div class="dashboard-wrap d-flex flex-column">
    <!-- 选项加载完毕 -->
    <template v-if="dashboardOptionsLoaded">
      <!-- tabs -->
      <div class="dashboard-header flex-shrink-0 flex-grow-0 pl-1 d-flex">
        <div class="flex-fill">
          <a-tabs :activeKey="currentDashboardKey" @change="handleTabChange" :animated="false">
            <template v-for="item of dashboardDefaultOptions">
              <a-tab-pane :tab="item.name" :key="item.id" />
            </template>
            <template v-for="item of dashboardOptions">
              <a-tab-pane :tab="item.name" :key="item.id" />
            </template>
            <a-dropdown :trigger="['click']" slot="tabBarExtraContent">
              <a class="ant-dropdown-link pr-2 pl-2 pt-2 pb-2" @click="e => e.preventDefault()">···</a>
              <a-menu slot="overlay" @click="handleActionClick">
                <a-menu-item key="create"><a-icon type="plus" />新建</a-menu-item>
                <a-menu-item key="edit" :disabled="isDefaultDashboard"><a-icon type="edit" />编辑</a-menu-item>
                <a-menu-item key="download" :disabled="isDefaultDashboard || disableDownloadConfig"><a-icon type="download" />导出</a-menu-item>
                <a-menu-item key="import"><a-icon type="file" />导入</a-menu-item>
                <a-menu-item key="delete" :disabled="isDefaultDashboard"><a-icon type="delete" />删除</a-menu-item>
              </a-menu>
            </a-dropdown>
          </a-tabs>
        </div>
      </div>
      <!-- dashboard -->
      <div class="dashboard-body flex-fill">
        <div class="layout-wrap">
          <grid-layout
            ref="grid-layout"
            :layout.sync="layout"
            :col-num="colNum"
            :max-rows="maxRows"
            :row-height="rowHeight"
            :margin="colMargin"
            :vertical-compact="false"
            :is-draggable="false"
            :is-resizable="false"
            :is-mirrored="false">
            <grid-item
              class="edit-grid-item"
              v-for="(item, key) in dashboard"
              :x="item.layout.x"
              :y="item.layout.y"
              :w="item.layout.w"
              :h="item.layout.h"
              :i="key"
              :key="key">
              <component
                class="card-shadow"
                :is="item.layout.component"
                :options="item.layout"
                :params="item.params" />
            </grid-item>
          </grid-layout>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="d-flex align-items-center justify-content-center h-100"><a-spin /></div>
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import VueGridLayout from 'vue-grid-layout'
import extendsComponents from '@Dashboard/extends'
import { Base64 } from 'js-base64'
import { clear as clearCache } from '@Dashboard/utils/cache'
import defaultConfig from './config/default'
import storage from '@/utils/storage'
import { download } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'Dashboard',
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    ...extendsComponents,
  },
  mixins: [WindowsMixin],
  data () {
    return {
      loading: false,
      dashboardDefaultOptions: [],
      dashboardOptions: [],
      dashboardOptionsLoaded: false,
      dashboard: {},
      currentDashboardOption: {},
      dashboardParams: {},
      layout: [],
      colNum: 56,
      rowHeight: 65,
      colMargin: [5, 5],
      maxRows: 34,
      defaultGridW: 2,
      defaultGridH: 2,
      currentDashboardKey: '',
    }
  },
  computed: {
    ...mapGetters(['scope']),
    disableDownloadConfig () {
      return R.isNil(this.dashboardOptions) || R.isEmpty(this.dashboardOptions)
    },
    isDefaultDashboard () {
      return this.currentDashboardKey.includes('default')
    },
  },
  destroyed () {
    this.pm = null
    clearCache()
  },
  created () {
    this.dashboardDefaultOptions = defaultConfig[this.scope]['options']
    this.pm = new this.$Manager('parameters', 'v1')
    this.fetchDashboardOptions()
    // 点击更多时操作的配置，key对应到
    this.moreActionOptions = {
      create: {
        method: 'handleToEdit',
      },
      edit: {
        method: 'handleToEdit',
        params: () => [this.currentDashboardOption.id],
      },
      download: {
        method: 'handleDownloadConfig',
      },
      import: {
        method: 'handleImportConfig',
      },
      delete: {
        method: 'handleRemoveDashboard',
      },
    }
  },
  methods: {
    async fetchDashboardOptions () {
      this.loading = true
      try {
        const response = await this.pm.get({ id: `dashboard_${this.scope}` })
        if (response.data && response.data.value) {
          this.dashboardOptions = response.data.value
        }
        let item = storage.get(`__oc_dashboard_${this.scope}__`)
        const matched = item && this.dashboardOptions.find(obj => obj.id === item.id)
        if (!matched) {
          item = this.dashboardDefaultOptions[0]
        }
        this.handleDashboardChange(item)
      } catch (error) {
        this.handleDashboardChange(this.dashboardDefaultOptions[0])
        throw error
      } finally {
        this.loading = false
        this.dashboardOptionsLoaded = true
      }
    },
    async fetchDashboard (id) {
      this.loading = true
      try {
        const response = await this.pm.get({ id: this.currentDashboardOption.id })
        if (response.data && response.data.value) {
          this.dashboard = response.data.value || {}
        }
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    handleDashboardChange (item) {
      // 是否为默认面板
      this.currentDashboardKey = item.id
      storage.set(`__oc_dashboard_${this.scope}__`, item)
      this.currentDashboardOption = item
      if (this.isDefaultDashboard) {
        this.dashboard = defaultConfig[this.scope][item.id]
      } else {
        this.fetchDashboard()
      }
    },
    handleTabChange (id) {
      const opt = R.find(R.propEq('id', id))([...this.dashboardDefaultOptions, ...this.dashboardOptions])
      if (opt) {
        this.handleDashboardChange(opt)
      }
    },
    handleToEdit (id) {
      this.$router.push({ name: 'DashboardEdit', query: { id } })
    },
    handleRemoveDashboard () {
      this.$confirm({
        content: '确定删除当前面板？',
        onOk: async () => {
          try {
            const newOptions = [ ...this.dashboardOptions ]
            const index = R.findIndex(R.propEq('id', this.currentDashboardOption.id))(newOptions)
            if (index !== -1) {
              newOptions.splice(index, 1)
            }
            const optionsResponse = await this.pm.update({
              id: `dashboard_${this.scope}`,
              data: {
                value: newOptions,
              },
            })
            await this.pm.delete({
              id: this.currentDashboardOption.id,
            })
            this.dashboardOptions = optionsResponse.data.value || []
            this.handleDashboardChange(this.dashboardDefaultOptions[0] || this.dashboardOptions[0])
          } catch (error) {
            throw error
          }
        },
        okText: this.$t('common.ok'),
        cancelText: this.$t('common.cancel'),
      })
    },
    handleDownloadConfig () {
      const ret = {
        scope: this.scope,
        items: [],
      }
      R.forEachObjIndexed((value, key) => {
        ret.items.push(value)
      }, this.dashboard)
      const data = Base64.encode(JSON.stringify(ret))
      const name = `${this.$t(`policyScopeLabel.${this.scope}`)}_${this.currentDashboardOption.name}.ocdb`
      download(data, name)
    },
    handleImportConfig () {
      this.createDialog('DashboardImport', {
        dashboardOptions: this.dashboardOptions,
        fetchDashboardOptions: () => this.fetchDashboardOptions(),
      })
    },
    handleActionClick ({ key }) {
      const opt = this.moreActionOptions[key]
      const method = opt.method
      const params = opt['params'] && opt['params']()
      params ? this[method](...params) : this[method]()
    },
  },
}
</script>

<style lang="scss" scoped>
.dashboard-wrap {
  position: absolute;
  top: 64px;
  left: 60px;
  padding: 15px 20px;
  bottom: 0;
  right: 0;
  overflow: auto;
}
.card-shadow {
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.1);
}
.layout-wrap {
  min-height: 2245px;
  min-width: 3925px;
}
</style>
