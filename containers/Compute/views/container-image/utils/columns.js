import i18n from '@/locales'

export const getImageNameTableColumn = () => {
  return {
    field: 'image_name',
    title: i18n.t('compute.repo.image.name'),
    minWidth: 160,
    formatter: ({ row }) => row.image_name || '-',
  }
}

export const getImageLabelTableColumn = () => {
  return {
    field: 'image_label',
    title: i18n.t('compute.repo.image.tag'),
    width: 120,
    formatter: ({ row }) => row.image_label || '-',
  }
}

export const getRegistryTableColumn = ({ vm = {} } = {}) => {
  return {
    field: 'registry',
    title: i18n.t('dictionary.container_registry'),
    minWidth: 140,
    slots: {
      default: ({ row }, h) => {
        const text = row.registry || row.registry_id || '-'
        if (!row.registry_id) return [text]
        return [
          <list-body-cell-wrap copy hideField={true} field="registry" row={row} message={text}>
            <side-page-trigger permission="container_registries_get" name="K8sReposSidePage" id={row.registry_id} vm={vm}>{text}</side-page-trigger>
          </list-body-cell-wrap>,
        ]
      },
    },
    formatter: ({ row }) => row.registry || row.registry_id || '-',
  }
}

export const getCredentialTableColumn = () => {
  return {
    field: 'credential_id',
    title: i18n.t('common.container_image_secret'),
    minWidth: 140,
    formatter: ({ row }) => row.credential_id || '-',
  }
}
