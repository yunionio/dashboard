<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    statusModule="tablestore"
    resource="tablestores" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getBrandTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'TablestoreDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    refresh: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    columns: {
      type: Array,
    },
  },
  data () {
    return {
      baseInfo: [
        getBrandTableColumn(),
        getCopyWithContentTableColumn({
          field: 'cloudregion',
          title: this.$t('storage.text_47'),
          hideField: true,
          slotCallback: row => {
            if (!row.cloudregion) return '-'
            return [
              <side-page-trigger permission='areas_get' name='CloudregionSidePage' id={row.cloudregion_id} vm={this}>{ row.cloudregion }</side-page-trigger>,
            ]
          },
        }),
        {
          field: 'storage_class',
          title: this.$t('storage.text_38'),
        },
      ],
    }
  },
}
</script>
