<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('iam.action_info')}}</div>
    <div slot="body" style="min-height:300px">
      <div>
        <a-checkbox
          class="mr-2"
          :checked="checkedAll"
          @change="handleCheckAllChange"
          :indeterminate="isIndeterminate"
          :disabled="params.resource.disabled || params.isViewer">{{$t('system.text_320')}}</a-checkbox>
      </div>
      <a-row class="mt-4">
          <template v-for="item of params.actions">
            <a-col
              v-if="item.label"
              :span="6"
              :key="item.action"
              class="mb-2 checkbox-item d-flex align-items-center">
              <a-checkbox :checked="checked.includes(item.action)" :value="item.action" :disabled="item.disabled || params.isViewer" class="text-truncate checkbox-property" @change="handleCheckChange">
                <span :title="item.label">{{ item.label }}</span>
              </a-checkbox>
            </a-col>
          </template>
      </a-row>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button v-if="!params.isViewer" @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'PolicyExtraActionConfig',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const initChecked = []
    this.params.actions.map(action => {
      if (this.params.checked.includes(action.action)) {
        initChecked.push(action.action)
      }
      // [create,list,get,delete,update]做联动
      // const actionTypes = action.action.split('_')
      // if (actionTypes[1] &&
      // actionTypes[1] === '*' &&
      // ['create', 'list', 'get', 'delete', 'update'].includes(actionTypes[0]) &&
      // this.params.resource &&
      // this.params.resource.checked &&
      // this.params.resource.checked.includes(actionTypes[0])) {
      //   initChecked.push(action.action)
      // }
    })
    return {
      checked: initChecked,
    }
  },
  computed: {
    checkedAll () {
      let ret = true
      this.params.actions.map(item => {
        if (!this.checked.includes(item.action)) {
          ret = false
        }
      })
      return ret
    },
    isIndeterminate () {
      return this.checked.length && this.checked.length < this.params.actions.length
    },
  },
  created () {
  },
  methods: {
    handleCheckAllChange () {
      if (this.checkedAll) {
        this.checked = []
      } else {
        this.checked = this.params.actions.map(action => action.action)
      }
    },
    handleCheckChange (e) {
      const { value, checked } = e.target
      if (checked && !this.checked.includes(value)) {
        this.checked = [...this.checked, value]
      } else if (!checked) {
        this.checked = this.checked.filter(action => action !== value)
      }
      // [create,list,get,delete,update]做联动
      const actionTypes = value.split('_')
      if (actionTypes[1] && actionTypes[1] === '*' && ['create', 'list', 'get', 'delete', 'update'].includes(actionTypes[0])) {
        this.params.extraChangeNormal(actionTypes[0], checked)
      }
    },
    async handleConfirm () {
      this.params.checkedChange && this.params.checkedChange(this.checked)
      this.cancelDialog()
    },
  },
}
</script>
