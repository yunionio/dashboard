<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import {
  getStatusTableColumn,
  getBrandTableColumn,
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'FlexNetworkList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'networkinterfaces',
        getParams: { details: true },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'FlexNetworkSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getCopyWithContentTableColumn({ field: 'mac', title: 'MAC地址' }),
        getStatusTableColumn({ statusModule: 'network' }),
        getBrandTableColumn(),
        {
          field: 'associate_type',
          title: '绑定设备类型(VPC)',
          width: 140,
        },
        getCopyWithContentTableColumn({ field: 'associate_id', title: '绑定设备' }),
      ],
    }
  },
  created () {
    this.initSidePageTab('flex-network-detail')
    this.list.fetchData()
  },
}
</script>
