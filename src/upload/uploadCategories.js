const admin = require('firebase-admin');
const categories = require('./categories.js'); // Importa o arquivo categories.js

// Inicializa o Firebase Admin SDK com as credenciais
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function uploadCategories() {
  try {
    const categoriesCollection = db.collection('categories');

    // 1. Deletar todas as categorias existentes
    const snapshot = await categoriesCollection.get();
    const batch = db.batch(); // Usamos um batch para deletar em lote

    snapshot.forEach((doc) => {
      batch.delete(doc.ref); // Adiciona cada documento ao batch de deleção
    });

    await batch.commit(); // Executa a deleção em lote
    console.log('Todas as categorias existentes foram deletadas.');

    // 2. Remover categorias duplicadas
    const uniqueCategories = removeDuplicates(categories);

    // 3. Fazer o upload das novas categorias
    for (const category of uniqueCategories) {
      await categoriesCollection.add(category);
      console.log(`Categoria adicionada: ${category.keyword} -> ${category.category}`);
    }

    console.log('Carga de categorias concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
}

// Função para remover categorias duplicadas
function removeDuplicates(categories) {
  const uniqueCategories = [];
  const seenKeywords = new Set(); // Usamos um Set para rastrear palavras-chave únicas

  for (const category of categories) {
    if (!seenKeywords.has(category.keyword)) {
      seenKeywords.add(category.keyword); // Adiciona a palavra-chave ao Set
      uniqueCategories.push(category); // Adiciona a categoria à lista única
    }
  }

  return uniqueCategories;
}

uploadCategories();