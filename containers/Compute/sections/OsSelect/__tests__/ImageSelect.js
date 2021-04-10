import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import ImageSelect from '../ImageSelect'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { Manager } from '@/utils/manager'
import i18n from '@/locales'

const idcStandardImageList = [
  {
    name: 'test1',
    id: 1,
    disk_format: 'qcow2',
    properties: {
      arch: 'x86_64',
      distro: 'Windows Server 2012 R2 Datacenter',
      os_type: 'Windows',
      partition_type: 'mbr',
      version: '6.3',
    },
  },
  {
    name: 'test2',
    id: 2,
    disk_format: 'qcow2',
    properties: {
      net_driver: '',
      os_distribution: 'CentOS',
      os_type: 'Linux',
      partition_type: 'mbr',
      uefi_support: 'true',
      version: '8.0.1905',
    },
  },
  {
    name: 'test31',
    id: 3,
    disk_format: 'qcow2',
    properties: {
      os_type: 'linux',
    },
  },
]

const idcStandardImageParams = {
  limit: 0,
  details: true,
  status: 'active',
  is_guest_image: false,
  scope: 'system',
  'filter.0': 'disk_format.notequals(iso)',
  is_standard: true,
}

const $route = {
  query: {},
}
let store = null
let setFieldsValue = null
let getFieldsValue = null
let decorator = null
let localVue = null

beforeEach(() => {
  setFieldsValue = jest.fn()
  decorator = {
    os: [
      'os',
      {
        initialValue: '',
        rules: [{ required: true, message: i18n.t('compute.text_153') }],
      },
    ],
    image: [
      'image',
      {
        initialValue: { key: '', label: '' },
      },
    ],
  }
  store = new Vuex.Store({
    getters: {
      scope: () => 'system', // !!! 如果写成 scope: 'system' 会报错，注意
      userInfo () {
        return {
          projectId: 'test',
        }
      },
    },
  })
  localVue = createLocalVue()
  localVue.use(Vuex)
})

describe('OsSelect', () => {
  it('IDC standard', () => {
    getFieldsValue = jest.fn(() => {
      return {
        os: 'Windows',
        image: {
          key: '90b59d90-45af-4dad-86ff-c2a19f689834',
          label: 'windows-server-2012-R2-VL-202008',
        },
      }
    })
    const wrapper = mount(ImageSelect, {
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
      propsData: {
        decorator,
        type: 'idc',
        hypervisor: 'kvm',
        cloudType: 'idc',
        imageType: IMAGES_TYPE_MAP.standard.key,
        form: {
          fc: {
            setFieldsValue,
            getFieldsValue,
          },
        },
      },
      mocks: {
        $route,
      },
      localVue,
      store,
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
    // 测试公共镜像的参数
    const imagesM = Manager.mock.instances[0]
    expect(imagesM.list.mock.calls[0][0].params).toEqual(idcStandardImageParams)
    wrapper.setData({
      images: {
        list: idcStandardImageList, // 公共镜像、iso、自定义镜像 list
        cacheimagesList: [], // idc: 镜像缓存list，用于对比哪些镜像已缓存，public|private: image-list
        hostimagesList: [], // 主机镜像 list
        instanceSnapshotsList: [], // 主机快照 list
      },
    })
    // 测试组件的 osOpts 和 imageOptsMap
    wrapper.vm.getImagesInfo()
    expect(wrapper.vm.imagesInfo.osOpts).toEqual([
      { label: 'Windows', key: 'Windows' },
      { label: 'CentOS', key: 'CentOS' },
      { label: 'Linux', key: 'Linux' },
    ])
    expect(wrapper.vm.imagesInfo.imageOptsMap).toEqual({
      Windows: [
        {
          name: 'test1',
          id: 1,
          disk_format: 'qcow2',
          properties: {
            arch: 'x86_64',
            distro: 'Windows Server 2012 R2 Datacenter',
            os_type: 'Windows',
            partition_type: 'mbr',
            version: '6.3',
          },
          feData: {
            name: 'test1',
            imageType: 'Windows',
          },
        },
      ],
      CentOS: [
        {
          name: 'test2',
          id: 2,
          disk_format: 'qcow2',
          properties: {
            net_driver: '',
            os_distribution: 'CentOS',
            os_type: 'Linux',
            partition_type: 'mbr',
            uefi_support: 'true',
            version: '8.0.1905',
          },
          feData: { name: 'CentOS (test2)', imageType: 'CentOS' },
        },
      ],
      Linux: [
        {
          name: 'test31',
          id: 3,
          disk_format: 'qcow2',
          properties: { os_type: 'linux' },
          feData: { name: 'test31', imageType: 'linux' },
        },
      ],
    })
  })
})
