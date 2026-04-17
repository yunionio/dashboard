<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.llm_spec_update') }}</div>
    <div slot="body">
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <template v-if="isOpenclaw">
          <a-divider orientation="left" class="openclaw-section-divider">{{ $t('aice.openclaw.section.ai_providers') }}</a-divider>
          <a-form-item :label="$t('aice.openclaw.provider_filter')" :extra="$t('aice.openclaw.provider_select_tip')">
            <a-select
              v-model="openclawSelectedProviders"
              mode="multiple"
              :placeholder="$t('aice.openclaw.provider_filter_placeholder')"
              allow-clear
              show-search
              :filter-option="filterProviderOption"
              style="width: 100%; max-width: 400px;">
              <a-select-option v-for="opt in providerOptionsForSelect" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-tabs
            v-if="providerTabList.length > 0"
            :activeKey="openclawProviderActiveKey"
            type="card"
            class="openclaw-provider-tabs"
            :animated="false"
            @change="openclawProviderActiveTab = $event">
            <a-tab-pane
              v-for="item in providerTabList"
              :key="item.key"
              :forceRender="true">
              <span slot="tab" class="openclaw-tab-with-close">
                {{ $t(item.labelKey) }}{{ item.required ? ' *' : '' }}
                <a-icon type="close" class="openclaw-tab-close" @click.prevent.stop="closeProviderTab(item.key)" />
              </span>

              <a-form-item :label="$t('aice.openclaw.credential_mode.label')">
                <a-radio-group
                  :value="openclawProviderCredentialMode[item.key] || 'new'"
                  @change="e => $set(openclawProviderCredentialMode, item.key, e.target.value)">
                  <a-radio value="new">{{ $t('aice.openclaw.credential_mode.new') }}</a-radio>
                  <a-radio value="existing">{{ $t('aice.openclaw.credential_mode.existing') }}</a-radio>
                </a-radio-group>
              </a-form-item>

              <template v-if="(openclawProviderCredentialMode[item.key] || 'new') === 'existing'">
                <a-form-item :label="$t('aice.container_secret')">
                  <base-select
                    ref="credentialSelects"
                    :ref-in-for="true"
                    v-model="openclawProviderCredentialId[item.key]"
                    resource="credentials"
                    :params="credentialParamsForProvider(item.key)"
                    :label-format="credentialLabelFormat"
                    :extra-opts="credentialExtraOpts(openclawProviderCredentialId[item.key])"
                    :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.container_secret')]), optionLabelProp: 'label' }"
                    @change="val => onProviderCredentialChange(item.key, val)" />
                </a-form-item>
                <a-form-item :label="$t('aice.container_secret.export_keys')" :extra="$t('aice.container_secret.export_keys_tip')">
                  <a-checkbox-group
                    :value="openclawProviderExportKeys[item.key] || []"
                    @change="val => $set(openclawProviderExportKeys, item.key, val)">
                    <a-checkbox v-for="k in (openclawProviderBlobKeys[item.key] || [])" :key="k" :value="k">{{ k }}</a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
              </template>

              <template v-else>
                <div class="openclaw-auto-credential-name text-color-secondary mb-2">
                  {{ $t('aice.openclaw.new_credential_name') }}：{{ genCredentialName({ llmName: instanceName, usage: 'provider', key: providerShortName(item.key) }) }}
                </div>
                <div class="openclaw-new-blob-section">
                  <div v-for="v in item.vars" :key="v.envKey" class="openclaw-new-blob-row mb-2">
                    <a-form-item
                      :label="v.envKey"
                      :required="item.required || v.required"
                      :extra="((item.required || v.required) ? $t('aice.openclaw.required_hint') + ' ' : '') + ($te(v.descriptionKey) ? $t(v.descriptionKey) : '')">
                      <a-input-password
                        v-if="isSecretEnvKey(v.envKey)"
                        :value="(openclawProviderBlob[item.key] || {})[v.envKey]"
                        :placeholder="v.envKey"
                        allow-clear
                        @change="e => $set(openclawProviderBlob[item.key], v.envKey, e.target.value)" />
                      <div
                        v-else-if="v.component === 'a-select'"
                        class="d-flex align-items-center openclaw-primary-model-select-row">
                        <a-select
                          class="flex-grow-1"
                          style="min-width: 0"
                          :value="(openclawProviderBlob[item.key] || {})[v.envKey] || undefined"
                          :placeholder="openclawProviderAselectPlaceholder(v)"
                          allow-clear
                          show-search
                          :filter-option="false"
                          :loading="openclawPrimaryModelLoading"
                          @dropdownVisibleChange="open => onOpenclawPrimaryModelDropdown(open, v, item.key)"
                          @search="q => onOpenclawPrimaryModelSearch(q, v, item.key)"
                          @change="val => $set(openclawProviderBlob[item.key], v.envKey, val)">
                          <a-select-option
                            v-for="opt in openclawPrimaryModelOptions"
                            :key="String(opt.value)"
                            :value="opt.value">
                            {{ opt.label }}
                          </a-select-option>
                        </a-select>
                        <a-icon
                          type="sync"
                          class="ml-2 primary-color flex-shrink-0"
                          :spin="openclawPrimaryModelLoading"
                          @click="refreshOpenclawPrimaryModel(v, item.key)" />
                      </div>
                      <a-input
                        v-else
                        :value="(openclawProviderBlob[item.key] || {})[v.envKey]"
                        :placeholder="v.envKey"
                        allow-clear
                        @change="e => $set(openclawProviderBlob[item.key], v.envKey, e.target.value)" />
                    </a-form-item>
                    <a-form-item
                      v-if="v.overrideUrlKey"
                      :label="v.overrideUrlKey"
                      :extra="($te('aice.openclaw.env.' + v.overrideUrlKey) ? $t('aice.openclaw.env.' + v.overrideUrlKey) : '') + ' ' + $t('aice.openclaw.override_url_optional')"
                      class="openclaw-override-url mt-1">
                      <a-input
                        :value="(openclawProviderBlob[item.key] || {})[v.overrideUrlKey]"
                        :placeholder="overrideUrlPlaceholder(v.overrideUrlKey)"
                        allow-clear
                        @change="e => $set(openclawProviderBlob[item.key], v.overrideUrlKey, e.target.value)" />
                    </a-form-item>
                  </div>
                </div>
              </template>
            </a-tab-pane>
          </a-tabs>
          <div v-else class="openclaw-filter-empty text-color-secondary">
            {{ openclawSelectedProviders.length === 0 ? $t('aice.openclaw.provider_select_first') : $t('aice.openclaw.provider_filter_empty') }}
          </div>

          <a-divider orientation="left" class="openclaw-section-divider">{{ $t('aice.openclaw.section.chat_channels') }}</a-divider>
          <a-form-item :label="$t('aice.openclaw.channels')" :extra="$t('aice.openclaw.channels_extra')">
            <a-select
              v-decorator="decorators.openclaw_channels"
              mode="multiple"
              :placeholder="$t('aice.openclaw.channel_select_placeholder')"
              allow-clear
              show-search
              :filter-option="filterChannelOption"
              style="width: 100%; max-width: 400px;">
              <a-select-option v-for="opt in channelOptionsForSelect" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <template v-if="filteredChannelSections.length > 0">
            <div class="openclaw-channel-config-hint text-color-secondary mb-2">
              {{ $t('aice.openclaw.channel_config_hint') }}
            </div>
            <a-tabs
              :activeKey="openclawChannelActiveTab || (filteredChannelSections[0] && filteredChannelSections[0].sectionKey)"
              class="openclaw-channel-tabs"
              :animated="false"
              @change="openclawChannelActiveTab = $event">
              <a-tab-pane
                v-for="section in filteredChannelSections"
                :key="section.sectionKey"
                :forceRender="true">
                <span slot="tab" class="openclaw-tab-with-close">
                  {{ $t(section.sectionLabelKey) }}
                  <a-icon type="close" class="openclaw-tab-close" @click.prevent.stop="closeChannelTab(section.sectionKey)" />
                </span>
                <a-form-item :label="$t('aice.openclaw.credential_mode.label')">
                  <a-radio-group
                    :value="openclawChannelCredentialMode[section.sectionKey] || 'new'"
                    @change="e => $set(openclawChannelCredentialMode, section.sectionKey, e.target.value)">
                    <a-radio value="new">{{ $t('aice.openclaw.credential_mode.new') }}</a-radio>
                    <a-radio value="existing">{{ $t('aice.openclaw.credential_mode.existing') }}</a-radio>
                  </a-radio-group>
                </a-form-item>
                <template v-if="(openclawChannelCredentialMode[section.sectionKey] || 'new') === 'existing'">
                  <a-form-item :label="$t('aice.container_secret')">
                    <base-select
                      ref="credentialSelects"
                      :ref-in-for="true"
                      v-model="openclawChannelCredentialId[section.sectionKey]"
                      resource="credentials"
                      :params="credentialParamsForChannel(section.sectionKey)"
                      :label-format="credentialLabelFormat"
                      :extra-opts="credentialExtraOpts(openclawChannelCredentialId[section.sectionKey])"
                      :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.container_secret')]), optionLabelProp: 'label' }"
                      @change="val => onChannelCredentialChange(section.sectionKey, val)" />
                  </a-form-item>
                  <a-form-item :label="$t('aice.container_secret.export_keys')" :extra="$t('aice.container_secret.export_keys_tip')">
                    <a-checkbox-group
                      :value="openclawChannelExportKeys[section.sectionKey] || []"
                      @change="val => $set(openclawChannelExportKeys, section.sectionKey, val)">
                      <a-checkbox
                        v-for="k in sectionBasicEnvKeys(section, openclawChannelBlobKeys[section.sectionKey] || [])"
                        :key="k"
                        :value="k">{{ k }}</a-checkbox>
                      <a-collapse :bordered="false" v-if="sectionAdvancedEnvKeys(section, openclawChannelBlobKeys[section.sectionKey] || []).length">
                        <a-collapse-panel :header="$t('common.adv_config')" key="advanced">
                          <a-checkbox
                            v-for="k in sectionAdvancedEnvKeys(section, openclawChannelBlobKeys[section.sectionKey] || [])"
                            :key="k"
                            :value="k">{{ k }}</a-checkbox>
                        </a-collapse-panel>
                      </a-collapse>
                    </a-checkbox-group>
                  </a-form-item>
                </template>
                <template v-else>
                  <div class="openclaw-auto-credential-name text-color-secondary mb-2">
                    {{ $t('aice.openclaw.new_credential_name') }}：{{ genCredentialName({ llmName: instanceName, usage: 'channel', key: section.sectionKey }) }}
                  </div>
                  <div class="openclaw-new-blob-section">
                    <div v-for="v in channelBasicVars(section.vars)" :key="v.envKey" class="openclaw-new-blob-row mb-2">
                      <a-form-item
                        :label="v.envKey"
                        :required="v.required"
                        :extra="($te(v.descriptionKey) ? $t(v.descriptionKey) : '') + ' ' + (v.required ? $t('aice.openclaw.required_hint') : $t('aice.openclaw.channel_var_optional'))">
                        <template v-if="v.envKey === 'FEISHU_DOMAIN'">
                          <a-radio-group
                            :value="((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue"
                            @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.value)">
                            <a-radio value="feishu">feishu</a-radio>
                            <a-radio value="lark">lark</a-radio>
                          </a-radio-group>
                        </template>
                        <template v-else-if="['FEISHU_DM_POLICY', 'DISCORD_DM_POLICY', 'TELEGRAM_DM_POLICY'].includes(v.envKey)">
                          <a-checkbox
                            :checked="(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue) === 'open'"
                            @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'open' : v.defaultValue)">
                            open
                          </a-checkbox>
                          <a-checkbox
                            :checked="(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue) === 'pairing'"
                            @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'pairing' : v.defaultValue)">
                            pairing
                          </a-checkbox>
                          <a-checkbox
                            :checked="(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue) === 'allowlist'"
                            @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'allowlist' : v.defaultValue)">
                            allowlist
                          </a-checkbox>
                          <a-checkbox
                            :checked="(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue) === 'disabled'"
                            @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'disabled' : v.defaultValue)">
                            disabled
                          </a-checkbox>
                        </template>
                        <template v-else-if="['FEISHU_GROUP_POLICY', 'DISCORD_GROUP_POLICY', 'TELEGRAM_GROUP_POLICY'].includes(v.envKey)">
                          <a-checkbox
                            :checked="String(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || '') === 'open'"
                            @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'open' : '')">
                            open
                          </a-checkbox>
                          <a-checkbox
                            :checked="String(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || '') === 'allowlist'"
                            @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'allowlist' : '')">
                            allowlist
                          </a-checkbox>
                          <a-checkbox
                            :checked="String(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || '') === 'disabled'"
                            @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'disabled' : '')">
                            disabled
                          </a-checkbox>
                        </template>
                        <template v-else-if="v.envKey === 'FEISHU_TYPING_INDICATOR'">
                          <a-checkbox
                            :checked="String(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue) === 'true'"
                            @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'true' : 'false')" />
                        </template>
                        <template v-else-if="v.envKey === 'FEISHU_RESOLVE_SENDER_NAMES'">
                          <a-checkbox
                            :checked="String(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue) === 'true'"
                            @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'true' : 'false')" />
                        </template>
                        <template v-else>
                          <a-input-password
                            v-if="isSecretEnvKey(v.envKey)"
                            :value="(openclawChannelBlob[section.sectionKey] || {})[v.envKey]"
                            :placeholder="v.defaultValue || v.envKey"
                            allow-clear
                            @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.value)" />
                          <a-input
                            v-else
                            :value="(openclawChannelBlob[section.sectionKey] || {})[v.envKey]"
                            :placeholder="v.defaultValue || v.envKey"
                            allow-clear
                            @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.value)" />
                        </template>
                      </a-form-item>
                    </div>
                    <a-collapse :bordered="false" v-if="channelAdvancedVars(section.vars).length">
                      <a-collapse-panel :header="$t('common.adv_config')" key="advanced">
                        <div v-for="v in channelAdvancedVars(section.vars)" :key="v.envKey" class="openclaw-new-blob-row mb-2">
                          <a-form-item
                            :label="v.envKey"
                            :required="v.required"
                            :extra="($te(v.descriptionKey) ? $t(v.descriptionKey) : '') + ' ' + (v.required ? $t('aice.openclaw.required_hint') : $t('aice.openclaw.channel_var_optional'))">
                            <template v-if="v.envKey === 'FEISHU_DOMAIN'">
                              <a-radio-group
                                :value="((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue"
                                @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.value)">
                                <a-radio value="feishu">feishu</a-radio>
                                <a-radio value="lark">lark</a-radio>
                              </a-radio-group>
                            </template>
                            <template v-else-if="['FEISHU_DM_POLICY', 'DISCORD_DM_POLICY', 'TELEGRAM_DM_POLICY'].includes(v.envKey)">
                              <a-checkbox
                                :checked="(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue) === 'open'"
                                @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'open' : v.defaultValue)">
                                open
                              </a-checkbox>
                              <a-checkbox
                                :checked="(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue) === 'pairing'"
                                @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'pairing' : v.defaultValue)">
                                pairing
                              </a-checkbox>
                              <a-checkbox
                                :checked="(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue) === 'allowlist'"
                                @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'allowlist' : v.defaultValue)">
                                allowlist
                              </a-checkbox>
                              <a-checkbox
                                :checked="(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue) === 'disabled'"
                                @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'disabled' : v.defaultValue)">
                                disabled
                              </a-checkbox>
                            </template>
                            <template v-else-if="['FEISHU_GROUP_POLICY', 'DISCORD_GROUP_POLICY', 'TELEGRAM_GROUP_POLICY'].includes(v.envKey)">
                              <a-checkbox
                                :checked="String(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || '') === 'open'"
                                @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'open' : '')">
                                open
                              </a-checkbox>
                              <a-checkbox
                                :checked="String(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || '') === 'allowlist'"
                                @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'allowlist' : '')">
                                allowlist
                              </a-checkbox>
                              <a-checkbox
                                :checked="String(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || '') === 'disabled'"
                                @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'disabled' : '')">
                                disabled
                              </a-checkbox>
                            </template>
                            <template v-else-if="v.envKey === 'FEISHU_TYPING_INDICATOR'">
                              <a-checkbox
                                :checked="String(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue) === 'true'"
                                @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'true' : 'false')" />
                            </template>
                            <template v-else-if="v.envKey === 'FEISHU_RESOLVE_SENDER_NAMES'">
                              <a-checkbox
                                :checked="String(((openclawChannelBlob[section.sectionKey] || {})[v.envKey]) || v.defaultValue) === 'true'"
                                @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.checked ? 'true' : 'false')" />
                            </template>
                            <template v-else>
                              <a-input-password
                                v-if="isSecretEnvKey(v.envKey)"
                                :value="(openclawChannelBlob[section.sectionKey] || {})[v.envKey]"
                                :placeholder="v.defaultValue || v.envKey"
                                allow-clear
                                @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.value)" />
                              <a-input
                                v-else
                                :value="(openclawChannelBlob[section.sectionKey] || {})[v.envKey]"
                                :placeholder="v.defaultValue || v.envKey"
                                allow-clear
                                @change="e => $set(openclawChannelBlob[section.sectionKey], v.envKey, e.target.value)" />
                            </template>
                          </a-form-item>
                        </div>
                      </a-collapse-panel>
                    </a-collapse>
                  </div>
                </template>
              </a-tab-pane>
            </a-tabs>
          </template>
        </template>
        <template v-else>
          <a-alert type="warning" :message="$t('aice.llm_spec_update')" :description="$t('aice.llm_spec')" show-icon />
        </template>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { OPENCLAW_CHANNEL_SECTIONS, OPENCLAW_CHANNEL_OPTIONS } from '../../llm-sku/openclawChannelConfig'
