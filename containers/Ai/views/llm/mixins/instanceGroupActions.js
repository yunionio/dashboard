export default {
  data () {
    return {
      instanceGroupActions: [
        {
          label: this.$t('compute.text_272'),
          action: () => {
            this.createDialog('LlmBatchConfirmDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              action: 'start',
              actionText: this.$t('compute.text_272'),
              steadyStatus: 'running',
            })
          },
          meta: () => {
            let ret = {
              validate: true,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            if (!ret.validate) return ret
            ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
              ret.validate = this.list.selectedItems.every(item => item.status === 'ready')
              return ret
            })
            return ret
          },
        },
        {
          label: this.$t('compute.text_274'),
          permission: 'llms_perform_restart',
          action: () => {
            this.createDialog('LlmBatchConfirmDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              action: 'restart',
              actionText: this.$t('compute.text_274'),
              steadyStatus: 'running',
            })
          },
          meta: () => {
            let ret = {
              validate: true,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            if (!ret.validate) return ret
            ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
              ret.validate = this.list.selectedItems.every(item => ['running', 'stop_fail', 'ready'].includes(item.status))
              return ret
            })
            return ret
          },
        },
        {
          label: this.$t('common.text00043'),
          action: () => {
            this.onManager('batchPerformAction', {
              steadyStatus: ['running', 'ready'],
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
        },
        {
          label: this.$t('compute.text_275'),
          actions: () => {
            return [
              {
                label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
                permission: 'llms_perform_public',
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    resource: 'llms',
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  ret.validate = this.list.selectedItems.length > 0
                  return ret
                },
              },
              {
                label: this.$t('compute.text_273'),
                permission: 'llms_perform_stop',
                action: () => {
                  this.createDialog('LlmBatchConfirmDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    action: 'stop',
                    actionText: this.$t('compute.text_273'),
                    steadyStatus: 'ready',
                  })
                },
                meta: () => {
                  let ret = {
                    validate: true,
                    tooltip: null,
                  }
                  ret.validate = this.list.selectedItems.length > 0
                  if (!ret.validate) return ret
                  ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
                    ret.validate = this.list.selectedItems.every(item => item.status === 'running')
                    return ret
                  })
                  return ret
                },
              },
              {
                label: this.$t('table.action.delete'),
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('table.action.delete'),
                    name: this.$t('aice.llm'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = { validate: this.list.selected.length }
                  if (this.list.selectedItems.some(item => !item.can_delete)) {
                    ret.validate = false
                    return ret
                  }
                  return ret
                },
              },
            ]
          },
        },
      ],
    }
  },
}
