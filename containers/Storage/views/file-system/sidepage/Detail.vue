<template>
  <detail
    :on-manager="onManager"
    :data="data"
    resource="nas"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    statusModule="nas" />
</template>

<script>

import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import {
  getBrandTableColumn,
  getBillingTypeTableColumn,
  getSwitchTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ColumnsMixin, { getFileSystemTypeColumn, getFileSystemStorageTypeColumn, getCapacityColumn } from '../mixins/columns'

export default {
  name: 'FileSystemDetail',
  mixins: [WindowsMixin, ColumnsMixin],
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
        getUserTagColumn({ onManager: this.onManager, resource: 'file_system', columns: () => this.columns, tipName: this.$t('dictionary.filesystem') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'file_system', columns: () => this.columns, tipName: this.$t('dictionary.filesystem') }),
        getBrandTableColumn(),
        getBillingTypeTableColumn(),
      ],
      extraInfo: [
        {
          title: this.$t('storage.text_80'),
          items: [
            getCapacityColumn(),
            getFileSystemTypeColumn(),
            getFileSystemStorageTypeColumn(),
            {
              field: 'protocol',
              title: this.$t('storage.filesystem.protocol'),
            }
          ],
        },
        {
          title: this.$t('storage.other.infomation'),
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
