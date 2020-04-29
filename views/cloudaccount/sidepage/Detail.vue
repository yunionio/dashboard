<template>
  <detail
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="cloudaccount" />
</template>

<script>
import {
  getAccessUrlTableColumn,
  getBalanceTableColumn,
  getGuestCountTableColumn,
  getHostCountTableColumn,
  getPublicScopeTableColumn,
} from '../utils/columns'
import { getBrandTableColumn, getEnabledTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudaccountDetail',
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
        getBrandTableColumn(),
        getPublicScopeTableColumn({ vm: this }),
        {
          field: 'account',
          title: '账号',
          slots: {
            default: ({ row }) => {
              return [
                <div class='text-truncate'>
                  <list-body-cell-wrap copy row={ row } field='account' title={ row['account'] } />
                </div>,
              ]
            },
          },
        },
        {
          field: 'proxy_setting.name',
          title: '代理',
          slots: {
            default: ({ row }) => {
              if (row.proxy_setting) {
                const { id, name } = row.proxy_setting
                return [
                  <div class='text-truncate'>
                    <side-page-trigger name="ProxysettingSidePage" id={id} list={this.list} vm={this}>{name}</side-page-trigger>
                  </div>,
                ]
              }
              return '-'
            },
          },
        },
        getEnabledTableColumn(),
        {
          field: 'last_sync',
          title: '同步时间',
          formatter: ({ row }) => {
            return this.$moment(row.last_sync).format()
          },
        },
      ],
      extraInfo: [
        {
          title: '账号信息',
          items: [
            getAccessUrlTableColumn(),
            getStatusTableColumn({ statusModule: 'cloudaccountHealthStatus', title: '健康状态', field: 'health_status' }),
            getBalanceTableColumn(),
            getGuestCountTableColumn(),
            getHostCountTableColumn(),
          ],
        },
      ],
    }
  },
}
</script>
