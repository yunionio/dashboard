<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'GpuDetail',
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
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'model',
          title: '设备型号',
        },
        {
          field: 'dev_type',
          title: '设备类型',
        },
        {
          field: 'host',
          title: '所在宿主机',
          slots: {
            default: ({ row }) => {
              return [
                <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) } id={row.host_id}>{ row.host }</side-page-trigger>,
              ]
            },
          },
        },
        {
          field: 'guest',
          title: `关联${this.$t('dictionary.server')}`,
          formatter: function ({ row }) {
            return row.guest || row.guest_id
          },
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'addr',
              title: 'PCI_BUS_ID',
            },
          ],
        },
      ],
    }
  },
  methods: {
    handleOpenSidepage (row) {
      this.initSidePageTab('host-detail')
      this.sidePageTriggerHandle(this, 'HostSidePage', {
        id: row.host_id,
        resource: 'hosts',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
