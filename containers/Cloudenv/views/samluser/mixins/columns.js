import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger
              name='SamluserSidePage'
              id={row.id}
              list={this.list}
              vm={this}
              tab='samluser-detail'
              options={{
                apiVersion: 'v1',
                resource: 'samlusers',
              }}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'samluser' }),
      getCopyWithContentTableColumn({
        field: 'cloudgroup',
        title: this.$t('dictionary.cloudgroup'),
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger permission='cloudgroup_get' name='CloudgroupSidePage' id={row.cloudgroup_id} list={this.list} vm={this} tab='cloudgroup-detail'>{ row.cloudgroup }</side-page-trigger>
          )
        },
      }),
      getBrandTableColumn(),
      getCopyWithContentTableColumn({
        field: 'cloudaccount',
        title: this.$t('common.text00108'),
      }),
    ]
  },
}
