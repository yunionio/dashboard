<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { getStatusTableColumn, getTimeTableColumn, getBrandTableColumn, getRegionTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'systemImageCacheList',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'storagecachedimages',
        apiVersion: 'v2',
        idKey: 'storagecache_id',
        getParams: {
          cachedimage_id: this.resId,
          details: true,
        },
        filterOptions: {
          name: {
            label: '镜像名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
      }),
      columns: [
        {
          field: 'host.name',
          title: '缓存位置',
          width: 150,
        },
        getStatusTableColumn({ statusModule: 'imageCache' }),
        getTimeTableColumn({ title: '更新时间', field: 'updated_at' }),
        getBrandTableColumn({ field: 'host.brand' }),
        getRegionTableColumn({ field: 'host.region' }),
        {
          field: 'host.account',
          title: '云账号',
          width: 100,
        },
      ],
      groupActions: [
        {
          label: '新建',
          actions: (obj) => {
            return [
              {
                label: 'IDC',
                action: () => {
                  this.createCache('onpremise', obj)
                },
              },
              {
                label: '私有云',
                action: () => {
                  this.createCache('private', obj)
                },
              },
              {
                label: '公有云',
                action: () => {
                  this.createCache('public', obj)
                },
              },
            ]
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
      ],
      singleActions: [
        {
          label: '删除',
          action: (obj) => {
            this.createDialog('DeleteCacheDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除',
              list: this.list,
              imageId: this.resId,
            })
          },
          meta: (obj) => {
            return this.$getDeleteResult(obj)
          },
        },
      ],
      ids: '',
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    createCache (title, obj) {
      this.createDialog('ImageCreateCache', {
        data: [obj],
        columns: this.columns,
        title,
        list: this.list,
        imageId: this.resId,
      })
    },
  },
}
</script>
