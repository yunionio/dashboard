<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name || $t('dashboard.instance_count') }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
        </div>
      </div>
      <div class="dashboard-card-body flex-column justify-content-center">
        <div class="flex-fill position-relative">
          <div class="dashboard-fco-wrap">
            <e-chart v-if="chartConfig.xAxis.data.length" :options="chartConfig" style="height: 100%; width: 100%;" autoresize />
          </div>
        </div>
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
import { mapGetters } from 'vuex'
import { chartColors } from '@/constants'
import { load } from '@Dashboard/utils/cache'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { getRequestT } from '@/utils/utils'

export default {
  name: 'ResourceCount',
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
    const initialNameValue = (this.params && this.params.name) || this.$t('dashboard.instance_count')
    return {
      data: {},
      visible: false,
      loading: false,
      form: {
        fc: this.$form.createForm(this),
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
      chartConfig: {
        legend: {
          show: false,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '2%',
          top: '8%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: [],
          axisTick: {
            show: false,
          },
          axisLabel: {
            interval: 0,
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false,
          },
        },
        series: [
          {
            barMaxWidth: 30,
            type: 'bar',
            data: [],
            label: {
              show: true,
              position: 'top',
            },
          },
        ],
        color: chartColors,
      },
      usageList: [
        {
          label: this.$t('common_239'),
          key: ['all.servers', 'domain.servers', 'servers'],
          required: true,
        },
        {
          label: 'RDS',
          key: ['all.rds', 'domain.rds', 'rds'],
          required: true,
        },
        {
          label: 'Redis',
          key: ['all.cache', 'domain.cache', 'cache'],
          required: true,
        },
        {
          label: 'OSS',
          key: ['all.buckets', 'domain.buckets', 'buckets'],
          required: true,
        },
        {
          label: this.$t('common_248'),
          key: ['all.loadbalancer', 'domain.loadbalancer', 'loadbalancer'],
          required: true,
        },
        {
          label: this.$t('scope.text_104'),
          key: ['baremetals', 'domain.baremetals', 'baremetals'],
          required: false,
        },
        {
          label: this.$t('common_305'),
          key: ['hosts', 'domain.hosts', 'hosts'],
          required: false,
        },
        {
          label: 'MongoDB',
          key: ['all.mongodb', 'domain.mongodb', 'mongodb'],
          required: false,
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isDomainMode', 'isAdminMode', 'isProjectMode']),
  },
  watch: {
    'form.fd' (val) {
      this.fetchUsage()
    },
    'dataRangeParams.scope': {
      handler (val) {
        this.fetchUsage()
      },
      immediate: true,
    },
    'dataRangeParams.domain': {
      handler (val) {
        this.fetchUsage()
      },
      immediate: true,
    },
    'dataRangeParams.project': {
      handler (val) {
        this.fetchUsage()
      },
      immediate: true,
    },
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.$emit('update', this.options.i, {
      ...this.form.fd,
    })
    this.refresh()
  },
  methods: {
    refresh () {
      return this.fetchUsage()
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
    genUsageParams () {
      const params = {
        scope: this.$store.getters.scope,
        $t: getRequestT(),
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
      return params
    },
    async fetchUsage () {
      this.loading = true
      try {
        const params = this.genUsageParams()
        const data = await load({
          res: 'usages',
          actionArgs: {
            url: '/v2/rpc/usages/general-usage',
            method: 'GET',
            params,
          },
          useManager: false,
          resPath: 'data',
        })
        const xData = []
        const yData = []
        this.usageList.map(item => {
          let key = item.key[0]
          if (this.isDomainMode || (this.isAdminMode && this.dataRangeParams?.scope === 'domain')) {
            key = item.key[1]
          }
          if (this.isProjectMode || (this.isAdminMode && this.dataRangeParams?.scope === 'project') || (this.isDomainMode && this.dataRangeParams?.scope === 'project')) {
            key = item.key[2]
          }
          if (item.required || (data.hasOwnProperty(key) && data[key])) {
            xData.push(item.label)
            yData.push(data[key] || 0)
          }
        })
        this.chartConfig.xAxis.data = xData
        this.chartConfig.series[0].data = yData
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
