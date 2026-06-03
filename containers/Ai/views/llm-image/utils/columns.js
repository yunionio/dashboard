import i18n from '@/locales'

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

export const getAppNameTableColumn = () => {
  return {
    field: 'app_name',
    title: i18n.t('aice.llm_image.app_name'),
    width: 160,
    formatter: ({ row }) => {
      return row.app_name || '-'
    },
  }
}
