/**
 * AUTOMATED CUSTOMER SUPPORT SYSTEM
 * Handles FAQs, responses, and support tickets automatically
 */

const { sendEmail } = require('../integrations/sendgrid');
const { sendSMS } = require('../integrations/twilio');

class CustomerSupport {
  constructor() {
    this.faqDatabase = this.loadFAQs();
    this.autoResponders = this.setupAutoResponders();
  }

  loadFAQs() {
    return {
      seller: {
        'how_does_it_work': {
          question: 'How does your process work?',
          answer: `Simple 3-step process:
1. Submit your property details (2 minutes)
2. Receive cash offer within 24 hours
3. Choose your closing date (as fast as 7 days)

We handle all paperwork, no commissions, no repairs needed.`
        },
        'what_offer_can_i_expect': {
          question: 'How much will you offer for my house?',
          answer: `Our offers are based on:
- Current market value (ARV)
- Condition of the property
- Needed repairs
- Market demand

Typically 70-85% of market value for properties needing work.
Houses in great condition may get higher offers.

Submit your property for a FREE no-obligation offer.`
        },
        'do_i_pay_commission': {
          question: 'Do I pay any commissions or fees?',
          answer: `NO commissions or hidden fees.

The offer you receive is the amount you'll get at closing.

We make money by finding investor buyers, not by charging you fees.`
        },
        'how_fast_can_you_close': {
          question: 'How quickly can we close?',
          answer: `You choose the timeline:
- As fast as 7 days
- Or schedule closing 3-6 months out

Common timelines:
- Need to move quickly: 7-14 days
- Need time to find new place: 30-60 days
- Inherited property out of state: Flexible

We work on YOUR timeline.`
        },
        'what_if_i_owe_more_than_house_worth': {
          question: 'I owe more than my house is worth. Can you still help?',
          answer: `Possibly. Options include:

1. Short sale (if bank agrees to discount)
2. Loan assumption (buyer takes over mortgage)
3. Subject-to purchase

We'll review your situation for free and present all options.

Submit your property and mention the mortgage balance in notes.`
        },
        'is_this_legit': {
          question: 'Is this legitimate? How do I know you\'re not a scam?',
          answer: `Great question! Here's how you know we're legit:

✅ Registered business (Manitoba)
✅ Verifiable company address
✅ Real testimonials from past clients
✅ Professional legal contracts
✅ NO upfront fees ever
✅ Close at lawyer's office or title company

We NEVER ask for money upfront. You only sign when you're ready.`
        }
      },

      buyer: {
        'how_do_i_get_deals': {
          question: 'How do I access deals?',
          answer: `Sign up for free beta access:

1. Create account at velocityrealestate.ca/investors
2. Browse active deals immediately
3. Submit bids on properties you like
4. Get notified when new deals match your criteria

Premium members get 48-hour exclusive access before free members.`
        },
        'what_are_profit_margins': {
          question: 'What kind of profit margins should I expect?',
          answer: `Our deals typically offer:

📊 15-25% profit margin after:
- Purchase price
- Repairs
- Holding costs
- Assignment fee

Example:
ARV: $300,000
All-in cost: $240,000
Profit potential: $60,000 (20%)

We pre-screen all deals to ensure buyer profitability.`
        },
        'can_i_inspect_before_bidding': {
          question: 'Can I inspect the property before bidding?',
          answer: `YES - absolutely required!

Process:
1. Submit bid
2. If accepted, you have 10-day due diligence period
3. Inspect property, review title, get appraisal
4. If not satisfied, cancel with full refund

We encourage thorough inspection. We want successful deals, not regrets.`
        },
        'what_if_i_back_out': {
          question: 'What if I need to back out of a deal?',
          answer: `During due diligence (10 days): Full refund, no questions asked.

After due diligence: Earnest deposit may be non-refundable.

We recommend:
- Thorough inspection
- Get contractor estimates
- Verify financing
- Review all numbers carefully

Take the full 10 days to decide.`
        },
        'do_i_need_cash_or_can_i_finance': {
          question: 'Do I need cash or can I get financing?',
          answer: `Both options work:

💰 Cash buyers:
- Faster closing
- No appraisal needed
- Stronger negotiating position

🏦 Financing:
- Conventional loans (owner-occupied)
- Hard money loans (investors)
- Private money

Must be pre-approved before bidding.`
        }
      },

      general: {
        'what_is_wholesaling': {
          question: 'What is wholesale real estate?',
          answer: `Wholesaling = connecting motivated sellers with investor buyers.

We:
1. Find sellers who need quick sales
2. Negotiate purchase contract
3. Find qualified investor buyer
4. Assign contract to buyer
5. Buyer closes directly with seller

Everyone wins:
✅ Seller gets quick cash sale
✅ Buyer gets below-market deal
✅ We earn assignment fee for facilitating`
        },
        'are_you_licensed_agents': {
          question: 'Are you licensed real estate agents?',
          answer: `No, we are NOT licensed real estate agents.

We are wholesale investors operating under assignment contracts.

We do NOT:
- List properties on MLS
- Act as buyer's or seller's agent
- Provide real estate advice

We DO:
- Make direct offers to purchase
- Connect buyers with sellers
- Facilitate wholesale transactions

All contracts are reviewed by legal counsel.`
        }
      }
    };
  }

