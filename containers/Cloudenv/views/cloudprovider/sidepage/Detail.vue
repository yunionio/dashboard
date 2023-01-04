<template>
  <detail
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :hiddenKeys="['tenant']"
    status-module="cloudaccount" />
</template>

<script>
import {
  getStatusTableColumn,
  getEnabledTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import {
  getResourceMatchProjectTableColumn,
} from '../utils/columns'
export default {
  name: 'CloudproviderDetail',
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
        getResourceMatchProjectTableColumn(),
        getBrandTableColumn({ field: 'provider' }),
        {
          field: 'account',
          title: this.$t('cloudenv.text_94'),
          slots: {
            default: ({ row }) => {
              return [
                <div class='text-truncate'>
                  <list-body-cell-wrap copy row={ row } field='account' title={ row.account } />
                </div>,
              ]
            },
          },
        },
        getEnabledTableColumn(),
        {
          field: 'last_sync',
          title: this.$t('cloudenv.text_103'),
          formatter: ({ row }) => {
            return this.$moment(row.last_sync).format()
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('cloudenv.text_359'),
          items: [
            getStatusTableColumn({ statusModule: 'cloudaccountHealthStatus', title: this.$t('cloudenv.text_93'), field: 'health_status' }),
          ],
        },
      ],
    }
  },
}
</script>
