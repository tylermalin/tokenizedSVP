import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * Sumsub KYC/AML Integration Service
 * Documentation: https://developers.sumsub.com/
 */
export class SumsubService {
  private api: AxiosInstance;
  private appToken: string;
  private secretKey: string;
  private baseURL: string;

  constructor() {
    this.appToken = process.env.SUMSUB_APP_TOKEN || '';
    this.secretKey = process.env.SUMSUB_SECRET_KEY || '';
    this.baseURL = process.env.SUMSUB_BASE_URL || 'https://api.sumsub.com';

    if (!this.appToken || !this.secretKey) {
      logger.warn('Sumsub credentials not configured. KYC/AML features will be limited.');
    }

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check if Sumsub is configured
   */
  isConfigured(): boolean {
    return !!(this.appToken && this.secretKey);
  }

  /**
   * Generate access token signature for API calls
   */
  private generateSignature(method: string, path: string, body: string = ''): { signature: string; timestamp: string } {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = timestamp + method.toUpperCase() + path + body;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('hex');
    
    return { signature, timestamp };
  }

  /**
   * Create applicant in Sumsub
   */
  async createApplicant(userId: string, email: string, externalUserId?: string) {
    try {
      const path = '/resources/applicants';
      const body = JSON.stringify({
        externalUserId: externalUserId || userId,
        email: email,
        requiredIdDocs: {
          docSets: [{
            idDocSetType: 'IDENTITY',
            types: ['PASSPORT', 'ID_CARD', 'DRIVERS']
          }]
        }
      });
      
      const { signature, timestamp } = this.generateSignature('POST', path, body);
      
      const response = await this.api.post(
        path,
        JSON.parse(body),
        {
          headers: {
            'X-App-Token': this.appToken,
            'X-App-Access-Sig': signature,
            'X-App-Access-Ts': timestamp
          }
        }
      );

      return {
        applicantId: response.data.id,
        inspectionId: response.data.inspectionId
      };
    } catch (error: any) {
      logger.error('Sumsub createApplicant error:', error.response?.data || error.message);
      throw new AppError('Failed to create KYC applicant', 500);
    }
  }

  /**
   * Generate access token for frontend SDK
   */
  async generateSDKToken(userId: string, levelName: string = 'basic-kyc-level'): Promise<string> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = crypto
        .createHmac('sha256', this.secretKey)
        .update(`${timestamp}POST/resources/accessTokens`)
        .digest('hex');

      const response = await this.api.post(
        '/resources/accessTokens',
        {
          userId: userId,
          ttlInSecs: 600, // 10 minutes
          levelName: levelName
        },
        {
          headers: {
            'X-App-Token': this.appToken,
            'X-App-Access-Sig': signature,
            'X-App-Access-Ts': timestamp.toString()
          }
        }
      );

      return response.data.token;
    } catch (error: any) {
      logger.error('Sumsub generateSDKToken error:', error.response?.data || error.message);
      throw new AppError('Failed to generate KYC access token', 500);
    }
  }

  /**
   * Get applicant status
   */
  async getApplicantStatus(applicantId: string) {
    try {
      const path = `/resources/applicants/${applicantId}/status`;
      const { signature, timestamp } = this.generateSignature('GET', path);
      
      const response = await this.api.get(
        path,
        {
          headers: {
            'X-App-Token': this.appToken,
            'X-App-Access-Sig': signature,
            'X-App-Access-Ts': timestamp
          }
        }
      );

      return {
        applicantId: response.data.id,
        reviewStatus: response.data.reviewStatus, // 'pending', 'completed', 'onHold', 'rejected'
        reviewResult: response.data.reviewResult, // 'green', 'red', 'amber'
        createdAt: response.data.createdAt,
        reviewDate: response.data.reviewDate
      };
    } catch (error: any) {
      logger.error('Sumsub getApplicantStatus error:', error.response?.data || error.message);
      throw new AppError('Failed to get applicant status', 500);
    }
  }

  /**
   * Get applicant data
   */
  async getApplicantData(applicantId: string) {
    try {
      const path = `/resources/applicants/${applicantId}/one`;
      const { signature, timestamp } = this.generateSignature('GET', path);
      
      const response = await this.api.get(
        path,
        {
          headers: {
            'X-App-Token': this.appToken,
            'X-App-Access-Sig': signature,
            'X-App-Access-Ts': timestamp
          }
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('Sumsub getApplicantData error:', error.response?.data || error.message);
      throw new AppError('Failed to get applicant data', 500);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Perform AML check (using Sumsub's AML screening)
   */
  async performAMLCheck(applicantId: string) {
    try {
      const applicantData = await this.getApplicantData(applicantId);
      
      // Sumsub performs AML checks as part of KYC review
      // Additional AML screening can be done via their API
      const status = await this.getApplicantStatus(applicantId);
      
      return {
        applicantId,
        amlStatus: status.reviewResult === 'green' ? 'cleared' : 'pending',
        reviewResult: status.reviewResult,
        reviewStatus: status.reviewStatus
      };
    } catch (error: any) {
      logger.error('Sumsub AML check error:', error);
      return {
        applicantId,
        amlStatus: 'pending',
        reviewResult: null,
        reviewStatus: null
      };
    }
  }
}

