export const getAssociateNameTableColumn = (vm) => {
  return {
    field: 'associate_name',
    title: '绑定资源',
    width: 120,
    slots: {
      default: ({ row }, h) => {
        const type = {
          server: '虚拟机',
          natgateway: 'NAT网关',
          lb: '负载均衡实例',
        }
        if (!row.associate_name) return '-'
        const text = `${row.associate_name}(${type[row.associate_type] || '-'})`
        if (vm) {
          return [
            <list-body-cell-wrap copy hideField={true} field='associate_name' row={row} message={text}>
              <side-page-trigger permission='server_get' name='VmInstanceSidePage' id={row.associate_id} vm={vm}>{text}</side-page-trigger>
            </list-body-cell-wrap>,
          ]
        }
        return text
      },
    },
  }
}
