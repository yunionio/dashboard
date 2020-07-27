import { mount } from '@vue/test-utils'
import * as R from 'ramda'
import DataDisk from '../index'
import { diskValidator } from '@Compute/utils/createServer'
import Disk from '@Compute/sections/Disk'
import { isRequired } from '@/utils/validate'
import i18n from '@/locales'

let decorator = null
let store = null
let setFieldsValue = null
let getFieldsValue = null
let wrapper = null
const type = 'idc'
const hypervisor = 'kvm'
const sku = {
  attached_disk_count: 0,
  attached_disk_size_gb: 0,
  can_delete: false,
  can_update: true,
  cloudregion_id: 'default',
  cpu_core_count: 2,
  created_at: '2019-01-08T04:51:02.000000Z',
  data_disk_max_count: 0,
  deleted: false,
  enabled: true,
  gpu_attachable: true,
  gpu_count: 0,
  gpu_max_count: 0,
  id: '540445d3-83e4-4881-8c66-e58fec6b77e4',
  instance_type_category: 'general_purpose',
  instance_type_family: 'g1',
  is_emulated: false,
  local_category: 'general_purpose',
  memory_size_mb: 2048,
  name: 'ecs.g1.c2m2',
  nic_max_count: 1,
  os_name: 'Any',
  postpaid_status: 'available',
  prepaid_status: 'available',
  provider: 'OneCloud',
  region: 'Default',
  region_ext_id: '',
  status: 'ready',
  sys_disk_max_size_gb: 0,
  sys_disk_min_size_gb: 0,
  sys_disk_resizable: true,
  sys_disk_type: 'local',
  total_guest_count: 17,
  update_version: 3,
  updated_at: '2019-07-18T02:12:11.000000Z',
}
const capabilityData = {
  brands: ['Ceph', 'VMware', 'S3', 'OneCloud'],
  compute_engine_brands: ['VMware', 'OneCloud'],
  data_storage_types: ['rbd/rotate', 'local/rotate'],
  data_storage_types2: {
    baremetal: [],
    kvm: ['rbd/rotate', 'local/rotate'],
  },
  disabled_brands: [],
  disabled_compute_engine_brands: [],
  disabled_network_manage_brands: [],
  disabled_object_storage_brands: [],
  gpu_models: ['GeForce GTX 1050 Ti', 'Quadro FX 580'],
  hypervisors: ['baremetal', 'kvm'],
  max_data_disk_count: 12,
  max_nic_count: 8,
  min_data_disk_count: 0,
  min_nic_count: 1,
  network_manage_brands: ['OneCloud'],
  object_storage_brands: ['Ceph', 'S3'],
  public_network_count: 3,
  resource_types: ['shared'],
  sched_policy_support: true,
  specs: {
    hosts: {
      'cpu:24/manufacture:LENOVO/mem:128738M/model:PC0169QS/nic:1': {
        count: 1,
        cpu: 24,
        manufacture: 'LENOVO',
        mem: 128738,
        model: 'PC0169QS',
        nic_count: 1,
      },
      'cpu:40/manufacture:Hewlett-Packard/mem:257773M/model:HP Z820 Workstation/nic:1': {
        count: 2,
        cpu: 40,
        manufacture: 'Hewlett-Packard',
        mem: 257773,
        model: 'HP Z820 Workstation',
        nic_count: 1,
      },
    },
    isolated_devices: {
      'model:Quadro FX 580/type:GPU-HPC/vendor:NVIDIA': {
        count: 1,
        dev_type: 'GPU-HPC',
        model: 'Quadro FX 580',
        pci_id: '10de:0659',
        vendor: 'NVIDIA',
      },
    },
  },
  storage_types: ['rbd/rotate', 'local/rotate'],
  storage_types2: { baremetal: [], kvm: ['rbd/rotate', 'local/rotate'] },
  usable: true,
}