import { OPENCLAW_PROVIDER_SECTIONS, OPENCLAW_PROVIDER_OPTIONS } from '../../llm-sku/openclawProviderConfig'
import { getParamsForType } from '../../llm-sku/llmTypeConfig'

export default {
  name: 'LlmUpdateSpecDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const row = (this.params && this.params.data && this.params.data[0]) || {}
    return {
      loading: false,
      instanceName: row.name || '',
      row,
      credentialNameMap: {},
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {
          openclaw_channels: [],
        },
      },
      decorators: {
        openclaw_channels: [
          'openclaw_channels',
          { initialValue: (row?.llm_spec?.openclaw?.channels || []).map(item => item.name), rules: [] },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
      OPENCLAW_PROVIDER_SECTIONS,
      openclawSelectedProviders: [],
      openclawProviderCredentialMode: {},
      openclawProviderCredentialId: {},
      openclawProviderBlobKeys: {},
      openclawProviderExportKeys: {},
      openclawProviderBlob: {},
      openclawProviderActiveTab: '',
      openclawChannelCredentialMode: {},
      openclawChannelCredentialId: {},
      openclawChannelBlobKeys: {},
      openclawChannelExportKeys: {},
      openclawChannelBlob: {},
      openclawChannelActiveTab: '',
      openclawPrimaryModelOptions: [],
      openclawPrimaryModelLoading: false,
    }
  },
  computed: {
    isOpenclaw () {
      return (this.row.llm_type || '').toLowerCase() === 'openclaw'
    },
    channelOptionsForSelect () {
      return OPENCLAW_CHANNEL_OPTIONS.map(opt => ({
        value: opt.value,
        label: this.$te(opt.label) ? this.$t(opt.label) : opt.label,
      }))
    },
    filteredChannelSections () {
      const channels = this.form.fd.openclaw_channels || []
      if (channels.length === 0) return []
      const set = new Set(channels)
      return OPENCLAW_CHANNEL_SECTIONS.filter(s => set.has(s.sectionKey))
    },
    providerOptionsForSelect () {
      return OPENCLAW_PROVIDER_OPTIONS.map(key => ({
        value: key,
        label: this.$te(key) ? this.$t(key) : key,
      }))
    },
    providerTabList () {
      const selected = this.openclawSelectedProviders || []
      if (selected.length === 0) return []
      const list = []
      selected.forEach(providerLabelKey => {
        const vars = []
        let required = false
        this.OPENCLAW_PROVIDER_SECTIONS.forEach(section => {
          section.vars.forEach(v => {
            if (v.providerLabelKey === providerLabelKey) {
              vars.push(v)
              if (section.required) required = true
            }
          })
        })
        if (vars.length) list.push({ key: providerLabelKey, labelKey: providerLabelKey, vars, required })
      })
      return list
    },
    openclawProviderActiveKey () {
      const list = this.providerTabList
      if (!list.length) return ''
      const keys = list.map(t => t.key)
      return keys.includes(this.openclawProviderActiveTab) ? this.openclawProviderActiveTab : (keys[0] || '')
    },
    openclawPrimaryModelBaseUrlForRefresh () {
      const pk = this.openclawProviderActiveKey
      const v = this.findOpenclawPrimaryModelVar(pk)
      if (!v) return ''
      const blob = (this.openclawProviderBlob || {})[pk] || {}
      const t = v.modelProviderType || 'ollama'
      if (t === 'vllm') return String(blob.VLLM_BASE_URL ?? '')
      return String(blob.OLLAMA_BASE_URL ?? '')
    },
  },
  watch: {
    openclawPrimaryModelBaseUrlForRefresh (newVal, oldVal) {
      if (oldVal === undefined) return
      if (newVal === oldVal) return
      const pk = this.openclawProviderActiveKey
      const v = this.findOpenclawPrimaryModelVar(pk)
      if (!v) return
      const blob = this.openclawProviderBlob[pk] || {}
      const cur = blob.OPENCLAW_PRIMARY_MODEL
      const hasModel = cur !== undefined && cur !== null && String(cur).trim() !== ''
      if (!hasModel) {
        this.openclawPrimaryModelOptions = []
        return
      }
      if (newVal) {
        this.loadOpenclawPrimaryModelOptions(v, pk, '')
      } else {
        this.openclawPrimaryModelOptions = []
      }
    },
    filteredChannelSections (sections) {
      ;(sections || []).forEach(s => this.ensureChannelState(s.sectionKey))
    },
    providerTabList (list) {
      const keys = (list || []).map(t => t.key)
      if (keys.length && !keys.includes(this.openclawProviderActiveTab)) {
        this.openclawProviderActiveTab = keys[0] || ''
      }
    },
    openclawSelectedProviders: {
      handler (list) {
        ;(list || []).forEach((providerKey) => {
          this.ensureProviderState(providerKey)
        })
      },
      deep: true,
    },
  },
  created () {
    // 初始化 providers 的 blob 输入结构
    this.OPENCLAW_PROVIDER_SECTIONS.forEach(section => {
      section.vars.forEach(({ providerLabelKey, envKey, overrideUrlKey }) => {
        if (!this.openclawProviderBlob[providerLabelKey]) this.$set(this.openclawProviderBlob, providerLabelKey, {})
        if (this.openclawProviderBlob[providerLabelKey][envKey] === undefined) this.$set(this.openclawProviderBlob[providerLabelKey], envKey, '')
        if (overrideUrlKey) {
          if (this.openclawProviderBlob[providerLabelKey][overrideUrlKey] === undefined) this.$set(this.openclawProviderBlob[providerLabelKey], overrideUrlKey, '')
        }
      })
    })
    this.initFromSpec()
  },
  methods: {
    credentialLabelFormat (item) {
      if (!item) return ''
      const id = String(item.id || item.key || '')
      const byMap = id && this.credentialNameMap && this.credentialNameMap[id]
      if (byMap) return byMap
      return item.name || id
    },
    credentialExtraOpts (credentialId) {
      if (!credentialId) return []
      const id = String(credentialId)
      const name = this.credentialNameMap && this.credentialNameMap[id]
      if (!name) return []
      return [{ id, name }]
    },
    initFromSpec () {
      const spec = this.row.llm_spec && this.row.llm_spec.openclaw != null ? this.row.llm_spec.openclaw : (this.row.llm_spec || {})
      if (!spec || typeof spec !== 'object') return
      const allowedChannelKeys = new Set(OPENCLAW_CHANNEL_SECTIONS.map(s => s.sectionKey))
      // providers
      if (Array.isArray(spec.providers) && spec.providers.length > 0) {
        const providerKeys = []
        spec.providers.forEach(p => {
          const name = p && p.name
          if (!name) return
          // name 为 providerShortName，例如 moonshot，需要映射回 providerLabelKey
          // 这里尽量做兼容：
          // 1) 如果历史数据直接存了 providerLabelKey，则直接匹配；
          // 2) 否则用 providerShortName 做大小写不敏感匹配；
          // 这样可以避免更新规格初始化时找不到对应 provider（导致 tab/输入项不出现）。
          const normalizedName = String(name)
          const labelKey =
            OPENCLAW_PROVIDER_OPTIONS.find(k => k === normalizedName) ||
            OPENCLAW_PROVIDER_OPTIONS.find(k => String(this.providerShortName(k) || '').toLowerCase() === normalizedName.toLowerCase()) ||
            null
          if (!labelKey) return
          providerKeys.push(labelKey)
          this.ensureProviderState(labelKey)
          const cred = p.credential || {}
          if (cred.id) {
            if (cred.name) {
              this.$set(this.credentialNameMap, String(cred.id), cred.name)
            }
            this.$set(this.openclawProviderCredentialMode, labelKey, 'existing')
            this.$set(this.openclawProviderCredentialId, labelKey, cred.id)
            const exportKeys = cred.export_keys || []
            this.$set(this.openclawProviderExportKeys, labelKey, exportKeys)
            // 拉取 blob keys 以填充可选项
            this.fetchCredentialBlobKeys(cred.id).then(keys => {
              this.$set(this.openclawProviderBlobKeys, labelKey, keys)
            }).catch(() => {
              this.$set(this.openclawProviderBlobKeys, labelKey, [])
            })
          } else {
            this.$set(this.openclawProviderCredentialMode, labelKey, 'new')
          }
        })
        this.openclawSelectedProviders = providerKeys
      }
      // channels
      const rawChannels = spec.channels
      if (Array.isArray(rawChannels) && rawChannels.length > 0) {
        const channelKeys = []
        rawChannels.forEach(item => {
          const key = item && (item.name || item.sectionKey || item.type || item.key)
          if (!key) return
          if (!allowedChannelKeys.has(key)) return
          channelKeys.push(key)
          this.ensureChannelState(key)
          const cred = item.credential || {}
          if (cred.id) {
            if (cred.name) {
              this.$set(this.credentialNameMap, String(cred.id), cred.name)
            }
            this.$set(this.openclawChannelCredentialMode, key, 'existing')
            this.$set(this.openclawChannelCredentialId, key, cred.id)
            const exportKeys = cred.export_keys || []
            this.$set(this.openclawChannelExportKeys, key, exportKeys)
            this.fetchCredentialBlobKeys(cred.id).then(keys => {
              this.$set(this.openclawChannelBlobKeys, key, keys)
            }).catch(() => {
              this.$set(this.openclawChannelBlobKeys, key, [])
            })
          } else {
            this.$set(this.openclawChannelCredentialMode, key, 'new')
          }
        })
        this.form.fc.setFieldsValue({ openclaw_channels: channelKeys })
        this.$set(this.form.fd, 'openclaw_channels', channelKeys)
        if (!this.openclawChannelActiveTab && channelKeys.length > 0) {
          this.openclawChannelActiveTab = channelKeys[0]
        }
      } else if (rawChannels && typeof rawChannels === 'object') {
        const channelKeys = []
        Object.keys(rawChannels).forEach((k) => {
          const key = String(k)
          if (!allowedChannelKeys.has(key)) return
          const item = rawChannels[key] || {}
          channelKeys.push(key)
          this.ensureChannelState(key)
          const cred = item.credential || item || {}
          const id = cred.id
          if (id) {
            if (cred.name) {
              this.$set(this.credentialNameMap, String(id), cred.name)
            }
            this.$set(this.openclawChannelCredentialMode, key, 'existing')
            this.$set(this.openclawChannelCredentialId, key, id)
            const exportKeys = cred.export_keys || []
            this.$set(this.openclawChannelExportKeys, key, exportKeys)
            this.fetchCredentialBlobKeys(id).then(keys => {
              this.$set(this.openclawChannelBlobKeys, key, keys)
            }).catch(() => {
              this.$set(this.openclawChannelBlobKeys, key, [])
            })
          } else {
            this.$set(this.openclawChannelCredentialMode, key, 'new')
          }
        })
        this.form.fc.setFieldsValue({ openclaw_channels: channelKeys })
        this.$set(this.form.fd, 'openclaw_channels', channelKeys)
        if (!this.openclawChannelActiveTab && channelKeys.length > 0) {
          this.openclawChannelActiveTab = channelKeys[0]
        }
      }
    },
    genCredentialName ({ llmName, usage, key }) {
      const base = String(llmName || '').trim() || 'llm'
      const u = String(usage || '').trim() || 'unknown'
      const k = String(key || '').trim() || 'default'
      const normalize = (s) => String(s || '').trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      return normalize(`${base}-${u}-${k}`) || 'llm-credential'
    },
    credentialParamsForChannel (channelKey) {
      const filter = ['type.equals(container_secret)']
      if (this.$store.getters.scope === 'project') {
        const uid = this.$store.getters.userInfo?.id
        if (uid) filter.push(`user_id.equals(${uid})`)
      }
      return {
        $t: 2,
        scope: this.$store.getters.scope,
        filter,
        'tags.0.key': 'user:openclaw_usage',
        'tags.0.value': 'channel',
        'tags.1.key': 'user:openclaw_name',
        'tags.1.value': channelKey,
      }
    },
    ensureChannelState (channelKey) {
      if (!this.openclawChannelCredentialMode[channelKey]) this.$set(this.openclawChannelCredentialMode, channelKey, 'new')
      if (!this.openclawChannelCredentialId[channelKey]) this.$set(this.openclawChannelCredentialId, channelKey, undefined)
      if (!this.openclawChannelBlobKeys[channelKey]) this.$set(this.openclawChannelBlobKeys, channelKey, [])
      if (!this.openclawChannelExportKeys[channelKey]) this.$set(this.openclawChannelExportKeys, channelKey, [])
      if (!this.openclawChannelBlob[channelKey]) this.$set(this.openclawChannelBlob, channelKey, {})
    },
    async fetchCredentialBlobKeys (credentialId) {
      if (!credentialId) return []
      const manager = new this.$Manager('credentials', 'v1')
      const { data } = await manager.get({ id: credentialId })
      const idStr = String(credentialId)
      const credName = data && data.name
      if (credName) {
        this.$set(this.credentialNameMap, idStr, credName)
      }
      const blob = data?.blob
      let obj = blob
      if (typeof blob === 'string') {
        try { obj = JSON.parse(blob) } catch (e) { obj = {} }
      }
      if (obj && typeof obj === 'object') {
        return Object.keys(obj)
      }
      return []
    },
    async onChannelCredentialChange (channelKey, credentialId) {
      this.ensureChannelState(channelKey)
      this.$set(this.openclawChannelCredentialId, channelKey, credentialId)
      this.$set(this.openclawChannelExportKeys, channelKey, [])
      try {
        const keys = await this.fetchCredentialBlobKeys(credentialId)
        this.$set(this.openclawChannelBlobKeys, channelKey, keys)
        this.$set(this.openclawChannelExportKeys, channelKey, [...keys])
      } catch (e) {
        this.$set(this.openclawChannelBlobKeys, channelKey, [])
      }
    },
    credentialParamsForProvider (providerKey) {
      const filter = ['type.equals(container_secret)']
      if (this.$store.getters.scope === 'project') {
        const uid = this.$store.getters.userInfo?.id
        if (uid) filter.push(`user_id.equals(${uid})`)
      }
      const shortName = this.providerShortName(providerKey)
      return {
        $t: 1,
        scope: this.$store.getters.scope,
        filter,
        'tags.0.key': 'user:openclaw_usage',
        'tags.0.value': 'provider',
        'tags.1.key': 'user:openclaw_name',
        'tags.1.value': shortName,
      }
    },
    providerShortName (providerKey) {
      const s = String(providerKey || '')
      const parts = s.split('.')
      return parts[parts.length - 1] || s
    },
    ensureProviderState (providerKey) {
      if (!this.openclawProviderCredentialMode[providerKey]) this.$set(this.openclawProviderCredentialMode, providerKey, 'new')
      if (!this.openclawProviderCredentialId[providerKey]) this.$set(this.openclawProviderCredentialId, providerKey, undefined)
      if (!this.openclawProviderBlobKeys[providerKey]) this.$set(this.openclawProviderBlobKeys, providerKey, [])
      if (!this.openclawProviderExportKeys[providerKey]) this.$set(this.openclawProviderExportKeys, providerKey, [])
      if (!this.openclawProviderBlob[providerKey]) this.$set(this.openclawProviderBlob, providerKey, {})
    },
    async onProviderCredentialChange (providerKey, credentialId) {
      this.ensureProviderState(providerKey)
      this.$set(this.openclawProviderCredentialId, providerKey, credentialId)
      this.$set(this.openclawProviderExportKeys, providerKey, [])
      try {
        const keys = await this.fetchCredentialBlobKeys(credentialId)
        this.$set(this.openclawProviderBlobKeys, providerKey, keys)
        this.$set(this.openclawProviderExportKeys, providerKey, [...keys])
      } catch (e) {
        this.$set(this.openclawProviderBlobKeys, providerKey, [])
      }
    },
    closeProviderTab (providerKey) {
      const next = this.openclawSelectedProviders.filter(k => k !== providerKey)
      this.openclawSelectedProviders = next
      if (this.openclawProviderActiveTab === providerKey && next.length > 0) {
        this.openclawProviderActiveTab = next[0]
      } else if (next.length === 0) {
        this.openclawProviderActiveTab = ''
      }
      this.$delete(this.openclawProviderCredentialMode, providerKey)
      this.$delete(this.openclawProviderCredentialId, providerKey)
      this.$delete(this.openclawProviderBlobKeys, providerKey)
      this.$delete(this.openclawProviderExportKeys, providerKey)
    },
    filterProviderOption (input, option) {
      const value = option.componentOptions && option.componentOptions.propsData && option.componentOptions.propsData.value
      if (value == null) return true
      const label = this.$te(value) ? this.$t(value) : String(value)
      return label.toLowerCase().indexOf((input || '').toLowerCase()) >= 0
    },
    closeChannelTab (sectionKey) {
      const channels = (this.form.fd.openclaw_channels || []).filter(k => k !== sectionKey)
      this.form.fc.setFieldsValue({ openclaw_channels: channels })
      this.$set(this.form.fd, 'openclaw_channels', channels)
      if (this.openclawChannelActiveTab === sectionKey && channels.length > 0) {
        this.openclawChannelActiveTab = channels[0]
      } else if (channels.length === 0) {
        this.openclawChannelActiveTab = ''
      }
      this.$delete(this.openclawChannelCredentialMode, sectionKey)
      this.$delete(this.openclawChannelCredentialId, sectionKey)
      this.$delete(this.openclawChannelBlobKeys, sectionKey)
      this.$delete(this.openclawChannelExportKeys, sectionKey)
    },
    filterChannelOption (input, option) {
      const value = option.componentOptions && option.componentOptions.propsData && option.componentOptions.propsData.value
      if (value == null) return true
      const opt = this.channelOptionsForSelect.find(o => o.value === value)
      const label = opt ? opt.label : (this.$te(value) ? this.$t(value) : String(value))
      return String(label).toLowerCase().indexOf((input || '').toLowerCase()) >= 0
    },
    channelBasicVars (vars) {
      return (vars || []).filter(v => !v.advanced)
    },
    channelAdvancedVars (vars) {
      return (vars || []).filter(v => !!v.advanced)
    },
    sectionBasicEnvKeys (section, envKeys) {
      if (!section) return envKeys || []
      const basicKeys = new Set(this.channelBasicVars(section.vars).map(v => v.envKey))
      return (envKeys || []).filter(k => basicKeys.has(k))
    },
    sectionAdvancedEnvKeys (section, envKeys) {
      if (!section) return []
      const basicKeys = new Set(this.channelBasicVars(section.vars).map(v => v.envKey))
      return (envKeys || []).filter(k => !basicKeys.has(k))
    },
    isSecretEnvKey (envKey) {
      const lower = (envKey || '').toLowerCase()
      return lower.includes('key') || lower.includes('secret') || lower.includes('token') || lower.includes('password')
    },
    findOpenclawPrimaryModelVar (providerKey) {
      if (providerKey == null || providerKey === '') return null
      const sections = this.OPENCLAW_PROVIDER_SECTIONS || []
      for (let i = 0; i < sections.length; i++) {
        const vars = sections[i].vars || []
        for (let j = 0; j < vars.length; j++) {
          const x = vars[j]
          if (x.envKey === 'OPENCLAW_PRIMARY_MODEL' && x.component === 'a-select') {
            if (x.providerLabelKey === providerKey) return x
          }
        }
      }
      return null
    },
    pickTrimmedOpenclawBlob (raw, providerKey) {
      const blob = {}
      const v = providerKey == null || providerKey === '' ? null : this.findOpenclawPrimaryModelVar(providerKey)
      const prefix = v && v.modelProviderType
      Object.keys(raw || {}).forEach(k => {
        const val = raw[k]
        if (val === undefined || val === null) return
        const s = typeof val === 'string' ? val.trim() : String(val).trim()
        if (s !== '') {
          if (k === 'OPENCLAW_PRIMARY_MODEL' && prefix) {
            blob[k] = s.startsWith(`${prefix}/`) ? s : `${prefix}/${s}`
          } else {
            blob[k] = s
          }
        }
      })
      return blob
    },
    validateOpenclawProviderRequiredEnv (providerKey) {
      const raw = this.openclawProviderBlob[providerKey] || {}
      const sections = this.OPENCLAW_PROVIDER_SECTIONS || []
      for (let i = 0; i < sections.length; i++) {
        const vars = sections[i].vars || []
        for (let j = 0; j < vars.length; j++) {
          const v = vars[j]
          if (v.providerLabelKey !== providerKey || !v.required) continue
          const val = raw[v.envKey]
          const empty = val === undefined || val === null || val === '' ||
            (typeof val === 'string' && !String(val).trim())
          if (empty) {
            const label = v.placeholderKey && this.$te(v.placeholderKey)
              ? this.$t(v.placeholderKey)
              : (this.$te(v.descriptionKey) ? this.$t(v.descriptionKey) : v.envKey)
            const tip = v.component === 'a-select'
              ? this.$t('common.tips.select', [label])
              : this.$t('common.tips.input', [label])
            this.$message.warning(tip)
            return false
          }
        }
      }
      return true
    },
    syncOpenclawPrimaryModelIfNotInOptions (providerKey) {
      const blob = (this.openclawProviderBlob || {})[providerKey]
      if (!blob) return
      const cur = blob.OPENCLAW_PRIMARY_MODEL
      const hasModel = cur !== undefined && cur !== null && String(cur).trim() !== ''
      if (!hasModel) return
      const opts = this.openclawPrimaryModelOptions || []
      const inList = opts.some(opt => String(opt.value) === String(cur))
      if (!inList) {
        this.$set(this.openclawProviderBlob[providerKey], 'OPENCLAW_PRIMARY_MODEL', '')
      }
    },
    openclawProviderAselectPlaceholder (v) {
      const labelKey = v.placeholderKey || 'aice.model'
      const label = this.$te(labelKey) ? this.$t(labelKey) : labelKey
      return this.$t('common.tips.select', [label])
    },
    refreshOpenclawPrimaryModel (v, providerKey) {
      this.loadOpenclawPrimaryModelOptions(v, providerKey, '')
    },
    async onOpenclawPrimaryModelDropdown (open, v, providerKey) {
      if (!open) return
      await this.loadOpenclawPrimaryModelOptions(v, providerKey, '')
    },
    onOpenclawPrimaryModelSearch (q, v, providerKey) {
      if (this._openclawPrimaryModelSearchTimer) clearTimeout(this._openclawPrimaryModelSearchTimer)
      this._openclawPrimaryModelSearchTimer = setTimeout(() => {
        this.loadOpenclawPrimaryModelOptions(v, providerKey, q || '')
      }, 300)
    },
    async loadOpenclawPrimaryModelOptions (v, providerKey, search) {
      const resource = (v && v.resource) || 'llms/provider-models'
      const blob = (this.openclawProviderBlob || {})[providerKey] || {}
      this.openclawPrimaryModelLoading = true
      try {
        const manager = new this.$Manager(resource, 'v2')
        const providerType = (v && v.modelProviderType) || 'ollama'
        const baseUrl = providerType === 'vllm' ? blob.VLLM_BASE_URL : blob.OLLAMA_BASE_URL
        const body = {
          scope: this.$store.getters.scope,
          limit: 20,
          ...getParamsForType('openclaw'),
          url: baseUrl,
          provider_type: providerType,
        }
        if (providerType === 'vllm' && blob.VLLM_API_KEY) {
          body.api_key = blob.VLLM_API_KEY
        }
        if (search) body.filter = [`name.contains(${search})`]
        const { data } = await manager.create({ data: body })
        const rows = this.unwrapOpenclawPrimaryModelResponse(data)
        this.openclawPrimaryModelOptions = rows.map(item => ({
          value: item.id || item.model_id,
          label: item.fullname || item.name || item.model_id || String(item.id || ''),
        })).filter(opt => opt.value !== undefined && opt.value !== null && opt.value !== '')
        if (!search) {
          this.syncOpenclawPrimaryModelIfNotInOptions(providerKey)
        }
      } catch (e) {
        this.openclawPrimaryModelOptions = []
      } finally {
        this.openclawPrimaryModelLoading = false
      }
    },
    unwrapOpenclawPrimaryModelResponse (data) {
      if (!data) return []
      if (Array.isArray(data)) return data
      if (Array.isArray(data.data)) return data.data
      if (data.data && Array.isArray(data.data.data)) return data.data.data
      return []
    },
    overrideUrlPlaceholder (overrideUrlKey) {
      const defaults = {
        MOONSHOT_BASE_URL: 'https://api.moonshot.cn/v1',
        KIMI_BASE_URL: 'https://api.moonshot.ai/anthropic',
      }
      return defaults[overrideUrlKey] || 'https://...'
    },
    async handleConfirm () {
      if (!this.isOpenclaw) {
        this.cancelDialog()
        return
      }
      this.loading = true
      try {
        const row = this.row
        const channelsSelected = this.form.fd.openclaw_channels || []
        const openclaw = {}
        const credManager = new this.$Manager('credentials', 'v1')

        const channels = []
        for (let i = 0; i < channelsSelected.length; i++) {
          const channelKey = channelsSelected[i]
          this.ensureChannelState(channelKey)
          const mode = this.openclawChannelCredentialMode[channelKey] || 'new'
          let credentialId
          let exportKeys
          if (mode === 'existing') {
            credentialId = this.openclawChannelCredentialId[channelKey]
            if (!credentialId) {
              this.$message.warning(this.$t('common.tips.select', [this.$t('aice.container_secret')]))
              this.loading = false
              return
            }
            exportKeys = this.openclawChannelExportKeys[channelKey] || []
            if (channelKey === 'qqbot') {
              const requiredKeys = ['QQBOT_APP_ID', 'QQBOT_CLIENT_SECRET']
              const missing = requiredKeys.filter(k => !(exportKeys || []).includes(k))
              if (missing.length) {
                const missingLabels = missing.map(k => this.$t(`aice.openclaw.channel.env.${k}`)).join(', ')
                this.$message.warning(this.$t('aice.openclaw.required_hint') + missingLabels)
                this.loading = false
                return
              }
            }
            if (channelKey === 'feishu') {
              const requiredKeys = ['FEISHU_APP_ID', 'FEISHU_APP_SECRET']
              const missing = requiredKeys.filter(k => !(exportKeys || []).includes(k))
              if (missing.length) {
                const missingLabels = missing.map(k => this.$t(`aice.openclaw.channel.env.${k}`)).join(', ')
                this.$message.warning(this.$t('aice.openclaw.required_hint') + missingLabels)
                this.loading = false
                return
              }
            }
            if (channelKey === 'discord') {
              const requiredKeys = ['DISCORD_BOT_TOKEN']
              const missing = requiredKeys.filter(k => !(exportKeys || []).includes(k))
              if (missing.length) {
                const missingLabels = missing.map(k => this.$t(`aice.openclaw.channel.env.${k}`)).join(', ')
                this.$message.warning(this.$t('aice.openclaw.required_hint') + missingLabels)
                this.loading = false
                return
              }
            }
            if (channelKey === 'telegram') {
              const requiredKeys = ['TELEGRAM_BOT_TOKEN']
              const missing = requiredKeys.filter(k => !(exportKeys || []).includes(k))
              if (missing.length) {
                const missingLabels = missing.map(k => this.$t(`aice.openclaw.channel.env.${k}`)).join(', ')
                this.$message.warning(this.$t('aice.openclaw.required_hint') + missingLabels)
                this.loading = false
                return
              }
            }
          } else {
            const credName = this.genCredentialName({ llmName: this.instanceName, usage: 'channel', key: channelKey })
            const raw = this.openclawChannelBlob[channelKey] || {}
            const blob = this.pickTrimmedOpenclawBlob(raw, '')
            if (channelKey === 'qqbot') {
              const missing = ['QQBOT_APP_ID', 'QQBOT_CLIENT_SECRET'].filter(k => !blob[k])
              if (missing.length) {
                const missingLabels = missing.map(k => this.$t(`aice.openclaw.channel.env.${k}`)).join(', ')
                this.$message.warning(this.$t('aice.openclaw.required_hint') + missingLabels)
                this.loading = false
                return
              }
            }
            if (channelKey === 'feishu') {
              const missing = ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'].filter(k => !blob[k])
              if (missing.length) {
                const missingLabels = missing.map(k => this.$t(`aice.openclaw.channel.env.${k}`)).join(', ')
                this.$message.warning(this.$t('aice.openclaw.required_hint') + missingLabels)
                this.loading = false
                return
              }
              // 单选/勾选控件可能只显示 defaultValue，但不一定触发 @change 写入 blob
              // 这里兜底补齐默认值，确保这些字段会写入 credential blob 与 export_keys
              if (!blob.FEISHU_DOMAIN) blob.FEISHU_DOMAIN = 'feishu'
              if (!blob.FEISHU_DM_POLICY) blob.FEISHU_DM_POLICY = 'open'
              if (!blob.FEISHU_TYPING_INDICATOR) blob.FEISHU_TYPING_INDICATOR = 'true'
              if (!blob.FEISHU_RESOLVE_SENDER_NAMES) blob.FEISHU_RESOLVE_SENDER_NAMES = 'true'
            }
            if (channelKey === 'discord') {
              const missing = ['DISCORD_BOT_TOKEN'].filter(k => !blob[k])
              if (missing.length) {
                const missingLabels = missing.map(k => this.$t(`aice.openclaw.channel.env.${k}`)).join(', ')
                this.$message.warning(this.$t('aice.openclaw.required_hint') + missingLabels)
                this.loading = false
                return
              }
              if (!blob.DISCORD_DM_POLICY) blob.DISCORD_DM_POLICY = 'open'
            }
            if (channelKey === 'telegram') {
              const missing = ['TELEGRAM_BOT_TOKEN'].filter(k => !blob[k])
              if (missing.length) {
                const missingLabels = missing.map(k => this.$t(`aice.openclaw.channel.env.${k}`)).join(', ')
                this.$message.warning(this.$t('aice.openclaw.required_hint') + missingLabels)
                this.loading = false
                return
              }
              if (!blob.TELEGRAM_DM_POLICY) blob.TELEGRAM_DM_POLICY = 'open'
            }
            if (Object.keys(blob).length === 0) {
              this.$message.warning(this.$t('aice.openclaw.provider_filter_empty'))
              this.loading = false
              return
            }
            const { data: credData } = await credManager.create({
              data: {
                type: 'container_secret',
                name: credName,
                blob,
                __meta__: {
                  'user:openclaw_usage': 'channel',
                  'user:openclaw_name': channelKey,
                },
              },
            })
            credentialId = credData.id
            exportKeys = Object.keys(blob)
          }
          channels.push({
            name: channelKey,
            credential: { id: credentialId, export_keys: exportKeys },
          })
        }
        if (channels.length) openclaw.channels = channels

        const providersSelected = this.openclawSelectedProviders || []
        if (!providersSelected.length) {
          this.$message.warning(this.$t('aice.openclaw.provider_select_first'))
          this.loading = false
          return
        }
        const providers = []
        for (let i = 0; i < providersSelected.length; i++) {
          const providerKey = providersSelected[i]
          this.ensureProviderState(providerKey)
          if (!this.validateOpenclawProviderRequiredEnv(providerKey)) {
            this.loading = false
            return
          }
          const mode = this.openclawProviderCredentialMode[providerKey] || 'new'
          let credentialId
          let exportKeys
          if (mode === 'existing') {
            credentialId = this.openclawProviderCredentialId[providerKey]
            if (!credentialId) {
              this.$message.warning(this.$t('common.tips.select', [this.$t('aice.container_secret')]))
              this.loading = false
              return
            }
            exportKeys = this.openclawProviderExportKeys[providerKey] || []
          } else {
            const credName = this.genCredentialName({ llmName: this.instanceName, usage: 'provider', key: this.providerShortName(providerKey) })
            const raw = this.openclawProviderBlob[providerKey] || {}
            const blob = this.pickTrimmedOpenclawBlob(raw, providerKey)
            if (Object.keys(blob).length === 0) {
              this.$message.warning(this.$t('aice.openclaw.ai_providers.at_least_one'))
              this.loading = false
              return
            }
            const { data: credData } = await credManager.create({
              data: {
                type: 'container_secret',
                name: credName,
                blob,
                __meta__: {
                  'user:openclaw_usage': 'provider',
                  'user:openclaw_name': this.providerShortName(providerKey),
                },
              },
            })
            credentialId = credData.id
            exportKeys = Object.keys(blob)
          }
          providers.push({
            name: this.providerShortName(providerKey),
            credential: { id: credentialId, export_keys: exportKeys },
          })
        }
        if (providers.length) openclaw.providers = providers

        if (!Object.keys(openclaw).length) {
          this.$message.warning(this.$t('aice.openclaw.provider_filter_empty'))
          this.loading = false
          return
        }

        await this.params.onManager('update', {
          id: row.id,
          managerArgs: {
            data: {
              llm_spec: { openclaw },
            },
          },
        })
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.openclaw-channel-tabs { margin-top: 8px; }
.openclaw-provider-tabs { margin-top: 8px; }
.openclaw-section-divider { margin-top: 20px; }
.openclaw-tab-with-close { display: inline-flex; align-items: center; gap: 6px; }
.openclaw-tab-close { font-size: 12px; cursor: pointer; opacity: 0.6; }
.openclaw-tab-close:hover { opacity: 1; }
.openclaw-new-blob-section { margin-top: 8px; }
.openclaw-new-blob-row ::v-deep .ant-form-item-label {
  padding-bottom: 4px;
  overflow: visible;
}
.openclaw-new-blob-row ::v-deep .ant-form-item-label label {
  overflow: visible;
  white-space: nowrap;
}
.openclaw-filter-empty { padding: 12px 0; font-size: 13px; }
.openclaw-channel-config-hint { font-size: 13px; }
</style>
