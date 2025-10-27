// Kompletni test loto procesa
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFullProcess() {
  try {
    console.log('🎯 Testiranje kompletnog loto procesa...\n');
    
    // 1. Kreiraj novo kolo
    console.log('1️⃣ Kreiranje novog kola...');
    const newRound = await prisma.round.create({
      data: {
        status: "ACTIVE",
        drawnNumbers: []
      }
    });
    console.log(`✅ Kolo #${newRound.id} kreirano (${newRound.status})`);
    
    // 2. Simuliraj uplate listića
    console.log('\n2️⃣ Simuliranje uplata listića...');
    const tickets = [
      { documentId: "12345678901", numbers: [1, 5, 12, 23, 34, 42] },
      { documentId: "98765432109", numbers: [2, 8, 15, 28, 35, 41] },
      { documentId: "55566677788", numbers: [3, 9, 18, 27, 36, 45] }
    ];
    
    for (const ticketData of tickets) {
      const ticket = await prisma.ticket.create({
        data: {
          code: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          documentId: ticketData.documentId,
          numbers: ticketData.numbers,
          roundId: newRound.id
        }
      });
      console.log(`   🎫 Listić ${ticket.code}: ${ticketData.numbers.join(', ')}`);
    }
    
    // 3. Zatvori kolo
    console.log('\n3️⃣ Zatvaranje kola...');
    await prisma.round.update({
      where: { id: newRound.id },
      data: { status: "CLOSED" }
    });
    console.log('✅ Kolo zatvoreno');
    
    // 4. Spremi izvučene brojeve
    console.log('\n4️⃣ Spremanje izvučenih brojeva...');
    const drawnNumbers = [1, 5, 15, 28, 35, 45];
    await prisma.round.update({
      where: { id: newRound.id },
      data: { drawnNumbers: drawnNumbers }
    });
    console.log(`✅ Izvučeni brojevi: ${drawnNumbers.join(', ')}`);
    
    // 5. Analiziraj rezultate
    console.log('\n5️⃣ Analiza rezultata...');
    const allTickets = await prisma.ticket.findMany({
      where: { roundId: newRound.id }
    });
    
    console.log('🎫 Rezultati listića:');
    allTickets.forEach(ticket => {
      const userNumbers = ticket.numbers;
      const matches = userNumbers.filter(num => drawnNumbers.includes(num));
      console.log(`   ${ticket.code}: ${userNumbers.join(', ')} → ${matches.length} pogodaka (${matches.join(', ') || 'nema'})`);
    });
    
    console.log('\n🎉 Test završen uspješno!');
    
  } catch (error) {
    console.error('❌ Greška:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFullProcess();

