<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions">
    <div slot="table-prepend" class="d-flex align-items-center pt-2 pb-2">
      <span><a-icon type="folder-open" theme="filled" style="color: rgb(245,200, 61);font-size:15px" />{{$t('storage.text_150')}}</span>
      <a-breadcrumb>
        <a-breadcrumb-item>
          <a-button style="padding:0" type="link" @click="nextPage('')">{{data.name}}</a-button>
        </a-breadcrumb-item>
        <a-breadcrumb-item v-for="(value, key) in breadcrumbs" :key="key">
          <a-button style="padding:0" type="link" @click="nextPage(key)">{{value}}</a-button>
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
    callback(new Error(this.$t('storage.text_151')))
  } else if (value.startsWith('/')) {
    callback(new Error(this.$t('storage.text_152')))
  } else if (value.includes('//')) {
    callback(new Error('不允许文件夹名称里包含连续的//'))
  } else if (value === '..') {
    callback(new Error(this.$t('storage.text_153')))
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
            label: this.$t('storage.text_154'),
            formatter: val => {
              return `${this.prefix}${val}`
            },
          },
        },
      }),
      columns: [
        {
          field: 'name',
          title: this.$t('storage.text_154'),
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
          title: this.$t('storage.text_93'),
          width: 120,
          formatter: ({ row }) => {
            return ACL_TYPE[row.acl] || row.acl || '-'
          },
        },
        {
          field: 'size_bytes',
          title: this.$t('storage.text_155'),
          minWidth: 100,
          formatter: ({ row }) => {
            return row.size_bytes ? sizestrWithUnit(row.size_bytes, 'B', 1024) : '-'
          },
        },
        {
          field: 'storage_class',
          title: this.$t('storage.text_38'),
          width: 120,
          formatter: ({ row }) => {
            return row.storage_class || '-'
          },
        },
        {
          field: 'last_modified',
          title: this.$t('storage.text_156'),
          width: 100,
          formatter: ({ row }) => {
            return row.last_modified ? this.$moment(row.last_modified).fromNow() : '-'
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('storage.text_157'),
          action: () => {
            this.createDialog('ObjectsUploadFileDialog', {
              title: this.$t('storage.text_157'),
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
              tooltip: !isValidate && this.$t('storage.text_158'),
            }
          },
        },
        {
          label: this.$t('storage.text_159'),
          action: (row) => {
            this.createDialog('SmartFormDialog', {
              title: this.$t('storage.text_159'),
              data: [row],
              list: this.list,
              width: 600,
              formItemLayout: {
                wrapperCol: {
                  span: 19,
                },
                labelCol: {
                  span: 5,
                },
              },
              callback: async (data) => {
                const manager = new this.$Manager(`buckets/${this.resName}/makedir`, 'v2')
                data.key = `${this.prefix}${data.key}/`
                await manager.create({ data })
                this.list.fetchData()
              },
              decorators: {
                key: ['key', {
                  rules: [
                    { required: true, message: this.$t('storage.text_151') },
                    { type: 'string', min: 1, max: 254, message: this.$t('storage.text_160'), trigger: 'blur' },
                    { validator: validDirName, trigger: 'blur' },
                  ],
                },
                {
                  label: this.$t('storage.text_161'),
                  placeholder: this.$t('storage.text_162'),
                  extra: () => {
                    return (
                      <div>
                        <div>{ this.$t('storage.text_173') }</div>
                        <div class='mt-1'>{ this.$t('storage.text_174') }</div>
                        <div class='mt-1'>{ this.$t('storage.text_175') }</div>
                        <div class='mt-1'>{ this.$t('storage.text_176') }</div>
                      </div>
                    )
                  },
                },
                ],
              },
            })
          },
        },
        {
          label: this.$t('storage.text_33'),
          actions: (row) => {
            return [
              {
                label: this.$t('storage.text_163'),
                action: async (row) => {
                  this.createDialog('ObjectsUpdateHttpDialog', {
                    title: this.$t('storage.text_163'),
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
                label: this.$t('storage.text_138'),
                action: () => {
                  this.createDialog('ObjectsUpdateAclDialog', {
                    title: this.$t('storage.text_138'),
                    bucket: this.data,
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
                label: this.$t('storage.text_36'),
                action: (row) => {
                  this.createDialog('ObjectsDeleteDialog', {
                    alert: this.$t('storage.text_164'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('storage.text_36'),
                    resName: this.resName,
                    list: this.list,
                    name: this.$t('storage.text_112'),
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
          label: this.$t('storage.text_165'),
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
          label: this.$t('storage.text_65'),
          actions: () => {
            return [
              {
                label: this.$t('storage.text_166'),
                action: async (row) => {
                  // await curl = controller.getUrl(row, this.data.name)
                  this.createDialog('ObjectsCreateUrlDialog', {
                    title: this.$t('storage.text_167'),
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
                label: this.$t('storage.text_138'),
                action: async (row) => {
                  this.createDialog('ObjectsUpdateAclDialog', {
                    title: this.$t('storage.text_138'),
                    data: [row],
                    bucket: this.data,
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
                label: this.$t('storage.text_163'),
                action: async (row) => {
                  this.createDialog('ObjectsUpdateHttpDialog', {
                    title: this.$t('storage.text_163'),
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
                label: this.$t('storage.text_36'),
                action: (row) => {
                  this.createDialog('ObjectsDeleteDialog', {
                    alert: this.$t('storage.text_164'),
                    data: [row],
                    columns: this.columns,
                    title: this.$t('storage.text_36'),
                    resName: this.resName,
                    list: this.list,
                    name: this.isDir(row.key) ? this.$t('storage.text_168') : this.$t('storage.text_112'),
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
          if (accessUrls[i].primary) {
            return accessUrls[i].url
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
        _.prefix = this.prefix
      }
      return _
    },
  },
}
</script>
