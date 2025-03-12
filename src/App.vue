<template>
  <v-responsive class="border rounded">

    <v-app>
      <v-main>
        <v-container fluid>
          <v-row>
            <v-col>
              <div v-if="!user">
                <LoginButton @login-success="handleLoginSuccess" />
              </div>
              <div v-else>
                <v-row>
                  <v-col>
                    <v-img src="logo.jpg" class="logo-image" />
                  </v-col>
                  <v-col cols="8">
                    <FileUpload @file-uploaded="handleFileUpload" />
                  </v-col>
                  <v-col>
                    <LogoutButton @logout-success="handleLogoutSuccess" />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <PieChart v-if="transactions.length" :transactions="transactions"
                      :category-colors="categoryColors" />
                    <TransactionTable v-if="transactions.length" :transactions="transactions"
                      @edit-category="saveCategory" @remove-transaction="removeTransaction" />
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>

<script>
import { auth, db, doc, setDoc, getDoc } from "@/firebase";
import { XMLParser } from "fast-xml-parser";
import LoginButton from "@/components/LoginButton.vue";
import LogoutButton from "@/components/LogoutButton.vue";
import FileUpload from "@/components/FileUpload.vue";
import PieChart from "@/components/PieChart.vue";
import TransactionTable from "@/components/TransactionTable.vue";
import { mapState, mapActions } from 'vuex';
import { stringToColor } from '@/utils/colors-gen';

export default {
  components: {
    LoginButton,
    LogoutButton,
    FileUpload,
    PieChart,
    TransactionTable,
  },
  computed: {
    ...mapState(['user', 'transactions']),
    categoryColors() {
      return this.generateCategoryColors();
    },
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
          .replace(/Compra no débito - /g, 'DÉBITO - ')
          .replace(/Pagamento de boleto efetuado - /g, 'BOLETO - ')
          .replace(/Transferência enviada pelo Pix - ([^-]+) - .*/, 'Pix para $1'),
      }));

      this.$store.commit('SET_TRANSACTIONS', formattedTransactions);
    },
    inferCategory(description) {
      description = description.toLowerCase();
      for (const { keyword, category } of this.$store.getters.categories) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(description)) {
          return category;
        }
      }
      return 'Outros';
    },
    async saveCategory(index, newCategory) {
      this.$store.commit('UPDATE_TRANSACTION_CATEGORY', { index, category: newCategory });
      const userId = this.user.uid;
      const transactions = this.transactions;
      await this.saveTransactions(userId, transactions);
    },
    async removeTransaction(index) {
      if (confirm('Tem certeza que deseja remover esta transação?')) {
        this.$store.commit('REMOVE_TRANSACTION', index);
      }
    },
    generateCategoryColors() {
      const colors = {};
      if (this.$store.getters.categories) {
        this.$store.getters.categories.forEach(category => {
          colors[category.category] = stringToColor(category.category);
        });
      }
      return colors;
    },
  },
};
</script>

<style scoped>
.logo-image {
  max-width: 100px;
  margin-bottom: 20px;
}
</style>