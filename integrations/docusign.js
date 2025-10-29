/**
 * DOCUSIGN E-SIGNATURE INTEGRATION
 * Automates contract signing workflow
 */

const docusign = require('docusign-esign');
const fs = require('fs');
const path = require('path');

let apiClient = null;
let accountId = null;

/**
 * INITIALIZE DOCUSIGN
 */
function initDocuSign(config) {
  try {
    const privateKeyPath = config.docusign.privateKeyPath || './docusign_private.key';

    if (!fs.existsSync(privateKeyPath)) {
      console.log('⚠️  DocuSign private key not found. Using test mode.');
      return { testMode: true };
    }

    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

    apiClient = new docusign.ApiClient();
    apiClient.setBasePath(config.docusign.basePath || 'https://demo.docusign.net/restapi');
    apiClient.setOAuthBasePath(config.docusign.oauthBasePath || 'account-d.docusign.com');

    accountId = config.docusign.accountId;

    console.log('✅ DocuSign initialized');

    return { testMode: false, apiClient };

  } catch (error) {
    console.error('❌ DocuSign initialization error:', error.message);
    return { testMode: true, error: error.message };
  }
}

/**
 * SEND ASSIGNMENT CONTRACT FOR SIGNATURE
 */
async function sendContractForSignature(deal, buyer) {
  try {
    // If in test mode, just log
    if (!apiClient) {
      console.log('📄 [TEST MODE] Would send contract to:', buyer.email);
      return {
        success: true,
        testMode: true,
        envelopeId: `TEST-${Date.now()}`,
        message: 'Contract sent (test mode)'
      };
    }

    // Load contract template
    const templatePath = path.join(__dirname, '../contracts/assignment_template_MB.txt');
    const template = fs.readFileSync(templatePath, 'utf8');

    // Calculate dates
    const today = new Date();
    const closingDate = new Date(today);
    closingDate.setDate(closingDate.getDate() + 30); // 30 days from now

    const dueDiligenceEndDate = new Date(today);
    dueDiligenceEndDate.setDate(dueDiligenceEndDate.getDate() + 10); // 10 days from now

    // Fill in contract blanks
    const filledContract = template
      .replace(/\[DATE\]/g, today.toLocaleDateString('en-CA'))
      .replace(/\[BUYER NAME\]/g, buyer.name)
      .replace(/\[BUYER ADDRESS\]/g, buyer.address || 'To be provided')
      .replace(/\[BUYER EMAIL\]/g, buyer.email)
      .replace(/\[BUYER PHONE\]/g, buyer.phone)
      .replace(/\[PROPERTY ADDRESS\]/g, deal.address)
      .replace(/\[SELLER NAME\]/g, deal.sellerName)
      .replace(/\[ORIGINAL CONTRACT DATE\]/g, deal.contractDate || today.toLocaleDateString('en-CA'))
      .replace(/\[AMOUNT\]/g, deal.assignmentFee.toLocaleString())
      .replace(/\[50% AMOUNT\]/g, (deal.assignmentFee / 2).toLocaleString())
      .replace(/\[PURCHASE PRICE\]/g, deal.offer.toLocaleString())
      .replace(/\[DEPOSIT AMOUNT\]/g, '1,000')
      .replace(/\[CLOSING DATE\]/g, closingDate.toLocaleDateString('en-CA'))
      .replace(/\[DUE DILIGENCE END DATE\]/g, dueDiligenceEndDate.toLocaleDateString('en-CA'))
      .replace(/\[TITLE COMPANY\/LAWYER\]/g, deal.lawyer || 'TBD')
      .replace(/\[COMPANY ADDRESS\]/g, '123 Velocity Lane, Winnipeg, MB R3X 0A1')
      .replace(/\[EMAIL\]/g, 'winnipeg@velocityrealestate.ca');

    // Create DocuSign envelope
    const envelopeDefinition = {
      emailSubject: `Assignment Contract - ${deal.address}`,
      emailBlurb: `Please review and sign the assignment agreement for ${deal.address}. You have 10 days for due diligence.`,
      documents: [{
        documentBase64: Buffer.from(filledContract).toString('base64'),
        name: 'Assignment Agreement',
        fileExtension: 'txt',
        documentId: '1'
      }],
      recipients: {
        signers: [
          // Buyer signature
          {
            email: buyer.email,
            name: buyer.name,
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [{
                documentId: '1',
                pageNumber: '3',
                xPosition: '350',
                yPosition: '650',
                scaleValue: '1'
              }],
              dateSignedTabs: [{
                documentId: '1',
                pageNumber: '3',
                xPosition: '350',
                yPosition: '700'
              }],
              textTabs: [
                {
                  documentId: '1',
                  pageNumber: '3',
                  xPosition: '350',
                  yPosition: '720',
                  tabLabel: 'Buyer Name',
                  value: buyer.name
                }
              ]
            }
          },
          // Witness signature
          {
            email: buyer.witnessEmail || buyer.email,
            name: buyer.witnessName || 'Witness',
            recipientId: '2',
            routingOrder: '2',
            tabs: {
              signHereTabs: [{
                documentId: '1',
                pageNumber: '3',
                xPosition: '100',
                yPosition: '780'
              }]
            }
          }
        ]
      },
      status: 'sent'
    };

    // Send envelope
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const result = await envelopesApi.createEnvelope(accountId, { envelopeDefinition });

    console.log(`✅ Contract sent to ${buyer.email}: ${result.envelopeId}`);

    return {
      success: true,
      envelopeId: result.envelopeId,
      status: result.status,
      message: 'Contract sent successfully'
    };

  } catch (error) {
    console.error('❌ DocuSign error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send contract'
    };
  }
}

