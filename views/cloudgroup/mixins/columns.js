import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger permission='cloudgroup_get' name='CloudgroupSidePage' id={row.id} list={this.list} vm={this}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'cloudgroup' }),
      getBrandTableColumn({ field: 'provider' }),
    ]
  },
}
