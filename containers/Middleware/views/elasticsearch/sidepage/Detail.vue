<template>
  <detail
    :on-manager="onManager"
    :data="data"
    status-module="elasticSearch"
    :extra-info="extraInfo"
    resource="elasticsearchs"
    :base-info="baseInfo" />
</template>

<script>
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import {
  getBrandTableColumn,
  getSwitchTableColumn,
  getBillingTypeTableColumn,
} from '@/utils/common/tableColumn'

import WindowsMixin from '@/mixins/windows'

export default {
  name: 'KafkaDetail',
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
    columns: Array,
    hiddenColumns: Array,
  },
  data () {
    return {
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'elastic_search', columns: () => this.columns, tipName: this.$t('dictionary.elasticsearch') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'elastic_search', columns: () => this.columns, tipName: this.$t('dictionary.elasticsearch') }),
        getBrandTableColumn(),
        getBillingTypeTableColumn(),
      ],
      extraInfo: [
        {
          title: this.$t('middleware.extra'),
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
