<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">
          {{ form.fd.name }}
          <a-icon class="ml-2" type="loading" v-if="loading" />
          <span v-if="isUsageKeyDeny" class="ml-2">
            <a-tooltip class="mr-2"><template slot="title">{{ $t('dashboard.usage_key_deny_tips') }}</template><icon type="help" /></a-tooltip>
            <a-icon class="warning-color mr-1" type="warning" />
            {{ $t('dashboard.usage_key_deny_tips_2') }}
          </span>
        </div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
          <router-link v-if="!edit" to="/monitoroverview" class="ml-2">
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
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { chartColors } from '@/constants'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { resolveValueChangeField } from '@/utils/common/ant'

export default {
  name: 'UnrecoveredAlarm',
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
    const initialNameValue = (this.params && this.params.name) || this.$t('monitor.overview_alert_sum')
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
        title: [
          {
            text: this.$t('monitor.overview_alert_sum'),
            subtext: '',
            textStyle: {
              fontSize: 12,
              color: '#ccc',
            },
            subtextStyle: {
              fontSize: 18,
              color: 'rgb(100, 100, 100)',
            },
            top: '30%',
            left: 'center',
          },
        ],

        tooltip: {
          trigger: 'item',
        },
        legend: {
          bottom: '3%',
          left: 'center',
        },
        color: chartColors,
        series: [
          {
            type: 'pie',
            radius: ['50%', '65%'],
            center: ['50%', '40%'],
            // hoverAnimation: false,
            label: {
              normal: {
                show: false,
              },
            },
            labelLine: {
              normal: {
                show: false,
              },
            },
            data: [],
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'capability', 'isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
    isUsageKeyDeny () {
      if (this.isAdminMode && (this.dataRangeParams?.scope === 'domain' || this.dataRangeParams?.scope === 'project')) {
        return true
      }
      if (this.isDomainMode && this.dataRangeParams?.scope === 'project') {
        return true
      }
      return false
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
    values.brand = R.join(',', values.brand || [])
    this.$emit('update', this.options.i, values)
    this.fetchData()
  },
  methods: {
    commonParams () {
      const extendParams = {
        scope: this.curNav.scope,
      }
      Object.assign(extendParams, this.extraParams)
      return extendParams
    },
    refresh () {
      return this.fetchData()
    },
    async fetchData () {
      this.loading = true
      try {
        const params = {
          scope: this.$store.getters.scope,
        }
        if (this.isAdminMode) {
          if (this.dataRangeParams?.scope === 'domain' && this.dataRangeParams?.domain) {
            params.scope = 'domain'
            params.domain_id = this.dataRangeParams?.domain
          }
          if (this.dataRangeParams?.scope === 'project' && this.dataRangeParams?.project) {
            params.scope = 'project'
            params.project_id = this.dataRangeParams?.project
          }
        }
        if (this.isDomainMode) {
          if (this.dataRangeParams?.scope === 'project' && this.dataRangeParams?.project) {
            params.scope = 'project'
            params.project_id = this.dataRangeParams?.project
          }
        }
        const { data: series = { } } = await new this.$Manager('alertrecords', 'v1').get({ id: 'total-alert', params: params })
        let total = 0
        const chartData = []
        if (Object.keys(series).length > 0) {
          for (const item in series) {
            total += series[item]
            chartData.push({ name: this.$t(`dictionary.${item}`), value: series[item] })
          }
        } else {
          chartData.push({ name: '', value: 0 })
        }
        this.chartOptions.series[0].data = chartData
        this.chartOptions.title[0].subtext = total
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
