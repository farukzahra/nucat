<template>
  <div class="container">
    <div v-if="!user">
      <LoginButton @login-success="handleLoginSuccess" />
    </div>
    <div v-else>
      <LogoutButton @logout-success="handleLogoutSuccess" />
      <div class="logo">
        <img src="@/assets/logo.jpg" alt="Logo" class="logo-image" />
      </div>
      <FileUpload @file-uploaded="handleFileUpload" />
      <PieChart v-if="transactions.length" :transactions="transactions" :category-colors="categoryColors" />
      <TransactionTable v-if="transactions.length" :transactions="transactions" @edit-category="saveCategory"
        @remove-transaction="removeTransaction" />
    </div>
  </div>
</template>

<script>
import { auth, db, doc, setDoc, getDoc } from "@/firebase";
import { XMLParser } from "fast-xml-parser";
import LoginButton from "@/components/LoginButton.vue";
import LogoutButton from "@/components/LogoutButton.vue";
import FileUpload from "@/components/FileUpload.vue";
import PieChart from "@/components/PieChart.vue";
import TransactionTable from "@/components/TransactionTable.vue";
import { categories } from "@/assets/categories";
import { mapState, mapActions } from 'vuex';

export default {
  components: {
    LoginButton,
    LogoutButton,
    FileUpload,
    PieChart,
    TransactionTable,
  },
  data() {
    return {
      categoryColors: {
        "Alimentação": "#FF6384",
        "Transporte": "#36A2EB",
        "Saúde": "#4BC0C0",
        "Lazer": "#FFCE56",
        "Educação": "#9966FF",
        "Compras": "#FF9F40",
        "Outros": "#C9CBCF",
      },
    };
  },
  computed: {
    ...mapState(['user', 'transactions']),
  },
  async created() {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        await this.loadUserAndTransactions(user);
      } else {
        this.$store.commit('SET_USER', null);
        this.$store.commit('SET_TRANSACTIONS', []);
      }
    });
  },
  methods: {
    ...mapActions(['loadUserAndTransactions', 'logout']),
    async handleLoginSuccess(user) {
      await this.loadUserAndTransactions(user);
    },
    async handleFileUpload(file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target.result;
        try {
          const parser = new XMLParser();
          const jsonData = parser.parse(content);
          const transactions = jsonData.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN || [];
          this.transactions = this.processTransactions(transactions);

          if (this.user) {
            await this.saveTransactions(this.user.uid, this.transactions);
          }
        } catch (error) {
          console.error("Erro ao processar OFX", error);
        }
      };
      reader.readAsText(file);
    },
    async saveTransactions(userId, transactions) {
      try {
        const userTransactionsRef = doc(db, "transactions", userId);
        await setDoc(userTransactionsRef, { transactions }, { merge: true });
      } catch (error) {
        console.error("Erro ao salvar transações:", error);
      }
    },
    async loadTransactions(userId) {
      try {
        const userTransactionsRef = doc(db, "transactions", userId);
        const docSnap = await getDoc(userTransactionsRef);
        if (docSnap.exists()) {
          this.transactions = docSnap.data().transactions.filter(tx => tx.amount < 0);
        }
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      }
    },
    processTransactions(transactions) {

      const processedTransactions = transactions
        .filter(tx => parseFloat(tx.TRNAMT) < 0)
        .map((tx) => ({
          date: tx.DTPOSTED,
          amount: parseFloat(tx.TRNAMT),
          description: tx.MEMO || 'Sem descrição',
          category: this.inferCategory(tx.MEMO || ''),
        }));

      const formattedTransactions = processedTransactions.map(tx => ({
        ...tx,
        description: (tx.description || '') 
          .replace(/Compra no débito - /g, '[DÉBITO] ')
          .replace(/Pagamento de boleto efetuado - /g, '[BOLETO] '),
      }));

      this.$store.commit('SET_TRANSACTIONS', formattedTransactions);
    },
    inferCategory(description) {
      description = description.toLowerCase();
      for (const { keyword, category } of categories) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(description)) {
          return category;
        }
      }
      return 'Outros';
    },
    async saveCategory(index, newCategory) {
      this.$store.commit('UPDATE_TRANSACTION_CATEGORY', { index, category: newCategory });
    },
    async removeTransaction(index) {
      if (confirm('Tem certeza que deseja remover esta transação?')) {
        this.$store.commit('REMOVE_TRANSACTION', index);
      }
    },
  },
};
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 900px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  text-align: center;
  position: relative;
}

.logo {
  margin-bottom: 20px;
}

.logo-image {
  max-width: 10%;
  height: auto;
}
</style>