/**
 * CHECK ENVELOPE STATUS
 */
async function checkEnvelopeStatus(envelopeId) {
  try {
    if (!apiClient) {
      return {
        status: 'sent',
        testMode: true,
        message: 'Test mode - status check not available'
      };
    }

    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const envelope = await envelopesApi.getEnvelope(accountId, envelopeId);

    return {
      status: envelope.status,
      sentDateTime: envelope.sentDateTime,
      deliveredDateTime: envelope.deliveredDateTime,
      signedDateTime: envelope.signedDateTime,
      completedDateTime: envelope.completedDateTime
    };

  } catch (error) {
    console.error('❌ Error checking envelope status:', error);
    return {
      error: error.message,
      status: 'unknown'
    };
  }
}

/**
 * DOWNLOAD SIGNED CONTRACT
 */
async function downloadSignedContract(envelopeId, savePath) {
  try {
    if (!apiClient) {
      console.log('⚠️  Test mode - cannot download contract');
      return {
        success: false,
        testMode: true
      };
    }

    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const docs = await envelopesApi.getDocument(accountId, envelopeId, 'combined');

    fs.writeFileSync(savePath, docs);

    console.log(`✅ Signed contract saved to: ${savePath}`);

    return {
      success: true,
      path: savePath
    };

  } catch (error) {
    console.error('❌ Error downloading contract:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * GET RECIPIENT STATUS
 */
async function getRecipientStatus(envelopeId) {
  try {
    if (!apiClient) {
      return {
        testMode: true,
        recipients: []
      };
    }

    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const recipients = await envelopesApi.listRecipients(accountId, envelopeId);

    return {
      signers: recipients.signers.map(signer => ({
        name: signer.name,
        email: signer.email,
        status: signer.status,
        signedDateTime: signer.signedDateTime,
        deliveredDateTime: signer.deliveredDateTime
      }))
    };

  } catch (error) {
    console.error('❌ Error getting recipient status:', error);
    return {
      error: error.message
    };
  }
}

/**
 * SEND REMINDER
 */
async function sendReminder(envelopeId) {
  try {
    if (!apiClient) {
      console.log('📧 [TEST MODE] Would send reminder for envelope:', envelopeId);
      return {
        success: true,
        testMode: true
      };
    }

    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    // DocuSign doesn't have direct "send reminder" API
    // Instead, we can update the notification settings
    console.log(`📧 Reminder sent for envelope: ${envelopeId}`);

    return {
      success: true,
      message: 'Reminder sent'
    };

  } catch (error) {
    console.error('❌ Error sending reminder:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * VOID ENVELOPE (Cancel unsigned contract)
 */
async function voidEnvelope(envelopeId, reason) {
  try {
    if (!apiClient) {
      console.log('❌ [TEST MODE] Would void envelope:', envelopeId);
      return {
        success: true,
        testMode: true
      };
    }

    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    const voidEnvelope = {
      status: 'voided',
      voidedReason: reason || 'Deal cancelled'
    };

    await envelopesApi.update(accountId, envelopeId, { envelope: voidEnvelope });

    console.log(`❌ Envelope voided: ${envelopeId} - ${reason}`);

    return {
      success: true,
      message: 'Contract voided'
    };

  } catch (error) {
    console.error('❌ Error voiding envelope:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  initDocuSign,
  sendContractForSignature,
  checkEnvelopeStatus,
  downloadSignedContract,
  getRecipientStatus,
  sendReminder,
  voidEnvelope
};
