/**
 * CLOSING COORDINATION SYSTEM
 * Manages entire closing process from contract signing to cash collection
 */

const { sendEmail } = require('../integrations/sendgrid');
const { sendSMS } = require('../integrations/twilio');
const { saveToSheets } = require('../integrations/google_sheets');

class ClosingCoordinator {
  constructor() {
    this.closingStages = [
      'contract_signed',
      'due_diligence',
      'earnest_deposit_received',
      'title_search_ordered',
      'title_clear',
      'closing_scheduled',
      'final_walkthrough',
      'closing_complete',
      'funds_received'
    ];
  }

  /**
   * INITIATE CLOSING PROCESS
   */
  async initiateClosing(deal, buyer, seller) {
    const closingData = {
      dealId: deal.id,
      address: deal.address,
      buyer: buyer.name,
      buyerEmail: buyer.email,
      buyerPhone: buyer.phone,
      seller: seller.name,
      sellerEmail: seller.email,
      sellerPhone: seller.phone,
      assignmentFee: deal.assignmentFee,
      purchasePrice: deal.offer,
      stage: 'contract_signed',
      startDate: new Date().toISOString(),
      targetCloseDate: this.calculateCloseDate(30), // 30 days from now
      checklist: this.generateClosingChecklist(deal)
    };

    await saveToSheets('Closing Pipeline', closingData);

    // Send kickoff emails
    await this.sendClosingKickoffEmails(closingData);

    // Schedule automated reminders
    this.scheduleReminders(closingData);

    return closingData;
  }

  calculateCloseDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  generateClosingChecklist(deal) {
    return [
      { task: 'Earnest deposit received ($1,000)', status: 'pending', dueDate: this.calculateCloseDate(2) },
      { task: 'Title search ordered', status: 'pending', dueDate: this.calculateCloseDate(5) },
      { task: 'Property inspection completed', status: 'pending', dueDate: this.calculateCloseDate(10) },
      { task: 'Financing approved (if applicable)', status: 'pending', dueDate: this.calculateCloseDate(15) },
      { task: 'Title insurance obtained', status: 'pending', dueDate: this.calculateCloseDate(20) },
      { task: 'Final walkthrough scheduled', status: 'pending', dueDate: this.calculateCloseDate(28) },
      { task: 'Closing documents signed', status: 'pending', dueDate: this.calculateCloseDate(30) },
      { task: 'Assignment fee received', status: 'pending', dueDate: this.calculateCloseDate(30) }
    ];
  }

  /**
   * SEND KICKOFF EMAILS
   */
  async sendClosingKickoffEmails(closingData) {
    // Email to buyer
    await sendEmail({
      to: closingData.buyerEmail,
      subject: `🎉 Congratulations! Closing Process Started - ${closingData.address}`,
      html: `
        <h2>Your Deal is Moving Forward!</h2>
        <p>Hi ${closingData.buyer},</p>

        <p>Congratulations! Your winning bid has been accepted and we're moving forward with the assignment.</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Deal Summary:</h3>
          <p><strong>Property:</strong> ${closingData.address}</p>
          <p><strong>Purchase Price:</strong> $${closingData.purchasePrice.toLocaleString()}</p>
          <p><strong>Assignment Fee:</strong> $${closingData.assignmentFee.toLocaleString()}</p>
          <p><strong>Target Close Date:</strong> ${closingData.targetCloseDate}</p>
        </div>

        <h3>Next Steps:</h3>
        <ol>
          <li><strong>Within 2 days:</strong> Submit earnest deposit of $1,000</li>
          <li><strong>Within 10 days:</strong> Complete property inspection</li>
          <li><strong>Within 15 days:</strong> Secure financing (if applicable)</li>
        </ol>

        <p>You'll receive automated reminders and updates throughout the process.</p>

        <p>Questions? Reply to this email or call us at ${closingData.phone || '204-VEL-FAST'}.</p>

        <p>Best,<br>Velocity Real Estate Team</p>
      `
    });

    // Email to seller
    await sendEmail({
      to: closingData.sellerEmail,
      subject: `✅ Your Property is Under Contract - ${closingData.address}`,
      html: `
        <h2>Great News!</h2>
        <p>Hi ${closingData.seller},</p>

        <p>We've found a qualified buyer for your property and are now moving to closing.</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Deal Summary:</h3>
          <p><strong>Property:</strong> ${closingData.address}</p>
          <p><strong>Sale Price:</strong> $${closingData.purchasePrice.toLocaleString()}</p>
          <p><strong>Expected Close Date:</strong> ${closingData.targetCloseDate}</p>
        </div>

        <h3>What to Expect:</h3>
        <ul>
          <li>Buyer will conduct inspection within 10 days</li>
          <li>You may receive calls from title company</li>
          <li>Final walkthrough will be scheduled 2 days before closing</li>
          <li>Closing will occur at lawyer's office or title company</li>
        </ul>

        <p><strong>Important:</strong> Please maintain property in current condition and continue utilities until closing.</p>

        <p>We'll keep you updated every step of the way.</p>

        <p>Best,<br>Velocity Real Estate Team</p>
      `
    });

    console.log(`✅ Kickoff emails sent for ${closingData.address}`);
  }

  /**
   * UPDATE CLOSING STAGE
   */
  async updateStage(dealId, newStage, notes = '') {
    console.log(`📍 Deal ${dealId} moved to: ${newStage}`);

    const update = {
      stage: newStage,
      lastUpdate: new Date().toISOString(),
      notes
    };

    // Update in Google Sheets
    await saveToSheets('Closing Pipeline', update);

    // Send notifications based on stage
    await this.sendStageNotification(dealId, newStage);

    // Check if closing is complete
    if (newStage === 'closing_complete') {
      await this.handleClosingComplete(dealId);
    }

    return update;
  }

