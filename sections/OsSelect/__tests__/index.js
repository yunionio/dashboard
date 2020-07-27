import { shallowMount } from '@vue/test-utils'
import OsSelect from '../index'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import i18n from '@/locales'

let setFieldsValue = null
let decorator = null

const $route = {
  query: {
  },
}

beforeEach(() => {
  setFieldsValue = jest.fn()
  decorator = {
    os: [
      'os',
      {
        initialValue: '',
        rules: [
          { required: true, message: i18n.t('compute.text_153') },
        ],
      },
    ],
    image: [
      'image',
      {
        initialValue: { key: '', label: '' },
      },
    ],
    imageType: [
      'imageType',
      {
        initialValue: 'standard',
      },
    ],
  }
})

describe('OsSelect', () => {
  it('IDC base', () => {
    const type = 'idc'
    const hypervisor = 'kvm'
    const wrapper = shallowMount(OsSelect, {
      provide () {
        return {
          form: {
            fc: {
              setFieldsValue,
            },
          },
        }
      },
      propsData: {
        decorator,
        type,
        hypervisor,
      },
      mocks: {
        $route,
      },
    })
    expect(wrapper.vm.mirrorTypeOptions).toEqual([IMAGES_TYPE_MAP.standard, IMAGES_TYPE_MAP.customize, IMAGES_TYPE_MAP.iso, IMAGES_TYPE_MAP.host, IMAGES_TYPE_MAP.snapshot])
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
