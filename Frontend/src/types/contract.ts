export type ContractStatus =
  | "NOT_READY"
  | "WAITING_INVESTOR_SIGNATURE"
  | "WAITING_STARTUP_SIGNATURE"
  | "FULLY_SIGNED";

export interface MeetingContract {
  meetingId: number;
  projectId: number;
  investorId: number;
  startupId: number;
  meetingTopic?: string;
  projectName?: string;
  investorName?: string;
  startupName?: string;
  investmentAmount?: number;
  equitySharePercent?: number;
  investmentDurationMonths?: number;
  milestone?: string;
  status: ContractStatus;
  investorSigned?: boolean;
  startupSigned?: boolean;
  investorSignedAt?: string;
  startupSignedAt?: string;
  ndaCompleted?: boolean;
  investmentFinalized?: boolean;
  fundsReleased?: boolean;
  fundsReleasedAt?: string;
  paymentId?: number;
  projectMinimumInvestment?: number;
  projectFundingAmount?: number;
  projectFundingReceived?: number;
  contractHtml?: string;
  investorSignatureHtml?: string;
  startupSignatureHtml?: string;
  preview?: boolean;
}

export interface ContractSignPayload {
  investmentAmount?: number;
  equitySharePercent?: number;
  investmentDurationMonths?: number;
  milestone?: string;
  acceptTerms?: boolean;
}

