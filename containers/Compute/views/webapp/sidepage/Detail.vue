<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="webapp"
    resource="webapps" />
</template>

<script>
import {
  getBrandTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import {
  getUserTagColumn,
} from '@/utils/common/detailColumn'
import {
  getTechStackTableColumn,
} from '../utils/columns'

export default {
  name: 'WebAppDetail',
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
        getUserTagColumn({ onManager: this.onManager, resource: 'webapp', columns: () => this.columns, tipName: this.$t('compute.webapp') }),
        getBrandTableColumn(),
        getTechStackTableColumn(),
      ],
    }
  },
  computed: {
    extraInfo () {
      return [
        {
          title: this.$t('network.wire.networks'),
          items: [
            getCopyWithContentTableColumn({
              field: 'ip_addr',
              title: this.$t('compute.webapp.ip_addr'),
              hideField: true,
              message: (row) => {
                return row.ip_addr || ''
              },
              slotCallback: (row) => {
                return row.ip_addr || '-'
              },
            }),
            getCopyWithContentTableColumn({
              field: 'vpc',
              title: 'VPC',
              message: (row) => {
                return row.vpc || '-'
              },
            }),
            getCopyWithContentTableColumn({
              field: 'network',
              title: this.$t('cloudenv.text_181'),
              message: (row) => {
                return row.network || '-'
              },
            }),
          ],
        },
      ]
    },
  },
}
</script>
