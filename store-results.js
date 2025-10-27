// Skripta za spremanje izvučenih brojeva
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function storeResults(numbers) {
  try {
    console.log('🎲 Spremanje izvučenih brojeva...');
    console.log(`📊 Brojevi: ${numbers.join(', ')}`);
    
    // Pronađi trenutno kolo
    const current = await prisma.round.findFirst({ 
      orderBy: { id: "desc" } 
    });
    
    if (!current) {
      console.log('❌ Nema postojećih kola');
      return;
    }
    
    console.log(`📊 Trenutno kolo #${current.id}: ${current.status}`);
    
    if (current.status !== "CLOSED") {
      console.log('❌ Kolo mora biti zatvoreno prije spremanja rezultata');
      return;
    }
    
    const drawnNumbers = current.drawnNumbers || [];
    if (drawnNumbers.length > 0) {
      console.log('❌ Rezultati su već spremljeni za ovo kolo');
      return;
    }
    
    // Spremi rezultate
    const updatedRound = await prisma.round.update({
      where: { id: current.id },
      data: { drawnNumbers: numbers }
    });
    
    console.log(`✅ Rezultati spremljeni za kolo #${updatedRound.id}!`);
    console.log(`🎲 Izvučeni brojevi: ${numbers.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Greška:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Primjer korištenja - zamijenite s vlastitim brojevima
const exampleNumbers = [1, 5, 12, 23, 34, 42];
storeResults(exampleNumbers);

