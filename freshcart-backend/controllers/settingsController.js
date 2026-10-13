const UserSettings = require("../models/UserSettings");

// =====================================================
// GET SETTINGS
// =====================================================

const getSettings = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log("GET SETTINGS USER ID:", userId);

    let settings = await UserSettings.findOne({ userId });

    // Create default settings if user has no settings
    if (!settings) {
      settings = await UserSettings.create({
        userId: userId,

        notifications: {
          orderUpdates: true,
          promotions: true,
          newProducts: true,
        },

        appearance: {
          darkMode: false,
        },

        language: "en",
      });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get settings",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE SETTINGS
// =====================================================

const updateSettings = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log("UPDATE SETTINGS USER ID:", userId);
    console.log("SETTINGS BODY:", req.body);

    let settings = await UserSettings.findOne({ userId });

    // =================================================
    // CREATE SETTINGS IF NOT EXISTS
    // =================================================

    if (!settings) {
      settings = new UserSettings({
        userId: userId,

        notifications: {
          orderUpdates: true,
          promotions: true,
          newProducts: true,
        },

        appearance: {
          darkMode: false,
        },

        language: "en",
      });
    }

    // =================================================
    // NOTIFICATIONS
    // =================================================

    if (req.body.notifications) {
      if (
        req.body.notifications.orderUpdates !== undefined
      ) {
        settings.notifications.orderUpdates =
          Boolean(req.body.notifications.orderUpdates);
      }

      if (
        req.body.notifications.promotions !== undefined
      ) {
        settings.notifications.promotions =
          Boolean(req.body.notifications.promotions);
      }

      if (
        req.body.notifications.newProducts !== undefined
      ) {
        settings.notifications.newProducts =
          Boolean(req.body.notifications.newProducts);
      }
    }

    // =================================================
    // APPEARANCE / DARK MODE
    // =================================================

    if (req.body.appearance) {
      if (req.body.appearance.darkMode !== undefined) {
        settings.appearance.darkMode =
          Boolean(req.body.appearance.darkMode);
      }
    }

    // =================================================
    // LANGUAGE
    // =================================================

    if (req.body.language !== undefined) {
      if (
        req.body.language === "en" ||
        req.body.language === "si"
      ) {
        settings.language = req.body.language;
      }
    }

    // Make sure userId is always present
    settings.userId = userId;

    await settings.save();

    console.log("SETTINGS SAVED:", settings);

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};

