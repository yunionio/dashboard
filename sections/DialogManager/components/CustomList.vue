<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item>
          <a-divider orientation="left">{{$t('common.text00084')}}</a-divider>
          <a-checkbox
            :indeterminate="columnsIndeterminate"
            @change="handleColumnsCheckAllChange"
            :checked="columnsCheckAll">{{$t('common.checkAll')}}</a-checkbox>
          <a-checkbox-group v-decorator="decorators.columnsSelected" @change="handleColumnsSelectedChange" class="w-100">
            <a-row>
              <draggable
                handle=".drag-icon"
                ghost-class="ghost"
                v-model="columnFields">
                <transition-group type="transition" name="flip-list">
                  <template v-for="item of columnFields">
                    <a-col
                      :span="6"
                      :key="item.property"
                      class="mb-2 checkbox-item d-flex align-items-center">
                      <a-checkbox :value="item.property" :disabled="item.disabled" class="text-truncate checkbox-property">
                        <span :title="item.title">{{ item.title }}</span>
                      </a-checkbox>
                      <a-icon type="drag" class="drag-icon pr-3" @click="iconClick" />
                    </a-col>
                  </template>
                </transition-group>
              </draggable>
            </a-row>
          </a-checkbox-group>
        </a-form-item>
        <!-- 标签 -->
        <template v-if="showTags">
          <a-form-item>
            <a-divider orientation="left">{{$t('common.text00086')}}</a-divider>
            <a-checkbox-group v-decorator="decorators.tagsSelected" class="w-100">
              <div class="tag-fields-wrap">
                <a-row>
                  <a-col
                    v-for="item of tagFields"
                    :span="6"
                    :key="item.property"
                    class="mb-2 checkbox-item">
                    <a-checkbox :value="item.property"><span :title="item.title">{{ item.title }}</span></a-checkbox>
                  </a-col>
                </a-row>
              </div>
            </a-checkbox-group>
          </a-form-item>
        </template>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { getTagTitle, isUserTag } from '@/utils/common/tag'
import { arrToObjByKey } from '@/utils/utils'

export default {
  name: 'CustomListDialog',
  components: {
    draggable,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    // 普通的列
    const columnFields = this.params.customs.filter(item => {
      return item.type !== 'checkbox' && item.type !== 'radio' && item.property !== 'action' && !isUserTag(item.property) && !this.params.hidenColumns.includes(item.property)
    })
    const initialColumnsSelected = columnFields.filter(item => item.visible).map(item => item.property)
    // 标签列
    const tagFields = this.params.customs.filter(item => {
      return item.type !== 'checkbox' && item.type !== 'radio' && item.property !== 'action' && isUserTag(item.property)
    })
    const initialTagsSelected = tagFields.filter(item => {
      return this.params.config.showTagKeys.includes(item.property)
    }).map(item => item.property)
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        columnsSelected: [
          'columnsSelected',
          {
            initialValue: initialColumnsSelected,
            // rules: [
            //   { required: true, message: this.$t('common.text00087') },
            // ],
          },
        ],
        tagsSelected: [
          'tagsSelected',
          {
            initialValue: initialTagsSelected,
          },
        ],
      },
      columnFields,
      tagFields,
      columnsIndeterminate: initialColumnsSelected.length !== 0 && columnFields.length !== initialColumnsSelected.length,
      columnsCheckAll: columnFields.length === initialColumnsSelected.length,
    }
  },
  computed: {
    ...mapGetters(['scope']),
    tagParams () {
      const ret = {
        with_user_meta: true,
        limit: 0,
        scope: this.scope,
      }
      if (R.is(String, this.params.resource)) {
        ret.resources = this.params.resource.substr(0, this.params.resource.length - 1)
      } else {
        ret.resources = this.params.resource.resource.substr(0, this.params.resource.resource.length - 1)
      }
      return ret
    },
    showTags () {
      return this.params.showTagColumns && this.tagFields.length > 0
    },
  },
  created () {
    if (this.params.showTagColumns) {
      this.fetchTags()
    }
  },
  methods: {
    async fetchTags () {
      let manager = new this.$Manager('metadatas')
      try {
        const response = await manager.get({
          id: 'tag-value-pairs',
          params: this.tagParams,
        })
        const data = response.data.data || []
        // 将已显示的标签列进行合并
        let tags = data.map(item => item.key)
        R.forEach(item => {
          tags.push(item.property)
        }, this.tagFields)
        tags = R.uniq(tags)
        // 拼装数据
        tags = tags.map(item => {
          return {
            property: item,
            title: getTagTitle(item),
          }
        })
        this.tagFields = tags
      } catch (error) {
        throw error
      } finally {
        manager = null
      }
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((errors, values) => {
          if (errors) {
            reject(errors)
          } else {
            resolve(values)
          }
        })
      })
    },
    async handleConfirm () {
      try {
        const { columnsSelected = [], tagsSelected = [] } = await this.validateForm()
        this.loading = true
        const sortColumnsMap = arrToObjByKey(this.columnFields, 'property', (item, i) => i)
        const unSelect = this.columnFields.filter(item => !columnsSelected.includes(item.property)).map(item => item.property)
        const showTagKeys = this.tagFields.filter(item => tagsSelected.includes(item.property)).map(item => item.property)
        await this.params.update({
          ...this.params.config,
          hiddenColumns: unSelect,
          showTagKeys,
          sortColumnsMap,
        })
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    handleColumnsSelectedChange (val) {
      this.columnsIndeterminate = !!val.length && val.length < this.columnFields.length
      this.columnsCheckAll = val.length === this.columnFields.length
    },
    handleColumnsCheckAllChange (e) {
      this.form.fc.setFieldsValue({
        columnsSelected: e.target.checked ? this.columnFields.map(item => item.property) : [],
      })
      this.columnsCheckAll = e.target.checked
      this.columnsIndeterminate = false
    },
    iconClick (e) {
      e.preventDefault()
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../styles/less/theme.less';

.tag-fields-wrap {
  max-height: 100px;
  overflow: auto;
}
.checkbox-item {
  ::v-deep {
    .ant-checkbox-wrapper {
      display: flex;
      align-items: center;
      .ant-checkbox {
        margin-top: 3px;
        & + span {
          flex: 1;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
      }
    }
    .drag-icon {
      visibility: hidden;
    }
    .checkbox-property {
      padding-right: 15px;
    }
  }
  &:hover {
    ::v-deep {
      &.drag-icon {
        visibility: visible;
      }
    }
  }
}
.flip-list-move {
  transition: transform 0.5s;
}
.drag-icon {
  position: absolute;
  right: 0;
  cursor: move;
}
.ghost {
  opacity: 0.7;
  background: @primary-color;
  ::v-deep {
    label span {
      color: #fff;
    }
  }
}
</style>
