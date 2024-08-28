import type { PaginationParams } from './common';

interface CreateGroupParams {
  display_name: string;
  note?: string;
  avatar?: File;
  header?: File;
}

interface UpdateGroupParams {
  display_name?: string;
  note?: string;
  avatar?: File | '';
  header?: File | '';
}

type GetGroupMembershipsParams = Omit<PaginationParams, 'min_id'>;
type GetGroupMembershipRequestsParams = Omit<PaginationParams, 'min_id'>;
type GetGroupBlocksParams = Omit<PaginationParams, 'min_id'>;

export type {
  CreateGroupParams,
  UpdateGroupParams,
  GetGroupMembershipsParams,
  GetGroupMembershipRequestsParams,
  GetGroupBlocksParams,
};
