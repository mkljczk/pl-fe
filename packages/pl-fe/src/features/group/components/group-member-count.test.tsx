import React from 'react';

import { buildGroup } from 'pl-fe/jest/factory';
import { render, screen } from 'pl-fe/jest/test-helpers';
import { Group } from 'pl-fe/normalizers';

import GroupMemberCount from './group-member-count';

let group: Group;

describe('<GroupMemberCount />', () => {
  describe('with support for "members_count"', () => {
    describe('with 1 member', () => {
      beforeEach(() => {
        group = buildGroup({
          members_count: 1,
        });
      });

      it('should render correctly', () => {
        render(<GroupMemberCount group={group} />);

        expect(screen.getByTestId('group-member-count').textContent).toEqual(
          '1 member',
        );
      });
    });

    describe('with 2 members', () => {
      beforeEach(() => {
        group = buildGroup({
          members_count: 2,
        });
      });

      it('should render correctly', () => {
        render(<GroupMemberCount group={group} />);

        expect(screen.getByTestId('group-member-count').textContent).toEqual(
          '2 members',
        );
      });
    });

    describe('with 1000 members', () => {
      beforeEach(() => {
        group = buildGroup({
          members_count: 1000,
        });
      });

      it('should render correctly', () => {
        render(<GroupMemberCount group={group} />);

        expect(screen.getByTestId('group-member-count').textContent).toEqual(
          '1k members',
        );
      });
    });
  });
});
