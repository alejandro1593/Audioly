const { Notification, User } = require('../models');

class NotificationService {
  async create({ userId, actorId, type, entityType, entityId, message }) {
    if (!userId || !actorId || userId === actorId) return null;

    return Notification.create({
      userId,
      actorId,
      type,
      entityType,
      entityId,
      message
    });
  }

  async getMine(userId) {
    const notifications = await Notification.findAll({
      where: { userId },
      include: [
        { model: User, as: 'actor', attributes: ['id', 'username', 'avatar'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const unreadCount = await Notification.count({
      where: { userId, readAt: null }
    });

    return { notifications, unreadCount };
  }

  async markAllRead(userId) {
    await Notification.update(
      { readAt: new Date() },
      { where: { userId, readAt: null } }
    );
    return { success: true };
  }

  async markRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });
    if (!notification) {
      const err = new Error('Notificación no encontrada');
      err.statusCode = 404;
      throw err;
    }
    if (!notification.readAt) {
      await notification.update({ readAt: new Date() });
    }
    return notification;
  }
}

module.exports = new NotificationService();