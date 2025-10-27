// Skripta za zatvaranje trenutnog kola
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function closeCurrentRound() {
  try {
    console.log('🔒 Zatvaranje trenutnog kola...');
    
    // Pronađi trenutno kolo
    const current = await prisma.round.findFirst({ 
      orderBy: { id: "desc" } 
    });
    
    if (!current) {
      console.log('❌ Nema postojećih kola');
      return;
    }
    
    console.log(`📊 Trenutno kolo #${current.id}: ${current.status}`);
    
    if (current.status === "CLOSED") {
      console.log('⚠️ Kolo je već zatvoreno');
      return;
    }
    
    // Zatvori kolo
    const updatedRound = await prisma.round.update({
      where: { id: current.id },
      data: { status: "CLOSED" }
    });
    
    console.log(`✅ Kolo #${updatedRound.id} zatvoreno!`);
    console.log(`📅 Status: ${updatedRound.status}`);
    
    // Broj listića u kolu
    const ticketCount = await prisma.ticket.count({
      where: { roundId: current.id }
    });
    
    console.log(`🎫 Broj listića u kolu: ${ticketCount}`);
    
  } catch (error) {
    console.error('❌ Greška:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

closeCurrentRound();