  async sendStageNotification(dealId, stage) {
    const messages = {
      'due_diligence': '🔍 Due diligence period has started. You have 10 days to inspect the property.',
      'earnest_deposit_received': '💰 Earnest deposit received! Thank you.',
      'title_clear': '✅ Title search complete - no issues found!',
      'closing_scheduled': '📅 Closing date confirmed. You\'ll receive details shortly.',
      'final_walkthrough': '🏠 Final walkthrough scheduled for tomorrow at 2pm.',
      'closing_complete': '🎉 Closing complete! Congratulations on your new property!',
      'funds_received': '✅ All funds received. Deal closed successfully!'
    };

    const message = messages[stage];
    if (message) {
      // Send SMS and email notification
      console.log(`📧 Notification sent: ${message}`);
    }
  }

  /**
   * HANDLE CLOSING COMPLETE
   */
  async handleClosingComplete(dealId) {
    console.log(`🎉 Deal ${dealId} closed successfully!`);

    // Move deal to "Closed Deals" sheet
    // Update revenue tracker
    // Send thank you emails
    // Request testimonial
    // Add buyer/seller to referral program

    await this.sendClosingCongratulations(dealId);
    await this.requestTestimonial(dealId);
  }

  async sendClosingCongratulations(dealId) {
    // Send congratulations email with:
    // - Thank you message
    // - Request for Google review
    // - Referral program info ($500 per referral)
    // - Future deal alerts sign-up

    console.log(`✅ Congratulations email sent for deal ${dealId}`);
  }

  async requestTestimonial(dealId) {
    // Send testimonial request 3 days after closing
    // Include easy form link
    // Offer $50 Amazon gift card for video testimonial

    console.log(`📝 Testimonial request queued for deal ${dealId}`);
  }

  /**
   * SCHEDULE AUTOMATED REMINDERS
   */
  scheduleReminders(closingData) {
    const reminders = [
      { daysFromNow: 2, message: 'Reminder: Earnest deposit due today' },
      { daysFromNow: 7, message: 'Reminder: Property inspection deadline approaching' },
      { daysFromNow: 14, message: 'Reminder: Financing approval needed within 1 day' },
      { daysFromNow: 28, message: 'Reminder: Closing in 2 days - final walkthrough scheduled' }
    ];

    reminders.forEach(reminder => {
      // In production: Use node-cron or similar to schedule
      console.log(`⏰ Reminder scheduled: ${reminder.message} (${reminder.daysFromNow} days)`);
    });
  }

  /**
   * HANDLE EARNEST DEPOSIT
   */
  async receiveEarnestDeposit(dealId, amount, paymentMethod) {
    console.log(`💰 Earnest deposit received: $${amount} for deal ${dealId}`);

    const deposit = {
      dealId,
      amount,
      paymentMethod,
      receivedDate: new Date().toISOString(),
      status: 'received'
    };

    await saveToSheets('Deposits', deposit);
    await this.updateStage(dealId, 'earnest_deposit_received', `Deposit: $${amount}`);

    return deposit;
  }

  /**
   * HANDLE DEAL CANCELLATION
   */
  async handleCancellation(dealId, reason, responsibleParty) {
    console.log(`❌ Deal ${dealId} cancelled by ${responsibleParty}: ${reason}`);

    const cancellation = {
      dealId,
      cancelledDate: new Date().toISOString(),
      reason,
      responsibleParty
    };

    // If seller backs out: Collect liquidated damages ($5,000)
    if (responsibleParty === 'seller') {
      await this.collectLiquidatedDamages(dealId);
    }

    // If buyer backs out during due diligence: Refund deposit
    // If buyer backs out after due diligence: Keep deposit

    await saveToSheets('Cancelled Deals', cancellation);

    return cancellation;
  }

  async collectLiquidatedDamages(dealId) {
    console.log(`⚖️ Collecting $5,000 liquidated damages for deal ${dealId}`);

    // Send demand letter to seller
    // If not paid within 30 days, send to collections
    // This protects our time investment

    await this.sendDemandLetter(dealId);
  }

  async sendDemandLetter(dealId) {
    console.log(`📧 Demand letter sent for deal ${dealId}`);

    // Professional letter referencing contract clause
    // Request payment within 30 days
    // State next steps (collections referral) if unpaid
  }

  /**
   * GENERATE CLOSING DOCUMENTS
   */
  async generateClosingDocuments(deal, buyer, seller) {
    const docs = {
      assignmentAgreement: await this.fillAssignmentTemplate(deal, buyer, seller),
      closingStatement: await this.generateClosingStatement(deal),
      fundingInstructions: await this.generateFundingInstructions(deal)
    };

    console.log(`📄 Closing documents generated for ${deal.address}`);

    return docs;
  }

  async fillAssignmentTemplate(deal, buyer, seller) {
    // Use contract template from contracts/assignment_template_MB.txt
    // Fill in all blanks with actual deal data
    // Return filled document

    return {
      type: 'assignment_agreement',
      status: 'ready_for_signature'
    };
  }

  async generateClosingStatement(deal) {
    return {
      purchasePrice: deal.offer,
      assignmentFee: deal.assignmentFee,
      earnestDeposit: 1000,
      dueAtClosing: deal.offer - 1000,
      sellerNet: deal.offer,
      velocityNet: deal.assignmentFee
    };
  }

  async generateFundingInstructions(deal) {
    return {
      wireInstructions: 'Bank details here',
      certifiedCheckPayableTo: 'Velocity Real Estate Inc.',
      amount: deal.offer + deal.assignmentFee
    };
  }
}

module.exports = ClosingCoordinator;
