// Script de test pour vérifier la connexion à la base de données
const { PrismaClient } = require('./src/generated/prisma');

async function testConnection() {
  console.log('🔍 Diagnostic de la base de données...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING ? 'Configurée' : 'Non configurée');
  console.log('POSTGRES_URL (pooling):', process.env.POSTGRES_URL ? 'Configurée' : 'Non configurée');
  
  if (process.env.POSTGRES_URL_NON_POOLING) {
    console.log('URL NON_POOLING (masquée):', process.env.POSTGRES_URL_NON_POOLING.replace(/:[^:@]+@/, ':***@'));
  }
  
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Test de connexion à la base de données...');
    
    // Test de connexion simple
    await prisma.$connect();
    console.log('✅ Connexion réussie !');
    
    // Test de requête
    const count = await prisma.gift.count();
    console.log(`✅ Nombre de cadeaux: ${count}`);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('Code d\'erreur:', error.code);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
