import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SPVData {
  id: string;
  name: string;
  type: string;
  fundraisingStart: Date;
  fundraisingEnd: Date;
  lifespanYears: number;
  targetAmount?: number | null;
  managementFee?: number | null;
  carryFee?: number | null;
  adminFee?: number | null;
  capitalStack?: string | null;
  manager?: {
    email: string;
    Manager?: {
      companyName?: string | null;
      companyAddress?: string | null;
    } | null;
  } | null;
}

export class DocumentGenerationService {
  /**
   * Generate Operating Agreement document
   */
  async generateOperatingAgreement(spvId: string): Promise<string> {
    const spv = await this.getSPVData(spvId);
    const template = this.getOperatingAgreementTemplate();
    const content = this.fillTemplate(template, spv);
    
    // Store document in database
    await prisma.document.upsert({
      where: {
        spvId_documentType_version: {
          spvId,
          documentType: 'operating_agreement',
          version: 1,
        },
      },
      update: {
        content,
        updatedAt: new Date(),
      },
      create: {
        spvId,
        documentType: 'operating_agreement',
        title: `Operating Agreement - ${spv.name}`,
        content,
      },
    });

    return content;
  }

  /**
   * Generate Subscription Agreement document
   */
  async generateSubscriptionAgreement(spvId: string): Promise<string> {
    const spv = await this.getSPVData(spvId);
    const template = this.getSubscriptionAgreementTemplate();
    const content = this.fillTemplate(template, spv);
    
    await prisma.document.upsert({
      where: {
        spvId_documentType_version: {
          spvId,
          documentType: 'subscription_agreement',
          version: 1,
        },
      },
      update: {
        content,
        updatedAt: new Date(),
      },
      create: {
        spvId,
        documentType: 'subscription_agreement',
        title: `Subscription Agreement - ${spv.name}`,
        content,
      },
    });

    return content;
  }

  /**
   * Generate Private Placement Memorandum (PPM)
   */
  async generatePPM(spvId: string): Promise<string> {
    const spv = await this.getSPVData(spvId);
    const template = this.getPPMTemplate();
    const content = this.fillTemplate(template, spv);
    
    await prisma.document.upsert({
      where: {
        spvId_documentType_version: {
          spvId,
          documentType: 'ppm',
          version: 1,
        },
      },
      update: {
        content,
        updatedAt: new Date(),
      },
      create: {
        spvId,
        documentType: 'ppm',
        title: `Private Placement Memorandum - ${spv.name}`,
        content,
      },
    });

    return content;
  }

  /**
   * Get SPV data with manager information
   */
  private async getSPVData(spvId: string): Promise<SPVData> {
    const spv = await prisma.sPV.findUnique({
      where: { id: spvId },
      include: {
        User: {
          include: {
            Manager: {
              select: {
                companyName: true,
                companyAddress: true,
              },
            },
          },
        },
      },
    });

    if (!spv) {
      throw new Error(`SPV not found: ${spvId}`);
    }

    return {
      id: spv.id,
      name: spv.name,
      type: spv.type,
      fundraisingStart: spv.fundraisingStart,
      fundraisingEnd: spv.fundraisingEnd,
      lifespanYears: spv.lifespanYears,
      targetAmount: spv.targetAmount,
      managementFee: spv.managementFee,
      carryFee: spv.carryFee,
      adminFee: spv.adminFee,
      capitalStack: spv.capitalStack,
      manager: spv.User ? {
        email: spv.User.email,
        Manager: spv.User.Manager,
      } : null,
    };
  }

