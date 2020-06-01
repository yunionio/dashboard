<template>
   <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions">
      <div slot="table-prepend" class="d-flex align-items-center pt-2 pb-2">
        <span>
         <a-icon type="folder-open" theme="filled" style="color: rgb(245,200, 61);font-size:15px" /> 当前文件目录：
        </span>
        <a-breadcrumb>
           <a-breadcrumb-item>
             <a-button  style="padding:0" type="link" @click="nextPage('')"> {{data.name}} </a-button>
          </a-breadcrumb-item>
          <a-breadcrumb-item v-for="(value, key) in breadcrumbs" :key="key">
             <a-button style="padding:0" type="link" @click="nextPage(key)"> {{value}} </a-button>
          </a-breadcrumb-item>
        </a-breadcrumb>
      </div>
    </page-list>
</template>

<script>
import { ACL_TYPE } from '@Storage/constants/index.js'
import { objectsModel } from '@Storage/views/bucket/utils/controller.js'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { sizestrWithUnit } from '@/utils/utils'

const validDirName = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入文件夹名称'))
  } else if (value.startsWith('/')) {
    callback(new Error('不能以 / 开头作为文件夹名称'))
  } else if (value.includes('//')) {
    callback(new Error('不允许文件夹名称里包含连续的//'))
  } else if (value === '..') {
    callback(new Error('不允许以 .. 作为文件夹名称'))
  } else {
    callback()
  }
}
export default {
  name: 'BucketStorageObjectList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    data: {
      type: Object,
    },
  },
  data () {
    return {
      paths: [],
      prefix: '',
      nextFetchListLoading: false,
      list: this.$list.createList(this, {
        resource: 'objects',
        getParams: this.getParams,
        ctx: [['buckets', this.data.id]],
        idKey: 'key',
        filterOptions: {
          prefix: {
            label: '文件名称',
            formatter: val => {
              return `${this.prefix}${val}`
            },
          },
        },
      }),
      columns: [
        {
          field: 'name',
          title: '文件名称',
          minWidth: 120,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }) => {
              const { key } = row
              if (this.nextFetchListLoading && this.prefix === key) {
                return [<a-icon type="loading" />]
              }
              const rkey = key.replace(this.prefix, '')
              if (this.isDir(key)) {
                return [
                  <div class="d-flex align-items-center">
                    <a-icon type="folder" theme="filled" style="color: rgb(245,200, 61)" />
                    <a class="text-truncate" style="margin-right: 3px" onClick={() => this.nextPage(key)}>{ rkey }</a>
                    <copy message={rkey} />
                  </div>,
                ]
              }
              return [
                <div class="d-flex align-items-center">
                  <a-icon theme="filled" type="file" />
                  <span class="text-truncate">
                    {rkey}
                  </span>
                  <copy message={rkey} />
                </div>,
              ]
            },
          },
        },
        {
          field: 'acl',
          title: '读写权限',
          width: 120,
          formatter: ({ row }) => {
            return ACL_TYPE[row.acl] || row.acl || '-'
          },
        },
        {
          field: 'size_bytes',
          title: '大小',
          minWidth: 100,
          formatter: ({ row }) => {
            return row.size_bytes ? sizestrWithUnit(row.size_bytes, 'B', 1024) : '-'
          },
        },
        {
          field: 'storage_class',
          title: '存储类型',
          width: 120,
          formatter: ({ row }) => {
            return row.storage_class || '-'
          },
        },
        {
          field: 'last_modified',
          title: '更新时间',
          width: 100,
          formatter: ({ row }) => {
            return row.last_modified ? this.$moment(row.last_modified).fromNow() : '-'
          },
        },
      ],
      groupActions: [
        {
          label: '上传文件',
          action: () => {
            this.createDialog('ObjectsUploadFileDialog', {
              title: '上传文件',
              list: this.list,
              resId: this.data.id,
              resItem: this.data,
              resName: this.resName,
              prefix: this.prefix,
            })
          },
          meta: () => {
            const isValidate = !(this.data.brand === 'Azure' && !this.prefix)
            return {
              buttonType: 'primary',
              validate: isValidate,
              tooltip: !isValidate && 'Azure平台根目录不允许上传文件',
            }
          },
        },
        {
          label: '新建文件夹',
          action: (row) => {
            this.createDialog('SmartFormDialog', {
              title: '新建文件夹',
              data: [row],
              list: this.list,
              width: 600,
              callback: async (data) => {
                const manager = new this.$Manager(`buckets/${this.resName}/makedir`, 'v2')
                data['key'] = `${this.prefix}${data.key}/`
                await manager.create({ data })
                this.list.fetchData()
              },
              decorators: {
                key: ['key', {
                  rules: [
                    { required: true, message: '请输入文件夹名称' },
                    { type: 'string', min: 1, max: 254, message: '1~254 个字符，可用数字、中英文和常见字符的组合', trigger: 'blur' },
                    { validator: validDirName, trigger: 'blur' },
                  ],
                },
                {
                  label: '文件夹名称',
                  placeholder: '请输入文件名称',
                  extra: () => {
                    return <div>
                        1. 请使用符合要求的 UTF-8 字符，可用数字、中英文和可见字符的组合 <br />
                        2. 用 / 分割路径，可快速创建子目录，但不要以 / 打头，不要出现连续的 / <br />
                        3. 不允许以 .. 作为文件夹名称 <br />
                        4.总长度控制在 1-254 个字符
                    </div>
                  },
                },
                ],
              },
            })
          },
        },
        {
          label: '批量操作',
          actions: (row) => {
            return [
              {
                label: '设置HTTP头',
                action: async (row) => {
                  this.createDialog('ObjectsUpdateHttpDialog', {
                    title: '设置HTTP头',
                    data: this.list.selectedItems,
                    resName: this.resName,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: row => {
                  return {
                    validate: this.list.selectedItems.every(row => !this.isDir(row.key)),
                  }
                },
              },
              {
                label: '设置读写权限',
                action: () => {
                  this.createDialog('ObjectsUpdateAclDialog', {
                    title: '设置读写权限',
                    data: this.list.selectedItems,
                    resName: this.resName,
                    columns: this.columns,
                    list: this.list,
                    refresh: this.refresh,
                  })
                },
                meta: row => {
                  return {
                    validate: this.list.selectedItems.every(row => !this.isDir(row.key)),
                  }
                },
              },
              {
                label: '删除',
                action: (row) => {
                  this.createDialog('ObjectsDeleteDialog', {
                    alert: '提示：删除操作会同时删除目录下所有文件，删除后数据不可恢复和访问。',
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除',
                    resName: this.resName,
                    list: this.list,
                    name: '文件',
                  })
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: !!this.list.selectedItems.length,
            }
          },
        },
      ],
      singleActions: [
        {
          label: '下载',
          action: (row) => {
            objectsModel.getUrl(row, this.data.name, this.accessUrl).then((url) => {
              url && window.open(url)
            })
          },
          meta: row => {
            return {
              validate: !this.isDir(row.key),
            }
          },
        },
        {
          label: '更多',
          actions: () => {
            return [
              {
                label: '生成临时URL',
                action: async (row) => {
                  // await curl = controller.getUrl(row, this.data.name)
                  this.createDialog('ObjectsCreateUrlDialog', {
                    title: '生成URL',
                    data: [row],
                    resName: this.resName,
                    accessUrl: this.accessUrl,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: row => {
                  return {
                    validate: !this.isDir(row.key),
                  }
                },
              },
              {
                label: '设置读写权限',
                action: async (row) => {
                  this.createDialog('ObjectsUpdateAclDialog', {
                    title: '设置读写权限',
                    data: [row],
                    resName: this.resName,
                    columns: this.columns,
                    list: this.list,
                    refresh: this.refresh,
                  })
                },
                meta: row => {
                  return {
                    validate: !this.isDir(row.key),
                  }
                },
              },
              {
                label: '设置HTTP头',
                action: async (row) => {
                  this.createDialog('ObjectsUpdateHttpDialog', {
                    title: '设置HTTP头',
                    data: [row],
                    resName: this.resName,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: row => {
                  return {
                    validate: !this.isDir(row.key),
                  }
                },
              },
              {
                label: '删除',
                action: (row) => {
                  this.createDialog('ObjectsDeleteDialog', {
                    alert: '提示：删除操作会同时删除目录下所有文件，删除后数据不可恢复和访问。',
                    data: [row],
                    columns: this.columns,
                    title: '删除',
                    resName: this.resName,
                    list: this.list,
                    name: this.isDir(row.key) ? '文件夹' : '文件',
                  })
                },
              },
            ]
          },
          // meta: row => {
          //   return {
          //     validate: !this.isDir(row.key),
          //   }
          // },
        },
      ],
    }
  },
  computed: {
    resName () {
      return this.data.name
    },
    accessUrl () {
      if (this.data.access_urls && this.data.access_urls.length > 0) {
        const accessUrls = this.data.access_urls
        for (let i = 0; i < accessUrls.length; i++) {
          if (accessUrls[i]['primary']) {
            return accessUrls[i]['url']
          }
        }
        return accessUrls[0].url
      }
      return ''
    },
    breadcrumbs () {
      const _ = {}
      if (this.prefix) {
        const paths = this.prefix.split('/')
        if (paths && paths.length > 0) {
          paths.forEach((path, index) => {
            if (path === '') return false
            const k = paths.slice(0, index + 1).join('/')
            _[k + '/'] = path
          })
        }
      }
      return _
    },
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('detail')
  },
  methods: {
    isDir (key) {
      return key.endsWith('/')
    },
    async nextPage (key, index) {
      // 表示根目录，根目录不需要prefix
      this.prefix = key
      this.nextFetchListLoading = true
      await this.list.reset()
      await this.list.fetchData()
      this.nextFetchListLoading = false
    },
    getParams () {
      const _ = {}
      if (this.prefix) {
        _['prefix'] = this.prefix
      }
      return _
    },
  },
}
</script>
