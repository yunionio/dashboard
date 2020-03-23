export default {
  created () {
    this.singleActions = [
      {
        label: '删除',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            title: '删除',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            // alert: '提示：请确保存储桶下所有目录和文件已删空，删除后数据不可恢复和访问。',
          })
        },
        meta: obj => {
          return {
            validate: obj.can_delete,
            tooltip: obj.delete_fail_reason,
          }
        },
      },
    ]
  },
}
