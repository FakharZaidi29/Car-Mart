const ActivityLog = require('../models/ActivityLog');

const log = async (adminId, adminName, action, description) => {
  try {
    await ActivityLog.create({ adminId, adminName, action, description });
  } catch {}
};

module.exports = log;
