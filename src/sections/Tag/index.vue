<template>
  <div>
    <div class="tag-list">
      <template v-for="item of tags">
        <span
          class="tag mb-1 d-inline-block"
          :title="item.title"
          :key="`${item.key}${item.value}`"
          :style="{ backgroundColor: item.backgroundColor, color: item.color, borderColor: item.color }">
          <div class="d-flex align-items-center">
            <span class="flex-fill text-truncate">{{ item.title }}</span>
            <a-icon class="ml-1 remove-tag flex-grow-0 flex-shrink-0" type="close" @click="removeTag(item)" />
          </div>
        </span>
      </template>
    </div>
    <a-form-item :extra="extra" class="mt-2">
      <div class="d-flex">
        <div style="line-height: 40px;">
          <tag-select
            :global="global"
            v-model="checked"
            :params="params"
            :managerInstance="managerInstance"
            :multiple="multiple"
            :button-text="$t('common_110')"
            :allowNoValue="allowNoValue" />
          <pre-defined-tag-select
            v-if="showPreDefinedTagSelect"
            :global="global"
            v-model="checked"
            :params="params"
            :managerInstance="managerInstance"
            :multiple="multiple"
            :allowNoValue="allowNoValue" />
          <a-button class="ml-2" v-if="!showForm && canCreate" @click="() => showForm = true">{{$t('common_258')}}</a-button>
        </div>
        <a-form
          class="ml-2"
          layout="inline"
          :form="tagForm.fc"
          v-if="showForm">
          <a-form-item>
            <a-input v-decorator="decorators.key" :placeholder="$t('common_112')" />
          </a-form-item>
          <a-form-item>
            <a-input v-decorator="decorators.value" :placeholder="$t('common_113')" />
          </a-form-item>
          <a-form-item>
            <a-button @click="addTag">{{$t('common_114')}}</a-button>
            <a-button @click="() => showForm = false" class="ml-2">{{$t('common_115')}}</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { getTagColor, getTagTitle } from '@/utils/common/tag'
import TagSelect from '@/sections/TagSelect'
import PreDefinedTagSelect from '@/sections/TagSelectPreDefined'
import { isCE } from '@/utils/utils'
import { hasPermission } from '@/utils/auth'
import i18n from '@/locales'

export default {
  name: 'Tag',
  components: {
    TagSelect,
    PreDefinedTagSelect,
  },
  props: {
    extra: {
      type: String,
      default: i18n.t('common_259'),
    },
    value: {
      type: Object,
      default () {
        return {}
      },
    },
    canCreate: {
      type: Boolean,
      default: true,
    },
    multiple: Boolean,
    params: {
      type: Object,
      default () {
        return {
          resources: 'server',
        }
      },
    },
    global: {
      type: Boolean,
      default: true,
    },
    managerInstance: Object,
    allowNoValue: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      checked: this.value,
      showForm: false,
      tagForm: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        key: [
          'key',
          {
            rules: [
              { required: true, whitespace: true, message: this.$t('common_116') },
            ],
          },
        ],
        value: [
          'value',
          {
            rules: [
              { required: true, whitespace: true, message: this.$t('common.tips.input', [this.$t('common_113')]) },
            ],
          },
        ],
      },
    }
  },
  computed: {
    showPreDefinedTagSelect () {
      return !isCE() && !this.$store.getters.isSysCE && hasPermission('tags_list')
    },
    tags () {
      const ret = []
      R.forEachObjIndexed((value, key) => {
        if (value.length > 0) {
          if (Array.isArray(value)) {
            for (let i = 0, len = value.length; i < len; i++) {
              ret.push(this.genTag(key, value[i]))
            }
          } else {
            ret.push(this.genTag(key, value))
          }
        } else {
          ret.push(this.genTag(key, null))
        }
      }, this.checked)
      return ret
    },
  },
  watch: {
    tags (val) {
      let ret
      if (val && val.length > 0) {
        ret = {}
        for (let i = 0, len = val.length; i < len; i++) {
          if (ret.hasOwnProperty(val[i].key)) {
            if (R.is(Array, ret[val[i].key])) {
              ret[val[i].key].push(val[i].value || '')
            } else {
              ret[val[i].key] = [ret[val[i].key], val[i].value || '']
            }
          } else {
            ret[val[i].key] = val[i].value || ''
          }
        }
      }
      this.$emit('change', ret)
      this.$emit('tagsChange', this.tags)
    },
  },
  methods: {
    async addTag () {
      try {
        const values = await this.tagForm.fc.validateFields()
        const key = `user:${values.key}`
        const newValue = { ...this.checked }
        if (newValue[key]) {
          if (values.value) {
            if (!newValue[key].includes(values.value)) {
              newValue[key] = this.multiple ? [...newValue[key], values.value] : [values.value]
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
        this.tagForm.fc.resetFields()
      } catch (error) {
        throw error
      }
    },
    genTag (key, value) {
      const rgb = getTagColor(key, value, 'rgb')
      const strRgb = rgb.join(',')
      return {
        title: getTagTitle(key, value),
        color: `rgb(${strRgb})`,
        backgroundColor: `rgba(${strRgb},.1)`,
        key,
        value,
      }
    },
    removeTag (item) {
      const newValue = { ...this.checked }
      if (R.is(Array, newValue[item.key])) {
        const value = newValue[item.key].filter(value => value !== item.value)
        if (value.length) {
          newValue[item.key] = value
        } else {
          delete newValue[item.key]
        }
      } else {
        delete newValue[item.key]
      }
      this.checked = newValue
    },
  },
}
</script>

<style lang="less" scoped>
.tag-list {
  min-height: 65px;
  border: 2px dashed #ddd;
  padding: 8px;
}
.tag {
  max-width: 100%;
  line-height: 20px;
  margin-right: 10px;
  padding: 0 6px 0 4px;
  font-size: 12px;
  border-style: solid;
  border-width: 1px;
}
</style>
