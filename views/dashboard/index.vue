<template>
  <div class="dashboard-wrap d-flex flex-column">
    <div class="dashboard-header flex-shrink-0 flex-grow-0 pl-1 mb-4 d-flex" v-if="!dashboardEmpty">
      <div class="flex-fill">
        <a-dropdown :trigger="['click']">
          <a-button type="link" class="text-color pl-0">{{ currentDashboardOption.name }}<a-icon type="down" /></a-button>
          <a-menu slot="overlay" @click="e => handleDashboardClick({ id: e.key, name: e.item.title })">
            <a-menu-item v-for="item of dashboardOptions" :key="item.id" :title="item.name">{{ item.name }}</a-menu-item>
          </a-menu>
        </a-dropdown>
        <a-button type="link" icon="plus" @click="() => handleToEdit()">新建</a-button>
        <a-button type="link" icon="edit" @click="() => handleToEdit(currentDashboardOption.id)">编辑</a-button>
        <a-button type="link" icon="download" @click="handleDownloadConfig" :disabled="disableDownloadConfig">导出</a-button>
        <a-button type="link" icon="file" @click="handleImportConfig">导入</a-button>
        <a-popover trigger="click" v-model="deletePopoverVisible">
          <template v-slot:content>
            <div><a-icon type="exclamation-circle" class="warning-color mr-1" />你所选<span class="font-weight-bold ml-2 mr-2">{{currentDashboardOption.name}}</span>将执行<span class="error-color ml-2 mr-2">删除</span>操作操作，是否确认？</div>
            <div class="text-right mt-2">
              <a-button size="small" type="primary" @click="handleRemoveDashboard">确定</a-button>
              <a-button size="small" @click="deletePopoverVisible = false" class="ml-2">取消</a-button>
            </div>
          </template>
          <a-button type="link" icon="delete">删除</a-button>
        </a-popover>
      </div>
      <a-button type="link" @click="swtchOldDashboard" v-if="$appConfig.isPrivate">使用旧版</a-button>
    </div>
    <div class="dashboard-body flex-fill">
      <div class="d-flex align-items-center justify-content-center h-100" v-if="loading">
        <a-spin />
      </div>
      <div class="d-flex flex-column h-100" v-if="dashboardEmpty && !loading">
        <div class="text-right flex-grow-0 flex-shrink-0">
          <a-button type="link" @click="swtchOldDashboard" v-if="$appConfig.isPrivate">使用旧版</a-button>
        </div>
        <div class="flex-fill d-flex align-items-center justify-content-center">
          <a-empty>
            <template v-slot:description>
              <div>暂无控制面板，点击<a-button type="link" icon="plus" @click="() => handleToEdit()" />新建或<a-button type="link" icon="file" @click="handleImportConfig" />导入</div>
            </template>
          </a-empty>
        </div>
      </div>
      <div v-if="!dashboardEmpty" class="layout-wrap">
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
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import VueGridLayout from 'vue-grid-layout'
import extendsComponents from '@Dashboard/extends'
import Cookies from 'js-cookie'
import { Base64 } from 'js-base64'
import { clear as clearCache } from '@Dashboard/utils/cache'
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
      dashboardOptions: [],
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
      deletePopoverVisible: false,
    }
  },
  computed: {
    ...mapGetters(['scope']),
    dashboardEmpty () {
      return this.dashboardOptions.length <= 0
    },
    disableDownloadConfig () {
      return R.isNil(this.dashboardOptions) || R.isEmpty(this.dashboardOptions)
    },
  },
  destroyed () {
    this.pm = null
    clearCache()
  },
  created () {
    this.pm = new this.$Manager('parameters', 'v1')
    this.fetchDashboardOptions()
  },
  methods: {
    async fetchDashboardOptions () {
      this.loading = true
      try {
        const response = await this.pm.get({ id: `dashboard_${this.scope}` })
        if (response.data && response.data.value) {
          this.dashboardOptions = response.data.value || []
        }
        if (this.dashboardOptions.length > 0) {
          let item = storage.get(`__oc_dashboard_${this.scope}__`)
          const matched = item && this.dashboardOptions.find(obj => obj.id === item.id)
          if (!matched) {
            item = this.dashboardOptions[0]
          }
          this.handleDashboardClick(item)
        }
      } catch (error) {
        throw error
      } finally {
        this.loading = false
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
    handleDashboardClick (item) {
      storage.set(`__oc_dashboard_${this.scope}__`, item)
      this.currentDashboardOption = item
      this.fetchDashboard()
    },
    handleToEdit (id) {
      this.$router.push({ name: 'DashboardEdit', query: { id } })
    },
    async handleRemoveDashboard () {
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
        this.handleDashboardClick(this.dashboardOptions[0])
      } catch (error) {
        throw error
      }
    },
    swtchOldDashboard () {
      Cookies.set('__oc_dashboard_version__', 'v1', { expires: 365 })
      window.location.href = `${process.env.VUE_APP_V1_PERFIX}/dashboard`
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
