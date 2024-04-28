import { v4 as uuidv4 } from 'uuid';

import {
  accountSchema,
  cardSchema,
  groupMemberSchema,
  groupRelationshipSchema,
  groupSchema,
  relationshipSchema,
  statusSchema,
  type Account,
  type Card,
  type Group,
  type GroupMember,
  type GroupRelationship,
  type Relationship,
  type Status,
  Instance,
  instanceSchema,
} from 'soapbox/schemas';
import { GroupRoles } from 'soapbox/schemas/group-member';

import type { PartialDeep } from 'type-fest';

// TODO: there's probably a better way to create these factory functions.
// This looks promising but didn't work on my first attempt: https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock

function buildAccount(props: PartialDeep<Account> = {}): Account {
  return accountSchema.parse(Object.assign({
    id: uuidv4(),
    url: `https://soapbox.test/users/${uuidv4()}`,
  }, props));
}

function buildCard(props: PartialDeep<Card> = {}): Card {
  return cardSchema.parse(Object.assign({
    url: 'https://soapbox.test',
  }, props));
}

function buildGroup(props: PartialDeep<Group> = {}): Group {
  return groupSchema.parse(Object.assign({
    id: uuidv4(),
    owner: {
      id: uuidv4(),
    },
  }, props));
}

function buildGroupRelationship(props: PartialDeep<GroupRelationship> = {}): GroupRelationship {
  return groupRelationshipSchema.parse(Object.assign({
    id: uuidv4(),
  }, props));
}

function buildGroupMember(
  props: PartialDeep<GroupMember> = {},
  accountProps: PartialDeep<Account> = {},
): GroupMember {
  return groupMemberSchema.parse(Object.assign({
    id: uuidv4(),
    account: buildAccount(accountProps),
    role: GroupRoles.USER,
  }, props));
}

function buildInstance(props: PartialDeep<Instance> = {}) {
  return instanceSchema.parse(props);
}

function buildRelationship(props: PartialDeep<Relationship> = {}): Relationship {
  return relationshipSchema.parse(Object.assign({
    id: uuidv4(),
  }, props));
}

function buildStatus(props: PartialDeep<Status> = {}) {
  return statusSchema.parse(Object.assign({
    id: uuidv4(),
    account: buildAccount(),
  }, props));
}

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