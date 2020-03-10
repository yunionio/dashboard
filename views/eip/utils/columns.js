export const getAssociateNameTableColumn = () => {
  return {
    field: 'associate_name',
    title: '绑定资源',
    width: 120,
    formatter: ({ cellValue, row }) => {
      const type = {
        server: '虚拟机',
        natgateway: 'NAT网关',
        lb: '负载均衡实例',
      }
      if (cellValue) {
        return `${cellValue}(${type[row.associate_type] || '-'})`
      }
    },
  }
}
