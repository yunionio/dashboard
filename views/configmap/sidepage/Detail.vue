<template>
  <detail
    :showDesc="false"
    :showName="false"
    :hiddenKeys="['project_domain', 'tenant', 'created_at', 'updated_at']"
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import DataView from '@K8S/sections/DataView'

export default {
  name: 'K8sConfigmapDetail',
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
        {
          field: 'name',
          title: '名称',
          slots: {
            default: ({ row }) => {
              return [
                <div class='text-truncate'>
                  <list-body-cell-wrap copy row={ this.data } onManager={ this.onManager } field='name' title={ row.name } />
                </div>,
              ]
            },
          },
        },
        {
          field: 'cluster',
          title: '集群',
        },
        {
          field: 'namespace',
          title: '命名空间',
        },
        {
          field: 'creationTimestamp',
          title: '创建时间',
          formatter: ({ row }) => {
            return (row.creationTimestamp && this.$moment(row.creationTimestamp).format()) || '-'
          },
        },
      ],
      extraInfo: [
        {
          title: '数据',
          field: 'data',
          slots: {
            default: ({ row }) => {
              return [
                <DataView manager={ this.onManager } data={ row } />,
              ]
            },
          },
        },
      ],
    }
  },
}
</script>
