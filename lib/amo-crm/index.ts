export const AmoCrmRequestType = {
  INVOICE: 1,
  CONSULTATION: 2,
};

export const Aplication = {
  VIBER: 1,
  TELEGRAM: 2,
  WEB: 3
};

export const AMO_CRM_URL =
  "https://hook.integromat.com/u756f2d1dvrbn5a4dwyvvupm7sgwgtnc";

export interface AmoCrmInvoiceRequest {
  REQUEST_TYPE: number;
  SUBSCRIPTION_NAME: string;
  SUBSCRIPTION_PRICE: string;
  MOBILE_PHONE: string;
  USER_NAME: string;
}
export interface AmoCrmConsultationRequest {
  REQUEST_TYPE: number;
  USER_ROLE: string;
  INSTALL_DATE: string;
  APPLICATION: number;
  BOT_ACTIONS: number;
  PREVIOUS_REQUESTS: number;
  MOBILE_PHONE: string;
  USER_NAME: string;
}
