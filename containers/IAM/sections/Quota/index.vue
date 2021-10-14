<template>
  <div>
    <a-alert type="warning" :closable="false" v-show="!readyOnly">
      <div slot="message">{{$t('system.text_32')}}<br />{{$t('system.text_33')}}<br />{{$t('system.text_34')}}<br /><br />{{$t('system.text_35')}}<br />{{$t('system.text_36')}}<br />{{$t('system.text_37')}}<br />{{$t('system.text_38')}}</div>
    </a-alert>
    <!-- 虚拟机配额 -->
    <div class="d-flex justify-content-between quota-title">
      <h3>{{$t('system.text_39', [$t('dictionary.server')])}}</h3>
      <a-tooltip>
        <template slot="title">{{$t('system.text_40')}}</template>
        <a-icon type="reload" @click="refreshQuota()" />
      </a-tooltip>
    </div>
    <vxe-grid
      :size="tableConfig.size"
      ref="xHostQuotaTable"
      class="mt-4"
      keep-source
      :loading="quotaData.host.loading"
      :data="quotaData.host.list"
      :columns="hostQuota.columns"
      :edit-config="tableConfig.editConfig"
      @edit-closed="editClosedEvent('host')"
      @edit-actived="editActivedEvent" />
    <quota-message v-if="quotaData.host.isAdd && quotaData.host.isKeyRepeat" />
    <div v-show="!readyOnly && !quotaData.host.isUpdate" class="quota-add"><span class="add" @click="addQuotaHandle(-1, 'host')">{{$t('system.text_41')}}</span></div>
    <!-- 区域配额 -->
    <div class="d-flex justify-content-between quota-title"><h3>{{$t('system.text_42')}}</h3></div>
    <vxe-grid
      :size="tableConfig.size"
      ref="xRegionQuotaTable"
      class="mt-4"
      :loading="quotaData.region.loading"
      :data="quotaData.region.list"
      :columns="regionQuota.columns"
      :edit-config="tableConfig.editConfig"
      @edit-closed="editClosedEvent('region')"
      @edit-actived="editActivedEvent" />
    <quota-message v-if="quotaData.region.isAdd && quotaData.region.isKeyRepeat" />
    <div v-show="!readyOnly && !quotaData.region.isUpdate" class="quota-add"><span class="add" @click="addQuotaHandle(-1, 'region')">{{$t('system.text_41')}}</span></div>
    <!-- 项目配额 -->
    <div class="d-flex justify-content-between quota-title"><h3>{{$t('system.text_43')}}</h3></div>
    <vxe-grid
      :size="tableConfig.size"
      ref="xProjectQuotaTable"
      class="mt-4"
      :loading="quotaData.project.loading"
      :data="quotaData.project.list"
      :columns="projectQuota.columns"
      :edit-config="tableConfig.editConfig"
      @edit-closed="editClosedEvent('project')" />
    <!-- 镜像配额 -->
    <div class="d-flex justify-content-between quota-title"><h3>{{$t('system.text_44')}}</h3></div>
    <vxe-grid
      :size="tableConfig.size"
      ref="xImageQuotaTable"
      class="mt-4"
      :loading="quotaData.image.loading"
      :data="quotaData.image.list"
      :columns="imageQuota.columns"
      :edit-config="tableConfig.editConfig"
      @edit-closed="editClosedEvent('image')"
      @edit-actived="editActivedEvent" />
    <quota-message v-if="quotaData.image.isAdd && quotaData.image.isKeyRepeat" />
    <div v-show="!readyOnly && !quotaData.image.isUpdate" class="quota-add"><span class="add" @click="addQuotaHandle(-1, 'image')">{{$t('system.text_41')}}</span></div>
    <template v-if="isDomainScene">
      <div class="d-flex justify-content-between quota-title"><h3>{{$t('system.text_45')}}</h3></div>
      <vxe-grid
        :size="tableConfig.size"
        ref="xDomainQuotaTable"
        class="mt-4"
        :loading="quotaData.domain.loading"
        :data="quotaData.domain.list"
        :columns="domainQuota.columns"
        :edit-config="tableConfig.editConfig"
        @edit-closed="editClosedEvent('domain')" />
      <!-- <div v-show="!readyOnly && !quotaData.domain.isUpdate" class="quota-add"><span class="add" @click="addQuotaHandle(-1, 'domain')">{{$t('system.text_41')}}</span></div> -->
      <div class="d-flex justify-content-between quota-title"><h3>{{$t('system.text_46')}}</h3></div>
      <vxe-grid
        :size="tableConfig.size"
        ref="xIdentityQuotaTable"
        class="mt-4"
        :loading="quotaData.identity.loading"
        :data="quotaData.identity.list"
        :columns="identityQuota.columns"
        :edit-config="tableConfig.editConfig"
        @edit-closed="editClosedEvent('identity')" />
      <!-- <div v-show="!readyOnly && !quotaData.identity.isUpdate" class="quota-add"><span class="add" @click="addQuotaHandle(-1, 'identity')">{{$t('system.text_41')}}</span></div> -->
      <!-- 基础设施配额 -->
      <div class="d-flex justify-content-between quota-title"><h3>{{$t('system.text_47')}}</h3></div>
      <vxe-grid
        :size="tableConfig.size"
        ref="xInfrasQuotaTable"
        class="mt-4"
        :loading="quotaData.infras.loading"
        :data="quotaData.infras.list"
        :columns="infrasQuota.columns"
        :edit-config="tableConfig.editConfig"
        @edit-closed="editClosedEvent('infras')"
        @edit-actived="editActivedEvent" />
      <quota-message v-if="quotaData.infras.isAdd && quotaData.infras.isKeyRepeat" />
      <div v-show="!readyOnly && !quotaData.infras.isUpdate" class="quota-add"><span class="add" @click="addQuotaHandle(-1, 'infras')">{{$t('system.text_41')}}</span></div>
    </template>
  </div>
