<template>
  <a-form-item label="NFC存储">
    <vxe-grid :columns="columns" :data="list" />
  </a-form-item>
</template>

<script>
import shareStorageMixin from '../mixins/shareStorageMixin'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'GuideShareStorageNFCList',
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
  computed: {
    columns () {
      return [
        getNameDescriptionTableColumn({
          title: '名称',
          showDesc: false,
        }),
        {
          field: 'storage_conf.nfs_host',
          title: 'NFS Host',
        },
        {
          field: 'storage_conf.nfs_shared_dir',
          title: 'NFS Shared Dir',
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
