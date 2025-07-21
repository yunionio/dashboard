<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">
          {{ form.fd.name }}<a-icon class="ml-2" type="loading" v-if="loading" />
          <span v-if="isResDeny" class="ml-2"><a-icon class="warning-color mr-1" type="warning" />{{ $t('common.permission.403') }}</span>
        </div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
          <a class="ml-2" v-if="!edit" @click="goPage">
            <icon type="arrow-right" style="font-size:18px" />
          </a>
        </div>
      </div>
      <div class="dashboard-card-body flex-column justify-content-center">
        <template v-if="seriesData && seriesData.length">
          <div class="flex-fill position-relative">
            <div class="dashboard-fco-wrap">
              <template v-for="item in seriesData">
                <div class="mt-2 mb-2" :key="item.name">
                  <div class="d-flex mini-text">
                    <div class="flex-fill text-truncate" :title="item.name">{{ item.name }}</div>
                    <div class="flex-grow-0 flex-shrink-0 text-color-help ml-2">{{ getLabel(item.value) }}</div>
                  </div>
                  <a-progress :percent="getPercent(item.value)" :showInfo="false" status="normal" :strokeWidth="4" stroke-color="#ADE4B6" />
                </div>
              </template>
            </div>
          </div>
        </template>
        <template v-else>
          <data-empty />
        </template>
      </div>
    </div>
    <base-drawer :visible.sync="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit">
      <a-form
        hideRequiredMark
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dashboard.text_6')">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item :label="$t('dashboard.text_56')">
          <a-radio-group v-decorator="decorators.resType" @change="handleResTypeChange">
            <a-radio-button value="server">{{$t('dashboard.text_57')}}</a-radio-button>
            <a-radio-button value="host">{{$t('dashboard.text_58')}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('dashboard.text_55')">
          <a-select v-decorator="decorators.brand" allowClear :placeholder="$t('dashboard.text_99')" mode="multiple">
            <template v-for="item of brands">
              <a-select-option :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('dashboard.text_20')">
          <a-select v-decorator="decorators.usage">
            <template v-for="item of usageOptions[form.fd.resType]">
              <a-select-option :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
            </template>
          </a-select>
          <div slot="extra">
            <i18n path="metricConfig.create_form.metric_extra">
              <template #link>
                <help-link :href="metricDoc">{{$t('metricConfig.create_form.usage_link')}}</help-link>
              </template>
            </i18n>
          </div>
        </a-form-item>
        <a-form-item :label="$t('monitor.overview.aggregate')">
          <a-select v-decorator="decorators.dimensionId">
            <a-select-option v-for="item in dimentions" :value="item.id" :key="item.id">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="TOP/Bottom">
          <a-select v-decorator="decorators.order">
            <a-select-option value="TOP">TOP</a-select-option>
            <a-select-option value="BOTTOM">BOTTOM</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('dashboard.text_59')">
          <a-input-number :min="1" :max="100" v-decorator="decorators.limit" />
        </a-form-item>
        <a-form-item :label="$t('dashboard.text_60')">
          <a-select v-decorator="decorators.time">
            <template v-for="item of timeOptions">
              <a-select-option :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { load } from '@Dashboard/utils/cache'
import { resolveValueChangeField } from '@/utils/common/ant'
import { findPlatform, typeClouds } from '@/utils/common/hypervisor'
import { getRequestT } from '@/utils/utils'
import { hasPermission } from '@/utils/auth'
import { getSignature } from '@/utils/crypto'
import { getMetricDocs } from '@Dashboard/constants'
import setting from '@/config/setting'
import { usageConfig, serverUsageOptions, hostUsageOptions } from './constants'

export default {
  name: 'Top5',
  components: {
    BaseDrawer,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
    edit: Boolean,
  },
  data () {
    const initialBrandValue = (this.params && this.params.brand && R.split(',', this.params.brand)) || []
    const initialResTypeValue = (this.params && this.params.resType) || 'server'
    const initialDimensionId = (this.params && this.params.dimensionId) || (initialResTypeValue === 'server' ? 'vm_id' : 'host_id')
    let initialUsage = this.params && this.params.usage
    if (!initialUsage) {
      if (initialResTypeValue === 'server') {
        initialUsage = serverUsageOptions[0].key
      }
      if (initialResTypeValue === 'host') {
        initialUsage = hostUsageOptions[0].key
      }
    }
    const initialNameValue = (this.params && this.params.name) || `${serverUsageOptions[0].label}TOP5`
    const initialOrderValue = (this.params && this.params.order) || 'TOP'
    const initialLimit = (this.params && this.params.limit) || 5
    const initialTime = (this.params && this.params.time) || 24 * 60
    return {
      data: [],
      visible: false,
      loading: false,
      seriesData: [],
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            const newField = resolveValueChangeField(values)
            R.forEachObjIndexed((item, key) => {
              this.$set(this.form.fd, key, item)
            }, newField)
          },
        }),
        fd: {
          name: initialNameValue,
          brand: initialBrandValue,
          resType: initialResTypeValue,
          usage: initialUsage,
          order: initialOrderValue,
          limit: initialLimit,
          time: initialTime,
          dimensionId: initialDimensionId,
        },
      },
      usageOptions: {
        server: serverUsageOptions,
        host: hostUsageOptions,
      },
      timeOptions: [
        { label: this.$t('timeselect.hour', [1]), key: 60 * 60 },
        { label: this.$t('timeselect.hours', [6]), key: 360 * 60 },
        { label: this.$t('timeselect.hours', [12]), key: 12 * 60 * 60 },
        { label: this.$t('timeselect.days', [1]), key: 24 * 60 * 60 },
        { label: this.$t('timeselect.days', [7]), key: 7 * 24 * 60 * 60 },
        { label: this.$t('timeselect.days', [14]), key: 14 * 24 * 60 * 60 },
        { label: this.$t('timeselect.months', [1]), key: 30 * 24 * 60 * 60 },
      ],
      decorators: {
        name: [
          'name',
          {
            initialValue: initialNameValue,
            rules: [
              { required: true, message: this.$t('dashboard.text_8') },
            ],
          },
        ],
        brand: [
          'brand',
          {
            initialValue: initialBrandValue,
            // rules: [
            //   { required: true, message: this.$t('dashboard.text_72') },
            // ],
          },
        ],
        resType: [
          'resType',
          {
            initialValue: initialResTypeValue,
            rules: [
              { required: true, message: this.$t('dashboard.text_73') },
            ],
          },
        ],
        usage: [
          'usage',
          {
            initialValue: initialUsage,
            rules: [
              { required: true, message: this.$t('dashboard.text_22') },
            ],
          },
        ],
        order: [
          'order',
          {
            initialValue: initialOrderValue,
            rules: [
              { required: true, message: this.$t('dashboard.text_74') },
            ],
          },
        ],
        limit: [
          'limit',
          {
            initialValue: initialLimit,
            rules: [
              { required: true, message: this.$t('dashboard.text_75') },
            ],
          },
        ],
        time: [
          'time',
          {
            initialValue: initialTime,
            rules: [
              { required: true, message: this.$t('dashboard.text_76') },
            ],
          },
        ],
        dimensionId: [
          'dimensionId',
          {
            initialValue: initialDimensionId,
            rules: [{ required: true, message: '' }],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
      metricDoc: getMetricDocs(this.$store.getters.scope),
    }
  },
  computed: {
    ...mapGetters(['scope', 'capability', 'isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo', 'permission']),
    brandEnvs () {
      const brand = this.form.fd.brand
      return brand.map(key => findPlatform(key))
    },
    maxSeriesData () {
      const dataList = this.seriesData.map(item => Number(item.value))
      const maxData = Math.max.apply(null, dataList)
      return maxData > 100 ? maxData : 100
    },
    brands () {
      const isServer = this.form.fd.resType === 'server'
      const brands = (this.capability.brands || []).map(item => {
        const opt = typeClouds.brandMap[item]
        if (opt) {
          return {
            label: opt.label,
            key: opt.key,
          }
        }
        return {
          label: item,
          key: item,
        }
      })
      if (isServer) {
        return brands.filter(item => {
          const env = findPlatform(item.key)
          return env !== 'private' || env !== 'idc'
        })
      }
      return brands.filter(item => {
        const env = findPlatform(item.key)
        return env === 'private' || env === 'idc'
      })
    },
    dimentions () {
      const curScope = this.scope
      const scopeLevel = Math.max(['project', 'domain', 'system'].indexOf(curScope) + 1, 0)
      const ret = []
      if (this.form.fd.resType === 'server') {
        ret.push({ scope: curScope, id: 'vm_id', name: 'vm_name', label: this.$t('cloudenv.text_99') })
      } else {
        ret.push({ scope: curScope, id: 'host_id', name: 'host', label: this.$t('cloudenv.text_101') })
      }
      scopeLevel > 2 && ret.push({
        scope: curScope,
        id: 'domain_id',
        name: 'project_domain',
        label: this.$t('dictionary.domain'),
      })
      scopeLevel > 1 && this.form.fd.resType === 'server' && ret.push({
        scope: curScope,
        id: 'tenant_id',
        name: 'tenant',
        label: this.$t('dictionary.project'),
      })
      ret.push({ scope: curScope, id: 'brand', name: 'brand', label: this.$t('common.brands') })
      ret.push({ scope: curScope, id: 'cloudregion_id', name: 'cloudregion', label: this.$t('cloudenv.text_10') })
      ret.push({ scope: curScope, id: 'zone_id', name: 'zone', label: this.$t('cloudenv.text_11') })
      return ret
    },
    dimension () {
      return this.dimentions.filter((d) => { return d.id === this.form.fd.dimensionId })[0]
    },
    isResDeny () {
      const usage = this.params?.usage || ''
      if (usage.endsWith('vm_cpu') || usage.endsWith('vm_mem') || usage.endsWith('vm_disk')) {
        return !hasPermission({ key: 'servers_list', permissionData: this.permission })
      }
      return !hasPermission({ key: 'compute_usages_get' })
    },
  },
  watch: {
    'form.fd' (val) {
      const newVal = { ...val }
      for (const key in newVal) {
        this.decorators[key][1].initialValue = newVal[key]
      }
      this.form.fc.setFieldsValue(newVal)
      this.$nextTick(() => {
        this.fetchData()
      })
      // this.changeName(val)
    },
    'form.fd.resType' (val) {
      if (this.dimentions.filter(item => item.id === this.form.fd.dimensionId).length === 0) {
        this.form.fc.setFieldsValue({
          dimensionId: this.dimentions[0].id,
        })
      }
      this.changeName(val, this.form.fd.usage)
    },
    'form.fd.usage': {
      handler (val) {
        this.changeName(this.form.fd.resType, val)
      },
    },
  },
  created () {
    const values = { ...this.form.fd }
    values.brand = R.join(',', values.brand || [])
    this.$emit('update', this.options.i, values)
    this.fetchData()
  },
  methods: {
    refresh () {
      return this.fetchData()
    },
    async fetchData () {
      // if (!this.form.fd.brand) return
      if (this.isResDeny) return
      this.loading = true
      try {
        const requestData = this.genQueryData()
        requestData.signature = getSignature(requestData)
        const data = await load({
          res: 'unifiedmonitors',
          actionArgs: {
            url: '/v1/unifiedmonitors/query',
            method: 'POST',
            params: {
              $t: getRequestT(),
              ignoreErrorStatusCode: [403],
            },
            data: requestData,
          },
          useManager: false,
          resPath: 'data.series',
        })
        this.seriesData = this.toHistogramChartData(data || [])
      } finally {
        this.loading = false
      }
    },
    toHistogramChartData (series) {
      const { order, limit } = this.form.fd
      let rows = series.map((item) => {
        const lastPoint = item.points ? item.points[item.points.length - 1] : undefined
        if (lastPoint) {
          return {
            name: this.filterByOem(item.tags[this.dimension.name]),
            id: item.tags[this.dimension.id],
            value: lastPoint[0],
            timestamp: lastPoint[1],
            tags: item.tags,
          }
        }
      })
      rows = rows.sort((a, b) => {
        if (order.toLowerCase() === 'bottom') {
          return a.value - b.value
        } else {
          return b.value - a.value
        }
      })
      if (rows.length > limit) {
        rows = rows.slice(0, limit)
      }
      return rows
    },
    filterByOem (name) {
      if (this.form.fd.dimensionId === 'brand') {
        if (name === 'OneCloud') {
          return setting.brand[setting.language] || name
        } else if (name === 'Cloudpods') {
          const { companyInfo = {} } = this.$store.state.app
          return setting.language === 'en' ? (companyInfo.inner_copyright_en || name) : (companyInfo.inner_copyright || name)
        }
      }
      return name
    },
    handleEdit () {
      this.visible = true
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.form.fd = values
        const updateValues = { ...values }
        updateValues.brand = updateValues.brand.join(',')
        this.$emit('update', this.options.i, updateValues)
        this.visible = false
      } catch (error) {
        throw error
      }
    },
    handleResTypeChange (e) {
      this.form.fc.setFieldsValue({
        usage: this.usageOptions[e.target.value][0].key,
        brand: [],
      })
    },
    genQueryData () {
      const fd = this.form.fd
      let ret = ''
      const brandKey = 'brand'
      const brand = this.form.fd.brand
      const usageKeys = fd.usage.split(',')
      const min = fd.time / 60
      const condition = this.getDomainOrProjectQuery()
      const brandTags = brand.map(key => {
        return {
          key: brandKey,
          value: key,
          operator: '=',
          condition: 'and',
        }
      })
      if (this.brandEnvs.length && this.brandEnvs.every(env => env === 'public')) {
        if (fd.resType === 'server') {
          // ret = `SELECT ${fd.order}("${usageKeys[0]}", "vm_name", "vm_ip", "hypervisor", ${fd.limit}) FROM "${usageKeys[1]}" WHERE time > now() - ${min}m AND "${brandKey}"='${brand}'`
          ret = {
            metric_query: [
              {
                model: {
                  database: 'telegraf',
                  measurement: usageKeys[1],
                  select: [
                    [
                      {
                        type: 'field',
                        params: [usageKeys[0], 'vm_name', 'vm_ip'],
                      },
                      { type: 'mean' },
                      { type: 'abs' },
                    ],
                  ],
                  tags: [
                    {
                      key: this.groupInput(),
                      operator: '!=',
                      value: '',
                    },
                    ...brandTags,
                  ],
                  group_by: this.groupBy(usageKeys[0]),
                },
              },
            ],
            scope: this.scope,
            from: `${min}m`,
            interval: `${min}m`,
            unit: true,
          }
        }
        if (condition && condition.length > 0) {
          // ret += ` AND ${condition}`
          ret.metric_query[0].model.tags.push(condition)
        }
        return ret
      } else if (this.brandEnvs.includes('idc') || this.brandEnvs.includes('private')) {
        if (fd.resType === 'server') {
          // ret = `SELECT ${fd.order}("${usageKeys[0]}", "vm_name", "vm_ip", ${fd.limit}) FROM "telegraf"."30day_only"."${usageKeys[1]}" WHERE time > now() - ${min}m AND "${brandKey}"='${brand}'`
          ret = {
            metric_query: [
              {
                model: {
                  database: 'telegraf',
                  measurement: usageKeys[1],
                  select: [
                    [
                      {
                        type: 'field',
                        params: [usageKeys[0], 'vm_name', 'vm_ip'],
                      },
                      { type: 'mean' },
                      { type: 'abs' },
                    ],
                  ],
                  tags: [
                    {
                      key: this.groupInput(),
                      operator: '!=',
                      value: '',
                    },
                    ...brandTags,
                  ],
                  group_by: this.groupBy(usageKeys[0]),
                },
              },
            ],
            scope: this.scope,
            from: `${min}m`,
            interval: `${min}m`,
            unit: true,
          }
        }
        if (fd.resType === 'host') {
          // ret = `SELECT ${fd.order}("${usageKeys[0]}", ${fd.limit}) FROM "${usageKeys[1]}" WHERE "res_type" = 'host' AND time > now() - ${min}m AND "${brandKey}" = '${brand}' GROUP BY "host"`
          ret = {
            metric_query: [
              {
                model: {
                  database: 'telegraf',
                  measurement: usageKeys[1],
                  select: [
                    [
                      {
                        type: 'field',
                        params: [usageKeys[0], 'host', 'host_ip'],
                      },
                      { type: 'mean' },
                      { type: 'abs' },
                    ],
                  ],
                  tags: [
                    {
                      key: this.groupInput(),
                      operator: '!=',
                      value: '',
                    },
                    ...brandTags,
                  ],
                  group_by: this.groupBy(usageKeys[0]),
                },
              },
            ],
            scope: this.scope,
            from: `${min}m`,
            interval: `${min}m`,
            unit: true,
          }
        }
        if (condition) {
          ret.metric_query[0].model.tags.push(condition)
          // ret += ` AND ${condition}`
        }
        return ret
      } else {
        if (fd.resType === 'server') {
          ret = {
            metric_query: [
              {
                model: {
                  database: 'telegraf',
                  measurement: usageKeys[1],
                  select: [
                    [
                      {
                        type: 'field',
                        params: [usageKeys[0], 'vm_name', 'vm_ip'],
                      },
                      { type: 'mean' },
                      { type: 'abs' },
                    ],
                  ],
                  tags: [
                    {
                      key: this.groupInput(),
                      operator: '!=',
                      value: '',
                    }],
                  group_by: this.groupBy(usageKeys[0]),
                },
              },
            ],
            scope: this.scope,
            from: `${min}m`,
            unit: true,
            interval: `${min}m`,
          }
        }
        if (fd.resType === 'host') {
          ret = {
            metric_query: [
              {
                model: {
                  database: 'telegraf',
                  measurement: usageKeys[1],
                  select: [
                    [
                      {
                        type: 'field',
                        params: [usageKeys[0], 'host', 'host_ip'],
                      },
                      { type: 'mean' },
                      { type: 'abs' },
                    ],
                  ],
                  tags: [
                    {
                      key: this.groupInput(),
                      operator: '!=',
                      value: '',
                    }],
                  group_by: this.groupBy(usageKeys[0]),
                },
              },
            ],
            scope: this.scope,
            from: `${min}m`,
            unit: true,
            interval: `${min}m`,
          }
        }
        if (condition && condition.length > 0) {
          // ret += ` AND ${condition}`
          ret.metric_query[0].model.tags.push(condition)
        }
        return ret
      }
    },
    getLabel (val) {
      const fixedVal = isNaN(Number(val)) ? 0 : Number(val).toFixed(2)
      const formatter = usageConfig[this.form.fd.usage] && usageConfig[this.form.fd.usage].formatter
      if (formatter) return formatter(fixedVal)
      return fixedVal
    },
    getPercent (val) {
      const num = (val / this.maxSeriesData).toFixed(2) * 100
      return Number.isFinite(num) ? num : 0
    },
    getDomainOrProjectQuery () {
      if (this.isProjectMode) {
        // return `"tenant_id" = '${this.userInfo.projectId}'`
        return {
          key: 'tenant_id',
          value: this.userInfo.projectId,
          operator: '=',
        }
      } else if (this.isDomainMode) {
        // return `"domain_id" = '${this.userInfo.projectDomainId}'`
        return {
          key: 'domain_id',
          value: this.userInfo.projectDomainId,
          operator: '=',
        }
      }
      return null
    },
    groupInput () {
      if (this.form.fd.resType === 'host') {
        return 'project_domain'
      }
      switch (this.dimension.scope) {
        case 'system':
          return 'project_domain'
        default:
          return 'tenant'
      }
    },
    groupBy (field) {
      const ret = []

      if ((this.dimension.scope === 'system' || this.dimension.scope === 'domain') && this.dimension.name === 'tenant') {
        ret.push({ type: 'field', params: ['project_domain'] })
      } else if (this.dimension.scope === 'project' && this.dimension.name !== 'tenant') {
        ret.push({ type: 'field', params: ['tenant'] })
      } else {
        ret.push({ type: 'field', params: [this.dimension.name] })
        ret.push({ type: 'field', params: [this.dimension.id] })
      }
      return ret
    },
    goPage () {
      this.$router.push('./monitoroverview')
    },
    changeName (resType, usage) {
      let usage_label = ''
      if (resType === 'server') {
        usage_label = serverUsageOptions.find(item => item.key === usage)?.label
      }
      if (resType === 'host') {
        usage_label = hostUsageOptions.find(item => item.key === usage)?.label
      }
      this.form.fc.setFieldsValue({
        name: `${usage_label}TOP5`,
      })
    },
  },
}
</script>
