export const getTypeTableColumn = () => {
  return {
    field: 'type',
    title: '应用类型',
    minWidth: 100,
    formatter: ({ row }) => {
      return row.type
    },
  }
}

export const getKindTableColumn = () => {
  return {
    field: 'kind',
    title: '种类',
    minWidth: 100,
    formatter: ({ row }) => {
      return row.kind
    },
  }
}

export const getTechStackTableColumn = () => {
  return {
    field: 'tech_stack',
    title: '技术栈',
    minWidth: 100,
    formatter: ({ row }) => {
      return row.tech_stack
    },
  }
}
