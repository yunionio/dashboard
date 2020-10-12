<script>
import * as R from 'ramda'
import { isWithinRange } from '@/utils/validate'

export default {
  name: 'CreatePrepareNets',
  props: {
    type: {
      type: String,
      default: 'host',
    },
    prepareNetData: {
      type: Object,
      required: true,
    },
  },
  computed: {
    nets () {
      return this.prepareNetData[`${this.type}s`] || []
    },
    suggestedNets () {
      return this.prepareNetData[`${this.type}_suggested_networks`] || []
    },
    listData () {
      const _ = this.nets
      const networks = this.suggestedNets
      const _listData = []
      if (!_ || _.length === 0) return []
      const formatIps = (row) => {
        if (row.ip_nets && row.ip_nets.length > 0) {
          return row.ip_nets.map(item => item.ip)
        }
        return row.ip ? [row.ip] : []
      }
      const formatSuitable = (row) => {
        const { ips } = row
        // ip为空 默认为true
        if (!ips || !ips.length) return true
        for (let i = 0; i < networks.length; i++) {
          const { guest_ip_start, guest_ip_end } = networks[i]
          for (let p = 0; p < ips.length; p++) {
            const ip = ips[p]
            if (isWithinRange(ip, guest_ip_start, guest_ip_end)) {
              return true
            }
          }
        }
        return false
      }
      let items = []
      let j = 0
      for (let i = 0; i < _.length; i++) {
        const row = _[i]
        row.ips = formatIps(row)
        const { ip_nets } = row
        let isSuitableNetwork = false
        if (ip_nets && ip_nets.length) {
          isSuitableNetwork = ip_nets.every(o => o.suitable_network)
        }
        this.$set(row, 'isSuitable', isSuitableNetwork || !!row.suitable_network || formatSuitable(row))
        items.push(_[i])
        if (_.length === 1) {
          _listData.push(items)
          return _listData
        }
        // 最后一个
        if (i === _.length - 1) {
          _listData.push(items)
          break
        }
        if (j >= 1) {
          _listData.push(items)
          items = []
          j = 0
        } else {
          ++j
        }
      }
      return _listData
    },
  },
  methods: {
    // formatStatus (status) {
    //   return (
    //     <div style="display: inline-block;">
    //       {status
    //         ? <a-icon class="success-color" type="check-circle" style="font-size: 19px" />
    //         : <a-icon class="error-color" type="close-circle" style="font-size: 19px" />
    //       }
    //     </div>
    //   )
    // },
  },
  // render () {
  //   const Thead = () => {
  //     const tds = [<td>序号</td>, <td> 名称 </td>, <td> { this.type === 'host' ? this.$t('cloudenv.text_171') : this.$t('cloudenv.text_172') }</td>, <td>网络是否满足</td>]
  //     return (
  //       <tr class="thead">
  //         { (this.listData && this.listData.length > 0) ? this.listData[0].map(() => tds) : null }
  //       </tr>
  //     )
  //   }
  //   const Tbody = () => {
  //     let index = 0
  //     const trs = this.listData.map(rows => {
  //       return <tr>
  //         {
  //           rows.map(row => {
  //             const tds = []
  //             const o = {
  //               index: ++index,
  //               name: row.name,
  //               ips: row.ips,
  //               status: this.formatStatus(row.isSuitable),
  //             }
  //             Object.keys(o).forEach(k => {
  //               if (k === 'ips') {
  //                 tds.push(
  //                   <td>{ o.ips && o.ips.length > 0 ? o.ips.map(ip => ip).join('、') : '-'}</td>,
  //                 )
  //               } else {
  //                 tds.push(
  //                   <td>
  //                     {o[k]}
  //                   </td>,
  //                 )
  //               }
  //             })
  //             return tds
  //           })
  //         }
  //       </tr>
  //     })
  //     return trs
  //   }
  //   return (
  //     <div class="prepare-content">
  //       {
  //         (this.nets && this.nets.length > 0)
  //           ? <table class="prepare-table">
  //             <tbody>
  //               <Thead />
  //               <Tbody />
  //             </tbody>
  //           </table>
  //           : <a-alert show-icon message={this.type === 'host' ? this.$t('cloudenv.text_173') : this.$t('cloudenv.text_174')} type="error" class="mt-4" />
  //       }

  //     </div>
  //   )
  // },
  render () {
    let index = 0
    const columns = [
      {
        field: 'index0',
        title: this.$t('cloudenv.text_496'),
        formatter: ({ row }) => {
          if (row[0] && row[0].name) {
            return ++index
          }
          return '-'
        },
      },
      {
        field: 'name0',
        title: this.$t('table.title.name'),
        formatter: ({ row }) => {
          return (row[0] && row[0].name) || '-'
        },
      },
      {
        field: 'ips0',
        title: this.type === 'host' ? this.$t('cloudenv.text_171') : this.$t('cloudenv.text_172'),
        formatter: ({ row }) => {
          return row[0] && row[0].ips && row[0].ips.length > 0 ? row[0].ips.map(ip => ip).join('、') : '-'
        },
      },
      {
        field: 'isSuitable0',
        title: this.$t('cloudenv.text_495'),
        slots: {
          default: ({ row }) => {
            if (!R.isNil(row[0] && row[0].isSuitable)) {
              return row[0] && row[0].isSuitable ? [<a-icon class="success-color" type="check-circle" style="font-size: 19px" />] : [<a-icon class="error-color" type="close-circle" style="font-size: 19px" />]
            }
            return '-'
          },
        },
      },
      {
        field: 'index1',
        title: this.$t('cloudenv.text_496'),
        formatter: ({ row }) => {
          if (row[1] && row[1].name) {
            return ++index
          }
          return '-'
        },
      },
      {
        field: 'name1',
        title: this.$t('table.title.name'),
        formatter: ({ row }) => {
          return (row[1] && row[1].name) || '-'
        },
      },
      {
        field: 'ips1',
        title: this.type === 'host' ? this.$t('cloudenv.text_171') : this.$t('cloudenv.text_172'),
        formatter: ({ row }) => {
          return row[1] && row[1].ips && row[1].ips.length > 1 ? row[1].ips.map(ip => ip).join('、') : '-'
        },
      },
      {
        field: 'isSuitable1',
        title: this.$t('cloudenv.text_495'),
        slots: {
          default: ({ row }) => {
            if (!R.isNil(row[1] && row[1].isSuitable)) {
              return row[1] && row[1].isSuitable ? [<a-icon class="success-color" type="check-circle" style="font-size: 19px" />] : [<a-icon class="error-color" type="close-circle" style="font-size: 19px" />]
            }
            return '-'
          },
        },
      },
    ]
    return (
      <div class='prepare-content'>
        {
          (this.nets && this.nets.length > 0)
            ? <vxe-grid border show-overflow='title' height='300' size='mini' scroll-y={{ gt: 10 }} highlight-hover-row data={ this.listData } columns={ columns } />
            : <a-alert show-icon message={this.type === 'host' ? this.$t('cloudenv.text_173') : this.$t('cloudenv.text_174')} type='error' class='mt-4' />
        }
      </div>
    )
  },
}
</script>

<style lang="less" scoped>
// .prepare-content{
//   max-height: 300px;
//   overflow: auto;
// }
// .prepare-table{
//   width: 100%;
//   margin-top: 30px;
//   .thead{
//     background-color: #f8f8f9;
//     td {
//       padding: 5px;
//       font-weight: 500;
//     }
//   }
//   td {
//     font-size: 12px;
//     color: #60626E;
//     padding: 7px;
//     border: 1px solid #e8eaec;
//     text-align: center
//   }
// }
</style>
