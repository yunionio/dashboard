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
          <router-link v-if="!edit" to="/vminstance" class="ml-2">
            <icon type="arrow-right" style="font-size:18px" />
          </router-link>
        </div>
      </div>
      <div class="dashboard-card-body flex-column justify-content-center">
        <template v-if="chartOptions.series[0].data.length">
          <div class="flex-fill position-relative">
            <div class="dashboard-fco-wrap">
              <e-chart :options="chartOptions" style="height: 100%; width: 100%;" autoresize />
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
        <a-form-item :label="$t('dashboard.near')">
          <a-select v-decorator="decorators.from">
            <a-select-option :value="7">{{$t('dashboard.vm_count_near', [7])}}</a-select-option>
            <a-select-option :value="14">{{$t('dashboard.vm_count_near', [14])}}</a-select-option>
            <a-select-option :value="21">{{$t('dashboard.vm_count_near', [21])}}</a-select-option>
            <a-select-option :value="30">{{$t('dashboard.vm_count_near', [30])}}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { load } from '@Dashboard/utils/cache'
import { chartColors } from '@/constants'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { resolveValueChangeField } from '@/utils/common/ant'
import { getSignature } from '@/utils/crypto'
import { getRequestT } from '@/utils/utils'
import { hasPermission } from '@/utils/auth'

export default {
  name: 'VmHistoryCount',
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
    dataRangeParams: {
      type: Object,
    },
  },
  data () {
    const initialNameValue = (this.params && this.params.name) || this.$t('dashboard.vm_history_count')
    const initialFromValue = (this.params && this.params.from) || 7
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
          from: initialFromValue,
        },
      },
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
        from: [
          'from',
          {
            initialValue: initialFromValue,
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
      chartOptions: {
        tooltip: {
          show: true,
          trigger: 'item',
          confine: true,
          position: (point, params, dom, rect, size) => {
            const number = this.$t('dashboard.stage', [params.value])
            const series = `<div style="color: #616161;">${params.marker} <span>${params.name}</span>:  <span>${number}</span></div>`
            const wrapper = `<div class="chart-tooltip-wrapper">
                              <div class="lines-wrapper">${series}</div>
                            </div>`
            dom.style.border = 'none'
            dom.style.backgroundColor = 'transparent'
            dom.innerHTML = wrapper
          },
        },
        grid: {
          left: 50,
          bottom: 30,
          top: 30,
          right: 20,
          width: 'auto',
        },
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            type: 'bar',
            data: [],
          },
        ],
        color: chartColors,
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'isAdminMode', 'isDomainMode', 'isProjectMode']),
    queryMode () {
      if (this.isAdminMode && (this.dataRangeParams?.scope !== 'domain' && this.dataRangeParams?.scope !== 'project')) {
        return 'all.servers'
      } else if (this.isDomainMode || (this.isAdminMode && this.dataRangeParams?.scope === 'domain')) {
        return 'domain.servers'
      } else if (this.isProjectMode || (this.isAdminMode && this.dataRangeParams?.scope === 'project') || (this.isDomainMode && this.dataRangeParams?.scope === 'project')) {
        return 'project.servers'
      } else {
        return 'all.servers'
      }
    },
    isResDeny () {
      return !hasPermission({ key: 'bill_analysises_list' })
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
    'dataRangeParams.scope': {
      handler (val) {
        this.fetchData()
      },
      immediate: true,
    },
    'dataRangeParams.domain': {
      handler (val) {
        this.fetchData()
      },
      immediate: true,
    },
    'dataRangeParams.project': {
      handler (val) {
        this.fetchData()
      },
      immediate: true,
    },
  },
  created () {
    const values = { ...this.form.fd }
    this.$emit('update', this.options.i, values)
    this.fetchData()
  },
  methods: {
    refresh () {
      return this.fetchData()
    },
    async fetchData () {
      this.loading = true
      try {
        const requestData = this.genQueryData()
        requestData.signature = getSignature(requestData)
        const params = {
          $t: getRequestT(),
          ignoreErrorStatusCode: [403],
        }
        const data = await load({
          res: 'unifiedmonitors',
          actionArgs: {
            url: '/v1/unifiedmonitors/query',
            method: 'POST',
            params,
            data: requestData,
          },
          useManager: false,
          resPath: 'data.series[0]',
        })
        const { points = [] } = data || {}
        const yData = []
        const xData = []
        points.map(item => {
          yData.push(item[0])
          xData.push(this.$moment(item[1]).format('MM-DD'))
        })
        this.chartOptions.xAxis.data = xData
        this.chartOptions.series[0].data = yData
      } finally {
        this.loading = false
      }
    },
    genQueryData () {
      const ret = {
        metric_query: [
          {
            model: {
              database: 'telegraf',
              measurement: 'usage',
              select: [
                [
                  {
                    type: 'field',
                    params: [this.queryMode],
                  },
                  {
                    type: 'last',
                  },
                ],
              ],
            },
          },
        ],
        scope: this.scope,
        show_meta: true,
        from: `${this.form.fd.from * 24}h`,
        interval: '24h',
        unit: true,
      }
      const tags = []
      if (this.isAdminMode) {
        if (this.dataRangeParams?.scope === 'domain' && this.dataRangeParams?.domain) {
          tags.push({
            key: 'domain_id',
            operator: '=',
            value: this.dataRangeParams?.domain,
          })
        }
        if (this.dataRangeParams?.scope === 'project' && this.dataRangeParams?.project) {
          tags.push({
            key: 'tenant_id',
            operator: '=',
            value: this.dataRangeParams?.project,
          })
        }
      }
      if (this.isDomainMode) {
        if (this.dataRangeParams?.scope === 'project' && this.dataRangeParams?.project) {
          tags.push({
            key: 'tenant_id',
            operator: '=',
            value: this.dataRangeParams?.project,
          })
        }
      }
      if (tags.length) {
        ret.metric_query[0].model.tags = tags
      }
      return ret
    },
    handleEdit () {
      this.visible = true
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.form.fd = values
        const updateValues = { ...values }
        this.$emit('update', this.options.i, updateValues)
        this.visible = false
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
