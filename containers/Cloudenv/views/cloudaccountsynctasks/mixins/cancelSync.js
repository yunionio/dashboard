export default {
  methods: {
    async fetchActiveSyncTasks (params) {
      const manager = new this.$Manager('cloudaccountsynctasks', 'v2')
      const { data } = await manager.list({
        params: {
          details: true,
          active: true,
          ...params,
        },
      })
      return data.data || data.cloudaccountsynctasks || []
    },
    /**
     * 查找进行中的同步任务并打开取消确认框
     * @param {Object} query list 过滤参数，如 cloudprovider_id / cloudregion_id / level
     */
    async handleCancelActiveSyncTasks (query) {
      const tasks = await this.fetchActiveSyncTasks(query)
      if (!tasks.length) {
        this.$message.warning(this.$t('cloudenv.sync_task.no_active_task'))
        this.list && this.list.refresh()
        return
      }
      this.createDialog('CloudaccountsynctasksCancelDialog', {
        vm: this,
        data: tasks,
        columns: [
          { field: 'name', title: this.$t('table.title.name') },
          { field: 'level', title: this.$t('cloudenv.sync_task.level') },
          { field: 'status', title: this.$t('common.status') },
        ],
        onManager: (method, opts) => {
          const manager = new this.$Manager('cloudaccountsynctasks', 'v2')
          return manager[method]({ ...opts.managerArgs })
        },
        success: () => {
          this.list && this.list.refresh()
        },
      })
    },
    handleCancelAccountSync (row) {
      return this.handleCancelActiveSyncTasks({
        cloudaccount_id: row.id,
        level: 'account',
      })
    },
    handleCancelProviderSync (row) {
      return this.handleCancelActiveSyncTasks({
        cloudprovider_id: row.id,
        level: 'provider',
      })
    },
    handleCancelProviderRegionSync (row) {
      return this.handleCancelActiveSyncTasks({
        cloudprovider_id: row.cloudprovider_id,
        cloudregion_id: row.cloudregion_id,
        level: 'region',
      })
    },
  },
}
