import { shallowMount } from '@vue/test-utils'
import CpuRadio from '../index.vue'

describe('CpuRadio', () => {
  const decorator = [
    'vcpu',
    {
      initialValue: 2,
    },
  ]
  const options = [1, 2, 4]

  it('check showMore', () => {
    const max = 2
    const wrapper = shallowMount(CpuRadio, {
      propsData: { decorator, options, max },
    })
    expect(wrapper.html()).toContain('...')
  })

  it('check disabled', () => {
    const disableOptions = [2]
    const wrapper = shallowMount(CpuRadio, {
      propsData: { decorator, options, disableOptions },
    })
    expect(wrapper.find('a-radio-button-stub[disabled="true"]').exists()).toBe(true)
  })
})
