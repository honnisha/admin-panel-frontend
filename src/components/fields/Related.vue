<template>

  <v-autocomplete
    :density="density"
    :variant="variant"
    :clearable="true"
    v-model="value"
    :label="field.label"
    :messages="field.help_text || []"
    :disabled="isReadOnly()"
    :placeholder="$t('inputStringForSearch')"

    :items="choices"
    :multiple="isMany()"
    :loading="loading || apiLoading"
    chips
    closable-chips
    persistent-hint
    no-filter
    hide-selected

    :return-object="false"
    item-value="pk"
    item-title="text"

    :append-inner-icon="isMany() ? 'mdi-relation-many-to-many' : 'mdi-relation-many-to-one'"

    :search="search"
    @update:search="updateSearch"
    @update:modelValue="onChange"
  >
    <template v-slot:chip="{ props, item }">
      <v-chip
        class="autocomplete-chip"
        v-bind="props"
        :text="item.raw.text"
      ></v-chip>
    </template>

    <template v-slot:item="{ props, item }">
      <v-list-item
        v-bind="props"
        :title="item.raw.text"
      ></v-list-item>
    </template>
  </v-autocomplete>

</template>

<script>
import { defaultProps, validateProps } from '/src/utils/fields.js'
import { toast } from "vue3-toastify"

const requiredFields = {
  model_name: {type: String, required: false},
  app_label: {type: String, required: false},
}

export default {
  props: {
    ...defaultProps,
  },
  emits: ["changed"],
  data(props) {
    return {
      value: null,
      formData: null,
      apiLoading: false,
      choices: [],
      search: '',
      init: false,
    }
  },
  created() {
    validateProps(this, requiredFields)
    this.value = this.field.initial

    if (this.relationNameFilter === this.fieldSlug) {
      this.value = this.isMany() ? [this.filterId] : this.filterId
      this.$emit('changed', this.value)
    }

    if (!this.readOnly) {
      this.updateChoices()
    }
  },
  methods: {
    isReadOnly() {
      return this.readOnly || this.relationNameFilter === this.fieldSlug
    },
    updateFormData(initFormData) {
      this.formData = initFormData
      this.value = initFormData[this.fieldSlug]

      if (this.relationNameFilter === this.fieldSlug) {
        this.value = this.isMany() ? [this.filterId] : this.filterId
      }

      // Update choices to get display text
      if (!this.init) {
        this.init = true
        this.updateChoices()
      }
    },
    updateSearch(search) {
      this.search = search
      this.updateChoices()
    },
    updateChoices() {
      if (!this.field.model_name || !this.field.app_label) return

      getAutocomplete({
        model_name: this.field.model_name,
        app_label: this.field.app_label,
        search_string: this.search || '',
        limit: 30,
        viewname: this.viewname,
        field_slug: this.fieldSlug,
        is_filter: this.isFilter,
        form_data: this.formData,
        existed_choices: this.isMany() ? this.value : this.value ? [this.value] : [],
        actionName: this.actionName,
      }).then(response => {
        this.choices = response
        this.apiLoading = false
      }).catch(error => {

        this.apiLoading = false
        let error_message = `Autocomplete ${this.field.model_name}.${this.field.app_label} search:"${this.search}" error:"${error}"`
        console.error(error_message)
        toast(error_message, {
          "limit": 3,
          "theme": "auto",
          "type": "error",
          "position": "top-center",
          "dangerouslyHTMLString": true
        })
      })
    },
    onChange(newValue) {
      this.value = newValue
      this.$emit('changed', this.value)
    },
    isMany() {
      const many = [
        'primarymany',
        'multiple choice',
        'ModelMultipleChoiceFilter',
        'ForeignKey',
        'ManyToManyField',
      ]
      return many.indexOf(this.field.type) !== -1
    },
  },
}
</script>
