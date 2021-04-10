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
          title: this.$t('cloudenv.text_10'),
          hideField: true,
          slotCallback: row => {
            if (!row.cloudregion) return '-'
            return [<side-page-trigger onTrigger={ () => this.handleOpenCloudregionDetail(row.cloudregion_id) }>{ row.cloudregion }</side-page-trigger>]
          },
        }),
        {
          field: 'baremetals',
          title: this.$t('cloudenv.text_485'),
        },
        {
          field: 'baremetals_enabled',
          title: this.$t('cloudenv.text_476'),
        },
        {
          field: 'hosts',
          title: this.$t('cloudenv.text_486'),
        },
        {
          field: 'hosts_enabled',
          title: this.$t('cloudenv.text_487'),
        },
        {
          field: 'storages',
          title: this.$t('cloudenv.text_488'),
        },
        {
          field: 'wires',
          title: this.$t('cloudenv.text_489'),
        },
        {
          field: 'networks',
          title: this.$t('cloudenv.text_490'),
        },
      ],
      extraInfo: [
        {
          title: this.$t('cloudenv.text_359'),
          items: [
            {
              field: 'location',
              title: this.$t('cloudenv.text_374'),
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
