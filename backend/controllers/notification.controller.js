const NotificationService = require('../services/notification.service');
const asyncHandler = require('../utils/asyncHandler');

class NotificationController {
  getMine = asyncHandler(async (req, res) => {
    const result = await NotificationService.getMine(req.user.id);
    res.json({ success: true, ...result });
  });

  markAllRead = asyncHandler(async (req, res) => {
    const result = await NotificationService.markAllRead(req.user.id);
    res.json({ success: true, ...result });
  });

  markRead = asyncHandler(async (req, res) => {
    const notification = await NotificationService.markRead(req.params.id, req.user.id);
    res.json({ success: true, notification });
  });
}

module.exports = new NotificationController();