beforeEach(() => {
  decorator = {
    type: i => [
      `dataDiskTypes[${i}]`,
      {
        rules: [
          { validator: isRequired(), message: i18n.t('compute.text_121') },
        ],
      },
    ],
    size: i => [
      `dataDiskSizes[${i}]`,
      {
        rules: [
          { required: true, message: i18n.t('compute.text_122') },
        ],
      },
    ],
    schedtag: i => [
      `dataDiskSchedtags[${i}]`,
      {
        validateTrigger: ['change', 'blur'],
        rules: [{
          required: true,
          message: i18n.t('compute.text_123'),
        }],
      },
    ],
    policy: i => [
      `dataDiskPolicys[${i}]`,
      {
        validateTrigger: ['blur', 'change'],
        rules: [{
          required: true,
          message: i18n.t('compute.text_123'),
        }],
      },
    ],
    snapshot: i => [
      `dataDiskSnapshots[${i}]`,
      {
        validateTrigger: ['blur', 'change'],
        rules: [{
          required: true,
          message: i18n.t('compute.text_124'),
        }],
      },
    ],
    filetype: i => [
      `dataDiskFiletypes[${i}]`,
      {
        validateTrigger: ['blur', 'change'],
        rules: [{
          required: true,
          message: i18n.t('compute.text_125'),
        }],
      },
    ],
    mountPath: i => [
      `dataDiskMountPaths[${i}]`,
      {
        validateTrigger: ['blur', 'change'],
        rules: [{
          required: true,
          message: i18n.t('compute.text_126'),
        }, {
          validator: diskValidator,
        }],
      },
    ],
  }
  store = {
    getters: {
      isAdminMode: () => true,
      scope: () => 'system',
    },
  }
  setFieldsValue = jest.fn()
  getFieldsValue = jest.fn()
  wrapper = mount(DataDisk, {
    propsData: {
      decorator,
      type,
      hypervisor,
      sku,
      capabilityData,
    },
    provide () {
      return {
        form: {
          fc: {
            setFieldsValue,
            getFieldsValue,
          },
        },
      }
    },
    store,
  })
})

expect.extend({
  haveSizeAndType (obj) {
    const result = {
      message: () => '',
      pass: true,
    }
    const keys = Object.keys(obj)
    const valid = keys.every(k => {
      const val = obj[k]
      if (k.startsWith('dataDiskSizes')) {
        return R.is(Number, val) && val >= 10
      }
      if (k.startsWith('dataDiskTypes')) {
        return R.is(Object, val) && !R.isEmpty(val.key)
      }
      return true
    })
    if (!valid) {
      result.pass = false
      result.message = () => i18n.t('compute.text_127', [JSON.stringify(obj)])
    }
    return result
  },
})

describe('DataDisk kvm', () => {
  it('check add once', () => {
    wrapper.vm.add()
    wrapper.vm.$nextTick(() => {
      expect(setFieldsValue.mock.instances[0].setFieldsValue).toHaveBeenCalled()
      expect(setFieldsValue.mock.calls[0][0]).haveSizeAndType()
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  it('check add twice', () => {
    wrapper.vm.add()
    wrapper.vm.add()
    wrapper.vm.$nextTick(() => {
      expect(setFieldsValue.mock.instances[0].setFieldsValue).toHaveBeenCalled()
      expect(setFieldsValue.mock.calls[0][0]).haveSizeAndType()
      expect(setFieldsValue.mock.calls[1][0]).haveSizeAndType()
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  it('check add twice and decrease once', () => {
    wrapper.vm.add()
    wrapper.vm.add()
    const firstKey = wrapper.vm.dataDisks[0].key
    const secondKey = wrapper.vm.dataDisks[1].key
    wrapper.vm.decrease(firstKey)
    expect(wrapper.vm.dataDisks[0].key).toBe(secondKey)
  })

  it('check diskTypeChange', () => {
    wrapper.vm.add()
    wrapper.vm.add()
    wrapper.find(Disk).vm.$emit('diskTypeChange', {
      key: 'rbd',
      label: 'Ceph RBD',
    })
    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.dataDisks[0].diskType.key).toBe('rbd')
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  // 如果磁盘类别里面有本地磁盘，优先本地磁盘作为第一项
  it('check add once, diskType is local', () => {
    if (wrapper.vm.typesMap.local) {
      expect(Object.keys(wrapper.vm.typesMap)[0]).toBe('local')
    }
  })
})
