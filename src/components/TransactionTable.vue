<template>
  <div class="transaction-table">
    <div class="transaction-row header">
      <div class="transaction-cell">Data</div>
      <div class="transaction-cell">Descrição</div>
      <div class="transaction-cell">Valor</div>
      <div class="transaction-cell">Categoria</div>
      <div class="transaction-cell"></div>
    </div>
    <TransactionRow
      v-for="(transaction, index) in transactions"
      :key="index"
      :transaction="transaction"
      :index="index"
      @edit-category="startEditCategory"
      @remove-transaction="removeTransaction"
    />
  </div>
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
.transaction-table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.transaction-row {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  transition: background 0.3s ease;
}

.transaction-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.transaction-row.header {
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
}

.transaction-cell {
  flex: 1;
  text-align: center;
  padding: 8px;
  word-wrap: break-word;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>