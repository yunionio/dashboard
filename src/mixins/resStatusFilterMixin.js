export default {
  props: {
    statusRes: {
      type: String,
      default: 'server',
    },
    filterParams: {
      type: Object,
      default: () => ({}),
    },
  },
  watch: {
    filterParams: {
      handler: function (val) {
        if (!val.isFirstLoad) {
          const filterStatus = this.list.filter.status || []
          val.statusCheckArr.forEach((item) => {
            if (!filterStatus.includes(item)) {
              filterStatus.push(item)
            }
          })
          if (val.statusCheckArr && val.statusCheckArr.length > 0) {
            this.list.changeFilter({ ...this.list.filter, status: val.statusCheckArr })
            this.list.filterOptions.status.items = []
            const statusArrTem = this.list.filterOptions.status.items || []
            val.statusArr.forEach((item) => {
              const isExist = statusArrTem.some((obj) => { return obj.key === item })
              if (!isExist) {
                statusArrTem.push({
                  key: item,
                  label: this.$t(`status.${this.statusRes}.${item}`),
                })
              }
            })
            this.list.filterOptions.status.items = statusArrTem
          } else {
            delete this.list.filter.status
            this.list.changeFilter({ ...this.list.filter })
          }
        }
      },
      deep: true,
    },
  },
}
