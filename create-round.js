// Skripta za kreiranje novog kola direktno u bazi podataka
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createNewRound() {
  try {
    console.log('🎯 Kreiranje novog kola...');
    
    // Provjeri trenutno stanje
    const current = await prisma.round.findFirst({ 
      orderBy: { id: "desc" } 
    });
    
    if (current) {
      console.log(`📊 Trenutno kolo #${current.id}: ${current.status}`);
    } else {
      console.log('📊 Nema postojećih kola');
    }
    
    // Kreiraj novo kolo
    const newRound = await prisma.round.create({
      data: {
        status: "ACTIVE",
        drawnNumbers: []
      }
    });
    
    console.log(`✅ Novo kolo #${newRound.id} kreirano!`);
    console.log(`📅 Status: ${newRound.status}`);
    console.log(`🎲 Izvučeni brojevi: ${newRound.drawnNumbers}`);
    
    // Broj postojećih listića
    const ticketCount = await prisma.ticket.count({
      where: { roundId: newRound.id }
    });
    
    console.log(`🎫 Broj listića u novom kolu: ${ticketCount}`);
    
  } catch (error) {
    console.error('❌ Greška:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createNewRound();
