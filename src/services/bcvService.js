const cron = require('node-cron');
const Setting = require('../models/Setting');

// Función para consultar la tasa oficial de DolarApi y actualizar la base de datos
async function fetchAndUpdateBCVRate() {
  try {
    console.log('[BCV Service] Iniciando consulta de tasa cambiaria...');
    
    // Hacemos fetch al endpoint de DolarApi Venezuela
    const response = await fetch('https://ve.dolarapi.com/v1/dolares');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Buscamos el elemento de la tasa oficial (BCV)
    const oficialData = data.find(item => item.fuente === 'oficial');
    
    if (oficialData && oficialData.promedio) {
      const bcvRate = parseFloat(oficialData.promedio);
      
      if (bcvRate > 0) {
        // Actualizar o crear en base de datos
        await Setting.upsert({
          key: 'bcv_rate',
          value: bcvRate.toFixed(2)
        });
        
        console.log(`[BCV Service] ✅ Tasa BCV actualizada con éxito a: ${bcvRate.toFixed(2)} Bs/$ (Fuente: DolarApi Oficial)`);
        return bcvRate;
      }
    }
    
    throw new Error('No se encontró la tasa oficial promedio en la respuesta de la API.');
    
  } catch (error) {
    console.error('[BCV Service] ❌ Error actualizando la tasa BCV automáticamente:', error.message);
    
    // Intentamos asegurar que al menos exista un valor por defecto en la BD si está vacío
    try {
      const existing = await Setting.findByPk('bcv_rate');
      if (!existing) {
        await Setting.create({ key: 'bcv_rate', value: '45.00' });
        console.log('[BCV Service] Se inicializó la tasa BCV por defecto (45.00 Bs/$) ante falla de API.');
      }
    } catch (dbErr) {
      console.error('[BCV Service] Error de base de datos:', dbErr.message);
    }
    
    return null;
  }
}

// Inicializar el planificador cron (Lunes a Viernes a las 12:00 AM)
function initBCVScheduler() {
  // Cron Expression: 0 0 * * 1-5 (Minuto 0, Hora 0, todos los días del mes, todos los meses, Lunes a Viernes)
  cron.schedule('0 0 * * 1-5', async () => {
    console.log('[BCV Service] Ejecutando actualización programada de la tasa BCV (Medianoche Lun-Vie)...');
    await fetchAndUpdateBCVRate();
  }, {
    scheduled: true,
    timezone: "America/Caracas" // Asegura que corra a la hora oficial de Venezuela
  });
  
  console.log('[BCV Service] 📅 Programador de Tasa BCV activo (Lunes a Viernes a las 12:00 AM, Hora de Caracas)');
}

module.exports = {
  fetchAndUpdateBCVRate,
  initBCVScheduler
};
