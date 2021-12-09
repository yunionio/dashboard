<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body" style="height:400px;overflow-y:auto">
      <template v-if="!transferLoading">
        <a-form v-bind="formItemLayout">
          <template v-for="(item,index) in keysList">
            <a-form-item :key="index" :label="`${$t('common_743')}${index+1}`">
              <div class="d-flex">
                <div class="flex-fill">
                  <base-select
                  v-model="keysList[index]"
                  id-key="key"
                  name-key="label"
                  @change="v => change(v, index)"
                  :options="resourceDataList"
                  :select-props="{ allowClear: true, placeholder: $t('common_742') }"
                  :disabledItems="disabledList[index]" />
                </div>
                <a-button v-if="index>0" style="flex: 0 0 24px;margin-left: 20px;transform:translateY(8px)" shape="circle" icon="minus" size="small" @click="deleteKey(index)" />
                <div v-else style="flex: 0 0 24px;margin-left: 20px;" />
              </div>
            </a-form-item>
          </template>
        </a-form>
        <!-- 添加 -->
        <div class="d-flex align-items-center">
          <a-button type="primary" shape="circle" icon="plus" size="small" @click="addKey" />
          <a-button type="link" @click="addKey">{{$t('common_741')}}</a-button>
        </div>
      </template>
      <div v-else class="loading"><a-spin :spinning="transferLoading" /></div>
    </div>
    <div slot="footer">
      <a-button v-bind="okButtonProps" @click="handleConfirm">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { mapActions, mapState } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'TreeConfigDialog',
  components: { },
  mixins: [DialogMixin, WindowsMixin],
  props: {},
  data () {
    return {
      loading: false,
      transferLoading: false,
      resourceDataList: [],
      keysList: [],
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      disabledList: [],
    }
  },
  computed: {
    ...mapState({
      projectTreeTags: state => state.projectTags.projectTreeTags,
    }),
    okButtonProps () {
      const defaultProps = {
        type: 'primary',
        loading: this.loading,
      }
      const { okButtonProps } = this.params
      if (okButtonProps && R.type(okButtonProps) === 'Object') {
        return Object.assign(defaultProps, okButtonProps)
      }
      return defaultProps
    },
    idKey () {
      return this.params.idKey || 'id'
    },
    defaultList () {
      return this.projectTreeTags || []
    },
  },
  created () {
    this.tM = new this.$Manager('projects', 'v1')
    this.pM = new this.$Manager('parameters', 'v1')
    this.initKeys()
  },
  methods: {
    ...mapActions({ updateProjectTreeTags: 'projectTags/updateProjectTreeTags' }),
    async handleConfirm () {
      this.loading = true
      try {
        const projectTreeTags = []
        this.keysList.map(item => {
          if (item) {
            projectTreeTags.push({
              key: item,
            })
          }
        })
        await this.updateProjectTreeTags(projectTreeTags)
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    async initKeys () {
      try {
        this.transferLoading = true
        const { data: tags } = await this.tM.get({
          id: 'tag-value-pairs',
          params: {
            limit: 0,
            scope: this.$store.getters.scope,
            with_user_meta: true,
            // resources: this.params.resources,
            key_only: true,
          },
        })
        this.resourceDataList = tags.map(item => {
          return {
            label: `${item.key.replace('user:', '')} (${item.count})`,
            count: item.count,
            key: item.key,
          }
        }).sort((a, b) => {
          return b.count - a.count
        })
        const defaultKeysList = this.projectTreeTags.map(item => {
          return item.key
        })
        this.keysList = defaultKeysList.length ? defaultKeysList : [undefined]
        this.updateDisabledItems()
        this.transferLoading = false
      } catch (err) {
        console.error(err)
        this.transferLoading = false
      }
    },
    change (val, index) {
      this.keysList[index] = val
      this.updateDisabledItems()
    },
    updateDisabledItems () {
      this.$nextTick(() => {
        this.disabledList = this.keysList.map(key => {
          const disabledItems = this.keysList.filter(item => {
            return item !== key
          })
          return disabledItems
        })
      })
    },
    addKey () {
      this.keysList = this.keysList.concat([undefined])
    },
    deleteKey (index) {
      this.keysList = this.keysList.filter((item, idx) => index !== idx)
    },
  },
}
</script>
<style lang="less" scoped>
.loading {
  display: flex;
  justify-content: center;
  padding-top: 30px;
}
</style>
