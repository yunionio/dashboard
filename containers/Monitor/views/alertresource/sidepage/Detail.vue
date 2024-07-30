<template>
  <detail
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :on-manager="onManager"
    :hiddenKeys="hiddenKeys"
    status-module="commonalert"
    :resource="resource"
    :showName="false" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import { getCopyWithContentTableColumn, getBrandTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'
import { strategyColumn } from '@Monitor/views/commonalert/utils'

export default {
  name: 'AlertResourceDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    resource: String,
  },
  data () {
    return {
      baseInfo: [
        // projectTableColumn,
        // getProjectTableColumn(),
        getCopyWithContentTableColumn(),
        getCopyWithContentTableColumn({ field: 'ip', title: 'IP' }),
        getBrandTableColumn(),
        getCopyWithContentTableColumn({ field: 'cloudregion', title: this.$t('dictionary.cloudregion') }),
        getCopyWithContentTableColumn({ field: 'zone', title: this.$t('dictionary.zone') }),
      ],
      extraInfo: [
        {
          title: this.$t('monitor.associate_alarm_strategy'),
          field: 'strategy',
          slots: {
            default: ({ row }, h) => {
              return [
                <vxe-grid class="mb-2" data={ this.alertList } columns={ this.alertColumns } />,
              ]
            },
          },
        },
      ],
      hiddenKeys: ['status'],
      alertList: [],
      alertColumns: [
        getCopyWithContentTableColumn({ field: 'alert_name' }),
        strategyColumn('alert_rule'),
        getStatusTableColumn({ field: 'alert_state', statusModule: 'alertrecord' }),
        {
          field: 'metric',
          title: this.$t('monitor.monitor_metric'),
        },
        {
          field: '_option',
          title: this.$t('table.title._action'),
          slots: {
            default: ({ row }, h) => {
              return [<a-button type='link' onClick={e => this.goMonitor(row)}>{ this.$t('monitor.view_monitor')}</a-button>]
            },
          },
        },
      ],
    }
  },
  created () {
    this.getAlerts()
  },
  methods: {
    async getAlerts () {
      try {
        const { data: { data: list } } = await new this.$Manager('monitorresourcealerts', 'v1')
          .list({
            params: {
              scope: this.$store.getters.scope,
              limit: 0,
              all_state: true,
              monitor_resource_id: this.data.id,
            },
          })
        this.alertList = list
      } catch (error) {
        console.error(error)
        return []
      }
    },
    goMonitor (data) {
      this.createDialog('ViewMonitorDialog', {
        vm: this,
        title: this.$t('common.view_action', [this.$t('monitor.text_0')]),
        columns: this.columns,
        onManager: this.onManager,
        data: [data],
      })
    },
  },
}
</script>
