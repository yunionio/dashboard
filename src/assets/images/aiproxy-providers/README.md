# Aiproxy provider icons

Catalog `provider_key` icons for the AI gateway Dashboard. File name matches key: `{provider_key}.svg`.

**Regenerate:** from repo root run:

```bash
./scripts/sync-aiproxy-provider-icons.sh
```

## Licenses

| Source | License | URL |
|--------|---------|-----|
| lobe-icons | MIT | https://github.com/lobehub/lobe-icons |
| simple-icons | CC0 | https://simpleicons.org/ (xiaomi fallback only) |
| `providers/aliyun.svg` | project asset | OneCloud cloud provider set |
| `llm-images/default.svg` | project asset | generic fallback |

## Mapping (colorful)

| provider_key | Upstream | Color |
|--------------|----------|-------|
| anthropic | lobe `claude-color.svg` | yes |
| azure | lobe `azure-color.svg` | yes |
| bedrock | lobe `aws-color.svg` | yes |
| cerebras | lobe `cerebras-color.svg` | yes |
| cohere | lobe `cohere-color.svg` | yes |
| deepseek | lobe `deepseek-color.svg` | yes |
| gemini | lobe `gemini-color.svg` | yes |
| groq | lobe `groq.svg` + `#F55036` | tinted |
| mistral | lobe `mistral-color.svg` | yes |
| ollama | lobe `ollama.svg` + `#1D1D1D` | tinted |
| openai | lobe `openai.svg` + `#10A37F` | tinted |
| parasail | lobe `parasail.svg` + `#0EA5E9` | tinted |
| perplexity | lobe `perplexity-color.svg` | yes |
| sgl | copy of `vllm.svg` | yes |
| vertex | lobe `vertexai-color.svg` ([Vertex AI](https://lobehub.com/icons/vertexai)) | yes |
| openrouter | lobe `openrouter.svg` + `#412991` | tinted |
| elevenlabs | lobe `elevenlabs.svg` + `#000000` | tinted |
| huggingface | lobe `huggingface-color.svg` | yes |
| nebius | lobe `nebius.svg` + `#5B4FFF` | tinted |
| xai | lobe `xai.svg` + `#000000` | tinted |
| replicate | lobe `replicate.svg` + `#000000` | tinted |
| vllm | lobe `vllm-color.svg` | yes |
| runway | lobe `runway.svg` + `#000000` | tinted |
| fireworks | lobe `fireworks-color.svg` | yes |
| aliyun | `providers/aliyun.svg` | yes |
| baidu | lobe `baidu-color.svg` | yes |
| xiaomi | simple-icons `xiaomi.svg` + `#FF6900` | tinted |
| default | `llm-images/default.svg` | fallback |

Used by [`containers/Ai/utils/aiproxyProviderIcon.js`](../../../containers/Ai/utils/aiproxyProviderIcon.js).
