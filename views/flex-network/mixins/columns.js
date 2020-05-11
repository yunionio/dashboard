import {
  getStatusTableColumn,
  getBrandTableColumn,
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        vm: this,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'networkinterface', columns: () => this.columns }),
      getCopyWithContentTableColumn({ field: 'mac', title: 'MAC地址' }),
      getStatusTableColumn({ statusModule: 'network' }),
      getPublicScopeTableColumn({ vm: this }),
      getProjectDomainTableColumn(),
      getBrandTableColumn(),
      getCopyWithContentTableColumn({
        field: 'associate_type',
        title: '绑定设备类型(VPC)',
        minWidth: 160,
      }),
      getCopyWithContentTableColumn({ field: 'associate_id', title: '绑定设备' }),
    ]
  },
}
