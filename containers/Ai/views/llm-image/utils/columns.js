import i18n from '@/locales'
import { renderDesktopAppNameCell } from '@Ai/utils/communityImages'

export const getImageNameTableColumn = () => {
  return {
    field: 'image_name',
    title: i18n.t('aice.llm_image.url'),
    width: 170,
    formatter: ({ row }) => {
      return row.image_name
    },
  }
}

export const getImageLabelTableColumn = () => {
  return {
    field: 'image_label',
    title: i18n.t('aice.llm_image.label'),
    width: 120,
    formatter: ({ row }) => {
      return row.image_label
    },
  }
}

export const getImageSourceTableColumn = () => {
  return {
    field: 'image_source',
    title: i18n.t('aice.llm_image.image_source'),
    width: 120,
    formatter: ({ row }) => {
      if (row.image_source === 'container_image' || row.container_image_id) {
        return i18n.t('dictionary.container_image')
      }
      return i18n.t('aice.llm_image.image_source.manual')
    },
  }
}

export const getContainerImageTableColumn = ({ vm = {} } = {}) => {
  return {
    field: 'container_image_id',
    title: i18n.t('dictionary.container_image'),
    minWidth: 160,
    slots: {
      default: ({ row }, h) => {
        const id = row.container_image_id
        if (!id) return '-'
        const text = row.container_image || `${row.image_name || ''}:${row.image_label || ''}` || id
        return [
          <side-page-trigger permission="container_images_get" name="ContainerImageSidePage" id={id} vm={vm}>{text}</side-page-trigger>,
        ]
      },
    },
    formatter: ({ row }) => {
      if (!row.container_image_id) return '-'
      return row.container_image || `${row.image_name || ''}:${row.image_label || ''}` || row.container_image_id
    },
  }
}

export const getAppNameTableColumn = () => {
  return {
    field: 'app_name',
    title: i18n.t('aice.llm_image.app_name'),
    width: 120,
    align: 'center',
    formatter: ({ row }) => {
      return row.app_name || '-'
    },
    slots: {
      default: ({ row }, h) => {
        if (!row.app_name) return '-'
        return [renderDesktopAppNameCell(h, row.app_name)]
      },
    },
  }
}
