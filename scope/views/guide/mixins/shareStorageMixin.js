export default {
  methods: {
    handleDeleteRow (row) {
      this.createDialog('GuideDeleteStorageDialog', {
        data: [row],
        columns: this.columns,
        title: '删除Ceph存储',
        manager: this.manager,
        success: this.refresh,
      })
    },
    handleBindHosts (row) {
      this.createDialog('AssociatedHostDialog', {
        data: [row],
        columns: this.columns,
        title: '关联宿主机',
        refresh: this.refresh,
      })
    },
  },
}
