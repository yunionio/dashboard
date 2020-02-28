export default {
  created () {
    this.singleActions = [
      {
        label: '重新执行',
        action: (obj) => {
          this.onManager('performAction', {
            steadyStatus: ['succeeded', 'failed'],
            id: obj.id,
            managerArgs: {
              action: 'run',
            },
          })
        },
        meta: obj => {
          const { status } = obj
          const isRun = status === 'running'
          return {
            validate: !isRun,
            tooltip: isRun && '执行中状态下不支持此操作',
          }
        },
      },
      {
        label: '终止执行',
        action: (obj) => {
          this.createDialog('AnsiblePlayBookStopDialog', {
            title: '终止执行',
            data: [obj],
            onManager: this.onManager,
            columns: this.columns,
          })
        },
        meta: obj => {
          const { status } = obj
          const isRun = status === 'running'
          return {
            validate: isRun,
            tooltip: !isRun && '仅在执行中状态下支持此操作',
          }
        },
      },
    ]
  },
}
