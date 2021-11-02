<template>
  <base-dialog v-if="isShowMonitorAlert" @cancel="cancelDialog" :modalProps="modalProps" width="400px">
    <div class="oc-monitor-alert-header" slot="header">{{$t('common.monitor_alert_fatal')}}</div>
    <div class="oc-monitor-alert-body" slot="body">
      <ul>
        <li v-for="obj of monitorResourceAlerts" :key="obj.alert_id">
          [{{ levelMaps[obj.level] ? levelMaps[obj.level].label : obj.level }}] {{obj.alert_name}} {{$t('common.monitor_alert')}}<br />
          <!-- 策略名称 -->
          {{$t('monitor.text_99')}}: {{obj.alert_name}}<br />
          <!-- 触发时间 -->
          {{$t('monitor.text_14')}}: {{obj.trigger_time}}<br />
          <!-- 报警级别 -->
          {{$t('compute.text_738')}}: {{ levelMaps[obj.level] ? levelMaps[obj.level].label : obj.level }}<br />
          <!-- 触发条件 -->
          {{$t('monitor.condition')}}: {{obj.alert_rule.metric}} {{obj.alert_rule.comparator}} {{obj.alert_rule.threshold}}<br />
          <!-- 资源数量 -->
          {{$t('cloudenv.text_417')}}：1<br />
          <!-- 资源名称 -->
          {{$t('common_151')}}：{{obj.res_name}}
        </li>
      </ul>
    </div>
    <div slot="footer">
      <!-- 查看详情 -->
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{$t('common_224')}}</a-button>
      <a-button @click="cancelDialog">{{$t('common.later_handle')}}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapState } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { levelMaps } from '@Monitor/constants'

export default {
  name: 'MonitorAlertNotifyDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      timer: null,
      modalProps: {
        dialogStyle: {
          position: 'fixed',
          right: 0,
          bottom: '-404px',
          top: 'auto !important',
          transition: 'all .5s',
        },
      },
      levelMaps,
    }
  },
  computed: {
    ...mapState('monitor', ['monitorResourceAlerts']),
    isShowMonitorAlert () {
      return this.monitorResourceAlerts?.length > 0
    },
  },
  mounted () {
    this.timer = setTimeout(() => {
      this.modalProps.dialogStyle.bottom = '0'
    }, 500)
  },
  destroyed () {
    clearTimeout(this.timer)
  },
  methods: {
    async handleConfirm () {
      this.cancelDialog()
      this.$router.push('/alertrecord')
    },
  },
}
</script>

<style lang="scss">
.oc-monitor-alert-dialog.ant-modal {
  position: fixed;
  width: 300px !important;
  right: 0;
  bottom: 0;
  top: auto !important;
}
.oc-monitor-alert-header {
  color: #F00B0B;
}
.oc-monitor-alert-body {
  max-height: 200px;
  overflow: auto;
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    li {
      padding: 6px 0;
      border-bottom: 1px dashed #ccc;
    }
  }
}
</style>
