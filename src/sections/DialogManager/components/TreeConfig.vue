<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body" style="height:400px">
      <draggable-transfer
        idKey="key"
        :loading="transferLoading"
        :dataList="resourceDataList"
        :defaultList="defaultList"
        :draggable="{right:true}"
        @change="handleSelectChange" />
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
      selectedTreeList: [],
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
        const projectTreeTags = this.selectedTreeList.map(item => {
          return {
            key: item.key,
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
        this.transferLoading = false
      } catch (err) {
        console.error(err)
        this.transferLoading = false
      }
    },
    handleSelectChange (val) {
      this.selectedTreeList = val
    },
  },
}
</script>
