import * as R from 'ramda'

export const k8sStatusColumn = () => {
  return {
    field: 'status',
    title: '状态',
    minWidth: 200,
    slots: {
      default: ({ row }, h) => {
        const warnings = row.podsInfo.warnings.map(v => v.message)
        let warnTooltip = null
        if (warnings && warnings.length) {
          warnTooltip = (
            <a-tooltip placement="top">
              <template slot="title">
                { warnings.map(val => (<div> { val } </div>)) }
              </template>
              <a-icon type="bulb" theme="twoTone" twoToneColor="#f5222d" class="mr-2" />状态异常
            </a-tooltip>
          )
        }
        return [
          <div class='text-truncate'>
            <status status={ row.status } statusModule='k8s_resource'>
              { warnTooltip }
            </status>
          </div>,
        ]
      },
    },
  }
}

export const k8sLabelColumn = () => {
  return {
    field: 'labels',
    title: '标签',
    minWidth: 200,
    slots: {
      default: ({ row }, h) => {
        if (!row.labels || !R.is(Object, row.labels)) return '-'
        const colors = ['pink', 'orange', 'green', 'cyan', 'blue', 'purple', 'red']
        const labels = Object.entries(row.labels).map(arr => ({ key: arr[0], value: arr[1] }))
        return [
          <div>
            {
              labels.map((val, i) => {
                return (<div><a-tag color={ colors[i % colors.length] }>{ `${val.key}：${val.value}` }</a-tag></div>)
              })
            }
          </div>,
        ]
      },
    },
  }
}
