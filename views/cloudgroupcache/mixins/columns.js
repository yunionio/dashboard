import {
  getStatusTableColumn,
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        title: i18n.t('cloudenv.text_332'),
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
