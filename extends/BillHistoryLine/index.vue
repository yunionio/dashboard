<template>
  <div class="h-100 w-100 position-relative">
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
    <base-drawer :visible.sync="visible" title="配置磁贴" @ok="handleSubmit">
      <a-form-model
        ref="form"
        hideRequiredMark
        :model="fd"
        :rules="rules">
        <a-form-model-item label="磁贴名称" prop="name">
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

export const options = {
  label: '费用总览',
  desc: '历史费用总览',
  icon: 'dashboard-fee',
  h: 5,
  w: 10,
  sort: 6,
}

export default {
  name: 'BillHistoryLine',
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
    const initNameValue = (this.params && this.params.name) || '近一个月历史消费总览'
    return {
      data: [],
      visible: false,
      loading: false,
      fd: {
        name: initNameValue,
      },
      rules: {
        name: [
          { required: true, message: '请输入磁贴名称' },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'isAdminMode']),
    lineChartColumns () {
      return ['time', '裸金属资源', 'GPU卡', '虚拟资源']
    },
    lineChartRows () {
      const rows = []
      R.forEach(item => {
        rows.push({
          time: this.$moment(item[0]).format('MM月DD日'),
          裸金属资源: (+item[1] || 0).toFixed(2),
          GPU卡: (+item[2] || 0).toFixed(2),
          虚拟资源: (+item[3] || 0).toFixed(2),
        })
      }, (this.data[0] && this.data[0].values) || [])
      return rows
    },
  },
  created () {
    this.fetchData()
    this.$emit('update', this.options.i, {
      ...this.fd,
    })
    this.$bus.$on('DashboardCardRefresh', args => {
      this.fetchData()
    }, this)
  },
  methods: {
    handleEdit () {
      this.visible = true
    },
    async fetchData () {
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
              db: 'meter_db',
              q: this.genSQLQuery(),
              epoch: 'ms',
            },
          },
          useManager: false,
          resPath: 'data.results[0].series',
        })
        this.data = data || []
      } finally {
        this.loading = false
      }
    },
    genSQLQuery () {
      if (this.isAdminMode) {
        return `SELECT sum(baremetalFee) AS "baremetalFee", sum(gpuFee) AS "gpuFee", sum(serverFee) AS "serverFee" FROM meter_res_fee where time > now() - ${30 * 24}h and time <= now() - 24h GROUP BY time(24h)`
      }
      return `SELECT sum(baremetalFee) AS "baremetalFee", sum(gpuFee) AS "gpuFee", sum(serverFee) AS "serverFee" FROM meter_res_fee where time > now() - ${30 * 24}h and time <= now() - 24h AND projectId='${this.userInfo.projectId}' GROUP BY time(24h)`
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
