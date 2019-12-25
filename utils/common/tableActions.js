export function disableDeleteAction (params = {}, dialogParams = {}) {
  const { name = '实例' } = dialogParams
  const { list, columns, createDialog, ...optionParams } = params
  const getData = (row) => row ? [row] : list.selectedItems
  const options = {
    label: '设置删除保护',
    action: (row) => {
      createDialog('ChangeDisableDelete', {
        name,
        data: getData(row),
        list,
        columns,
      })
    },
    meta: (row) => {
      const validate = getData(row) && getData(row).length > 0
      return {
        validate: validate,
        tooltip: !validate && `请选择需要操作的${name}`,
      }
    },
    ...optionParams,
  }
  return options
}
