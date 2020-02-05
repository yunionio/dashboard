import { shallowMount } from '@vue/test-utils'
import Backup from '../index.vue'

jest.mock('@/utils/manager', () => {
  const hostlist = [
    { name: 'test1', id: 1 },
    { name: 'test2', id: 2 },
    { name: 'test3', id: 3 },
  ]
  function Manager () {}
  Manager.prototype.list = () => Promise.resolve({ data: { data: hostlist } })
  return { Manager }
})

describe('Backup switchDisabled', () => {
  const decorator = {
    backupEnable: [
      'backupEnable',
      {
        valuePropName: 'checked',
        initialValue: false,
      },
    ],
    backup: [
      'backup',
    ],
  }

  it('hostList.length decide switchDisabled false', () => {
    const wrapper = shallowMount(Backup, {
      propsData: { decorator },
      data () {
        return {
          backupEnable: false,
        }
      },
    })
    wrapper.vm.$nextTick(() => { // 已经模拟 manager 方法返回 hostList
      expect(wrapper.vm.switchDisabled).toBeFalsy()
    })
  })

  it('diskType=gpfs decide switchDisabled true', () => {
    const wrapper = shallowMount(Backup, {
      propsData: { decorator, diskType: 'gfs1' },
    })
    expect(wrapper.vm.switchDisabled).toBeTruthy()
  })
})
