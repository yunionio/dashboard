export const getVpcTableColumn = (vm) => {
  return {
    field: 'vpc',
    title: 'VPC',
    minWidth: 120,
    showOverflow: 'ellipsis',
    slots: {
      default: ({ row }, h) => {
        return [
          <side-page-trigger name='VpcSidePage' id={row.vpc_id} vm={vm}>{row.vpc}</side-page-trigger>,
        ]
      },
    },
  }
}
