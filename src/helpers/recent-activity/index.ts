import { TransactionColumnTitle, TransferColumnTitle, HistoryDataItem } from '@/containers/app/wallet/recent-activity';

interface HistoryColumns {
  key: string;
  title: string;
}

export interface HistoryRowData {
  key: string;
  value: string;
  icon?: string | null;
  colour?: string | null;
}

export interface HistoryRows {
  data: HistoryRowData[];
}

export const transactionsParser = (columns: HistoryColumns[], rows: HistoryRows[]): HistoryDataItem[] => {
  const keys = {
    id: columns.find((item) => item.title.toLowerCase() === TransactionColumnTitle.id.toLowerCase())?.key,
    type: columns.find((item) => item.title.toLowerCase() === TransactionColumnTitle.type.toLowerCase())?.key,
    status: columns.find((item) => item.title.toLowerCase() === TransactionColumnTitle.status.toLowerCase())?.key,
    paymentSystem: columns.find(
      (item) => item.title.toLowerCase() === TransactionColumnTitle.paymentSystem.toLowerCase()
    )?.key,
    account: columns.find((item) => item.title.toLowerCase() === TransactionColumnTitle.account.toLowerCase())?.key,
    createdAt: columns.find((item) => item.title.toLowerCase() === TransactionColumnTitle.createdAt.toLowerCase())?.key,
    closeTime: columns.find((item) => item.title.toLowerCase() === TransactionColumnTitle.closeTime.toLowerCase())?.key,
    processedAt: columns.find((item) => item.title.toLowerCase() === TransactionColumnTitle.processedAt.toLowerCase())
      ?.key,
    amount: columns.find((item) => item.title.toLowerCase() === TransactionColumnTitle.amount.toLowerCase())?.key,
    currency: columns.find((item) => item.title.toLowerCase() === TransactionColumnTitle.currency.toLowerCase())?.key,
    canBeCanceled: columns.find(
      (item) => item.title.toLowerCase() === TransactionColumnTitle.canBeCanceled.toLowerCase()
    )?.key,
    approveReason: columns.find(
      (item) => item.title.toLowerCase() === TransactionColumnTitle.approveReason.toLowerCase()
    )?.key,
    declineReason: columns.find(
      (item) => item.title.toLowerCase() === TransactionColumnTitle.declineReason.toLowerCase()
    )?.key
  };
  return rows.map((item) => ({
    id: item.data.find((el) => el.key === keys.id)?.value || '',
    type: item.data.find((el) => el.key === keys.type)?.value || '',
    status: item.data.find((el) => el.key === keys.status)?.value || '',
    paymentSystem: item.data.find((el) => el.key === keys.paymentSystem)?.value,
    account: item.data.find((el) => el.key === keys.account)?.value,
    createdAt: item.data.find((el) => el.key === keys.createdAt)?.value || new Date(),
    processedAt: item.data.find((el) => el.key === keys.processedAt)?.value,
    amount: item.data.find((el) => el.key === keys.amount)?.value || '',
    currency: item.data.find((el) => el.key === keys.currency)?.value || '',
    canBeCanceled: item.data.find((el) => el.key === keys.canBeCanceled)?.value,
    approveReason: item.data.find((el) => el.key === keys.approveReason)?.value,
    declineReason: item.data.find((el) => el.key === keys.declineReason)?.value || null
  }));
};

export const transfersParser = (columns: HistoryColumns[], rows: HistoryRows[]): HistoryDataItem[] => {
  const keys = {
    id: columns.find((item) => item.title.toLowerCase() === TransferColumnTitle.id.toLowerCase())?.key,
    type: 'transfer',
    status: columns.find((item) => item.title.toLowerCase() === TransferColumnTitle.status.toLowerCase())?.key,
    fromAccount: columns.find((item) => item.title.toLowerCase() === TransferColumnTitle.fromAccount.toLowerCase())
      ?.key,
    toAccount: columns.find((item) => item.title.toLowerCase() === TransferColumnTitle.toAccount.toLowerCase())?.key,
    createdAt: columns.find((item) => item.title.toLowerCase() === TransferColumnTitle.date.toLowerCase())?.key,
    closeTime: columns.find((item) => item.title.toLowerCase() === TransferColumnTitle.closeTime.toLowerCase())?.key,
    amount: columns.find((item) => item.title.toLowerCase() === TransferColumnTitle.amount.toLowerCase())?.key,
    currency: columns.find((item) => item.title.toLowerCase() === TransferColumnTitle.currency.toLowerCase())?.key,
    declineReason: columns.find((item) => item.title.toLowerCase() === TransferColumnTitle.declineReason.toLowerCase())
      ?.key
  };

  return rows.map((item) => ({
    id: item.data.find((el) => el.key === keys.id)?.value || '',
    type: keys.type,
    status: item.data.find((el) => el.key === keys.status)?.value || '',
    fromAccount: item.data.find((el) => el.key === keys.fromAccount)?.value,
    toAccount: item.data.find((el) => el.key === keys.toAccount)?.value,
    createdAt: item.data.find((el) => el.key === keys.createdAt)?.value || new Date(),
    amount: item.data.find((el) => el.key === keys.amount)?.value || '',
    currency: item.data.find((el) => el.key === keys.currency)?.value || '',
    declineReason: item.data.find((el) => el.key === keys.declineReason)?.value || null,
    fromIcon: item.data.find((el) => el.key === keys.fromAccount)?.icon || '',
    toIcon: item.data.find((el) => el.key === keys.toAccount)?.icon || '',
    fromColor: item.data.find((el) => el.key === keys.fromAccount)?.colour || '',
    toColor: item.data.find((el) => el.key === keys.toAccount)?.colour || ''
  }));
};
