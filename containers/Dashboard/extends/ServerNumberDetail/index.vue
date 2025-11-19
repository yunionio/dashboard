<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">
          {{ fd.name }}
          <a-icon class="ml-2" type="loading" v-if="loading" />
        </div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="() => visible = true" />
          <router-link v-if="!edit" to="/vminstance" class="ml-2">
            <icon type="arrow-right" style="font-size:18px" />
          </router-link>
        </div>
      </div>
      <div class="dashboard-card-body align-items-center justify-content-center">
        <e-chart :options="chartOptions" style="height: 100%; width: 100%;" autoresize />
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
        <a-form-model-item :label="$t('dashboard.group_by')" prop="type">
          <a-radio-group v-model="fd.type" @change="handleType">
            <a-radio-button value="domain" v-if="isAdminMode">
              {{ $t('dictionary.domain') }}
            </a-radio-button>
            <a-radio-button value="project">
              {{ $t('dictionary.project') }}
            </a-radio-button>
          </a-radio-group>
        </a-form-model-item>
      </a-form-model>
    </base-drawer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { load } from '@Dashboard/utils/cache'
import { getRequestT } from '@/utils/utils'
import { chartColors } from '@/constants'
import { numerify } from '@/filters'

export default {
  name: 'ServerNumberDetail',
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
    const initNameValue = (this.params && this.params.name) || this.$t('dashborad.server_domain_numbers')
    const initType = (this.params && this.params.type) || 'domain'
    return {
      data: [],
      visible: false,
      loading: false,
      fd: {
        name: initNameValue,
        type: initType,
      },
      rules: {
        name: [
          { required: true, message: this.$t('dashboard.text_8') },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'isAdminMode', 'isDomainMode']),
    allServers () {
      const arr = this.data.map(item => item.count)
      return R.sum(arr)
    },
    outherData () {
      return this.data.map(item => {
        const ret = {
          ...item,
          formatted_amount: item.count,
          percent: this.getPercent(item.count, this.allServers),
          value: item.count,
        }
        return ret
      })
    },
    chartOptions () {
      return {
        title: [
          {
            text: this.$t('dashboard.text_181'),
            subtext: `${this.allServers}`,
            textStyle: {
              fontSize: 12,
              color: '#ccc',
            },
            subtextStyle: {
              fontSize: 18,
              color: 'rgb(100, 100, 100)',
            },
            top: '42%',
            left: '24.5%',
            textAlign: 'center',
          },
        ],
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: (params) => {
            const { name, count, percent } = params.data
            return `${name}: ${count}(${percent}%)`
          },
        },
        color: chartColors,
        legend: {
          type: 'scroll',
          pageIconSize: 8,
          icon: 'circle',
          orient: 'vertical',
          left: '50%',
          align: 'left',
          top: 'middle',
          itemHeight: 8,
          itemWidth: 8,
          textStyle: {
            rich: {
              name: {
                verticalAlign: 'right',
                align: 'left',
                fontSize: 12,
                color: 'rgb(100, 100, 100)',
                height: 20,
              },
              percent: {
                align: 'left',
                color: '#1890ff',
                borderWidth: 1,
                borderColor: '#1890ff',
                padding: [3, 5, 3, 5],
              },
              formatted_amount: {
                align: 'left',
                fontSize: 12,
                color: 'rgb(150, 150, 150)',
                padidng: 0,
              },
            },
          },
          height: '90%',
          formatter: name => {
            const item = R.find(R.propEq('name', name))(this.outherData)
            if (item) {
              return `{name|${name}}\n{formatted_amount|${item.formatted_amount}}  {percent|${item.percent}%}`
            }
            return name
          },
        },
        series: [
          {
            name: this.$t('dashboard.text_49'),
            type: 'pie',
            center: ['25%', '50%'],
            radius: ['50%', '65%'],
            hoverAnimation: false,
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
            data: this.outherData,
          },
        ],
      }
    },
  },
  watch: {
    'fd.type' (val) {
      this.fetchData()
    },
    isDomainMode: {
      handler (val) {
        if (val) {
          this.fd.name = this.$t('dashborad.server_project_numbers')
          this.fd.type = 'project'
        }
      },
      immediate: true,
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
    this.fetchData()
    this.$emit('update', this.options.i, {
      ...this.fd,
    })
  },
  methods: {
    refresh () {
      return this.fetchData()
    },
    async fetchData () {
      this.loading = true
      try {
        const params = {
          $t: getRequestT(),
          scope: this.scope,
        }
        if (this.isAdminMode) {
          if (this.dataRangeParams?.scope === 'domain' && this.dataRangeParams?.domain) {
            params.domain_id = this.dataRangeParams?.domain
          }
          if (this.dataRangeParams?.scope === 'project' && this.dataRangeParams?.project) {
            params.project_id = this.dataRangeParams?.project
          }
        }
        if (this.isDomainMode) {
          if (this.dataRangeParams?.scope === 'project' && this.dataRangeParams?.project) {
            params.project_id = this.dataRangeParams?.project
          }
        }
        const data = await load({
          res: 'servers',
          actionArgs: {
            url: `/v2/servers/${this.fd.type}-statistics`,
            method: 'GET',
            params,
          },
          useManager: false,
          resPath: 'data',
        })
        this.data = data || []
        this.data.sort(this.compareData)
      } finally {
        this.loading = false
      }
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
    getPercent (num, den) {
      const percent = (num / den) * 100
      if (percent && percent < 10) {
        return percent.toFixed(1)
      }
      return `${numerify(percent, 'percent')}`
    },
    compareData (a, b) {
      if (a.count > b.count) {
        return -1
      } else if (a.count < b.count) {
        return 1
      } else {
        return 0
      }
    },
    handleType (v) {
      if (v.target.value === 'domain') {
        this.fd.name = this.$t('dashborad.server_domain_numbers')
      } else {
        this.fd.name = this.$t('dashborad.server_project_numbers')
      }
    },
  },
}
</script>
