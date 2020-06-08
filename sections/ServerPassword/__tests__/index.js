import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import BaseSelect from '@tests/stubs/BaseSelect'
import Icon from '@tests/stubs/Icon'
import ServerPassword from '../index'
import { LOGIN_TYPES_MAP } from '@Compute/constants'

const localVue = createLocalVue()
localVue.use(VueRouter)
localVue.directive('decorator', {})
const router = new VueRouter()

let decorator = null
let form = null
beforeEach(() => {
  decorator = {
    loginType: ['loginType', { initialValue: 'random' }],
    keypair: [
      'loginKeypair',
      {
        initialValue: 'abc',
      },
    ],
    password: [
      'loginPassword',
    ],
  }
  form = {
    fc: {
      setFieldsValue: jest.fn(),
    },
  }
})

describe('ServerPassword loginTypeMap', () => {
  it('check all loginTypeMap', () => {
    const loginTypes = ['random', 'keypair', 'image', 'password']
    const wrapper = shallowMount(ServerPassword, {
      propsData: {
        decorator,
        loginTypes,
        form,
      },
    })
    expect(wrapper.vm.loginTypeMap).toEqual(LOGIN_TYPES_MAP)
    expect(wrapper.vm.form.fc.setFieldsValue.mock.calls[0][0]).toEqual({ loginType: LOGIN_TYPES_MAP.random.key })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('check loginTypeMap initValue is image', () => {
    const loginTypes = ['keypair', 'image']
    const wrapper = shallowMount(ServerPassword, {
      propsData: {
        decorator,
        loginTypes,
        form,
      },
    })
    expect(wrapper.vm.loginTypeMap).toEqual({
      keypair: LOGIN_TYPES_MAP.keypair,
      image: LOGIN_TYPES_MAP.image,
    })
    expect(wrapper.vm.form.fc.setFieldsValue.mock.calls[0][0]).toEqual({ loginType: LOGIN_TYPES_MAP.image.key })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  // 暂时无法解决 BaseSelect value is required
  it('check loginTypeMap initValue is the first of loginTypes', () => {
    const loginTypes = ['keypair', 'password']
    const wrapper = shallowMount(ServerPassword, {
      propsData: {
        decorator,
        loginTypes,
        form,
      },
      stubs: {
        'base-select': BaseSelect,
        icon: Icon,
      },
      localVue,
      router,
    })
    expect(wrapper.vm.loginTypeMap).toEqual({
      keypair: LOGIN_TYPES_MAP.keypair,
      password: LOGIN_TYPES_MAP.password,
    })
    expect(wrapper.vm.form.fc.setFieldsValue.mock.calls[0][0]).toEqual({ loginType: LOGIN_TYPES_MAP.keypair.key })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
