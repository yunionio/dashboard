import { shallowMount } from '@vue/test-utils'
import VmPublicCreateBill from '../index.vue'
import i18n from '@/locales'

describe('VmPublicCreateBill', () => {
  it('check buyDurationOptions in aliyun, first item is 1W', () => {
    const decorators = {
      billType: [
        'billType',
        {
          initialValue: 'quantity',
        },
      ],
      duration: [
        'duration',
        {
          initialValue: '1M',
        },
      ],
    }
    const providerList = ['aliyun']
    const wrapper = shallowMount(VmPublicCreateBill, {
      propsData: {
        decorators,
        providerList,
      },
    })
    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.buyDurationOptions[0]).toEqual({
        label: i18n.t('compute.text_24'),
        key: '1W',
        unit: 'W',
        includes: ['aliyun'],
      })
    })
  })
})
