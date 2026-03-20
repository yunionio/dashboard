<template>
  <div>
    <page-header :title="isApplyType ? $t('aice.app_llm_create') : $t('aice.llm_create')" />
    <page-body>
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" :placeholder="$t('common.tips.input', [$t('common.name')])" />
          <template v-slot:extra>
            <name-repeated res="llms" :name="form.fd.name" />
          </template>
        </a-form-item>
        <a-form-item :label="isApplyType ? $t('aice.llm_type.app') : $t('aice.llm_type.llm')">
          <a-radio-group
            class="llm-type-picker"
            button-style="solid"
            v-decorator="decorators.llm_type">
            <a-radio-button v-for="opt in llmTypeOptions" :key="opt.id" :value="opt.id">
              {{ opt.name }}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="isApplyType ? $t('aice.app_llm_sku') : $t('aice.llm_sku')">
          <base-select
            v-decorator="decorators.llm_sku_id"
            resource="llm_skus"
            :select-props="{
              placeholder: $t('common.tips.select', [isApplyType ? $t('aice.app_llm_sku') : $t('aice.llm_sku')]),
            }"
            :params="llmSkuParams" />
        </a-form-item>
        <a-form-item :label="$t('aice.bandwidth_mb')">
          <a-input-number
            v-decorator="decorators.bandwidth_mb"
            :min="1"
            :max="10000"
            :step="1"
            :precision="0" />
        </a-form-item>
        <a-form-item :label="$t('dictionary.host')">
          <base-select
            v-decorator="decorators.prefer_host"
            resource="hosts"
            :select-props="{
              placeholder: $t('common.tips.select', [$t('dictionary.host')]),
              allowClear: true,
            }"
            :params="hostParams" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_104')" class="mb-0">
          <server-network
            :form="form"
            :decorator="decorators.network"
            :network-list-params="networkParams"
            :schedtag-params="resourcesParams.schedtag"
            :network-resource-mapper="networkResourceMapper"
            :hiddenNetworkOptions="['schedtag']"
            defaultNetworkType="default"
            :hiddenAdd="true"
            :isDialog="true" />
        </a-form-item>
        <template v-if="form.fd.llm_type === 'openclaw'">
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
                    v-model="openclawProviderCredentialId[item.key]"
                    resource="credentials"
                    :params="credentialParamsForProvider(item.key)"
                    :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.container_secret')]) }"
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
                  {{ $t('aice.openclaw.new_credential_name') }}：{{ genCredentialName({ llmName: form.fd.name, usage: 'provider', key: providerShortName(item.key) }) }}
                </div>
                <div class="openclaw-new-blob-section">
                  <div v-for="v in item.vars" :key="v.envKey" class="openclaw-new-blob-row mb-2">
                    <a-form-item
                      :label="v.envKey"
                      :required="item.required"
                      :extra="(item.required ? $t('aice.openclaw.required_hint') + ' ' : '') + ($te(v.descriptionKey) ? $t(v.descriptionKey) : '')">
                      <a-input-password
                        v-if="isSecretEnvKey(v.envKey)"
                        :value="(openclawProviderBlob[item.key] || {})[v.envKey]"
                        :placeholder="v.envKey"
                        allow-clear
                        @change="e => $set(openclawProviderBlob[item.key], v.envKey, e.target.value)" />
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
                      v-model="openclawChannelCredentialId[section.sectionKey]"
                      resource="credentials"
                      :params="credentialParamsForChannel(section.sectionKey)"
                      :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.container_secret')]) }"
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
                    {{ $t('aice.openclaw.new_credential_name') }}：{{ genCredentialName({ llmName: form.fd.name, usage: 'channel', key: section.sectionKey }) }}
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
        <a-form-item :label="$t('compute.text_494')" :extra="$t('compute.text_495')">
          <a-switch v-decorator="decorators.auto_start" :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" />
        </a-form-item>
      </a-form>
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" @click="handleConfirm">{{ $t('common.create') }}</a-button>
        <a-button @click="handleCancel">{{ $t('common.cancel') }}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import * as R from 'ramda'
