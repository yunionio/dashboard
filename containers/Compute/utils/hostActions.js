import { commonUnabled } from '../views/vminstance/utils'
import i18n from '@/locales'

export function hostCommonActions (hostList) {
  return [
    {
      label: hostList.$t('compute.text_272'),
      action: (obj) => {
        hostList.list.batchPerformAction('start', null, hostList.list.steadyStatus)
      },
      meta: () => {
        if (hostList.list.selectedItems.length <= 0) {
          return {
            validate: false,
            tooltip: hostList.$t('compute.text_823'),
          }
        }
        for (let i = 0; i < hostList.list.selectedItems.length; i++) {
          const obj = hostList.list.selectedItems[i]
          if (!obj.is_baremetal) {
            return {
              validate: false,
              tooltip: hostList.$t('compute.text_823'),
            }
          }
          if (obj.server_id && obj.host_type === 'baremetal') {
            return {
              validate: false,
            }
          }
          if (obj.status !== 'ready') {
            return {
              validate: false,
              tooltip: hostList.$t('compute.text_823'),
            }
          }
        }
        return {
          validate: true,
        }
      },
    },
    {
      label: hostList.$t('compute.text_273'),
      action: (obj) => {
        hostList.list.batchPerformAction('stop', null, hostList.list.steadyStatus)
      },
      meta: () => {
        if (hostList.list.selectedItems.length <= 0) {
          return {
            validate: false,
            tooltip: hostList.$t('compute.text_824'),
          }
        }
        for (let i = 0; i < hostList.list.selectedItems.length; i++) {
          const obj = hostList.list.selectedItems[i]
          if (!obj.is_baremetal) {
            return {
              validate: false,
              tooltip: hostList.$t('compute.text_824'),
            }
          }
          if (obj.server_id && obj.host_type === 'baremetal') {
            return {
              validate: false,
            }
          }
          if (obj.status !== 'running') {
            return {
              validate: false,
              tooltip: hostList.$t('compute.text_824'),
            }
          }
        }
        return {
          validate: true,
        }
      },
    },
    {
      label: hostList.$t('compute.text_274'),
      action: (obj) => {
        hostList.list.batchPerformAction('reset', null, hostList.list.steadyStatus)
      },
      meta: () => {
        if (hostList.list.selectedItems.length <= 0) {
          return {
            validate: false,
            tooltip: hostList.$t('compute.text_824'),
          }
        }
        for (let i = 0; i < hostList.list.selectedItems.length; i++) {
          const obj = hostList.list.selectedItems[i]
          if (!obj.is_baremetal) {
            return {
              validate: false,
              tooltip: hostList.$t('compute.text_824'),
            }
          }
          if (obj.server_id && obj.host_type === 'baremetal') {
            return {
              validate: false,
            }
          }
          if (obj.status !== 'running') {
            return {
              validate: false,
              tooltip: hostList.$t('compute.text_824'),
            }
          }
        }
        return {
          validate: true,
        }
      },
    },
    {
      label: hostList.$t('compute.text_550'),
      action: () => {
        hostList.list.batchPerformAction('maintenance', null, hostList.list.steadyStatus)
      },
      meta: () => {
        if (hostList.list.selectedItems.length <= 0) {
          return {
            validate: false,
          }
        }
        for (let i = 0; i < hostList.list.selectedItems.length; i++) {
          const obj = hostList.list.selectedItems[i]
          if (obj.server) {
            return {
              validate: false,
            }
          }
          if (!obj.is_baremetal) {
            return {
              validate: false,
            }
          }
          if (!obj.server_id) {
            return {
              validate: false,
            }
          }
          if (obj.is_maintenance) {
            return {
              validate: false,
            }
          }
          if (['running', 'ready'].indexOf(obj.status) < 0) {
            return {
              validate: false,
            }
          }
        }
        return {
          validate: true,
        }
      },
    },
    {
      label: hostList.$t('compute.text_559'),
      action: () => {
        hostList.list.batchPerformAction('unmaintenance', null, hostList.list.steadyStatus)
      },
      meta: () => {
        if (hostList.list.selectedItems.length <= 0) {
          return {
            validate: false,
          }
        }
        for (let i = 0; i < hostList.list.selectedItems.length; i++) {
          const obj = hostList.list.selectedItems[i]
          if (obj.server) {
            return {
              validate: false,
            }
          }
          if (!obj.is_baremetal) {
            return {
              validate: false,
            }
          }
          if (!obj.server_id) {
            return {
              validate: false,
            }
          }
          if (!obj.is_maintenance) {
            return {
              validate: false,
            }
          }
          if (['running', 'ready'].indexOf(obj.status) < 0) {
            return {
              validate: false,
            }
          }
        }
        return {
          validate: true,
        }
      },
    },
    {
      label: hostList.$t('compute.perform_sync_status'),
      action: () => {
        hostList.list.batchPerformAction('syncstatus', null, hostList.list.steadyStatus)
      },
      meta: () => {
        if (hostList.list.selectedItems.length <= 0) {
          return {
            validate: false,
          }
        }
        for (let i = 0; i < hostList.list.selectedItems.length; i++) {
          const obj = hostList.list.selectedItems[i]
          if (!obj.is_baremetal) {
            return {
              validate: false,
            }
          }
        }
        return {
          validate: true,
        }
      },
    },
  ]
}

export function hostServerActions (manager, obj, objList, isHostServer) {
  return [
    {
      label: i18n.t('compute.text_272'),
      permission: 'server_perform_start',
      action: () => {
        manager('performAction', {
          steadyStatus: 'running',
          id: isHostServer ? obj.server_id : obj.id,
          managerArgs: {
            action: 'start',
          },
        })
      },
      meta: () => {
        return {
          validate: obj.status === 'ready' && !commonUnabled(obj),
        }
      },
    },
    {
      label: i18n.t('compute.text_273'),
      permission: 'server_perform_stop',
      action: () => {
        objList.createDialog('VmShutDownDialog', {
          data: [obj],
          columns: objList.columns,
          onManager: manager,
          isHostServer: isHostServer,
        })
      },
      meta: () => {
        return {
          validate: obj.status === 'running' && !commonUnabled(obj),
        }
      },
    },
    {
      label: i18n.t('compute.text_274'),
      permission: 'server_perform_restart',
      action: () => {
        objList.createDialog('VmRestartDialog', {
          data: [obj],
          columns: objList.columns,
          onManager: manager,
          isHostServer: isHostServer,
        })
      },
      meta: () => {
        return {
          validate: (obj.status === 'running' || obj.status === 'stop_fail') && !commonUnabled(obj),
        }
      },
    },
  ]
}
