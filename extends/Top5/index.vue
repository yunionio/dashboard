<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
        </div>
      </div>
      <div class="dashboard-card-body flex-column justify-content-center">
        <template v-if="seriesData && seriesData.length">
          <div class="flex-fill position-relative">
            <div class="dashboard-fco-wrap">
              <template v-for="item in seriesData">
                <div class="mt-2 mb-2" :key="item.host">
                  <div class="d-flex mini-text">
                    <div class="flex-fill text-truncate" :title="item.host">{{ item.host }}</div>
                    <div class="flex-grow-0 flex-shrink-0 text-color-help ml-2">{{ getLabel(item.value) }}</div>
                  </div>
                  <a-progress :percent="getPercent(item.value)" :showInfo="false" status="normal" :strokeWidth="4" stroke-color="rgb(82, 196, 26)" />
                </div>
              </template>
            </div>
          </div>
        </template>
        <template v-else>
          <a-empty />
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
        <a-form-item :label="$t('dashboard.text_55')">
          <a-select v-decorator="decorators.brand">
            <template v-for="item of capability.brands">
              <a-select-option :key="item" :value="item">{{ item }}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('dashboard.text_56')">
          <a-radio-group v-decorator="decorators.resType" @change="handleResTypeChange">
            <a-radio-button value="server">{{$t('dashboard.text_57')}}</a-radio-button>
            <a-radio-button value="host" v-if="showResTypeHost">{{$t('dashboard.text_58')}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('dashboard.text_20')">
          <a-select v-decorator="decorators.usage">
            <template v-for="item of usageOptions[form.fd.resType]">
              <a-select-option :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
            </template>
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
import { usageConfig } from './constants'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { load } from '@Dashboard/utils/cache'
import { resolveValueChangeField } from '@/utils/common/ant'
import { typeClouds, findPlatform } from '@/utils/common/hypervisor'
import { getRequestT } from '@/utils/utils'

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
  },
  data () {
    const serverUsageOptions = [
      { label: this.$t('dashboard.text_61'), key: 'usage_active,vm_cpu' },
      { label: this.$t('dashboard.text_62'), key: 'read_bps,vm_diskio' },
      { label: this.$t('dashboard.text_63'), key: 'write_bps,vm_diskio' },
      { label: this.$t('dashboard.text_64'), key: 'bps_recv,vm_netio' },
      { label: this.$t('dashboard.text_65'), key: 'bps_sent,vm_netio' },
    ]
    const hostUsageOptions = [
      { label: this.$t('dashboard.text_61'), key: 'usage_active,cpu' },
      { label: this.$t('dashboard.text_46'), key: 'used_percent,mem' },
      { label: this.$t('dashboard.text_64'), key: 'bps_recv,net' },
      { label: this.$t('dashboard.text_65'), key: 'bps_sent,net' },
    ]
    const initialNameValue = (this.params && this.params.name) || 'TOP5'
    const initialBrandValue = (this.params && this.params.brand) || ''
    const initialResTypeValue = (this.params && this.params.resType) || 'server'
    let initialUsage = this.params && this.params.usage
    if (!initialUsage) {
      if (initialResTypeValue === 'server') {
        initialUsage = serverUsageOptions[0].key
      }
      if (initialResTypeValue === 'host') {
        initialUsage = hostUsageOptions[0].key
      }
    }
    const initialOrderValue = (this.params && this.params.order) || 'TOP'
    const initialLimit = (this.params && this.params.limit) || 5
    const initialTime = (this.params && this.params.time) || 60 * 60 * 30
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
        },
      },
      usageOptions: {
        server: serverUsageOptions,
        host: hostUsageOptions,
      },
      timeOptions: [
        { label: this.$t('dashboard.text_66'), key: 60 * 60 * 5 },
        { label: this.$t('dashboard.text_67'), key: 60 * 60 * 10 },
        { label: this.$t('dashboard.text_68'), key: 60 * 60 * 15 },
        { label: this.$t('dashboard.text_69'), key: 60 * 60 * 20 },
        { label: this.$t('dashboard.text_70'), key: 60 * 60 * 25 },
        { label: this.$t('dashboard.text_71'), key: 60 * 60 * 30 },
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
            rules: [
              { required: true, message: this.$t('dashboard.text_72') },
            ],
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
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'capability', 'isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
    brandEnv () {
      return findPlatform(this.form.fd.brand)
    },
    showResTypeHost () {
      return this.brandEnv === 'private' || this.brandEnv === 'idc'
    },
    maxSeriesData () {
      const dataList = this.seriesData.map(item => Number(item.value))
      const maxData = Math.max.apply(null, dataList)
      return maxData > 100 ? maxData : 100
    },
  },
  watch: {
    'form.fd' (val) {
      this.fetchData()
      for (const key in this.decorators) {
        let config = this.decorators[key][1] || {}
        config = {
          ...config,
          initialValue: val[key],
        }
        this.decorators[key][1] = config
      }
    },
    showResTypeHost (val) {
      if (!val) {
        this.form.fc.setFieldsValue({
          resType: 'server',
          usage: this.usageOptions.server[0].key,
        })
      }
    },
  },
  created () {
    this.$emit('update', this.options.i, this.form.fd)
    this.fetchData()
  },
  methods: {
    refresh () {
      return this.fetchData()
    },
    async fetchData () {
      if (!this.form.fd.brand) return
      this.loading = true
      try {
        const data = await load({
          res: 'query',
          actionArgs: {
            baseURL: '',
            url: '/query',
            method: 'GET',
            params: {
              $t: getRequestT(),
              db: 'telegraf',
              epoch: 'ms',
              q: this.genSQLQuery(),
            },
          },
          useManager: false,
          resPath: 'data.results[0].series',
        })
        this.seriesData = this.seriesDataMapper(data)
      } finally {
        this.loading = false
      }
    },
    handleEdit () {
      this.visible = true
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.form.fd = values
        this.$emit('update', this.options.i, values)
        this.visible = false
      } catch (error) {
        throw error
      }
    },
    handleResTypeChange (e) {
      this.form.fc.setFieldsValue({
        usage: this.usageOptions[e.target.value][0].key,
      })
    },
    genSQLQuery () {
      const fd = this.form.fd
      let ret = ''
      let brand = fd.brand
      let brandKey = 'brand'
      const usageKeys = fd.usage.split(',')
      const min = fd.time / 60 / 60
      const condition = this.getDomainOrProjectQuery()
      if (this.brandEnv === 'idc' || this.brandEnv === 'private') {
        const hypervisor = typeClouds.brandMap[brand].hypervisor
        if (hypervisor === 'kvm') {
          brandKey = 'platform'
          brand = 'kvm'
        }
        if (fd.resType === 'server') {
          ret = `SELECT ${fd.order}("${usageKeys[0]}", "vm_name", "vm_ip", ${fd.limit}) FROM "telegraf"."30day_only"."${usageKeys[1]}" WHERE time > now() - ${min}m AND "${brandKey}"='${brand}'`
        }
        if (fd.resType === 'host') {
          ret = `SELECT ${fd.order}("${usageKeys[0]}", ${fd.limit}) FROM "${usageKeys[1]}" WHERE "res_type" = 'host' AND time > now() - ${min}m AND "${brandKey}" = '${brand}' GROUP BY "host"`
        }
        if (condition && condition.length > 0) {
          ret += ` AND ${condition}`
        }
        return ret
      }
      if (this.brandEnv === 'public') {
        if (fd.resType === 'server') {
          ret = `SELECT ${fd.order}("${usageKeys[0]}", "vm_name", "vm_ip", "hypervisor", ${fd.limit}) FROM "${usageKeys[1]}" WHERE time > now() - ${min}m AND "${brandKey}"='${brand}'`
        }
        if (condition && condition.length > 0) {
          ret += ` AND ${condition}`
        }
        return ret
      }
      return ret
    },
    seriesDataMapper (series) {
      if (!series || !series.length) return []
      const index = series[0].columns.findIndex(v => v === 'vm_name')
      const arr = series[0].values
      const data = arr.map(item => {
        return {
          host: item[index],
          value: item[1],
        }
      })
      data.sort((a, b) => {
        if (this.form.fd.order === 'TOP') {
          return b.value - a.value
        }
        return a.value - b.value
      })
      return data
    },
    getLabel (val) {
      const formatter = usageConfig[this.form.fd.usage] && usageConfig[this.form.fd.usage].formatter
      if (formatter) return formatter(val)
      return val
    },
    getPercent (val) {
      const num = (val / this.maxSeriesData).toFixed(2) * 100
      return Number.isFinite(num) ? num : 0
    },
    getDomainOrProjectQuery () {
      if (this.isProjectMode) {
        return `tenant_id = ${this.userInfo.projectId}`
      } else if (this.isDomainMode) {
        return `domain_id = ${this.userInfo.projectDomainId}`
      }
      return ''
    },
  },
}
</script>