  /**
   * Fill template with SPV data
   */
  private fillTemplate(template: string, spv: SPVData): string {
    const capitalStack = spv.capitalStack ? JSON.parse(spv.capitalStack) : null;
    const managerCompany = spv.manager?.Manager?.companyName || 'Manager';
    const managerAddress = spv.manager?.Manager?.companyAddress || 'Address not provided';
    
    let filled = template
      .replace(/\{\{SPV_NAME\}\}/g, spv.name)
      .replace(/\{\{SPV_TYPE\}\}/g, spv.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))
      .replace(/\{\{FUNDRAISING_START\}\}/g, spv.fundraisingStart.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
      .replace(/\{\{FUNDRAISING_END\}\}/g, spv.fundraisingEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
      .replace(/\{\{LIFESPAN_YEARS\}\}/g, spv.lifespanYears.toString())
      .replace(/\{\{TARGET_AMOUNT\}\}/g, spv.targetAmount ? `$${spv.targetAmount.toLocaleString()}` : 'Not specified')
      .replace(/\{\{MANAGEMENT_FEE\}\}/g, spv.managementFee ? `${spv.managementFee}%` : 'Not specified')
      .replace(/\{\{CARRY_FEE\}\}/g, spv.carryFee ? `${spv.carryFee}%` : 'Not specified')
      .replace(/\{\{ADMIN_FEE\}\}/g, spv.adminFee ? `${spv.adminFee}%` : 'Not specified')
      .replace(/\{\{MANAGER_COMPANY\}\}/g, managerCompany)
      .replace(/\{\{MANAGER_ADDRESS\}\}/g, managerAddress)
      .replace(/\{\{MANAGER_EMAIL\}\}/g, spv.manager?.email || 'Not provided')
      .replace(/\{\{CAPITAL_STACK_EQUITY\}\}/g, capitalStack?.equity ? `$${capitalStack.equity.toLocaleString()}` : 'N/A')
      .replace(/\{\{CAPITAL_STACK_PREFERRED\}\}/g, capitalStack?.preferred ? `$${capitalStack.preferred.toLocaleString()}` : 'N/A')
      .replace(/\{\{CAPITAL_STACK_MEZZANINE\}\}/g, capitalStack?.mezzanine ? `$${capitalStack.mezzanine.toLocaleString()}` : 'N/A')
      .replace(/\{\{EFFECTIVE_DATE\}\}/g, new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));

    // Handle conditional sections (capital stack)
    if (capitalStack && (capitalStack.equity || capitalStack.preferred || capitalStack.mezzanine)) {
      filled = filled.replace(
        /\{\{#if CAPITAL_STACK_EQUITY\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
        '$1'
      );
    } else {
      filled = filled.replace(
        /\{\{#if CAPITAL_STACK_EQUITY\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
        '$2'
      );
    }

    return filled;
  }

  /**
   * Operating Agreement Template
   */
  private getOperatingAgreementTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Operating Agreement - {{SPV_NAME}}</title>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; }
    h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
    h2 { margin-top: 30px; border-bottom: 1px solid #000; padding-bottom: 5px; }
    .section { margin: 20px 0; }
    .signature-section { margin-top: 60px; }
  </style>
</head>
<body>
  <h1>OPERATING AGREEMENT</h1>
  <h2>{{SPV_NAME}}</h2>
  <p><strong>{{SPV_TYPE}}</strong></p>
  
  <div class="section">
    <p><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}</p>
  </div>

  <div class="section">
    <h2>ARTICLE I - FORMATION</h2>
    <p>This Operating Agreement (the "Agreement") is entered into as of {{EFFECTIVE_DATE}}, by and among {{SPV_NAME}} (the "Company"), a {{SPV_TYPE}}, and its members.</p>
    <p>The Company is organized as a {{SPV_TYPE}} under the laws of Delaware. The Company's principal place of business shall be {{MANAGER_ADDRESS}}.</p>
  </div>

  <div class="section">
    <h2>ARTICLE II - PURPOSE AND TERM</h2>
    <p>The purpose of the Company is to engage in investment activities as described in the Private Placement Memorandum.</p>
    <p>The Company shall continue in existence for a period of {{LIFESPAN_YEARS}} years from the date of formation, unless earlier dissolved in accordance with the provisions of this Agreement.</p>
  </div>

  <div class="section">
    <h2>ARTICLE III - CAPITAL CONTRIBUTIONS</h2>
    <p>The total target capital commitment for the Company is {{TARGET_AMOUNT}}.</p>
    <p>Members shall make capital contributions as set forth in their respective Subscription Agreements.</p>
  </div>

  <div class="section">
    <h2>ARTICLE IV - MANAGEMENT</h2>
    <p>The Company shall be managed by {{MANAGER_COMPANY}} (the "Manager"), located at {{MANAGER_ADDRESS}}.</p>
    <p>The Manager shall have full authority to manage the business and affairs of the Company, subject to the limitations set forth in this Agreement.</p>
  </div>

  <div class="section">
    <h2>ARTICLE V - FEES AND EXPENSES</h2>
    <p><strong>Management Fee:</strong> The Manager shall be entitled to receive an annual management fee equal to {{MANAGEMENT_FEE}} of committed capital.</p>
    <p><strong>Carried Interest:</strong> The Manager shall be entitled to receive carried interest equal to {{CARRY_FEE}} of net profits, subject to a preferred return to members.</p>
    <p><strong>Administrative Fee:</strong> The Company shall pay administrative fees equal to {{ADMIN_FEE}} annually.</p>
  </div>

  <div class="section">
    <h2>ARTICLE VI - DISTRIBUTIONS</h2>
    <p>Distributions shall be made to members in accordance with their respective ownership interests, after payment of all fees and expenses.</p>
    <p>Distributions shall be made at such times and in such amounts as determined by the Manager in its sole discretion.</p>
  </div>

  <div class="section">
    <h2>ARTICLE VII - TRANSFERS OF INTERESTS</h2>
    <p>No member may transfer all or any portion of their interest in the Company without the prior written consent of the Manager.</p>
  </div>

  <div class="section">
    <h2>ARTICLE VIII - DISSOLUTION</h2>
    <p>The Company shall dissolve upon the earlier of: (i) the expiration of its term; (ii) the written consent of all members; or (iii) as otherwise provided by law.</p>
  </div>

  <div class="signature-section">
    <p>IN WITNESS WHEREOF, the parties have executed this Operating Agreement as of the date first written above.</p>
    <br><br>
    <p><strong>{{SPV_NAME}}</strong></p>
    <br><br>
    <p>By: {{MANAGER_COMPANY}}</p>
    <p>Name: _________________________</p>
    <p>Title: _________________________</p>
    <p>Date: _________________________</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Subscription Agreement Template
   */
  private getSubscriptionAgreementTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Subscription Agreement - {{SPV_NAME}}</title>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; }
    h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
    h2 { margin-top: 30px; border-bottom: 1px solid #000; padding-bottom: 5px; }
    .section { margin: 20px 0; }
    .signature-section { margin-top: 60px; }
  </style>
</head>
<body>
  <h1>SUBSCRIPTION AGREEMENT</h1>
  <h2>{{SPV_NAME}}</h2>
  
  <div class="section">
    <p><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}</p>
  </div>

  <div class="section">
    <h2>1. SUBSCRIPTION</h2>
    <p>The undersigned (the "Subscriber") hereby subscribes for an interest in {{SPV_NAME}} (the "Company"), a {{SPV_TYPE}}, in the amount set forth below.</p>
    <p><strong>Subscription Amount:</strong> $_________________________</p>
  </div>

  <div class="section">
    <h2>2. REPRESENTATIONS AND WARRANTIES</h2>
    <p>The Subscriber represents and warrants that:</p>
    <ul>
      <li>The Subscriber is an accredited investor as defined in Rule 501 of Regulation D under the Securities Act of 1933.</li>
      <li>The Subscriber has such knowledge and experience in financial and business matters that the Subscriber is capable of evaluating the merits and risks of an investment in the Company.</li>
      <li>The Subscriber is acquiring the interest for investment purposes only and not with a view to resale or distribution.</li>
      <li>The Subscriber understands that the interest is not registered under the Securities Act and may not be transferred except in compliance with applicable securities laws.</li>
    </ul>
  </div>

  <div class="section">
    <h2>3. TERMS OF INVESTMENT</h2>
    <p>The Company's target capital commitment is {{TARGET_AMOUNT}}.</p>
    <p>The Company's term is {{LIFESPAN_YEARS}} years from the date of formation.</p>
    <p>The fundraising period begins on {{FUNDRAISING_START}} and ends on {{FUNDRAISING_END}}.</p>
  </div>

  <div class="section">
    <h2>4. FEES AND EXPENSES</h2>
    <p>The Company will charge the following fees:</p>
    <ul>
      <li><strong>Management Fee:</strong> {{MANAGEMENT_FEE}} annually</li>
      <li><strong>Carried Interest:</strong> {{CARRY_FEE}} of net profits</li>
      <li><strong>Administrative Fee:</strong> {{ADMIN_FEE}} annually</li>
    </ul>
  </div>

  <div class="section">
    <h2>5. PAYMENT</h2>
    <p>The Subscriber agrees to make payment of the subscription amount by wire transfer to the account designated by the Company.</p>
    <p>Payment must be received by {{FUNDRAISING_END}}.</p>
  </div>

  <div class="section">
    <h2>6. ACCEPTANCE</h2>
    <p>This subscription is subject to acceptance by the Company. The Company reserves the right to reject any subscription in its sole discretion.</p>
  </div>

  <div class="signature-section">
    <p>IN WITNESS WHEREOF, the Subscriber has executed this Subscription Agreement as of the date set forth below.</p>
    <br><br>
    <p><strong>SUBSCRIBER:</strong></p>
    <br><br>
    <p>Name: _________________________</p>
    <p>Signature: _________________________</p>
    <p>Date: _________________________</p>
    <br><br>
    <p><strong>ACCEPTED BY:</strong></p>
    <p><strong>{{SPV_NAME}}</strong></p>
    <p>By: {{MANAGER_COMPANY}}</p>
    <p>Name: _________________________</p>
    <p>Title: _________________________</p>
    <p>Date: _________________________</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Private Placement Memorandum Template
   */
  private getPPMTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Private Placement Memorandum - {{SPV_NAME}}</title>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; }
    h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
    h2 { margin-top: 30px; border-bottom: 1px solid #000; padding-bottom: 5px; }
    .section { margin: 20px 0; }
    .disclaimer { background-color: #f0f0f0; padding: 15px; border: 1px solid #000; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>PRIVATE PLACEMENT MEMORANDUM</h1>
  <h2>{{SPV_NAME}}</h2>
  <p><strong>{{SPV_TYPE}}</strong></p>
  
  <div class="disclaimer">
    <p><strong>CONFIDENTIAL PRIVATE PLACEMENT MEMORANDUM</strong></p>
    <p>This Private Placement Memorandum (the "Memorandum") is confidential and is being furnished solely for the use of prospective investors in connection with the private placement of interests in {{SPV_NAME}} (the "Company").</p>
    <p>This Memorandum does not constitute an offer to sell or a solicitation of an offer to buy any securities. The offering is made only to accredited investors.</p>
  </div>

  <div class="section">
    <h2>EXECUTIVE SUMMARY</h2>
    <p><strong>Company:</strong> {{SPV_NAME}}</p>
    <p><strong>Type:</strong> {{SPV_TYPE}}</p>
    <p><strong>Manager:</strong> {{MANAGER_COMPANY}}</p>
    <p><strong>Target Capital Commitment:</strong> {{TARGET_AMOUNT}}</p>
    <p><strong>Term:</strong> {{LIFESPAN_YEARS}} years</p>
    <p><strong>Fundraising Period:</strong> {{FUNDRAISING_START}} to {{FUNDRAISING_END}}</p>
  </div>

  <div class="section">
    <h2>INVESTMENT OBJECTIVE</h2>
    <p>The Company's investment objective is to generate returns through strategic investments in accordance with its investment strategy as a {{SPV_TYPE}}.</p>
  </div>

  <div class="section">
    <h2>MANAGEMENT</h2>
    <p><strong>Manager:</strong> {{MANAGER_COMPANY}}</p>
    <p><strong>Address:</strong> {{MANAGER_ADDRESS}}</p>
    <p><strong>Contact:</strong> {{MANAGER_EMAIL}}</p>
    <p>The Manager will be responsible for the day-to-day management and operations of the Company.</p>
  </div>

  <div class="section">
    <h2>TERMS OF THE OFFERING</h2>
    <p><strong>Minimum Investment:</strong> As set forth in the Subscription Agreement</p>
    <p><strong>Target Capital Commitment:</strong> {{TARGET_AMOUNT}}</p>
    <p><strong>Term:</strong> The Company will have a term of {{LIFESPAN_YEARS}} years from the date of formation.</p>
    <p><strong>Fundraising Period:</strong> The Company will accept subscriptions from {{FUNDRAISING_START}} through {{FUNDRAISING_END}}.</p>
  </div>

  <div class="section">
    <h2>FEES AND EXPENSES</h2>
    <p><strong>Management Fee:</strong> The Manager will receive an annual management fee equal to {{MANAGEMENT_FEE}} of committed capital.</p>
    <p><strong>Carried Interest:</strong> The Manager will be entitled to receive carried interest equal to {{CARRY_FEE}} of net profits, subject to a preferred return to investors.</p>
    <p><strong>Administrative Fee:</strong> The Company will pay administrative fees equal to {{ADMIN_FEE}} annually.</p>
  </div>

  <div class="section">
    <h2>RISK FACTORS</h2>
    <p>An investment in the Company involves significant risks, including but not limited to:</p>
    <ul>
      <li><strong>Market Risk:</strong> The value of investments may fluctuate based on market conditions.</li>
      <li><strong>Liquidity Risk:</strong> Interests in the Company are not readily transferable and may be illiquid.</li>
      <li><strong>Management Risk:</strong> The success of the Company depends on the Manager's investment decisions.</li>
      <li><strong>Regulatory Risk:</strong> Changes in laws and regulations may adversely affect the Company.</li>
      <li><strong>Concentration Risk:</strong> The Company may have concentrated positions in certain investments.</li>
    </ul>
  </div>

  <div class="section">
    <h2>CAPITAL STRUCTURE</h2>
    {{#if CAPITAL_STACK_EQUITY}}
    <p>The Company's capital structure includes:</p>
    <ul>
      <li><strong>Equity:</strong> {{CAPITAL_STACK_EQUITY}}</li>
      <li><strong>Preferred:</strong> {{CAPITAL_STACK_PREFERRED}}</li>
      <li><strong>Mezzanine:</strong> {{CAPITAL_STACK_MEZZANINE}}</li>
    </ul>
    {{else}}
    <p>The Company's capital structure will be determined based on the investments made.</p>
    {{/if}}
  </div>

  <div class="section">
    <h2>SUITABILITY</h2>
    <p>This offering is suitable only for investors who:</p>
    <ul>
      <li>Are accredited investors as defined in Rule 501 of Regulation D</li>
      <li>Have sufficient financial resources to bear the risk of loss of their entire investment</li>
      <li>Understand the risks associated with this type of investment</li>
      <li>Do not require liquidity in their investment</li>
    </ul>
  </div>

  <div class="section">
    <h2>SUBSCRIPTION PROCEDURE</h2>
    <p>To subscribe for an interest in the Company, prospective investors must:</p>
    <ol>
      <li>Complete and execute a Subscription Agreement</li>
      <li>Provide evidence of accredited investor status</li>
      <li>Wire the subscription amount to the designated account</li>
    </ol>
    <p>Subscriptions are subject to acceptance by the Company.</p>
  </div>

  <div class="section">
    <h2>ADDITIONAL INFORMATION</h2>
    <p>For additional information regarding this offering, please contact:</p>
    <p>{{MANAGER_COMPANY}}<br>
    {{MANAGER_ADDRESS}}<br>
    Email: {{MANAGER_EMAIL}}</p>
  </div>

  <div class="disclaimer">
    <p><strong>IMPORTANT NOTICE</strong></p>
    <p>This Memorandum contains confidential information and is intended solely for the use of the person to whom it is delivered. Reproduction or distribution of this Memorandum, in whole or in part, is prohibited without the prior written consent of the Company.</p>
    <p>The information contained herein is subject to change without notice. The Company reserves the right to modify the terms of the offering at any time.</p>
  </div>

  <p style="margin-top: 40px;"><strong>Date:</strong> {{EFFECTIVE_DATE}}</p>
</body>
</html>
    `.trim();
  }

  async generateFormD(spvId: string): Promise<string> {
    // TODO: Generate Form D filing
    return `document-hash-${spvId}-formd`;
  }

  async generateBlueSky(spvId: string, state: string): Promise<string> {
    // TODO: Generate Blue Sky filing for specific state
    return `document-hash-${spvId}-bluesky-${state}`;
  }

  /**
   * Get document by SPV ID and type
   */
  async getDocument(spvId: string, documentType: string) {
    return prisma.document.findFirst({
      where: {
        spvId,
        documentType,
      },
      orderBy: {
        version: 'desc',
      },
    });
  }

  /**
   * Get all documents for an SPV
   */
  async getSPVDocuments(spvId: string) {
    return prisma.document.findMany({
      where: {
        spvId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
