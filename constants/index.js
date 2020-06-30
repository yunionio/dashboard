export const STORAGE_TYPES = {
  local: '本地存储',
  baremetal: '物理机存储',
  sheepdog: 'Sheepdog',
  rbd: 'Ceph',
  docker: '容器存储',
  nas: 'NAS',
  vsan: 'vSAN',
  nfs: 'NFS',
  gpfs: 'GPFS',
  localstorage: '本地云盘',
  ceph: '共享云盘',
  iscsi: 'iscsi',
}

export const MEDIUM_TYPES = {
  rotate: '机械盘',
  ssd: '固态盘',
  hybrid: '混合盘',
}

export const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
}

export const ACL_TYPE = {
  private: '本账号读写',
  'public-read': '本账号写公开读',
  'public-read-write': '公开读写',
}

export const OSS_MONITOR_OPTS = {
  aliyun: [
    {
      name: 'GetObjectE2eLatency',
      label: 'GetObject请求平均E2E延时',
      seleteItem: 'req_late',
      fromItem: 'oss_latency',
      as: 'GET类请求次数',
      unit: 'ms',
      transfer: 1,
      tag: {
        request: 'get',
      },
    },
    {
      name: 'GetObjectCount',
      label: 'GetObject成功请求数',
      seleteItem: 'req_count',
      fromItem: 'oss_req',
      as: 'GetObject成功请求数',
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
      label: 'GET类请求次数',
      seleteItem: 'req_count',
      fromItem: 'oss_req',
      as: 'GET类请求次数',
      unit: '',
      transfer: 1,
      tag: {
        request: 'get',
      },
    },
    {
      name: 'first_byte_latency',
      label: 'GET类请求首字节平均时延',
      seleteItem: 'req_late',
      fromItem: 'oss_latency',
      as: 'GET类请求首字节平均时延',
      unit: 'ms',
      transfer: 1,
      tag: {
        request: 'get',
      },
    },
  ],
}
