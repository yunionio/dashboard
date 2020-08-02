<template>
  <detail
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo"
    :extra-info="extraInfo"
     :nameRules="[{ required: true, message: '请输入名称' }]" />
</template>

<script>
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'ZoneDetail',
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getCopyWithContentTableColumn({
          field: 'cloudregion',
          title: '区域',
          hideField: true,
          slotCallback: row => {
            if (!row.cloudregion) return '-'
            return [<side-page-trigger onTrigger={ () => this.handleOpenCloudregionDetail(row.cloudregion_id) }>{ row.cloudregion }</side-page-trigger>]
          },
        }),
        {
          field: 'baremetals',
          title: '物理机(数量)',
        },
        {
          field: 'baremetals_enabled',
          title: '可用物理机',
        },
        {
          field: 'hosts',
          title: '宿主机(数量)',
        },
        {
          field: 'hosts_enabled',
          title: '可用宿主机',
        },
        {
          field: 'storages',
          title: '存储(数量)',
        },
        {
          field: 'wires',
          title: '二层网络(数量)',
        },
        {
          field: 'networks',
          title: 'IP子网(数量)',
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'location',
              title: '位置',
            },
          ],
        },
      ],
    }
  },
  methods: {
    handleOpenCloudregionDetail (id) {
      this.$emit('init-side-page-tab', 'CloudregionDetail')
      this.$emit('side-page-trigger-handle', this, 'CloudregionSidePage', {
        id,
        resource: 'cloudregions',
        apiVersion: 'v2',
      }, {
        cancel: () => {
          this.$emit('single-refresh', this.data.id)
        },
      })
    },
  },
}
</script>