  setupAutoResponders() {
    return {
      'new_seller_lead': this.respondToNewSellerLead.bind(this),
      'new_buyer_signup': this.respondToNewBuyerSignup.bind(this),
      'bid_submitted': this.respondToBidSubmission.bind(this),
      'deal_question': this.respondToDealQuestion.bind(this),
      'general_inquiry': this.respondToGeneralInquiry.bind(this)
    };
  }

  /**
   * AUTO-RESPOND TO COMMON QUESTIONS
   */
  async handleInquiry(inquiry) {
    const { type, question, email, name, userType } = inquiry;

    // Try to find matching FAQ
    const faq = this.findMatchingFAQ(question, userType);

    if (faq) {
      // Send automated response
      await this.sendAutoResponse(email, name, faq);
      return { handled: true, method: 'auto', faq };
    } else {
      // Create support ticket for manual response
      await this.createSupportTicket(inquiry);
      return { handled: false, method: 'manual', ticket: 'created' };
    }
  }

  findMatchingFAQ(question, userType = 'general') {
    const keywords = {
      'how_does_it_work': ['process', 'how does', 'how it works', 'steps'],
      'what_offer_can_i_expect': ['offer', 'price', 'how much', 'value'],
      'do_i_pay_commission': ['commission', 'fees', 'cost', 'charge'],
      'how_fast_can_you_close': ['timeline', 'fast', 'quickly', 'closing date'],
      'what_if_i_owe_more_than_house_worth': ['underwater', 'owe more', 'upside down', 'mortgage'],
      'is_this_legit': ['legit', 'scam', 'real', 'trust', 'legitimate'],
      'how_do_i_get_deals': ['access', 'find deals', 'get deals', 'see properties'],
      'what_are_profit_margins': ['profit', 'margin', 'make money', 'return'],
      'can_i_inspect_before_bidding': ['inspect', 'see property', 'walkthrough'],
      'what_if_i_back_out': ['cancel', 'back out', 'refund'],
      'do_i_need_cash_or_can_i_finance': ['financing', 'cash', 'loan', 'mortgage']
    };

    const questionLower = question.toLowerCase();

    for (const [faqKey, keywordList] of Object.entries(keywords)) {
      for (const keyword of keywordList) {
        if (questionLower.includes(keyword)) {
          // Try to find in user-specific FAQs first
          if (this.faqDatabase[userType] && this.faqDatabase[userType][faqKey]) {
            return this.faqDatabase[userType][faqKey];
          }
          // Fall back to general
          if (this.faqDatabase.general[faqKey]) {
            return this.faqDatabase.general[faqKey];
          }
        }
      }
    }

    return null;
  }

  async sendAutoResponse(email, name, faq) {
    await sendEmail({
      to: email,
      subject: `Re: ${faq.question}`,
      html: `
        <p>Hi ${name},</p>

        <p>Thanks for your question!</p>

        <h3>${faq.question}</h3>

        <p style="white-space: pre-line;">${faq.answer}</p>

        <p>Still have questions? Just reply to this email and a team member will respond within 24 hours.</p>

        <p>Best,<br>
        Velocity Real Estate Team<br>
        <a href="https://velocityrealestate.ca">velocityrealestate.ca</a></p>
      `
    });

    console.log(`✅ Auto-response sent to ${email}: ${faq.question}`);
  }

