export default {
  created () {
    this.singleActions = [
      {
        label: '删除',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '删除',
            name: this.$t('dictionary.keypair'),
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
