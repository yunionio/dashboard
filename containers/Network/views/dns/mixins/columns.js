import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import { REGEXP } from '@/utils/validate'
import i18n from '@/locales'

const { IPv4, domain } = REGEXP
const RECORD_TYPE_MAP = {
  A: 'A/AAAA',
  AAAA: 'A/AAAA',
  CNAME: 'CNAME',
  PTR: 'PTR',
  SRV: 'SRV',
}

const classify = (recordStr) => {
  const initArr = recordStr.split(',')
  const recordList = initArr.map(keyValue => {
    const arr = keyValue.split(':')
    const key = arr[0]
    if (key === 'SRV') {
      return {
        key,
        host: arr[1],
        port: arr[2],
        weight: arr[3],
        priority: arr[4],
      }
    } else {
      const record = keyValue
        .split(':')
        .slice(1)
        .join(':')
      return { key, record }
    }
  })
  const key = recordList[0].key // 拿第一个 key 做判断
  return {
    recordType: RECORD_TYPE_MAP[key],
    recordList,
  }
}

const checkName = (row) => {
  return (rule, value, callback) => {
    if (!value) {
      return callback(new Error(i18n.t('network.text_158')))
    }
    if (IPv4.regexp.test(value) || !domain.regexp.test(value)) {
      return callback(new Error(i18n.t('network.text_178')))
    }
    const { recordType } = classify(row.records)
    if (recordType === 'SRV') {
      const parts = value.split('.')
      if (parts.length < 3) {
        return callback(new Error(i18n.t('network.text_179')))
      }
      for (let i = 0; i < parts.length; i++) {
        if (i < 2 && (parts[i].length < 2 || parts[i][0] !== '_')) {
          return callback(new Error(i18n.t('network.text_180')))
        } else if (i >= 2 && parts[i].length === 0) {
          return callback(new Error(i18n.t('network.text_180')))
        }
      }
    }
    callback()
  }
}

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: i18n.t('network.text_156'),
        edit: false,
        formRules: function (row) {
          return [
            { required: true, message: i18n.t('network.text_173') },
            { validator: checkName(row) },
          ]
        },
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getEnabledTableColumn(),
      getCopyWithContentTableColumn({
        field: 'records',
        title: i18n.t('network.text_152'),
      }),
      {
        field: 'ttl',
        title: 'TTL',
        formatter: ({ cellValue, row }) => {
          const ttlTime = parseInt(cellValue / 60)
          if (ttlTime >= 1440) { // 一天是 1440 分钟
            return i18n.t('network.text_185', [parseInt(ttlTime / 1440)])
          } else if (ttlTime >= 60) {
            return i18n.t('network.text_186', [parseInt(ttlTime / 60)])
          } else if (ttlTime > 1) {
            return i18n.t('network.text_187', [ttlTime])
          } else {
            return i18n.t('network.text_188', [cellValue || 0])
          }
        },
      },
    ]
  },
}
