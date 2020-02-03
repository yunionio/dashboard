import { shallowMount, createLocalVue } from '@vue/test-utils'
import Backup from '../index.vue'

const localVue = createLocalVue()

describe('Backup', () => {
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

  it('check backupEnable', () => {
    const wrapper = shallowMount(Backup, {
      propsData: { decorator },
      localVue,
    })
    wrapper.vm.getBackupHosts()
    console.log(wrapper.vm.hostList, 'wrapper.vm.hostList')
    wrapper.vm.$nextTick(() => {
      const mock = jest.fn(() => wrapper.vm.hostList)
      console.log(mock, 'mock')
      expect(mock).toBeCalledWith(expect.any(Array))
    })
  })

  // it('check disabled', () => {
  //   const disabledItems = []
  //   const wrapper = shallowMount(Backup, {
  //     propsData: { decorator, options, disableOptions },
  //     localVue,
  //   })
  //   expect(wrapper.find('a-radio-button-stub[disabled="true"]').exists()).toBe(true)
  // })
})
