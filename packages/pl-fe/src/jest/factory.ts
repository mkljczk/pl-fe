import {
  accountSchema,
  groupMemberSchema,
  groupRelationshipSchema,
  groupSchema,
  instanceSchema,
  previewCardSchema,
  relationshipSchema,
  statusSchema,
  GroupRoles,
  type Account,
  type Group,
  type GroupMember,
  type GroupRelationship,
  type Instance,
  type PreviewCard,
  type Relationship,
  type Status,
} from 'pl-api';

import type { PartialDeep } from 'type-fest';

// TODO: there's probably a better way to create these factory functions.
// This looks promising but didn't work on my first attempt: https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock

const buildAccount = (props: PartialDeep<Account> = {}): Account =>
  accountSchema.parse(Object.assign({
    id: crypto.randomUUID(),
    url: `https://soapbox.test/users/${crypto.randomUUID()}`,
  }, props));

const buildCard = (props: PartialDeep<PreviewCard> = {}): PreviewCard =>
  previewCardSchema.parse(Object.assign({
    url: 'https://soapbox.test',
  }, props));

const buildGroup = (props: PartialDeep<Group> = {}): Group =>
  groupSchema.parse(Object.assign({
    id: crypto.randomUUID(),
    owner: {
      id: crypto.randomUUID(),
    },
  }, props));

const buildGroupRelationship = (props: PartialDeep<GroupRelationship> = {}): GroupRelationship =>
  groupRelationshipSchema.parse(Object.assign({
    id: crypto.randomUUID(),
  }, props));

const buildGroupMember = (
  props: PartialDeep<GroupMember> = {},
  accountProps: PartialDeep<Account> = {},
): GroupMember => groupMemberSchema.parse(Object.assign({
  id: crypto.randomUUID(),
  account: buildAccount(accountProps),
  role: GroupRoles.USER,
}, props));

const buildInstance = (props: PartialDeep<Instance> = {}) => instanceSchema.parse(props);

const buildRelationship = (props: PartialDeep<Relationship> = {}): Relationship =>
  relationshipSchema.parse(Object.assign({
    id: crypto.randomUUID(),
  }, props));

const buildStatus = (props: PartialDeep<Status> = {}) =>
  statusSchema.parse(Object.assign({
    id: crypto.randomUUID(),
    account: buildAccount(),
  }, props));

export {
  buildAccount,
  buildCard,
  buildGroup,
  buildGroupMember,
  buildGroupRelationship,
  buildInstance,
  buildRelationship,
  buildStatus,
};
