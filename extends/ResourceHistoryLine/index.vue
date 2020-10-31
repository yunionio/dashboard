<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ fd.name }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
        </div>
      </div>
      <div class="dashboard-card-body align-items-center justify-content-center">
        <line-chart :columns="lineChartColumns" :rows="lineChartRows" width="100%" height="100%" />
      </div>
    </div>
    <base-drawer :visible.sync="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit">
      <a-form-model
        ref="form"
        hideRequiredMark
        :model="fd"
        :rules="rules">
        <a-form-model-item :label="$t('dashboard.text_6')" prop="name">
          <a-input v-model="fd.name" />
        </a-form-model-item>
      </a-form-model>
    </base-drawer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { load } from '@Dashboard/utils/cache'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { getRequestT } from '@/utils/utils'
import LineChart from '@/sections/Charts/Line'
import { getSignature } from '@/utils/crypto'

export default {
  name: 'ResourceHistoryLine',
  components: {
    LineChart,
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
    const initNameValue = (this.params && this.params.name) || this.$t('dashboard.text_37')
    return {
      data: [],
      visible: false,
      loading: false,
      fd: {
        name: initNameValue,
      },
      rules: {
        name: [
          { required: true, message: this.$t('dashboard.text_8') },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'isAdminMode']),
    lineChartColumns () {
      return ['time', this.$t('dashboard.text_38'), this.$t('dashboard.text_39'), this.$t('dashboard.text_40'), this.$t('dashboard.text_41'), this.$t('dashboard.text_42')]
    },
    lineChartRows () {
      const rows = []
      R.forEach(item => {
        rows.push({
          time: this.$moment(item[item.length - 1]).format(this.$t('dashboard.text_12')),
          [this.$t('dashboard.text_38')]: (+item[4] || 0).toFixed(2),
          [this.$t('dashboard.text_40')]: (+item[0] || 0).toFixed(2),
          [this.$t('dashboard.text_11')]: (+item[2] || 0).toFixed(2),
          [this.$t('dashboard.text_41')]: (+item[3] || 0).toFixed(2),
          [this.$t('dashboard.text_42')]: (+item[1] || 0).toFixed(2),
        })
      }, (this.data && this.data.points) || [])
      return rows
    },
  },
  created () {
    this.fetchData()
    this.$emit('update', this.options.i, {
      ...this.fd,
    })
  },
  methods: {
    refresh () {
      return this.fetchData()
    },
    handleEdit () {
      this.visible = true
    },
    async fetchData () {
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
            },
            data: requestData,
          },
          useManager: false,
          resPath: 'data.series[0]',
        })
        this.data = data || []
      } finally {
        this.loading = false
      }
    },
    genQueryData () {
      const ret = {
        metric_query: [
          {
            model: {
              database: 'meter_db',
              measurement: 'meter_res_usage',
              select: [
                [
                  {
                    type: 'field',
                    params: ['cpuCount'],
                  },
                  {
                    type: 'sum',
                    params: [],
                  },
                ],
                [
                  {
                    type: 'field',
                    params: ['memCount'],
                  },
                  {
                    type: 'sum',
                    params: [],
                  },
                ],
                [
                  {
                    type: 'field',
                    params: ['diskCount'],
                  },
                  {
                    type: 'sum',
                    params: [],
                  },
                ],
                [
                  {
                    type: 'field',
                    params: ['gpuCount'],
                  },
                  {
                    type: 'sum',
                    params: [],
                  },
                ],
                [
                  {
                    type: 'field',
                    params: ['baremetalCount'],
                  },
                  {
                    type: 'sum',
                    params: [],
                  },
                ],
              ],
              // tags: [
              //   {
              //     key: 'res_type',
              //     value: 'host',
              //     operator: '=',
              //   },
              // ],
              group_by: [
                {
                  type: 'time',
                  params: ['24h', '-8h'],
                },
                {
                  type: 'fill',
                  params: ['none'],
                },
              ],
            },
          },
        ],
        scope: this.scope,
        from: `${30 * 24}h`,
        now: 'now - 24h',
        unit: true,
      }
      if (this.isAdminMode) {
        // return `SELECT sum(cpuCount) AS "cpuCount", sum(memCount) AS "memCount", sum(diskCount) AS "diskCount", sum(gpuCount) AS "gpuCount", sum(baremetalCount) AS "baremetalCount" FROM meter_res_usage where time > now() - ${30 * 24}h and time <= now() - 24h GROUP BY time(24h,-8h)`
        return ret
      }
      ret.metric_query.model.tags = [
        {
          key: 'projectId',
          value: this.userInfo.projectId,
          operator: '=',
        },
      ]
      // return `SELECT sum(cpuCount) AS "cpuCount", sum(memCount) AS "memCount", sum(diskCount) AS "diskCount", sum(gpuCount) AS "gpuCount", sum(baremetalCount) AS "baremetalCount" FROM meter_res_usage where time > now() - ${30 * 24}h and time <= now() - 24h AND projectId='${this.userInfo.projectId}' GROUP BY time(24h,-8h)`
      return ret
    },
    async handleSubmit () {
      try {
        await this.$refs.form.validate()
        this.$emit('update', this.options.i, this.fd)
        this.visible = false
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
