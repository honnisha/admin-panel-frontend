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

    :return-object="true"
    item-value="key"
    item-title="title"

    :append-inner-icon="isMany() ? 'mdi-relation-many-to-many' : 'mdi-relation-many-to-one'"

    :search="search"
    @update:search="updateSearch"
    @update:modelValue="onChange"
  >
    <template v-slot:chip="{ props, item }">
      <v-chip
        class="autocomplete-chip"
        v-bind="props"
        :text="item.raw.title"
      ></v-chip>
    </template>

    <template v-slot:item="{ props, item }">
      <v-list-item
        v-bind="props"
        :title="item.raw.title"
      ></v-list-item>
    </template>
  </v-autocomplete>

</template>

<script>
import { defaultProps, validateProps } from '/src/utils/fields.js'
import { getTableAutocomplete } from '/src/api/table'
import { toast } from "vue3-toastify"

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
    validateProps(this)
    this.value = this.field.initial

    if (!this.readOnly) {
      this.updateChoices()
    }
  },
  methods: {
    isReadOnly() {
      return this.readOnly
    },
    updateFormData(initFormData) {
      this.formData = initFormData
      this.value = initFormData[this.fieldSlug]

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
      getTableAutocomplete({
        group: this.categorySchema.group,
        category: this.categorySchema.category,

        search_string: this.search || '',
        limit: 30,
        field_slug: this.fieldSlug,
        is_filter: this.isFilter,
        form_data: this.formData || {},
        existed_choices: this.isMany() ? this.value : this.value ? [this.value] : [],
        action_name: this.actionName,
      }).then(response => {
        this.choices = response.data.results
        this.apiLoading = false
      }).catch(error => {

        this.apiLoading = false
        let error_message = `Autocomplete ${this.categorySchema.group}.${this.categorySchema.category} search:"${this.search}" error:"${error}"`
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
