import { sizestr } from '@/utils/utils'
import i18n from '@/locales'
import {
  GPU_TYPE_OPTION_MAP,
  ISOLATED_DEVICE_DEV_TYPE_OPTION_MAP,
  ISOLATED_DEVICE_SHARING_MODE_OPTION_MAP,
  getDeviceGpuType,
} from '@Compute/constants'

export const getReserveResourceColumn = () => {
  return {
    field: 'reserved_memory',
    title: i18n.t('compute.text_501'),
    minWidth: 100,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        const ret = []
        if (row.reserved_cpu) {
          const config = row.reserved_cpu + 'C' + (row.reserved_memory ? sizestr(row.reserved_memory, 'M', 1024) : '') + (row.reserved_storage ? sizestr(row.reserved_storage, 'M', 1024) : '')
          return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
        }
        return ret
      },
    },
  }
}

export const getSharingModeColumn = () => {
  return {
    field: 'sharing_mode',
    title: i18n.t('compute.sharing_mode'),
    minWidth: 100,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return ISOLATED_DEVICE_SHARING_MODE_OPTION_MAP[row.sharing_mode]?.label || row.sharing_mode || '-'
    },
  }
}

export const getGpuTypeColumn = () => {
  return {
    field: 'gpu_type',
    title: i18n.t('compute.pci.gpu_mode'),
    minWidth: 100,
    showOverflow: 'title',
    formatter: ({ row }) => {
      const gpuType = getDeviceGpuType(row)
      return GPU_TYPE_OPTION_MAP[gpuType]?.label || gpuType || '-'
    },
  }
}

export const getMemorySizeColumn = () => {
  return {
    field: 'memory_size',
    title: i18n.t('compute.memory_size'),
    minWidth: 100,
    showOverflow: 'title',
    formatter: ({ row }) => {
      const size = row.memory_size || row.memory_size_mb
      if (!size) return '-'
      return sizestr(size, 'M', 1024)
    },
  }
}

export const getVirtualNumColumn = () => {
  return {
    field: 'virtual_num',
    title: i18n.t('compute.virtual_num'),
    minWidth: 100,
    showOverflow: 'title',
    formatter: ({ row }) => {
      if (row.virtual_num === undefined || row.virtual_num === null || row.virtual_num === '') {
        return '-'
      }
      return row.virtual_num
    },
  }
}

export const getAllocatedCountColumn = () => {
  return {
    field: 'allocated_count',
    title: i18n.t('compute.allocated_count'),
    minWidth: 100,
    showOverflow: 'title',
    formatter: ({ row }) => {
      if (row.allocated_count === undefined || row.allocated_count === null || row.allocated_count === '') {
        return '-'
      }
      return row.allocated_count
    },
  }
}

export const getMemoryAllocatedColumn = () => {
  return {
    field: 'memory_allocated',
    title: i18n.t('compute.memory_allocated'),
    minWidth: 100,
    showOverflow: 'title',
    formatter: ({ row }) => {
      if (row.memory_allocated === undefined || row.memory_allocated === null || row.memory_allocated === '') {
        return '-'
      }
      return sizestr(row.memory_allocated, 'M', 1024)
    },
  }
}

export const getIsolatedDeviceDetailColumns = (vm) => {
  return [
    {
      field: 'name',
      title: i18n.t('compute.text_228'),
      minWidth: 140,
      showOverflow: 'title',
      slots: {
        default: ({ row }) => {
          const id = row.isolated_device_id || row.id
          const name = row.name || row.model || '-'
          if (!id || !vm) return [name]
          return [
            vm.$createElement('side-page-trigger', {
              props: {
                permission: 'isolated_devices_get',
                name: 'GpuSidePage',
                id,
                vm,
              },
            }, [name]),
          ]
        },
      },
    },
    {
      field: 'dev_type',
      title: i18n.t('compute.text_481'),
      minWidth: 100,
      showOverflow: 'title',
      formatter: ({ cellValue, row }) => {
        return ISOLATED_DEVICE_DEV_TYPE_OPTION_MAP[row.dev_type]?.label || row.dev_type || '-'
      },
    },
    {
      field: 'gpu_type',
      title: i18n.t('compute.pci.gpu_mode'),
      minWidth: 100,
      showOverflow: 'title',
      formatter: ({ row }) => {
        const gpuType = getDeviceGpuType(row)
        return GPU_TYPE_OPTION_MAP[gpuType]?.label || gpuType || '-'
      },
    },
    {
      field: 'sharing_mode',
      title: i18n.t('compute.sharing_mode'),
      minWidth: 100,
      showOverflow: 'title',
      formatter: ({ row }) => {
        return ISOLATED_DEVICE_SHARING_MODE_OPTION_MAP[row.sharing_mode]?.label || row.sharing_mode || '-'
      },
    },
    {
      field: 'addr',
      title: 'IP',
      minWidth: 100,
      showOverflow: 'title',
      formatter: ({ row }) => row.ip || row.addr || '-',
    },
    {
      field: 'device_memory_size',
      title: i18n.t('compute.memory_size'),
      minWidth: 100,
      showOverflow: 'title',
      formatter: ({ row }) => {
        const size = row.device_memory_size || row.memory_request
        if (!size) return '-'
        return sizestr(size, 'M', 1024)
      },
    },
    {
      field: 'model',
      title: i18n.t('compute.text_482'),
      minWidth: 140,
      showOverflow: 'title',
      formatter: ({ row }) => row.model || '-',
    },
  ]
}
