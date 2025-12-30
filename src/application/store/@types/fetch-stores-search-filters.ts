export enum StoreStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  ALL = 'ALL',
}

export interface FetchStoresSearchParams {
  status?: StoreStatus
  sortOrder?: 'asc' | 'desc'
}
