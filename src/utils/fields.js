export const defaultProps = {
  categorySchema: {type: Object, required: true},

  variant: {type: String, required: true},
  density: {type: String, required: true},
  field: {type: Object, required: true},
  fieldSlug: {type: String, required: true},
  loading: {type: Boolean, required: true},
  isFilter: {type: Boolean, required: false},
  readOnly: {type: Boolean, required: false},
  actionName: {type: String, required: false},
}

const baseFields = {
  type: {type: String, required: true},
  required: {type: Boolean, required: false},
  label: {type: String, required: true},
  help_text: {type: String, required: false},

  write_only: {type: Boolean, required: false},
  read_only: {type: Boolean, required: false},
  update_only: {type: Boolean, required: false},
  create_only: {type: Boolean, required: false},

  initial: {required: false},
}

export function validateProps(comp, compReqFields) {
  if (!comp.field) return

  const fields = {...baseFields, ...(compReqFields || {})}

  for (const [fieldName, fieldSettings] of Object.entries(fields)) {
    const setting = comp.field[fieldName]

    if (!setting && fieldSettings.required) {
      console.error(`Field ${comp.fieldSlug} type ${comp.field.type} attribute not found: "${fieldName}"`)
    }

    if (setting && setting.type && !(fieldSettings instanceof setting.type)) {
      console.error(`Field ${comp.fieldSlug} type ${typeof fieldSettings} is not ${setting.type}`)
    }
  }
}
