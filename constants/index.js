import i18n from '@/locales'
export const STORAGE_TYPES = {
  local: i18n.t('storage.text_1'),
  baremetal: i18n.t('storage.text_2'),
  sheepdog: 'Sheepdog',
  rbd: 'Ceph',
  docker: i18n.t('storage.text_3'),
  nas: 'NAS',
  vsan: 'vSAN',
  nfs: 'NFS',
  gpfs: 'GPFS',
  localstorage: i18n.t('storage.text_4'),
  ceph: i18n.t('storage.text_5'),
  iscsi: 'iscsi',
}

export const MEDIUM_TYPES = {
  rotate: i18n.t('storage.text_6'),
  ssd: i18n.t('storage.text_7'),
  hybrid: i18n.t('storage.text_8'),
}

export const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
}

export const ACL_TYPE = {
  private: i18n.t('storage.text_9'),
  'public-read': i18n.t('storage.text_10'),
  'public-read-write': i18n.t('storage.text_11'),
}

export const OSS_MONITOR_OPTS = {
  aliyun: [
    {
      name: 'GetObjectE2eLatency',
      label: i18n.t('storage.text_12'),
      seleteItem: 'req_late',
      fromItem: 'oss_latency',
      as: i18n.t('storage.text_13'),
      unit: 'ms',
      transfer: 1,
      tag: {
        request: 'get',
      },
    },
    {
      name: 'GetObjectCount',
      label: i18n.t('storage.text_14'),
      seleteItem: 'req_count',
      fromItem: 'oss_req',
      as: i18n.t('storage.text_14'),
      unit: '',
      transfer: 1,
      tag: {
        request: 'get',
      },
    },
  ],
  huawei: [
    {
      name: 'GetObjectE2eLatency',
      label: i18n.t('storage.text_13'),
      seleteItem: 'req_count',
      fromItem: 'oss_req',
      as: i18n.t('storage.text_13'),
      unit: '',
      transfer: 1,
      tag: {
        request: 'get',
      },
    },
    {
      name: 'first_byte_latency',
      label: i18n.t('storage.text_15'),
      seleteItem: 'req_late',
      fromItem: 'oss_latency',
      as: i18n.t('storage.text_15'),
      unit: 'ms',
      transfer: 1,
      tag: {
        request: 'get',
      },
    },
  ],
}
