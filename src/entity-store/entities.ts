import type { BookmarkFolder, GroupMember, GroupRelationship, Relationship, TrendsLink } from 'pl-api';
import type { Account, Group, Status } from 'soapbox/normalizers';
import type * as Schemas from 'soapbox/schemas';

enum Entities {
  ACCOUNTS = 'Accounts',
  BOOKMARK_FOLDERS = 'BookmarkFolders',
  DOMAINS = 'Domains',
  GROUPS = 'Groups',
  GROUP_MEMBERSHIPS = 'GroupMemberships',
  GROUP_MUTES = 'GroupMutes',
  GROUP_RELATIONSHIPS = 'GroupRelationships',
  RELATIONSHIPS = 'Relationships',
  RELAYS = 'Relays',
  RULES = 'Rules',
  STATUSES = 'Statuses',
  TRENDS_LINKS = 'TrendsLinks',
}

interface EntityTypes {
  [Entities.ACCOUNTS]: Account;
  [Entities.BOOKMARK_FOLDERS]: BookmarkFolder;
  [Entities.DOMAINS]: Schemas.Domain;
  [Entities.GROUPS]: Group;
  [Entities.GROUP_MEMBERSHIPS]: GroupMember;
  [Entities.GROUP_RELATIONSHIPS]: GroupRelationship;
  [Entities.RELATIONSHIPS]: Relationship;
  [Entities.RELAYS]: Schemas.Relay;
  [Entities.RULES]: Schemas.AdminRule;
  [Entities.STATUSES]: Status;
  [Entities.TRENDS_LINKS]: TrendsLink;
}

export { Entities, type EntityTypes };