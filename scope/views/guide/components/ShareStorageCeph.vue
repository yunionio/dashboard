<template>
  <a-form-item label="Ceph存储">
    <vxe-grid :columns="columns" :data="list" />
        <!-- <template v-slot:empty>
          <loader :loading="loading" />
      </template> -->
    <!-- </vxe-grid> -->
  </a-form-item>
</template>

<script>
import shareStorageMixin from '../mixins/shareStorageMixin'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'GuideShareStorageCephList',
  mixins: [WindowsMixin, shareStorageMixin],
  props: {
    list: {
      type: Array,
    },
    manager: {
      type: Object,
    },
    refresh: {
      type: Function,
    },
  },
  data () {
    return {
    }
  },
  computed: {
    columns () {
      return [
        getNameDescriptionTableColumn({
          title: '名称',
          showDesc: false,
        }),
        {
          field: 'storage_conf.mon_host',
          title: 'Ceph Mon Host',
        },
        {
          field: 'storage_conf.key',
          title: 'Ceph Key',
        },
        {
          field: 'storage_conf.pool',
          title: 'Ceph Pool',
        },
        {
          field: 'host',
          title: '宿主机',
          width: 300,
          slots: {
            default: ({ row }) => {
              console.log(row.hosts)
              if (row.hosts && row.hosts.length > 0) {
                return row.hosts.map((item, index) => {
                  return <span> {index ? '|' : null} {item.name} </span>
                })
              }
            },
          },
        },
        {
          field: 'delete',
          title: '操作',
          slots: {
            default: ({ row }) => {
              return [
                <a onClick={() => this.handleDeleteRow(row)}>删除</a>,
                <a class="ml-2" onClick={() => this.handleBindHosts(row)}>关联宿主机</a>,
              ]
            },
          },
        },
      ]
    },
  },
}
</script>
