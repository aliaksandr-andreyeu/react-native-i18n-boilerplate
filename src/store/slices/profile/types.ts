export interface EnableTwoFactorArgs {
  code: string;
}

export interface GetManualCodeResponse {
  url: string;
  manualCode: string;
}

export interface GetBackupCodesResponse {
  codes: number[];
}

export interface InitialState {
  lastBackupCodes: number[];
}
