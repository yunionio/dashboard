<template>
  <div>
    <a-tabs hideAdd v-model="active" type="editable-card" @edit="onEdit" @change="handleTabChange" class="spec-container-tabs">
      <a-tab-pane v-for="(pane, i) in panes" :key="pane.key" :closable="panes.length > 1" :forceRender="true">
        <template v-slot:tab>
          <a-badge :dot="showBadge(pane)" :offset="[(panes.length > 1 ? 24 : 10), -5]">
            <span>{{$t('compute.container', [i+1])}}</span>
          </a-badge>
        </template>
        <spec-container-form
          :ref="`form_${pane.key}`"
          :decorators="getDecorators(pane.key)"
          :cluster="cluster"
          :namespace="namespace"
          :form="form"
          :paneKey="pane.key"
          :initItem="initContainers[i] || null" />
      </a-tab-pane>
      <a-tab-pane key="add-tab" class="add-container-tab" :closable="false">
        <template v-slot:tab>
          <a-button type="dashed" size="small" @click.stop="add" icon="plus">{{$t('compute.add_container')}}</a-button>
      </template>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'
import SpecContainerForm from './Form'

export default {
  name: 'SpecContainers',
  components: {
    SpecContainerForm,
  },
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    cluster: String,
    namespace: String,
    form: {
      type: Object,
      validator: v => v.fc,
    },
    errPanes: {
      type: Array,
      default: () => [],
    },
    /** 修改工单反填：pod.containers */
    initContainers: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    const initCount = Math.max((this.initContainers && this.initContainers.length) || 0, 1)
    const panes = Array.from({ length: initCount }, () => ({ key: uuid() }))
    return {
      active: panes[0].key,
      panes,
    }
  },
  watch: {
    initContainers: {
      deep: true,
      handler (val) {
        if (!val || !val.length) return
        this.ensurePaneCount(val.length)
      },
    },
  },
  created () {
    this.syncPanes()
  },
  methods: {
    syncPanes () {
      this.$emit('update:panes', this.panes)
    },
    showBadge (pane) {
      return this.errPanes.includes(pane.key)
    },
    ensurePaneCount (count) {
      const n = Math.max(count || 0, 1)
      while (this.panes.length < n) {
        this.panes.push({ key: uuid() })
      }
      if (this.panes.length > n) {
        this.panes = this.panes.slice(0, n)
      }
      this.active = this.panes[0].key
      this.syncPanes()
    },
    add () {
      const key = uuid()
      this.panes.push({
        key,
      })
      this.active = key
      this.syncPanes()
    },
    fillContainers (containers = []) {
      this.ensurePaneCount(containers.length)
      this.$nextTick(() => {
        this.panes.forEach((pane, i) => {
          const item = containers[i]
          if (!item) return
          const formRef = this.$refs[`form_${pane.key}`]
          const formComp = Array.isArray(formRef) ? formRef[0] : formRef
          if (formComp && formComp.applyInitData) {
            formComp.initApplied = false
            formComp.applyInitData(item)
          }
        })
      })
      return this.panes.map(p => p.key)
    },
    initFromContainers (containers = []) {
      return this.fillContainers(containers)
    },
    onEdit (targetKey, action) {
      if (action === 'remove') {
        const index = this.panes.findIndex(val => val.key === targetKey)
        this.panes.splice(index, 1)
        if (this.active === targetKey) {
          this.active = this.panes[0].key
        }
        this.syncPanes()
      }
    },
    handleTabChange (key) {
      if (key === 'add-tab') {
        this.add()
      }
    },
    getDecorators (k) {
      const ret = {}
      R.forEachObjIndexed((item, key) => {
        if (R.is(Function, item)) {
          ret[key] = item(k)
        }
      }, this.decorators)
      return ret
    },
  },
}
</script>

<style lang="less" scoped>
.spec-container-tabs :deep(.ant-tabs-tab:last-child) {
  background: transparent !important;
  border: none !important;
}

.spec-container-tabs :deep(.ant-tabs-tab:last-child:hover) {
  background: transparent !important;
}

.spec-container-tabs :deep(.ant-tabs-tab:last-child.ant-tabs-tab-active) {
  background: transparent !important;
  border: none !important;
}
</style>
