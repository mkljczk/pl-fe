import {
  accountSchema,
  groupMemberSchema,
  groupRelationshipSchema,
  groupSchema,
  instanceSchema,
  relationshipSchema,
  statusSchema,
  GroupRoles,
  type Account,
  type Group,
  type GroupMember,
  type GroupRelationship,
  type Instance,
  type Relationship,
  type Status,
} from 'pl-api';
import { v4 as uuidv4 } from 'uuid';

import {
  cardSchema,
  type Card,
} from 'soapbox/schemas';

import type { PartialDeep } from 'type-fest';

// TODO: there's probably a better way to create these factory functions.
// This looks promising but didn't work on my first attempt: https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock

const buildAccount = (props: PartialDeep<Account> = {}): Account =>
  accountSchema.parse(Object.assign({
    id: uuidv4(),
    url: `https://soapbox.test/users/${uuidv4()}`,
  }, props));

const buildCard = (props: PartialDeep<Card> = {}): Card =>
  cardSchema.parse(Object.assign({
    url: 'https://soapbox.test',
  }, props));

const buildGroup = (props: PartialDeep<Group> = {}): Group =>
  groupSchema.parse(Object.assign({
    id: uuidv4(),
    owner: {
      id: uuidv4(),
    },
  }, props));

const buildGroupRelationship = (props: PartialDeep<GroupRelationship> = {}): GroupRelationship =>
  groupRelationshipSchema.parse(Object.assign({
    id: uuidv4(),
  }, props));

const buildGroupMember = (
  props: PartialDeep<GroupMember> = {},
  accountProps: PartialDeep<Account> = {},
): GroupMember => groupMemberSchema.parse(Object.assign({
  id: uuidv4(),
  account: buildAccount(accountProps),
  role: GroupRoles.USER,
}, props));

const buildInstance = (props: PartialDeep<Instance> = {}) => instanceSchema.parse(props);

const buildRelationship = (props: PartialDeep<Relationship> = {}): Relationship =>
  relationshipSchema.parse(Object.assign({
    id: uuidv4(),
  }, props));

const buildStatus = (props: PartialDeep<Status> = {}) =>
  statusSchema.parse(Object.assign({
    id: uuidv4(),
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