  async createSupportTicket(inquiry) {
    const ticket = {
      id: `TICKET-${Date.now()}`,
      created: new Date().toISOString(),
      type: inquiry.type,
      question: inquiry.question,
      email: inquiry.email,
      name: inquiry.name,
      userType: inquiry.userType,
      status: 'open',
      priority: inquiry.urgent ? 'high' : 'normal'
    };

    // Save to Google Sheets "Support Tickets" tab
    console.log(`🎫 Support ticket created: ${ticket.id}`);

    // Send acknowledgment
    await sendEmail({
      to: inquiry.email,
      subject: 'We received your message',
      html: `
        <p>Hi ${inquiry.name},</p>

        <p>Thanks for reaching out! We've received your message and will respond within 24 hours.</p>

        <p>Your ticket number: <strong>${ticket.id}</strong></p>

        <p>In the meantime, check out our <a href="https://velocityrealestate.ca/faq">FAQ page</a>
        - it might have the answer you're looking for!</p>

        <p>Best,<br>Velocity Real Estate Team</p>
      `
    });

    return ticket;
  }

  /**
   * SPECIFIC AUTO-RESPONDERS
   */
  async respondToNewSellerLead(leadData) {
    await sendEmail({
      to: leadData.email,
      subject: '✅ Property Submission Received - Offer Coming Within 24 Hours',
      html: `
        <h2>Thank You for Submitting Your Property!</h2>

        <p>Hi ${leadData.name},</p>

        <p>We've received your submission for <strong>${leadData.address}</strong>.</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What Happens Next:</h3>
          <ol>
            <li><strong>Today:</strong> Our team researches your property</li>
            <li><strong>Within 24 hours:</strong> You receive our cash offer via email</li>
            <li><strong>You decide:</strong> Accept, negotiate, or decline - no pressure</li>
          </ol>
        </div>

        <p><strong>Questions while you wait?</strong></p>
        <ul>
          <li>📞 Call/Text: ${leadData.contactPhone || '204-VEL-FAST'}</li>
          <li>📧 Email: Just reply to this message</li>
        </ul>

        <p>We're excited to help you achieve your goals!</p>

        <p>Best,<br>Velocity Real Estate Team</p>
      `
    });

    // Send SMS confirmation
    await sendSMS({
      to: leadData.phone,
      message: `Thanks for submitting ${leadData.address}! Expect our cash offer within 24 hours. Questions? Call 204-VEL-FAST.`
    });
  }

  async respondToNewBuyerSignup(buyerData) {
    await sendEmail({
      to: buyerData.email,
      subject: '🎉 Welcome to Velocity Real Estate - Free Beta Access Activated!',
      html: `
        <h2>Welcome Aboard!</h2>

        <p>Hi ${buyerData.name},</p>

        <p>Your investor account is now active with <strong>FREE beta access</strong> for 6 months!</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What You Get:</h3>
          ✅ Access to all wholesale deals<br>
          ✅ Email alerts for new properties<br>
          ✅ Bid on unlimited deals<br>
          ✅ 10-day due diligence period<br>
          ✅ Professional support team<br>
          <br>
          <strong>No payment required until ${this.calculateBetaEndDate()}</strong>
        </div>

        <h3>Get Started:</h3>
        <p>👉 <a href="https://velocityrealestate.ca/investors/dashboard">View Active Deals</a></p>

        <p>We currently have <strong>3 active deals</strong> ready for your review!</p>

        <p>Questions? Reply to this email anytime.</p>

        <p>Happy investing!<br>
        Velocity Real Estate Team</p>
      `
    });
  }

  calculateBetaEndDate() {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  async respondToBidSubmission(bidData) {
    await sendEmail({
      to: bidData.buyerEmail,
      subject: `✅ Bid Submitted - ${bidData.address}`,
      html: `
        <h2>Bid Received!</h2>

        <p>Hi ${bidData.buyerName},</p>

        <p>Your bid has been submitted for <strong>${bidData.address}</strong>.</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Bid Details:</h3>
          <p><strong>Your Bid:</strong> $${bidData.bidAmount.toLocaleString()}</p>
          <p><strong>Assignment Fee:</strong> $${bidData.assignmentFee.toLocaleString()}</p>
          <p><strong>Total Investment:</strong> $${(bidData.bidAmount + bidData.assignmentFee).toLocaleString()}</p>
        </div>

        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>We review all bids within 24-48 hours</li>
          <li>If accepted, you'll receive contract via DocuSign</li>
          <li>You'll have 10 days for due diligence</li>
        </ul>

        <p>🔔 We'll notify you immediately if your bid status changes.</p>

        <p>Best,<br>Velocity Real Estate Team</p>
      `
    });

    await sendSMS({
      to: bidData.buyerPhone,
      message: `Bid received for ${bidData.address}! We'll review within 24-48hrs. Check email for details.`
    });
  }
}

module.exports = CustomerSupport;
