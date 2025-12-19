import i18n from '@/locales'
import { sizestr } from '@/utils/utils'

export const getPackageNameTableColumn = () => {
  return {
    field: 'package',
    title: i18n.t('aice.mounted_apps.package'),
    width: 180,
    slots: {
      default: ({ row }, h) => {
        return [
          <list-body-cell-wrap copy hideField={true} field='package' row={row} message={row.package}>
            {row.package}
          </list-body-cell-wrap>,
        ]
      },
    },
  }
}

export const getAppIdTableColumn = () => {
  return {
    field: 'app_id',
    title: i18n.t('aice.mounted_apps.app_id'),
    width: 180,
    slots: {
      default: ({ row }, h) => {
        return [
          <list-body-cell-wrap copy hideField={true} field='app_id' row={row} message={row.app_id}>
            {row.app_id}
          </list-body-cell-wrap>,
        ]
      },
    },
  }
}

export const getPackageVersionTableColumn = () => {
  return {
    field: 'version',
    title: i18n.t('aice.mounted_apps.version'),
    width: 120,
    slots: {
      default: ({ row }, h) => {
        return [
          <list-body-cell-wrap copy hideField={true} field='version' row={row} message={row.version}>
            {row.version}
          </list-body-cell-wrap>,
        ]
      },
    },
  }
}

export const getAppImageTableColumn = ({ vm = {} } = {}) => {
  return {
    field: 'image_id',
    title: i18n.t('aice.template'),
    width: 120,
    slots: {
      default: ({ row }, h) => {
        return [
          <list-body-cell-wrap copy hideField={true} field='image_id' row={row} message={row.image}>
            <side-page-trigger permission='images_get' name='SystemImageSidePage' list={vm.list} id={row.image_id} vm={vm} tab="system-image-detail">{row.image}</side-page-trigger>
          </list-body-cell-wrap>,
        ]
      },
    },
  }
}

export const getAppSizeTableColumn = () => {
  return {
    field: 'size',
    title: i18n.t('table.title.image_size'),
    minWidth: 100,
    formatter: ({ cellValue, row }) => {
      return sizestr(cellValue, 'B', 1024)
    },
  }
}

export const getAppCacheStatusColumn = () => {
  return {
    field: 'cached_count',
    title: i18n.t('aice.mounted_apps.auto_cache.status'),
    minWidth: 100,
    slots: {
      default: ({ row }, h) => {
        if (!row.hasOwnProperty('cached_count')) {
          return '-'
        }
        const title = `${row.cached_count}/${row.cache_count}`
        const colorHigh = '#52C41A'
        const colorLow = '#FFC145'
        const colorMedium = '#FFC145'
        return [<UsedPercent colorHigh={colorHigh} colorLow={colorLow} colorMedium={colorMedium} title={title} used={row.cached_count} total={row.cache_count} usedLabel={i18n.t('aice.mounted_apps.auto_cache.on')} />]
      },
    },
    formatter: ({ row }) => {
      const title = `${i18n.t('aice.mounted_apps.auto_cache.on')}: ${row.cached_count}/${row.cache_count}`
      return title
    },
  }
}

export const getIconTableColumn = () => {
  return {
    field: 'icon_base64',
    title: i18n.t('aice.mounted_apps.icon'),
    width: 80,
    slots: {
      default: ({ row }, h) => {
        if (!row.icon_base64) {
          return '-'
        }
        const imgData = `data:image/webp;base64,${row.icon_base64}`
        return [
          <img src={imgData} width="64" />,
        ]
      },
    },
  }
}

export const getModelIdTableColumn = () => {
  return {
    field: 'model_id',
    title: 'Model ID',
    formatter: ({ row }) => {
      return row.model_id || '-'
    },
  }
}

export const getModelNameTableColumn = () => {
  return {
    field: 'model_name',
    title: 'Model Name',
    formatter: ({ row }) => {
      return row.model_name || '-'
    },
  }
}

export const getLlmTypeTableColumn = () => {
  return {
    field: 'llm_type',
    title: 'LLM Type',
    formatter: ({ row }) => {
      return row.llm_type || '-'
    },
  }
}
