export function createRules (t) {
  return {
    required: err => {
      return v => !!v || err || t('validation.required')
    },

    min_length: min_length => {
      return v =>
        (v && String(v).length >= min_length) ||
        t('validation.min_length', { min_length })
    },

    max_length: min_length => {
      return v =>
        (!v || String(v).length <= min_length) ||
        t('validation.max_length', { min_length })
    },
  }
}
