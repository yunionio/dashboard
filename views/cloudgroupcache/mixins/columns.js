import {
  getStatusTableColumn,
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        showDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger permission='cloudgroupcache_get' name='CloudgroupcacheSidePage' id={row.id} list={this.list} vm={this}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'cloudgroupcache' }),
      {
        field: 'cloudaccount',
        title: this.$t('dictionary.cloudaccount'),
        minWidth: 150,
        showOverflow: 'title',
      },
    ]
  },
}
