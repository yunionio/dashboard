<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">编辑标签</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="编辑标签" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <div class="tag-wrap">
        <a-divider orientation="left">
          <div class="font-weight-normal" style="font-size: 14px;">以下标签为公有云同步的标签，不可更改</div>
        </a-divider>
        <div class="tag-list">
          <template v-if="extTags.length <= 0">
            <loader no-data-text="暂无公有云标签" />
          </template>
          <template v-else>
            <template v-for="item of extTags">
              <span
                class="tag mb-1 text-truncate d-inline-block"
                :title="item.title"
                :key="`${item.key}${item.value}`"
                :style="{ backgroundColor: item.backgroundColor, color: item.color, borderColor: item.color }">
                {{ item.title }}
              </span>
            </template>
          </template>
        </div>
      </div>
      <div class="tag-wrap">
        <a-divider orientation="left">
          <div class="font-weight-normal" style="font-size: 14px;">以下标签为用户自定义标签</div>
        </a-divider>
        <div class="tag-list">
          <template v-if="userTags.length <= 0">
            <loader no-data-text="暂无用户标签" />
          </template>
          <template v-else>
            <template v-for="item of userTags">
              <span
                class="tag mb-1 text-truncate d-inline-block"
                :title="item.title"
                :key="`${item.key}${item.value}`"
                :style="{ backgroundColor: item.backgroundColor, color: item.color, borderColor: item.color }">
                {{ item.title }}<a-icon class="ml-1 remove-tag" type="close" @click="removeTag(item)" />
              </span>
            </template>
          </template>
        </div>
        <div class="text-color-help mt-2">注: 每个资源最多可绑定 20个标签</div>
      </div>
      <div class="mt-2 d-flex">
        <div style="line-height: 40px;">
          <tag-select
            button-text="已有标签"
            resource="server"
            v-model="checked" />
          <a-button class="ml-2" v-if="!showForm" @click="() => showForm = true">新建标签</a-button>
        </div>
        <a-form
          class="ml-2"
          layout="inline"
          :form="form.fc"
          v-if="showForm">
          <a-form-item>
            <a-input v-decorator="decorators.key" placeholder="标签键" />
          </a-form-item>
          <a-form-item>
            <a-input v-decorator="decorators.value" placeholder="标签值" />
          </a-form-item>
          <a-form-item>
            <a-button @click="addTag">添加</a-button>
            <a-button @click="() => showForm = false" class="ml-2">取消</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { filterUserTag, getTagColor, getTagTitle } from '@/utils/common/tag'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import TagSelect from '@/sections/TagSelect'

export default {
  name: 'SetTagDialog',
  components: {
    TagSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = filterUserTag({
      metadata: this.params.data[0].metadata,
      needExt: true,
    })
    let extTags = data.arr.filter(item => item.key.startsWith('ext:')).map(item => this.genTag(item))
    const checked = {}
    R.forEachObjIndexed((value, key) => {
      if (!key.startsWith('ext:')) {
        checked[key] = value
      }
    }, data.obj)
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        key: [
          'key',
          {
            rules: [
              { required: true, message: '请输入标签键' },
            ],
          },
        ],
        value: [
          'value',
        ],
      },
      extTags,
      checked,
      showForm: false,
    }
  },
  computed: {
    userTags () {
      let ret = []
      R.forEachObjIndexed((value, key) => {
        if (value.length > 0) {
          for (let i = 0, len = value.length; i < len; i++) {
            ret.push(this.genTag({ key, value: value[i] }))
          }
        } else {
          ret.push(this.genTag({ key, value: null }))
        }
      }, this.checked)
      return ret
    },
  },
  methods: {
    async addTag () {
      try {
        const values = await this.form.fc.validateFields()
        const key = `user:${values.key}`
        const newValue = { ...this.checked }
        if (newValue[key]) {
          if (values.value) {
            if (!newValue[key].includes(values.value)) {
              newValue[key] = [values.value]
            }
          }
        } else {
          if (values.value) {
            newValue[key] = [values.value]
          } else {
            newValue[key] = []
          }
        }
        this.checked = newValue
        this.form.fc.resetFields()
      } catch (error) {
        throw error
      }
    },
    removeTag (item) {
      const newValue = { ...this.checked }
      delete newValue[item.key]
      this.checked = newValue
    },
    async handleConfirm () {
      this.loading = true
      try {
        const data = {}
        R.forEachObjIndexed((value, key) => {
          const _key = R.replace(/(ext:|user:)/, '', key)
          data[_key] = value[0] ? value[0] : null
        }, this.checked)
        const ids = this.params.data.map(item => item.id)
        await this.params.list.onManager('batchPerformAction', {
          id: ids,
          managerArgs: {
            action: 'set-user-metadata',
            data,
          },
        })
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    genTag (item) {
      const rgb = getTagColor(item.key, item.value, 'rgb')
      const strRgb = rgb.join(',')
      return {
        title: getTagTitle(item.key, item.value),
        color: `rgb(${strRgb})`,
        backgroundColor: `rgba(${strRgb},.1)`,
        ...item,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.tag {
  max-width: 100%;
  line-height: 20px;
  margin-right: 10px;
  padding: 0 6px 0 4px;
  font-size: 12px;
  border-style: solid;
  border-width: 1px;
}
.tag-list {
  min-height: 150px;
  border: 2px dashed #ddd;
  padding: 8px;
}
.remove-tag {
  font-size: 12px;
  cursor: pointer;
}
</style>
