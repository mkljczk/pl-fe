import { GroupRoles } from 'pl-api';
import React from 'react';

import { buildGroup, buildGroupRelationship } from 'pl-fe/jest/factory';
import { render, screen } from 'pl-fe/jest/test-helpers';

import GroupOptionsButton from './group-options-button';

import type { Group } from 'pl-fe/normalizers/group';

let group: Group;

describe('<GroupOptionsButton />', () => {
  describe('when the user blocked', () => {
    beforeEach(() => {
      group = buildGroup({
        relationship: buildGroupRelationship({
          requested: false,
          member: true,
          blocked_by: true,
          role: GroupRoles.USER,
        }),
      });
    });

    it('should render null', () => {
      render(<GroupOptionsButton group={group} />);

      expect(screen.queryAllByTestId('dropdown-menu-button')).toHaveLength(0);
    });
  });

  describe('when the user is an admin', () => {
    beforeEach(() => {
      group = buildGroup({
        relationship: buildGroupRelationship({
          requested: false,
          member: true,
          role: GroupRoles.ADMIN,
        }),
      });
    });

    it('should render one option for leaving the group', () => {
      render(<GroupOptionsButton group={group} />);

      // Leave group option only
      expect(screen.queryAllByTestId('dropdown-menu-button')).toHaveLength(1);
    });
  });

  describe('when the user is an owner', () => {
    beforeEach(() => {
      group = buildGroup({
        relationship: buildGroupRelationship({
          requested: false,
          member: true,
          role: GroupRoles.OWNER,
        }),
      });
    });

    it('should render one option for muting the group', () => {
      render(<GroupOptionsButton group={group} />);

      expect(screen.queryAllByTestId('dropdown-menu-button')).toHaveLength(1);
    });
  });

  describe('when the user is a member', () => {
    beforeEach(() => {
      group = buildGroup({
        relationship: buildGroupRelationship({
          requested: false,
          member: true,
          role: GroupRoles.USER,
        }),
      });
    });

    it('should render the dropdown menu', () => {
      render(<GroupOptionsButton group={group} />);

      expect(screen.queryAllByTestId('dropdown-menu-button')).toHaveLength(1);
    });
  });
});
