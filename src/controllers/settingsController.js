const Setting = require('../models/Setting');

// Obtener tasa BCV (público)
exports.getBcvRate = async (req, res) => {
  try {
    const setting = await Setting.findOne({ where: { key: 'bcv_rate' } });
    const rate = setting ? parseFloat(setting.value) : 45.00;
    
    res.json({
      success: true,
      rate
    });
  } catch (error) {
    console.error('❌ Error al obtener tasa BCV:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la tasa cambiaria'
    });
  }
};

// Actualizar tasa BCV (admin)
exports.updateBcvRate = async (req, res) => {
  try {
    const { rate } = req.body;
    
    if (!rate || isNaN(rate) || parseFloat(rate) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Por favor proporcione una tasa de cambio válida mayor a 0'
      });
    }

    const [setting, created] = await Setting.findOrCreate({
      where: { key: 'bcv_rate' },
      defaults: { value: String(rate) }
    });

    if (!created) {
      setting.value = String(rate);
      await setting.save();
    }

    console.log('✅ Tasa BCV actualizada a:', rate);

    res.json({
      success: true,
      message: 'Tasa cambiaria BCV actualizada correctamente',
      rate: parseFloat(rate)
    });
  } catch (error) {
    console.error('❌ Error al actualizar tasa BCV:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar la tasa cambiaria'
    });
  }
};
