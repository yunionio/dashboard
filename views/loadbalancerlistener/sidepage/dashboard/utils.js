
import * as R from 'ramda'
import { getSignature } from '@/utils/crypto'
import i18n from '@/locales'

const LINE_POINT = 50
const FRONTEND = 'FRONTEND'
const BACKEND = 'BACKEND'
const isObject = v => R.is(Object, v)

const commonLbSql = ({ select, tags, time, interval, scope } = {}) => {
  const data = {
    metric_query: [
      {
        model: {
          measurement: 'haproxy',
          select,
          tags,
        },
      },
    ],
    scope,
    from: time.from,
    to: time.to,
    interval,
    unit: true,
  }
  data.signature = getSignature(data)
  return data
}

export const lbQuery = ({ fieldType, lsType, lsId, time, aggregate, isRule, scope } = {}) => {
  const from = time.from.replace(/\D+/g, '')
  const to = time.to ? time.to.replace(/\D+/g, '') : 0
  const timeDiff = (from - to) * 3600 // 小时 -> 秒
  const interval = `${timeDiff / LINE_POINT}s`
  const timeObj = {
    from: time.from,
    to: time.to ? 'now' : time.to,
  }
  const accidentArr = ['1xx', '2xx', '3xx', '4xx', '5xx', 'other']
  const commonAccident = accidentArr.map(code => {
    const field = `hrsp_${code}`
    return [
      {
        type: 'field',
        params: [field],
      },
      {
        type: aggregate,
        params: [],
      },
      {
        type: 'non_negative_derivative',
        parmas: ['1s'],
      },
      {
        type: 'alias',
        params: [field],
      },
    ]
  })
  const fields = {
    bps: {
      select: [
        [
          {
            type: 'field',
            params: ['bin'],
          },
          {
            type: aggregate,
            params: [],
          },
          {
            type: 'non_negative_derivative',
            parmas: ['1s'],
          },
          {
            type: 'math',
            params: ['*8'],
          },
          {
            type: 'alias',
            params: ['in_bps'],
          },
        ],
        [
          {
            type: 'field',
            params: ['bout'],
          },
          {
            type: aggregate,
            params: [],
          },
          {
            type: 'non_negative_derivative',
            parmas: ['1s'],
          },
          {
            type: 'math',
            params: ['*8'],
          },
          {
            type: 'alias',
            params: ['out_bps'],
          },
        ],
      ],
      tags: [
        { key: 'pxname', value: lsId, operator: '=', condition: 'and' },
        { key: 'svname', value: FRONTEND, operator: '=', condition: 'and' },
      ],
    },
    rate: {
      select: {
        http: [
          [
            {
              type: 'field',
              params: ['req_rate'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'alias',
              params: ['req_rate'],
            },
          ],
          [
            {
              type: 'field',
              params: ['conn_rate'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'alias',
              params: ['conn_rate'],
            },
          ],
        ],
        https: [
          [
            {
              type: 'field',
              params: ['req_rate'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'alias',
              params: ['req_rate'],
            },
          ],
          [
            {
              type: 'field',
              params: ['conn_rate'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'alias',
              params: ['conn_rate'],
            },
          ],
        ],
        tcp: [
          [
            {
              type: 'field',
              params: ['conn_rate'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'alias',
              params: ['conn_rate'],
            },
          ],
        ],
      },
      tags: [
        { key: 'pxname', value: lsId, operator: '=', condition: 'and' },
        { key: 'svname', value: FRONTEND, operator: '=', condition: 'and' },
      ],
    },
    accident: {
      select: {
        http: [
          [
            {
              type: 'field',
              params: ['dreq'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'non_negative_derivative',
              parmas: ['1s'],
            },
            {
              type: 'alias',
              params: ['dreq'],
            },
          ],
          [
            {
              type: 'field',
              params: ['dcon'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'non_negative_derivative',
              parmas: ['1s'],
            },
            {
              type: 'alias',
              params: ['dcon'],
            },
          ],
        ].concat(commonAccident),
        https: [
          [
            {
              type: 'field',
              params: ['/d(req|con)/'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'non_negative_derivative',
              parmas: ['1s'],
            },
          ],
          [
            {
              type: 'field',
              params: ['/hrsp_.+/'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'non_negative_derivative',
              parmas: ['1s'],
            },
          ],
        ].concat(commonAccident),
        tcp: [
          [
            {
              type: 'field',
              params: ['dcon'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'non_negative_derivative',
              parmas: ['1s'],
            },
            {
              type: 'alias',
              params: ['dcon'],
            },
          ],
        ],
      },
      tags: [
        { key: 'pxname', value: lsId, operator: '=', condition: 'and' },
        { key: 'svname', value: FRONTEND, operator: '=', condition: 'and' },
      ],
    },
  }
  const ruleFields = {
    bps: {
      select: [
        [
          {
            type: 'field',
            params: ['bin'],
          },
          {
            type: aggregate,
            params: [],
          },
          {
            type: 'non_negative_derivative',
            parmas: ['1s'],
          },
          {
            type: 'math',
            params: ['*8'],
          },
          {
            type: 'alias',
            params: ['in_bps'],
          },
        ],
        [
          {
            type: 'field',
            params: ['bout'],
          },
          {
            type: aggregate,
            params: [],
          },
          {
            type: 'non_negative_derivative',
            parmas: ['1s'],
          },
          {
            type: 'math',
            params: ['*8'],
          },
          {
            type: 'alias',
            params: ['out_bps'],
          },
        ],
      ],
      tags: [
        { key: 'pxname', value: `backends_rule_${lsId}`, operator: '=', condition: 'and' },
        { key: 'svname', value: BACKEND, operator: '=', condition: 'and' },
      ],
    },
    rate: {
      select: {
        http: [
          [
            {
              type: 'field',
              params: ['req_rate'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'alias',
              params: ['req_rate'],
            },
          ],
          [
            {
              type: 'field',
              params: ['conn_rate'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'alias',
              params: ['conn_rate'],
            },
          ],
        ],
        https: [
          [
            {
              type: 'field',
              params: ['req_rate'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'alias',
              params: ['req_rate'],
            },
          ],
          [
            {
              type: 'field',
              params: ['conn_rate'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'alias',
              params: ['conn_rate'],
            },
          ],
        ],
      },
      tags: [
        { key: 'pxname', value: `backends_rule_${lsId}`, operator: '=', condition: 'and' },
        { key: 'svname', value: BACKEND, operator: '=', condition: 'and' },
      ],
    },
    accident: {
      select: {
        http: [
          [
            {
              type: 'field',
              params: ['dreq'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'non_negative_derivative',
              parmas: ['1s'],
            },
            {
              type: 'alias',
              params: ['dreq'],
            },
          ],
          [
            {
              type: 'field',
              params: ['dcon'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'non_negative_derivative',
              parmas: ['1s'],
            },
            {
              type: 'alias',
              params: ['dcon'],
            },
          ],
        ].concat(commonAccident),
        https: [
          [
            {
              type: 'field',
              params: ['/d(req|con)/'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'non_negative_derivative',
              parmas: ['1s'],
            },
          ],
          [
            {
              type: 'field',
              params: ['/hrsp_.+/'],
            },
            {
              type: aggregate,
              params: [],
            },
            {
              type: 'non_negative_derivative',
              parmas: ['1s'],
            },
          ],
        ].concat(commonAccident),
      },
      tags: [
        { key: 'pxname', value: `backends_rule_${lsId}`, operator: '=', condition: 'and' },
        { key: 'svname', value: BACKEND, operator: '=', condition: 'and' },
      ],
    },
  }
  const fieldItem = isRule ? ruleFields[fieldType] : fields[fieldType]
  let { select, tags } = fieldItem
  if (isObject(select) && !R.is(Array, select)) select = select[lsType]
  if (!select) console.error(i18n.t('network.text_491', [lsType, fieldType]))
  if (!select) console.error(i18n.t('network.text_492', [lsType, fieldType]))
  return commonLbSql({ select, tags, time: timeObj, interval, scope })
}
