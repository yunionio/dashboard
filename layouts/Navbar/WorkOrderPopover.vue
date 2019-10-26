<template>
  <div>
    <a-popover trigger="click" v-model="visible" @visibleChange="handleVisibleChange">
      <div class="trigger d-flex align-items-center justify-content-center">
        <icon type="navbar-process" style="font-size: 24px;" />
      </div>
      <template v-slot:content>
        <div class="work-order-wrap">
          <div class="work-order-header d-flex align-items-center">
            <div class="flex-fill title">工单中心</div>
          </div>
          <div class="loading" v-if="loading">
            <loading-block :layout="loadingLayout" />
          </div>
          <template v-else>
            <ul class="work-list">
              <li @click="goHistoricProcess">未完成的工单<a>{{process['nr-historic-process-instance'] || 0}}</a>条</li>
              <li @click="goProcessTask">待我审批<a>{{process['nr-process-task'] || 0}}</a>条</li>
            </ul>
          </template>
        </div>
      </template>
    </a-popover>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'WorkOrderPopover',
  data () {
    return {
      visible: false,
      process: {},
      loading: false,
      loadingLayout: [[16, 8], [15], [16, 8], [12], [16, 8], [20], [16, 8], [14]],
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    processCount () {
      return this.process['nr-historic-process-instance'] + this.process['nr-process-task']
    },
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('historic-process-instances', 'v1')
  },
  methods: {
    async fetchData () {
      this.loading = true
      const params = {
        user_id: this.userInfo.id,
      }
      try {
        const { data } = await this.manager.rpc({
          methodname: 'GetStatistics',
          params,
        })
        this.process = data
      } finally {
        this.loading = false
      }
    },
    handleVisibleChange (val) {
      if (val) {
        this.fetchData()
      }
    },
    goHistoricProcess () {
      window.location.href = this.$appConfig.v1Perfix + '/workflow?type=me-process'
    },
    goProcessTask () {
      window.location.href = this.$appConfig.v1Perfix + '/workflow?type=approval-start'
    },
  },
}
</script>

<style lang="scss" scoped>
.trigger {
  height: 100%;
  padding: 0 20px;
  cursor: pointer;
  text-decoration: none;
}
.work-order-wrap {
  width: 200px;
}
.work-order-header {
  margin: 0;
  color: #606266;
  font-size: 14px;
  padding: 10px 10px;
  border-bottom: 1px solid #f5f5f5;
}
.loading {
  padding: 15px;
}
.work-list {
  margin: 0;
  padding: 0;
  list-style: none;
  margin-top: 5px;
  > li {
    padding: 4px 10px;
    &:hover {
      background-color: #edf6ff;
      color: #1890ff;
      cursor: pointer;
    }
  }
}
</style>
