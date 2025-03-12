<template>
  <v-table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Descrição</th>
        <th>Valor</th>
        <th>Categoria</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      <TransactionRow
        v-for="(transaction, index) in transactions"
        :key="index"
        :transaction="transaction"
        :index="index"
        @edit-category="startEditCategory"
        @remove-transaction="removeTransaction"
      />
    </tbody>
  </v-table>
</template>

<script>
import TransactionRow from './TransactionRow.vue';

export default {
  components: {
    TransactionRow,
  },
  props: {
    transactions: {
      type: Array,
      required: true,
    },
  },
  methods: {
    startEditCategory(index, selectedCategory) {
      this.$emit('edit-category', index, selectedCategory);
    },
    removeTransaction(index) {
      this.$emit('remove-transaction', index);
    },
  },
};
</script>

<style scoped>
</style>