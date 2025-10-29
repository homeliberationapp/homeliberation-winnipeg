/**
 * API ENDPOINTS FOR ADMIN HOLD SYSTEM
 * Handles hold, release, self-purchase operations
 */

const adminHoldSystem = require('../../bots/admin_hold_system');

module.exports = {

  /**
   * HOLD PROPERTY
   * POST /api/admin/hold-property
   */
  async holdProperty(req, res) {
    try {
      const { propertyId, reason, holdUntilTimestamp } = req.body;

      if (!propertyId || !reason) {
        return res.status(400).json({
          error: 'propertyId and reason are required'
        });
      }

      const result = await adminHoldSystem.holdProperty(
        propertyId,
        reason,
        holdUntilTimestamp
      );

      return res.status(200).json(result);

    } catch (error) {
      console.error('Error holding property:', error);
      return res.status(500).json({
        error: 'Failed to hold property',
        message: error.message
      });
    }
  },

  /**
   * SELF-PURCHASE
   * POST /api/admin/self-purchase
   */
  async selfPurchase(req, res) {
    try {
      const { propertyId, notes } = req.body;

      if (!propertyId) {
        return res.status(400).json({
          error: 'propertyId is required'
        });
      }

      const result = await adminHoldSystem.markSelfPurchase(
        propertyId,
        notes
      );

      return res.status(200).json(result);

    } catch (error) {
      console.error('Error marking self-purchase:', error);
      return res.status(500).json({
        error: 'Failed to mark self-purchase',
        message: error.message
      });
    }
  },

  /**
   * RELEASE PROPERTY
   * POST /api/admin/release-property
   */
  async releaseProperty(req, res) {
    try {
      const { propertyId, releaseNotes } = req.body;

      if (!propertyId) {
        return res.status(400).json({
          error: 'propertyId is required'
        });
      }

      const result = await adminHoldSystem.releaseProperty(
        propertyId,
        releaseNotes
      );

      return res.status(200).json(result);

    } catch (error) {
      console.error('Error releasing property:', error);
      return res.status(500).json({
        error: 'Failed to release property',
        message: error.message
      });
    }
  },

  /**
   * EXTEND HOLD
   * POST /api/admin/extend-hold
   */
  async extendHold(req, res) {
    try {
      const { propertyId, additionalHours } = req.body;

      if (!propertyId || !additionalHours) {
        return res.status(400).json({
          error: 'propertyId and additionalHours are required'
        });
      }

      const result = await adminHoldSystem.extendHold(
        propertyId,
        additionalHours
      );

      return res.status(200).json(result);

    } catch (error) {
      console.error('Error extending hold:', error);
      return res.status(500).json({
        error: 'Failed to extend hold',
        message: error.message
      });
    }
  },

  /**
   * GET HELD PROPERTIES
   * GET /api/admin/held-properties
   */
  async getHeldProperties(req, res) {
    try {
      const properties = await adminHoldSystem.getHeldProperties();

      return res.status(200).json(properties);

    } catch (error) {
      console.error('Error fetching held properties:', error);
      return res.status(500).json({
        error: 'Failed to fetch held properties',
        message: error.message
      });
    }
  },

  /**
   * SAVE AUTO-HOLD RULES
   * POST /api/admin/save-hold-rules
   */
  async saveHoldRules(req, res) {
    try {
      const { rules } = req.body;

      if (!rules) {
        return res.status(400).json({
          error: 'rules object is required'
        });
      }

      const result = await adminHoldSystem.setAutoHoldRules(rules);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Error saving hold rules:', error);
      return res.status(500).json({
        error: 'Failed to save hold rules',
        message: error.message
      });
    }
  },

  /**
   * GET AUTO-HOLD RULES
   * GET /api/admin/get-hold-rules
   */
  async getHoldRules(req, res) {
    try {
      const rules = adminHoldSystem.autoHoldRules;

      return res.status(200).json(rules);

    } catch (error) {
      console.error('Error fetching hold rules:', error);
      return res.status(500).json({
        error: 'Failed to fetch hold rules',
        message: error.message
      });
    }
  },

  /**
   * GET HOLD STATISTICS
   * GET /api/admin/hold-stats
   */
  async getHoldStatistics(req, res) {
    try {
      const stats = await adminHoldSystem.getStatistics();

      return res.status(200).json(stats);

    } catch (error) {
      console.error('Error fetching hold statistics:', error);
      return res.status(500).json({
        error: 'Failed to fetch statistics',
        message: error.message
      });
    }
  }

};
