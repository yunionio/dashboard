import { arrayToObj } from '@/utils/utils'
import i18n from '@/locales'

export const WORK_TYPES = [
  { key: 'Notebook', label: i18n.t('compute.modelarts.notebook') },
  { key: 'Train', label: i18n.t('compute.modelarts.train') },
  { key: 'Infer', label: i18n.t('compute.modelarts.infer') },
]

export const WORK_TYPE = arrayToObj(WORK_TYPES, 'key')

export const SPECS = [
  { key: 'x86', label: 'x86' },
  { key: 'arm64', label: 'arm64' },
]

export const SPEC_MAP = arrayToObj(SPECS, 'key')

export const ARCHS = [
  { key: 'CPU', label: 'CPU' },
  { key: 'GPU', label: 'GPU' },
  { key: 'Ascend', label: 'Ascend' },
]

export const ARCH_MAP = arrayToObj(ARCHS, 'key')

export const SPEC_ARCH_MAP = {
  [SPEC_MAP.x86.key]: [
    { key: 'CPU', label: 'CPU' },
    { key: 'GPU', label: 'GPU' },
  ],
  [SPEC_MAP.arm64.key]: [
    { key: 'Ascend', label: 'Ascend' },
  ],
}

export const ZONE_TYPES = [
  { key: 'random', label: i18n.t('compute.modelarts.random') },
]
export const ZONE_TYPE_MAP = arrayToObj(ZONE_TYPES, 'key')

export const BILL_TYPES = [
  { key: 'postpaid', label: i18n.t('compute.modelarts.postpaid') },
]
export const BILL_TYPE_MAP = arrayToObj(BILL_TYPES, 'key')
