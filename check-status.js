// Skripta za pregled stanja kola i listića
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStatus() {
  try {
    console.log('📊 Pregled stanja aplikacije...\n');
    
    // Pronađi trenutno kolo
    const current = await prisma.round.findFirst({ 
      orderBy: { id: "desc" } 
    });
    
    if (!current) {
      console.log('❌ Nema postojećih kola');
      return;
    }
    
    console.log(`🎯 Kolo #${current.id}:`);
    console.log(`   📅 Status: ${current.status}`);
    console.log(`   📅 Kreirano: ${new Date(current.createdAt).toLocaleString('hr-HR')}`);
    
    const drawnNumbers = current.drawnNumbers || [];
    if (drawnNumbers.length > 0) {
      console.log(`   🎲 Izvučeni brojevi: ${drawnNumbers.join(', ')}`);
    } else {
      console.log(`   🎲 Izvučeni brojevi: Još nisu objavljeni`);
    }
    
    // Broj listića
    const ticketCount = await prisma.ticket.count({
      where: { roundId: current.id }
    });
    
    console.log(`   🎫 Broj listića: ${ticketCount}`);
    
    // Lista svih kola
    const allRounds = await prisma.round.findMany({
      orderBy: { id: "desc" },
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    });
    
    console.log('\n📋 Sva kola:');
    allRounds.forEach(round => {
      const drawnNumbers = round.drawnNumbers || [];
      console.log(`   #${round.id}: ${round.status} (${round._count.tickets} listića) ${drawnNumbers.length > 0 ? `- ${drawnNumbers.join(', ')}` : ''}`);
    });
    
    // Zadnji listići
    const recentTickets = await prisma.ticket.findMany({
      where: { roundId: current.id },
      orderBy: { createdAt: "desc" },
      take: 5
    });
    
    if (recentTickets.length > 0) {
      console.log('\n🎫 Zadnji listići:');
      recentTickets.forEach(ticket => {
        const numbers = ticket.numbers;
        console.log(`   ${ticket.code}: ${numbers.join(', ')} (${ticket.documentId})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Greška:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();

