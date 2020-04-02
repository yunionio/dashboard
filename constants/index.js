export const RESTART_POLICY_OPTS = {
  deployment: [
    { key: 'Always', label: 'Always' },
  ],
  job: [
    { key: 'Never', label: 'Never' },
    { key: 'OnFailure', label: 'OnFailure' },
  ],
  cronjob: [
    { key: 'Never', label: 'Never' },
    { key: 'OnFailure', label: 'OnFailure' },
  ],
  statefulset: [
    { key: 'Always', label: 'Always' },
  ],
}

export const SECRET_DEFAULT_TYPE = 'kubernetes.io/dockerconfigjson'
