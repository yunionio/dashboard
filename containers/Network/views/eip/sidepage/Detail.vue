<template>
  <detail
    :on-manager="onManager"
    :data="data"
    resource="eips"
    statusModule="eip"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    auto-hidden-columns-key="eip_hidden_columns" />
</template>

<script>
import { getBrandTableColumn } from '@/utils/common/tableColumn'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'
import { getAssociateNameTableColumn, getIPWithBgpTypeTableColumn } from '../utils/columns'

export default {
  name: 'EipDetail',
  mixins: [WindowsMixin],
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
        getUserTagColumn({ onManager: this.onManager, resource: 'eip', columns: () => this.columns, tipName: this.$t('dictionary.eip') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'eip', columns: () => this.columns, tipName: this.$t('dictionary.eip') }),
        getBrandTableColumn(),
        getAssociateNameTableColumn(this),
        // {
        //   field: 'ip_addr',
        //   title: 'IP',
        // },
        getIPWithBgpTypeTableColumn(),
        {
          field: 'bandwidth',
          title: this.$t('network.text_195'),
          formatter: ({ cellValue, row }) => {
            if (!cellValue) return '-'
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'charge_type',
          title: this.$t('network.text_192'),
          formatter: ({ cellValue }) => {
            const type = {
              traffic: this.$t('network.text_193'),
              bandwidth: this.$t('network.text_194'),
            }
            return type[cellValue]
          },
        },
      ],
      extraInfo: [],
    }
  },
}
</script>