import WindowsMixin from '@/mixins/windows'
import validateForm from '@/utils/validate'
import NameRepeated from '@/sections/NameRepeated'
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import { LLM_TYPE_OPTIONS, getParamsForType } from '../llm-sku/llmTypeConfig'
import { OPENCLAW_CHANNEL_SECTIONS, OPENCLAW_CHANNEL_OPTIONS } from '../llm-sku/openclawChannelConfig'
import { OPENCLAW_PROVIDER_SECTIONS, OPENCLAW_PROVIDER_OPTIONS } from '../llm-sku/openclawProviderConfig'
export default {
  name: 'LLMCreate',
  provide () {
    return {
      form: this.form,
    }
  },
  components: {
    NameRepeated,
    ServerNetwork,
  },
  mixins: [WindowsMixin],
  data () {
    const isApplyType = this.$route.path.includes('app-llm')
    const llmTypeOptions = isApplyType ? LLM_TYPE_OPTIONS.filter(opt => opt.id !== 'vllm' && opt.id !== 'ollama') : LLM_TYPE_OPTIONS.filter(opt => opt.id === 'vllm' || opt.id === 'ollama')
    const defaultLlmType = (llmTypeOptions[0] && llmTypeOptions[0].id) || (isApplyType ? 'openclaw' : 'ollama')
    return {
      isApplyType,
      llmTypeOptions: llmTypeOptions.map(opt => ({ id: opt.id, name: this.$t(opt.name) })),
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {
          llm_type: defaultLlmType,
        },
        fi: {
          networkList: [],
          capability: {
            max_nic_count: 8,
          },
        },
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, validator: this.$validate('resourceName') },
            ],
          },
        ],
        llm_type: [
          'llm_type',
          {
            initialValue: defaultLlmType,
            rules: [
              { required: true, message: this.$t('common.tips.select', [isApplyType ? this.$t('aice.llm_type.app') : this.$t('aice.llm_type.llm')]) },
            ],
          },
        ],
        llm_sku_id: [
          'llm_sku_id',
          {
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_sku')]) },
            ],
          },
        ],
        bandwidth_mb: [
          'bandwidth_mb',
          {
            initialValue: 30,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.bandwidth_mb')]) },
            ],
          },
        ],
        prefer_host: [
          'prefer_host',
          {
            rules: [
              { required: false, message: this.$t('common.tips.select', [this.$t('dictionary.host')]) },
            ],
          },
        ],
        network: {
          networkType: [
            'networkType',
            {
              initialValue: NETWORK_OPTIONS_MAP.default.key,
            },
          ],
          networkConfig: {
            vpcs: i => [
              `vpcs[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_194'),
                }],
              },
            ],
            networks: i => [
              `networks[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_217'),
                }],
              },
            ],
            ips: (i, networkData) => [
              `networkIps[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [
                  {
                    validator: validateForm('IPv4'),
                  },
                ],
              },
            ],
            macs: (i, networkData) => [
              `networkMacs[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [
                  {
                    validator: validateForm('mac'),
                  },
                ],
              },
            ],
          },
          networkSchedtag: {
            schedtags: i => [
              `networkSchedtags[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_123'),
                }],
              },
            ],
            policys: (i, networkData) => [
              `networkPolicys[${i}]`,
              {
                validateTrigger: ['blur', 'change'],
                rules: [{
                  required: true,
                  message: this.$t('common_256'),
                }],
              },
            ],
          },
        },
        auto_start: [
          'auto_start',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ],
        openclaw_channels: [
          'openclaw_channels',
          { initialValue: [], rules: [] },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 3 },
        },
      },
      openclawChannelCredentialMode: {},
      openclawChannelCredentialId: {},
      openclawChannelBlobKeys: {},
      openclawChannelExportKeys: {},
      openclawChannelBlob: {},
      openclawChannelActiveTab: '',

      OPENCLAW_PROVIDER_SECTIONS,
      openclawSelectedProviders: [],
      openclawProviderCredentialMode: {},
      openclawProviderCredentialId: {},
      openclawProviderBlobKeys: {},
      openclawProviderExportKeys: {},
      openclawProviderBlob: {},
      openclawProviderActiveTab: '',
    }
  },
  computed: {
    networkParams () {
      const ret = {
        scope: this.$store.getters.scope,
        limit: 20,
        usable: true,
        host_type: 'container',
        vpc: this.form.fd.vpc,
      }
      return ret
    },
    resourcesParams () {
      const schedtag = {
        limit: 1024,
        filter: ['resource_type.equals(networks)'],
      }
      return {
        schedtag,
      }
    },
    llmSkuParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        ...getParamsForType(this.form.fd.llm_type),
      }
    },
    hostParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        host_status: 'online',
        host_type: 'container',
      }
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
  },
  watch: {
    'form.fd.llm_type' (val, oldVal) {
      if (val === oldVal) return
      this.form.fc.setFieldsValue({ llm_sku_id: undefined })
      if (oldVal === 'openclaw' && val !== 'openclaw') {
        this.form.fc.setFieldsValue({ openclaw_channels: [] })
        this.$set(this.form.fd, 'openclaw_channels', [])
        this.openclawSelectedProviders = []
        this.openclawProviderActiveTab = ''
        this.openclawProviderCredentialMode = {}
        this.openclawProviderCredentialId = {}
        this.openclawProviderBlobKeys = {}
        this.openclawProviderExportKeys = {}
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
    // 初始化 providers 的 blob 输入结构（按 key 分组）
    this.OPENCLAW_PROVIDER_SECTIONS.forEach(section => {
      section.vars.forEach(({ providerLabelKey, envKey, overrideUrlKey }) => {
        if (!this.openclawProviderBlob[providerLabelKey]) this.$set(this.openclawProviderBlob, providerLabelKey, {})
        if (this.openclawProviderBlob[providerLabelKey][envKey] === undefined) this.$set(this.openclawProviderBlob[providerLabelKey], envKey, '')
        if (overrideUrlKey) {
          if (this.openclawProviderBlob[providerLabelKey][overrideUrlKey] === undefined) this.$set(this.openclawProviderBlob[providerLabelKey], overrideUrlKey, '')
        }
      })
    })
  },
  methods: {
    genCredentialName ({ llmName, usage, key }) {
      const base = String(llmName || '').trim() || 'llm'
      const u = String(usage || '').trim() || 'unknown'
      const k = String(key || '').trim() || 'default'
      // 简单清洗：空白转为 -，并去掉多余的 -
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
      const base = { scope: this.$store.getters.scope, filter }
      return {
        ...base,
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
      const base = { scope: this.$store.getters.scope, filter }
      const shortName = this.providerShortName(providerKey)
      return {
        ...base,
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
    overrideUrlPlaceholder (overrideUrlKey) {
      const defaults = {
        MOONSHOT_BASE_URL: 'https://api.moonshot.cn/v1',
        KIMI_BASE_URL: 'https://api.moonshot.ai/anthropic',
      }
      return defaults[overrideUrlKey] || 'https://...'
    },
    networkResourceMapper (list) {
      return (list || []).map(val => {
        const isHostSubnet = val.server_type === 'host'
        if (!isHostSubnet) return val
        return {
          ...val,
          name: `${val.name}（Host IP 子网）`,
        }
      })
    },
    async genNetworks (values) {
      let ret = [{ exit: false }]
      // 指定 IP 子网
      if (this.form.fd.networkType === NETWORK_OPTIONS_MAP.manual.key) {
        ret = []
        R.forEachObjIndexed((value, key) => {
          const obj = {
            network: value,
          }
          if (this.form.fd.networkIps) {
            const address = this.form.fd.networkIps[key]
            if (address) {
              obj.address = address
            }
          }
          if (this.form.fd.networkMacs) {
            const mac = this.form.fd.networkMacs[key]
            if (mac) {
              obj.mac = mac
            }
          }
          ret.push(obj)
        }, values.networks)
      }
      // 指定 调度标签
      if (this.form.fd.networkType === NETWORK_OPTIONS_MAP.schedtag.key) {
        ret = []
        R.forEachObjIndexed((value, key) => {
          const obj = {
            id: value,
          }
          const strategy = this.form.fd.networkPolicys[key]
          if (strategy) {
            obj.strategy = strategy
          }
          ret.push({
            schedtags: [obj],
          })
        }, values.networkSchedtags)
      }
      return ret
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const networks = await this.genNetworks(values)
        const data = {
          generate_name: values.name,
          llm_sku_id: values.llm_sku_id,
          bandwidth_mb: values.bandwidth_mb,
          prefer_host: values.prefer_host,
          auto_start: values.auto_start,
          nets: networks,
        }
        if (this.form.fd.llm_type === 'openclaw') {
          const openclaw = {}
          const channelsSelected = values.openclaw_channels || []
          const channels = []
          const credManager = new this.$Manager('credentials', 'v1')
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
              const credName = this.genCredentialName({ llmName: values.name, usage: 'channel', key: channelKey })
              const raw = this.openclawChannelBlob[channelKey] || {}
              const blob = {}
              Object.keys(raw).forEach(k => {
                const v = (raw[k] || '').trim()
                if (v) blob[k] = v
              })
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
              const credName = this.genCredentialName({ llmName: values.name, usage: 'provider', key: this.providerShortName(providerKey) })
              const raw = this.openclawProviderBlob[providerKey] || {}
              const blob = {}
              Object.keys(raw).forEach(k => {
                const v = (raw[k] || '').trim()
                if (v) blob[k] = v
              })
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

          if (Object.keys(openclaw).length) data.llm_spec = { openclaw }
        }
        await new this.$Manager('llms', 'v1').create({
          data,
        })
        this.$message.success(this.$t('common.success'))
        this.$router.push(this.isApplyType ? '/app-llm' : '/llm')
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    handleCancel () {
      this.$router.push(this.isApplyType ? '/app-llm' : '/llm')
    },
  },
}
</script>

<style scoped>
.llm-type-picker ::v-deep .ant-radio-button-wrapper {
  height: 36px;
  line-height: 34px;
  border-radius: 4px;
  margin-right: 8px;
  margin-bottom: 8px;
}
.llm-type-picker ::v-deep .ant-radio-button-wrapper:first-child {
  border-radius: 4px;
}
.llm-type-picker ::v-deep .ant-radio-button-wrapper:last-child {
  border-radius: 4px;
}
.openclaw-channel-tabs { margin-top: 8px; }
.openclaw-provider-tabs { margin-top: 8px; }
.openclaw-section-divider { margin-top: 20px; }
.openclaw-tab-with-close { display: inline-flex; align-items: center; gap: 6px; }
.openclaw-tab-close { font-size: 12px; cursor: pointer; opacity: 0.6; }
.openclaw-tab-close:hover { opacity: 1; }
.openclaw-new-blob-section { margin-top: 8px; }
.openclaw-new-blob-row ::v-deep .ant-form-item-label { padding-bottom: 4px; }
.openclaw-filter-empty { padding: 12px 0; font-size: 13px; }
</style>
