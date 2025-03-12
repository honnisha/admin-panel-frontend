<template>

  <div class="filters-container">

    <div class="filter-element" v-if="getTableInfo().search">
      <v-text-field
        density="compact"
        variant="solo"
        prepend-inner-icon="mdi-magnify"

        v-model="filterInfo.search"
        :clearable="true"
        :label="$t('search')"
        @keydown.enter.prevent="applyFilter"
      />
    </div>

    <div
      v-for="(filter, filter_name) in getTableInfo().table_filters"
      v-bind:key="filter_name"
      class="filter-element"
    >
      <component
        v-if="getFieldComponent(filter)"
        :is="getFieldComponent(filter)"

        density="compact"
        variant="solo"

        :group="group"
        :category="category"

        :field="filter"
        :field-slug="filter_name"
        :loading="false"
        :is-filter="true"

        @changed="value => _updateValue(value, filter_name)"
        @keydown.enter.prevent="applyFilter"
      />
    </div>

    <!--
    <div class="filter-button">
      <v-btn
        variant="outlined"
        density="compact"
        class="button-icon"
        @click="applyFilter"
        color="secondary"
        icon="mdi-cog-outline"
      />
    </div>
    -->

    <div class="filter-button">
      <v-btn
        @click="applyFilter"
        color="secondary"
        prepend-icon="mdi-magnify"
        :disabled="loading"
      >{{ $t('apply') }}</v-btn>
    </div>
  </div>

</template>

<script>
import { CategorySchema } from '/src/api/scheme'
import BooleanFilter from '/src/components/fields/BooleanFilter.vue'
import StringField from '/src/components/fields/String.vue'
import NumberField from '/src/components/fields/Number.vue'
import ChoiceField from '/src/components/fields/Choice.vue'
import RelatedField from '/src/components/fields/Related.vue'
import DateTimeField from '/src/components/fields/DateTime.vue'

export default {
  props: {
    group: {type: String, required: true},
    category: {type: String, required: true},

    categorySchema: {type: CategorySchema, required: true},
    loading: {type: Boolean, required: false},

    filterInfoInit: {type: Object, required: false},
  },
  emits: ["filtered"],
  data() {
    return {
      filterInfo: {},
    }
  },
  created() {
    if (this.filterInfoInit) {
      this.filterInfo = this.filterInfoInit
    }
  },
  methods: {
    getTableInfo() {
      return this.categorySchema.getTableInfo()
    },
    getFieldComponent(filter) {
      const related = [
        'ForeignKey',
        'ModelChoiceFilter',
        'ManyToManyField',
        'OneToOneField',
        'ManyToManyRel',
        'ModelMultipleChoiceFilter',
        'ManyRelatedField',
        'AdminManyRelatedField',
        'AdminPrimaryKeyRelatedField',
      ]
      const datetime = [
        'DateTimeField',
        'DateFromToRangeFilter',
        'AdminDateFromToRangeFilter',
        'DateTimeFilter',
        'TimeField',
        'TimeFilter',
      ]

      if (['ChoiceFilter'].indexOf(filter._slug) !== -1 || filter.choices) return ChoiceField

      if (datetime.indexOf(filter._slug) !== -1) return DateTimeField
      if (related.indexOf(filter._slug) !== -1) return RelatedField
      if (['string'].indexOf(filter._slug) !== -1) return StringField
      if (['integer'].indexOf(filter._slug) !== -1) return NumberField
      if (['boolean'].indexOf(filter._slug) !== -1) return BooleanFilter
    },
    _updateValue(value, filter_name) {
      this.filterInfo.filters[filter_name] = value
    },
    applyFilter() {
      if (this.loading) return
      this.$emit('filtered', this.filterInfo)
    },
  },
}
</script>
