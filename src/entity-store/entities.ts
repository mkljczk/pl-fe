import type * as Schemas from 'soapbox/schemas';

enum Entities {
  ACCOUNTS = 'Accounts',
  BOOKMARK_FOLDERS = 'BookmarkFolders',
  DOMAINS = 'Domains',
  GROUPS = 'Groups',
  GROUP_MEMBERSHIPS = 'GroupMemberships',
  GROUP_MUTES = 'GroupMutes',
  GROUP_RELATIONSHIPS = 'GroupRelationships',
  PATRON_USERS = 'PatronUsers',
  RELATIONSHIPS = 'Relationships',
  RELAYS = 'Relays',
  RULES = 'Rules',
  STATUSES = 'Statuses',
}

interface EntityTypes {
  [Entities.ACCOUNTS]: Schemas.Account;
  [Entities.BOOKMARK_FOLDERS]: Schemas.BookmarkFolder;
  [Entities.DOMAINS]: Schemas.Domain;
  [Entities.GROUPS]: Schemas.Group;
  [Entities.GROUP_MEMBERSHIPS]: Schemas.GroupMember;
  [Entities.GROUP_RELATIONSHIPS]: Schemas.GroupRelationship;
  [Entities.PATRON_USERS]: Schemas.PatronUser;
  [Entities.RELATIONSHIPS]: Schemas.Relationship;
  [Entities.RELAYS]: Schemas.Relay;
  [Entities.RULES]: Schemas.AdminRule;
  [Entities.STATUSES]: Schemas.Status;
}

export { Entities, type EntityTypes };