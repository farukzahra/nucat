<template>
  <tr>
    <td>{{ formatDate(transaction.date) }}</td>
    <td>{{ transaction.description }}</td>
    <td>{{ formatCurrency(transaction.amount) }}</td>
    <td>
      <v-select
        v-if="editing"
        v-model="selectedCategory"
        :items="categories"
        @update:modelValue="saveCategory"
        @keydown.esc="cancelEdit"
      />
      <v-chip
        v-else
        @click="startEdit"
        :color="categoryColors[transaction.category]"
      >
        {{ transaction.category }}
      </v-chip>
    </td>
    <td>
      <v-btn icon @click="remove" variant="plain">
        <v-icon color="error">mdi-delete</v-icon>
      </v-btn>
    </td>
  </tr>
</template>

<script>
import { stringToColor } from '@/utils/colors-gen';

export default {
  props: {
    transaction: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      editing: false,
      selectedCategory: this.transaction.category,
      originalCategory: this.transaction.category,
    };
  },
  computed: {
    categories() {
      return this.$store.getters.categories.map(item => item.category)
        .filter((value, index, self) => self.indexOf(value) === index);
    },
    categoryColors() {
      const colors = {};
      if (this.$store.getters.categories) {
        this.$store.getters.categories.forEach(category => {
          colors[category.category] = stringToColor(category.category);
        });
      }
      return colors;
    },
  },
  methods: {
    startEdit() {
      this.editing = true;
      this.originalCategory = this.transaction.category;
    },
    saveCategory() {
      if (this.selectedCategory !== this.originalCategory) {
        this.$emit('edit-category', this.index, this.selectedCategory);
      }
      this.editing = false;
    },
    cancelEdit() {
      this.selectedCategory = this.originalCategory;
      this.editing = false;
    },
    remove() {
      this.$emit('remove-transaction', this.index);
    },
    formatDate(dateString) {
      if (!dateString) return "-";
      return `${dateString.substring(6, 8)}/${dateString.substring(4, 6)}/${dateString.substring(0, 4)}`;
    },
    formatCurrency(value) {
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    },
  },
};
</script>

<style scoped>
</style>