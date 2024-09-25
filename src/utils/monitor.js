import { UNITS, autoComputeUnit, getRequestT } from '@/utils/utils'
import { getSignature } from '@/utils/crypto'

function genServerQueryData (vmId, val, scope, from, interval, idKey, customTime, skip_check_series, extraTags = []) {
  let select = []
  if (val.as) {
    const asItems = val.as.split(',')
    select = val.seleteItem.split(',').map((val, i) => {
      return [
        {
          type: 'field',
          params: [val],
        },
        { // 对应 mean(val.seleteItem)
          type: val.groupFunc || val.selectFunction || 'mean',
          params: [],
        },
        { // 确保后端返回columns有 val.label 的别名
          type: 'alias',
          params: [asItems[i]],
        },
      ]
    })
  } else {
    select = val.seleteItem.split(',').map((v, i) => {
      return [
        {
          type: 'field',
          params: [v],
        },
        { // 对应 mean(val.seleteItem)
          type: v.groupFunc || v.selectFunction || 'mean',
          params: [],
        },
        { // 确保后端返回columns有 val.label 的别名
          type: 'alias',
          params: [val.label],
        },
      ]
    })
  }
  const model = {
    measurement: val.fromItem,
    select,
    tags: [
      {
        key: idKey,
        value: vmId,
        operator: '=',
      },
    ],
    group_by: [{
      type: 'tag',
      params: [idKey],
    }],
  }

  if (model.measurement === 'agent_cpu') {
    model.tags.push({
      key: 'cpu',
      value: 'cpu-total',
      operator: '=',
    })
  }

  if (val.groupBy && (val.groupBy.length !== 0)) {
    val.groupBy.forEach(group => {
      model.group_by.push({
        type: 'tag',
        params: [group],
      })
    })
  }
  if (val.where && (val.where.length !== 0)) {
    val.where.forEach(filter => {
      model.tags.push(filter)
    })
  }
  const data = {
    metric_query: [
      {
        model: model,
      },
    ],
    scope: scope,
    from: from,
    interval: interval,
    unit: false,
  }
  if (skip_check_series) {
    data.skip_check_series = true
  }
  if (from === 'custom' && customTime && customTime.from && customTime.to) {
    data.from = customTime.from
    data.to = customTime.to
  }
  data.signature = getSignature(data)
  return data
}

export class MonitorHelper {
  constructor (ManagerFactory, scope) {
    this.manager = new ManagerFactory('unifiedmonitors', 'v1')
    this.scope = scope
  }

  genServerQueryData (vmId, val, from, interval, idKey, customTime, skip_check_series) {
    return genServerQueryData(vmId, val, this.scope, from, interval, idKey, customTime, skip_check_series)
  }

  async fetchData (srvId, val, from, interval, idKey, customTime, skip_check_series) {
    const params = {
      id: 'query',
      action: '',
      data: this.genServerQueryData(srvId, val, from, interval, idKey, customTime, skip_check_series),
      params: { $t: getRequestT() },
    }
    try {
      const { data } = await this.manager.performAction(params)
      return data
    } catch (error) {
      throw error
    }
  }

  async fetchFormatData (srvId, val, from, interval, idKey = 'vm_id', customTime, skip_check_series = false) {
    try {
      const data = await this.fetchData(srvId, val, from, interval, idKey, customTime, skip_check_series)
      return {
        title: val.label,
        constants: val,
        series: data.series,
      }
    } catch (error) {
      throw error
    }
  }

  convertToListData (fmtDatas) {
    return fmtDatas.map(result => {
      const { unit, transfer, seleteItem } = result.constants
      const isSizestrUnit = UNITS.includes(unit)
      let series = result.series
      if (!series) series = []
      if (isSizestrUnit || unit === 'bps') {
        series = series.map(serie => {
          return autoComputeUnit(serie, unit, transfer, seleteItem)
        })
      }
      return {
        title: result.title,
        series,
        constants: result.constants,
      }
    })
  }
}
