export const getVpcTableColumn = (vm) => {
  return {
    field: 'vpc',
    title: vm.$t('network.text_535'),
    minWidth: 120,
    showOverflow: 'ellipsis',
  }
}
