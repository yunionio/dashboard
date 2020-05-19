import {
  getStatusTableColumn,
  getBrandTableColumn,
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
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
      getCopyWithContentTableColumn({ field: 'mac', title: 'MAC地址' }),
      getStatusTableColumn({ statusModule: 'network' }),
      getPublicScopeTableColumn({ vm: this }),
      getProjectDomainTableColumn(),
      getBrandTableColumn(),
      getCopyWithContentTableColumn({
        field: 'account',
        title: '云账号',
        minWidth: 110,
      }),
      getCopyWithContentTableColumn({
        field: 'cloudregion',
        title: '区域',
        minWidth: 120,
      }),
      getCopyWithContentTableColumn({
        field: 'associate_type',
        title: '绑定设备类型(VPC)',
        minWidth: 160,
      }),
      getCopyWithContentTableColumn({ field: 'associate_id', title: '绑定设备' }),
    ]
  },
}
