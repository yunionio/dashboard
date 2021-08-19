<template>
  <detail
    :on-manager="onManager"
    :data="data"
    resource="cdn_domains"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    statusModule="cdnDomain" />
</template>

<script>

import { getAreaColumn, getServiceTypeColumn } from '../mixins/columns'
import {
  getPublicScopeTableColumn,
  getBrandTableColumn,
  getSwitchTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CdnDetail',
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
        getPublicScopeTableColumn({ vm: this, resource: 'cdn_domains' }),
        getBrandTableColumn(),
      ],
      extraInfo: [
        {
          title: this.$t('network.text_308'),
          items: [
            getAreaColumn(),
            getServiceTypeColumn(),
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
            }),
          ],
        },
      ],
    }
  },
}
</script>