</template>

<script>
import _ from 'lodash'
import { HYPERVISORS_GROUP } from '@/constants'
import { hasPermission } from '@/utils/auth'
import WindowsMixin from '@/mixins/windows'
import ProjectQuotaMixin from './mixins/projectQuota'
import ImageQuotaMixin from './mixins/imageQuota'
import RegionQuotaMixin from './mixins/regionQuota'
import HostQuotaMixin from './mixins/hostQuota'
import DomainQuotaMixin from './mixins/domainQuota'
import IdentityQuotaMixin from './mixins/identityQuota'
import InfrasQuotaMixin from './mixins/infrasQuota'
import QuotaTableActionMixin from './mixins/quotaTableAction'
import { getArrUniqData, fetchHypervisors } from './utils'
import { cloudEnvOptions, hypervisorOptions } from './constants'
import QuotaMessage from './components/QuotaMessage'

export default {
  name: 'QuotaView',
  components: {
    QuotaMessage,
  },
  mixins: [ProjectQuotaMixin, ImageQuotaMixin, RegionQuotaMixin, HostQuotaMixin, DomainQuotaMixin, IdentityQuotaMixin, InfrasQuotaMixin, QuotaTableActionMixin, WindowsMixin],
  props: {
    domain: {
      type: String,
    },
    tenant: {
      type: String,
    },
    readyOnly: {
      type: Boolean,
      default: false,
    },
    scene: {
      type: String,
      required: false,
      validator: val => ['domain', 'tenant'].includes(val),
    },
  },
  data () {
    return {
      tableConfig: {
        size: 'mini',
        editConfig: { trigger: 'manual', mode: 'row', showIcon: false, autoClear: false },
      },
      quotaData: {
        project: {
          loading: false,
          list: [],
          isUpdate: false,
          isAdd: false,
        },
        image: {
          loading: false,
          list: [],
          isUpdate: false,
          isAdd: false,
          isKeyRepeat: true,
        },
        region: {
          loading: false,
          list: [],
          isUpdate: false,
          isAdd: false,
          isKeyRepeat: true,
        },
        host: {
          loading: false,
          list: [],
          isUpdate: false,
          isAdd: false,
          isKeyRepeat: true,
        },
        domain: {
          loading: false,
          list: [],
          isUpdate: false,
          isAdd: false,
        },
        identity: {
          loading: false,
          list: [],
          isUpdate: false,
          isAdd: false,
        },
        infras: {
          loading: false,
          list: [],
          isUpdate: false,
          isAdd: false,
          isKeyRepeat: true,
        },
      },
    }
  },
  computed: {
    commonFields () {
      return [
        {
          field: 'cloud_env',
          title: this.$t('system.text_48'),
          width: 100,
          editRender: { name: 'select', options: cloudEnvOptions, events: { change: this.cloudEnvChangeHandle }, attrs: { disabled: false } },
          formatter: ({ row }) => {
            const env = cloudEnvOptions.find((item) => { return item.value === row.cloud_env })
            return (env && env.label) || this.$t('system.text_25')
          },
        },
        {
          field: 'brand',
          title: this.$t('system.text_49'),
          width: 100,
          editRender: { name: 'select', options: [{ label: this.$t('system.text_25'), value: '' }], events: { change: this.brandChangeHandle }, attrs: { disabled: false } },
          formatter: ({ row }) => {
            if (row.brand) {
              const hasKey = this.$te(`scopeProviders['${row.brand.toLowerCase()}']`)
              return hasKey ? this.$t(`scopeProviders['${row.brand.toLowerCase()}']`) : row.brand
            }
            return this.$t('system.text_25')
          },
        },
        {
          field: 'account',
          title: this.$t('system.text_50'),
          width: 100,
          editRender: { name: 'select', options: [{ label: this.$t('system.text_25'), value: '' }], events: { change: this.accountChangeHandle }, attrs: { disabled: false } },
          formatter: ({ row }) => {
            return row.account || this.$t('system.text_25')
          },
        },
        {
          field: 'manager',
          title: this.$t('system.text_51'),
          width: 100,
          editRender: { name: 'select', options: [{ label: this.$t('system.text_25'), value: '' }], events: { change: this.managerChangeHandle }, attrs: { disabled: false } },
          formatter: ({ row }) => {
            return row.manager || this.$t('system.text_25')
          },
        },
        {
          field: 'region',
          title: this.$t('system.text_52'),
          width: 100,
          editRender: { name: 'select', options: [{ label: this.$t('system.text_25'), value: '' }], events: { change: this.regionChangeHandle }, attrs: { disabled: false } },
          formatter: ({ row }) => {
            return row.region || this.$t('system.text_25')
          },
        },
      ]
    },
    isDomainScene () {
      return this.scene === 'domain'
    },
  },
  watch: {
    domain () {
      this.updateDetailData()
    },
    tenant () {
      this.updateDetailData()
    },
  },
  created () {
    this.updateDetailData()
  },
  methods: {
    refreshQuota () {
      this.refresh = true
      Object.keys(this.quotaData).forEach((k) => {
        if (this.quotaData[k] && this.quotaData[k].isUpdate) {
          this.quotaData[k].isUpdate = false
          const tableRef = `x${k.charAt(0).toUpperCase() + k.slice(1)}QuotaTable`
          this.$refs[tableRef].clearActived()
        }
      })
      this.$nextTick(() => {
        this.updateDetailData()
      })
    },
    updateDetailData () {
      this.fetchProjectQuota()
      this.fetchImageQuota()
      this.fetchRegionQuota()
      this.fetchHostQuota()
      if (this.isDomainScene) {
        this.fetchDomainQuota()
        this.fetchIdentityQuota()
        this.fetchInfrasQuota()
      }
    },
    async cloudEnvChangeHandle ({ row, data }, evnt) {
      this.checkKeyRepeat(data, row, evnt, 'cloud_env', row.action)
      this.resetRowFields(row, 'cloud_env')
      row.cloud_env = evnt.target.value
      const xTable = _.capitalize(row.action)
      const column = this.$refs[`x${xTable}QuotaTable`].getColumnByField('brand')
      column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }]
      if (row.cloud_env) {
        this.quotaData[row.action].loading = true
        try {
          const res = await this.fetchCloudBrand(row.cloud_env)
          const env = row.cloud_env === 'onpremise' ? 'idc' : row.cloud_env
          const brands = Object.values(HYPERVISORS_GROUP[env]).map((item) => {
            return item.brand
          })
          let options = res.data.data[0].compute_engine_brands.filter((v) => {
            return brands.find((item) => { return item.toLowerCase() === v.toLowerCase() })
          })
          options = options.map((item) => {
            const hasKey = this.$te(`scopeProviders['${item.toLowerCase()}']`)
            return {
              label: hasKey ? this.$t(`scopeProviders['${item.toLowerCase()}']`) : item,
              value: item,
            }
          })
          column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }, ...options]
        } catch (error) {
          throw error
        }
        this.quotaData[row.action].loading = false
      }
    },
    async brandChangeHandle ({ row, data }, evnt) {
      this.checkKeyRepeat(data, row, evnt, 'brand', row.action)
      this.resetRowFields(row, 'brand')
      row.brand = evnt.target.value
      const xTable = _.capitalize(row.action)
      const column = this.$refs[`x${xTable}QuotaTable`].getColumnByField('account')
      column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }]
      if (row.brand) {
        this.quotaData[row.action].loading = true
        try {
          const res = await this.fetchCloudAccount(row.brand)
          let options = getArrUniqData(res.data.data, 'name')
          options = options.map((item) => {
            return {
              label: item.name,
              value: item.id,
            }
          })
          column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }, ...options]
        } catch (error) {
          throw error
        }
        this.quotaData[row.action].loading = false
      }
      if (row.brand !== 'OneCloud') {
        const column = this.$refs[`x${xTable}QuotaTable`].getColumnByField('hypervisor')
        if (column) {
          column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }]
        }
      } else {
        const column = this.$refs[`x${xTable}QuotaTable`].getColumnByField('hypervisor')
        if (column) {
          column.editRender.options = [...hypervisorOptions]
        }
      }
    },
    async accountChangeHandle ({ row, data }, evnt) {
      this.checkKeyRepeat(data, row, evnt, 'account', row.action)
      this.resetRowFields(row, 'account')
      row.account = evnt.target.value
      const xTable = _.capitalize(row.action)
      const column = this.$refs[`x${xTable}QuotaTable`].getColumnByField('manager')
      column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }]
      if (row.account) {
        this.quotaData[row.action].loading = true
        try {
          const res = await this.fetchCloudManager(row.account)
          let options = getArrUniqData(res.data.data, 'name')
          options = options.map((item) => {
            return {
              label: item.name,
              value: item.id,
            }
          })
          column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }, ...options]
        } catch (error) {
          throw error
        }
        this.quotaData[row.action].loading = false
      }
    },
    async managerChangeHandle ({ row, data }, evnt) {
      this.checkKeyRepeat(data, row, evnt, 'manager', row.action)
      this.resetRowFields(row, 'manager')
      row.manager = evnt.target.value
      const xTable = _.capitalize(row.action)
      const column = this.$refs[`x${xTable}QuotaTable`].getColumnByField('region')
      column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }]
      if (row.manager) {
        this.quotaData[row.action].loading = true
        try {
          const res = await this.fetchCloudRegion(row.manager)
          let options = getArrUniqData(res.data.data, 'name')
          options = options.map((item) => {
            return {
              label: this._$t(item),
              value: item.id,
            }
          })
          column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }, ...options]
        } catch (error) {
          throw error
        }
        this.quotaData[row.action].loading = false
      }
    },
    async regionChangeHandle ({ row, data }, evnt) {
      this.checkKeyRepeat(data, row, evnt, 'region', row.action)
      this.resetRowFields(row, 'region')
      row.region = evnt.target.value
      if (['zone', 'host'].includes(row.action)) {
        const xTable = _.capitalize(row.action)
        const column = this.$refs[`x${xTable}QuotaTable`].getColumnByField('zone')
        column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }]
        if (row.region) {
          this.quotaData[row.action].loading = true
          try {
            const res = await this.fetchCloudZone(row.region)
            let options = getArrUniqData(res.data.data, 'name')
            options = options.map((item) => {
              return {
                label: this._$t(item),
                value: item.id,
              }
            })
            column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }, ...options]
          } catch (error) {
            throw error
          }
          this.quotaData[row.action].loading = false
        }
      }
    },
    zoneChangeHandle ({ row, data }, evnt) {
      this.checkKeyRepeat(data, row, evnt, 'zone', row.action)
      row.zone = evnt.target.value
    },
    hypervisorChangeHandle ({ row, data }, evnt) {
      this.checkKeyRepeat(data, row, evnt, 'hypervisor', row.action)
      row.hypervisor = evnt.target.value
    },
    doQuotaUpdate (params, action) {
      const _action = action === 'host' ? 'quotas' : `${action}_quotas`
      const manager = new this.$Manager(_action)
      if (this.domain) {
        params.domain = this.domain
      }
      if (this.tenant) {
        params.tenant = this.tenant
      }
      return manager.rpc({ methodname: 'DoQuotaSet', params })
    },
    fetchCloudBrand (cloudEnv) {
      return fetchHypervisors({ scope: this.$store.getters.scope })
    },
    fetchCloudAccount (brand) {
      const manager = new this.$Manager('cloudaccounts')
      const params = {}
      if (brand) {
        params.brand = brand
      } else {
        params.limit = 0
      }
      return manager.list({ params })
    },
    fetchCloudManager (account) {
      const manager = new this.$Manager('cloudproviders')
      const params = {}
      if (account) {
        params.cloudaccount_id = account
      } else {
        params.limit = 0
      }
      return manager.list({ params })
    },
    fetchCloudRegion (account) {
      const manager = new this.$Manager('cloudregions')
      const params = {}
      if (account) {
        params.manager = account
      } else {
        params.limit = 0
      }
      return manager.list({ params })
    },
    fetchCloudZone (region) {
      const manager = new this.$Manager('zones')
      const params = {}
      if (region) {
        params.cloudregion_id = region
      } else {
        params.limit = 0
      }
      return manager.list({ params })
    },
    resetRowFields (row, field) {
      const fields = ['brand', 'account', 'manager', 'region', 'zone']
      const xTable = _.capitalize(row.action)
      for (let i = fields.length - 1; i >= 0; i--) {
        if (fields[i] === field) {
          break
        }
        const column = this.$refs[`x${xTable}QuotaTable`].getColumnByField(`${fields[i]}`)
        if (column) {
          row[`${fields[i]}`] = ''
          column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }]
        }
      }
    },
    backfillRowFeildsOptions (row, field) {
      const fields = ['brand', 'account', 'manager', 'region', 'zone', 'hypervisor']
      const fieldHandle = {
        brand: async (xTable, column, field) => {
          let options = []
          if (row.cloud_env) {
            const res = await this[`fetchCloud${_.capitalize(field)}`](row.cloud_env)
            const env = row.cloud_env === 'onpremise' ? 'idc' : row.cloud_env
            const brands = Object.values(HYPERVISORS_GROUP[env]).map((item) => {
              return item.brand
            })
            options = res.data.data[0].compute_engine_brands.filter((v) => {
              return brands.find((item) => { return item.toLowerCase() === v.toLowerCase() })
            })
            options = options.map((item) => {
              const hasKey = this.$te(`scopeProviders['${item.toLowerCase()}']`)
              return {
                label: hasKey ? this.$t(`scopeProviders['${item.toLowerCase()}']`) : item,
                value: item,
              }
            })
          }
          column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }, ...options]
        },
        account: async (xTable, column, field) => {
          const res = await this[`fetchCloud${_.capitalize(field)}`](row.brand)
          let options = getArrUniqData(res.data.data)
          options = options.map((item) => {
            return {
              label: item.name,
              value: item.id,
            }
          })
          column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }, ...options]
        },
        manager: async (xTable, column, field) => {
          const res = await this[`fetchCloud${_.capitalize(field)}`](row.account)
          let options = getArrUniqData(res.data.data)
          options = options.map((item) => {
            return {
              label: this._$t(item),
              value: item.id,
            }
          })
          column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }, ...options]
        },
        region: async (xTable, column, field) => {
          const res = await this[`fetchCloud${_.capitalize(field)}`](row.manager)
          let options = getArrUniqData(res.data.data)
          options = options.map((item) => {
            return {
              label: this._$t(item),
              value: item.id,
            }
          })
          column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }, ...options]
        },
        zone: async (xTable, column, field) => {
          const res = await this[`fetchCloud${_.capitalize(field)}`](row.region)
          let options = getArrUniqData(res.data.data)
          options = options.map((item) => {
            return {
              label: this._$t(item),
              value: item.id,
            }
          })
          column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }, ...options]
        },
      }
      fields.forEach((v) => {
        try {
          const xTable = _.capitalize(row.action)
          const column = this.$refs[`x${xTable}QuotaTable`].getColumnByField(v)
          if (column && fieldHandle[v]) {
            column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }]
            fieldHandle[v] && fieldHandle[v](xTable, column, v)
          }
          if (column && v === 'hypervisor') {
            if (row.brand !== 'OneCloud') {
              column.editRender.options = [{ label: this.$t('system.text_25'), value: '' }]
            } else {
              column.editRender.options = [...hypervisorOptions]
            }
          }
        } catch (error) {
          throw error
        }
      })
    },
    $matchedPolicy (policyKey) {
      return hasPermission({ key: policyKey })
    },
    isAllAny (row) {
      const fields = ['cloud_env', 'brand', 'account', 'manager', 'region']
      return fields.every((v) => { return !row[v] })
    },
    checkKeyRepeat (data, row, e, field, action) {
      if (data && data.length > 0) {
        const newRow = { ...row, [field]: e.target.value }
        const cloud_env = newRow.cloud_env || undefined
        const brand = newRow.brand || undefined
        const account = newRow.account || undefined
        const manager = newRow.manager || undefined
        const region = newRow.region || undefined
        const zone = newRow.zone || undefined
        const hypervisor = newRow.hypervisor || undefined
        const isKeyRepeat = data.some((item) => {
          if (action === 'region' || action === 'infras') {
            return item.cloud_env === cloud_env &&
              item.brand === brand &&
              item.account_id === account &&
              item.manager_id === manager &&
              item.region_id === region
          }
          if (action === 'host') {
            return item.cloud_env === cloud_env &&
              item.brand === brand &&
              item.account_id === account &&
              item.manager_id === manager &&
              item.region_id === region &&
              item.zone_id === zone &&
              item.hypervisor === hypervisor
          }
          return false
        })
        this.quotaData[action].isKeyRepeat = isKeyRepeat
      }
    },
  },
}
</script>

<style lang="less" scoped>
.quota-title {
  margin-top: 26px;
  text-indent: 12px;
  color: #0A1F44;
  border-bottom: 1px solid #0A1F44;
  h3, span {
    font-size: 14px;
    font-weight: normal;
  }
  h3 {
    border-left: 3px solid #1890ff;
  }
  span {
    color: #1890ff;
    cursor: pointer;
  }
}
.quota-add {
  height: 40px;
  line-height: 40px;
  font-size: 12px;
  text-align: center;
  border: 1px solid #e8eaec;
  border-top: none;
}
.add {
  display: inline-block;
  margin-right: 6px;
  color: #1890ff;
  cursor: pointer;
}
.del {
  display: inline-block;
  cursor: pointer;
}
</style>
