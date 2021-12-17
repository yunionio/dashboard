<template>
  <detail
    :on-manager="onManager"
    :data="data"
    resource="nats"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    statusModule="nat" />
</template>

<script>

import { getNatSpecColumn } from '../mixins/columns'
import {
  getUserTagColumn,
} from '@/utils/common/detailColumn'
import {
  getCopyWithContentTableColumn,
  getPublicScopeTableColumn,
  getBrandTableColumn,
  getBillingTypeTableColumn,
  getSwitchTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'NatDetail',
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
        getPublicScopeTableColumn({ vm: this, resource: 'natgateways' }),
        getUserTagColumn({ onManager: this.onManager, resource: 'natgateways', columns: () => this.columns, tipName: this.$t('dictionary.nat') }),
        getBrandTableColumn(),
        getBillingTypeTableColumn(),
      ],
      extraInfo: [
        {
          title: this.$t('network.text_308'),
          items: [
            getCopyWithContentTableColumn({
              field: 'vpc',
              title: 'VPC',
              hideField: true,
              slotCallback: row => {
                if (!row.vpc) return '-'
                return [
                  <side-page-trigger permission='vpcs_get' name='VpcSidePage' id={row.vpc_id} vm={this}>{ row.vpc }</side-page-trigger>,
                ]
              },
            }),
            getCopyWithContentTableColumn({
              field: 'network',
              title: this.$t('network.text_551'),
              hideField: true,
              slotCallback: row => {
                if (!row.network) return '-'
                return [
                  <side-page-trigger permission='networks_get' name='NetworkSidePage' id={row.network_id} vm={this}>{ row.network }</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'ip_addr',
              title: this.$t('network.text_558'),
              slots: {
                default: ({ row }) => {
                  return row.ip_addr || '-'
                },
              },
            },
            getNatSpecColumn(),
          ],
        },
        {
          title: this.$t('network.text_38'),
          items: [
            getSwitchTableColumn({
              field: 'disable_delete',
              title: this.$t('common.text00076'),
              change: val => {
                this.onManager('update', {
                  id: this.data.id,
                  managerArgs: {
                    data: { disable_delete: val },
                  },
                })
              },
              disabled: this.data.brand === 'Aws',
            }),
          ],
        },
      ],
    }
  },
}
</script>
