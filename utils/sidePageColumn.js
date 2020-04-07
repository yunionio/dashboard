const commonColumns = [
  {
    field: 'key',
    title: 'Key',
    minWidth: 200,
    showOverflow: 'ellipsis',
  },
  {
    field: 'label',
    title: 'Label',
    width: 200,
  },
]

const taintsColumns = [
  {
    field: 'key',
    title: 'Key',
    minWidth: 200,
    showOverflow: 'ellipsis',
  },
  {
    field: 'effect',
    title: 'Effect',
    width: 200,
  },
]

export const operatingSystemColumn = () => {
  return {
    title: '操作系统',
    field: 'operatingSystem',
    slots: {
      default: ({ row }, h) => {
        const data = row.labels ? Object.entries(row.labels).map(val => ({ key: val[0], label: val[1] })).filter(val => !val.key.toLowerCase().includes('id')) : []
        return [
          <vxe-grid class="mb-2" data={ data } columns={ commonColumns } />,
        ]
      },
    },
  }
}

export const annotateColumn = () => {
  return {
    title: '注释',
    field: 'annotate',
    slots: {
      default: ({ row }, h) => {
        const data = row.annotations ? Object.entries(row.annotations).map(val => ({ key: val[0], label: val[1] })) : []
        return [
          <vxe-grid class="mb-2" data={ data } columns={ commonColumns } />,
        ]
      },
    },
  }
}

export const tagColumn = () => {
  return {
    title: '标签',
    field: 'tag',
    slots: {
      default: ({ row }, h) => {
        const data = row.labels ? Object.entries(row.labels).map(val => ({ key: val[0], label: val[1] })) : []
        return [
          <vxe-grid class="mb-2" data={ data } columns={ commonColumns } />,
        ]
      },
    },
  }
}

export const taintColumn = () => {
  return {
    title: 'Taints',
    field: 'taints',
    slots: {
      default: ({ row }, h) => {
        const data = row.taints || []
        return [
          <vxe-grid class="mb-2" data={ data } columns={ taintsColumns } />,
        ]
      },
    },
  }
}
