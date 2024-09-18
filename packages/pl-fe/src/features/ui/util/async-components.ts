import { lazy } from 'react';

// Pages
export const AboutPage = lazy(() => import('pl-fe/features/about'));
export const AccountGallery = lazy(
  () => import('pl-fe/features/account-gallery'),
);
export const AccountTimeline = lazy(
  () => import('pl-fe/features/account-timeline'),
);
export const Aliases = lazy(() => import('pl-fe/features/aliases'));
export const Announcements = lazy(
  () => import('pl-fe/features/admin/announcements'),
);
export const AuthTokenList = lazy(
  () => import('pl-fe/features/auth-token-list'),
);
export const Backups = lazy(() => import('pl-fe/features/backups'));
export const Blocks = lazy(() => import('pl-fe/features/blocks'));
export const BookmarkFolders = lazy(
  () => import('pl-fe/features/bookmark-folders'),
);
export const Bookmarks = lazy(() => import('pl-fe/features/bookmarks'));
export const BubbleTimeline = lazy(
  () => import('pl-fe/features/bubble-timeline'),
);
export const ChatIndex = lazy(() => import('pl-fe/features/chats'));
export const Circle = lazy(() => import('pl-fe/features/circle'));
export const CommunityTimeline = lazy(
  () => import('pl-fe/features/community-timeline'),
);
export const ComposeEditor = lazy(
  () => import('pl-fe/features/compose/editor'),
);
export const Conversations = lazy(() => import('pl-fe/features/conversations'));
export const CreateApp = lazy(
  () => import('pl-fe/features/developers/apps/create'),
);
export const CryptoDonate = lazy(() => import('pl-fe/features/crypto-donate'));
export const Dashboard = lazy(() => import('pl-fe/features/admin'));
export const DeleteAccount = lazy(
  () => import('pl-fe/features/delete-account'),
);
export const Developers = lazy(() => import('pl-fe/features/developers'));
export const Directory = lazy(() => import('pl-fe/features/directory'));
export const DomainBlocks = lazy(() => import('pl-fe/features/domain-blocks'));
export const Domains = lazy(() => import('pl-fe/features/admin/domains'));
export const DraftStatuses = lazy(
  () => import('pl-fe/features/draft-statuses'),
);
export const EditEmail = lazy(() => import('pl-fe/features/edit-email'));
export const EditFilter = lazy(
  () => import('pl-fe/features/filters/edit-filter'),
);
export const EditGroup = lazy(() => import('pl-fe/features/group/edit-group'));
export const EditPassword = lazy(() => import('pl-fe/features/edit-password'));
export const EditProfile = lazy(() => import('pl-fe/features/edit-profile'));
export const EventDiscussion = lazy(
  () => import('pl-fe/features/event/event-discussion'),
);
export const EventInformation = lazy(
  () => import('pl-fe/features/event/event-information'),
);
export const Events = lazy(() => import('pl-fe/features/events'));
export const ExportData = lazy(() => import('pl-fe/features/export-data'));
export const ExternalLogin = lazy(
  () => import('pl-fe/features/external-login'),
);
export const FavouritedStatuses = lazy(
  () => import('pl-fe/features/favourited-statuses'),
);
export const FederationRestrictions = lazy(
  () => import('pl-fe/features/federation-restrictions'),
);
export const Filters = lazy(() => import('pl-fe/features/filters'));
export const FollowedTags = lazy(() => import('pl-fe/features/followed-tags'));
export const Followers = lazy(() => import('pl-fe/features/followers'));
export const Following = lazy(() => import('pl-fe/features/following'));
export const FollowRecommendations = lazy(
  () => import('pl-fe/features/follow-recommendations'),
);
export const FollowRequests = lazy(
  () => import('pl-fe/features/follow-requests'),
);
export const GenericNotFound = lazy(
  () => import('pl-fe/features/generic-not-found'),
);
export const GroupBlockedMembers = lazy(
  () => import('pl-fe/features/group/group-blocked-members'),
);
export const GroupGallery = lazy(
  () => import('pl-fe/features/group/group-gallery'),
);
export const GroupMembers = lazy(
  () => import('pl-fe/features/group/group-members'),
);
export const GroupMembershipRequests = lazy(
  () => import('pl-fe/features/group/group-membership-requests'),
);
export const Groups = lazy(() => import('pl-fe/features/groups'));
export const GroupTimeline = lazy(
  () => import('pl-fe/features/group/group-timeline'),
);
export const HashtagTimeline = lazy(
  () => import('pl-fe/features/hashtag-timeline'),
);
export const HomeTimeline = lazy(() => import('pl-fe/features/home-timeline'));
export const ImportData = lazy(() => import('pl-fe/features/import-data'));
export const IntentionalError = lazy(
  () => import('pl-fe/features/intentional-error'),
);
export const InteractionPolicies = lazy(
  () => import('pl-fe/features/interaction-policies'),
);
export const LandingTimeline = lazy(
  () => import('pl-fe/features/landing-timeline'),
);
export const Lists = lazy(() => import('pl-fe/features/lists'));
export const ListTimeline = lazy(() => import('pl-fe/features/list-timeline'));
export const LoginPage = lazy(
  () => import('pl-fe/features/auth-login/components/login-page'),
);
export const LogoutPage = lazy(
  () => import('pl-fe/features/auth-login/components/logout'),
);
export const ManageGroup = lazy(
  () => import('pl-fe/features/group/manage-group'),
);
export const MediaGallery = lazy(
  () => import('pl-fe/components/media-gallery'),
);
export const Migration = lazy(() => import('pl-fe/features/migration'));
export const ModerationLog = lazy(
  () => import('pl-fe/features/admin/moderation-log'),
);
export const Mutes = lazy(() => import('pl-fe/features/mutes'));
export const NewStatus = lazy(() => import('pl-fe/features/new-status'));
export const Notifications = lazy(() => import('pl-fe/features/notifications'));
export const PasswordReset = lazy(
  () => import('pl-fe/features/auth-login/components/password-reset'),
);
export const PinnedStatuses = lazy(
  () => import('pl-fe/features/pinned-statuses'),
);
export const PlFeConfig = lazy(() => import('pl-fe/features/pl-fe-config'));
export const PublicTimeline = lazy(
  () => import('pl-fe/features/public-timeline'),
);
export const Quotes = lazy(() => import('pl-fe/features/quotes'));
export const RegisterInvite = lazy(
  () => import('pl-fe/features/register-invite'),
);
export const RegistrationPage = lazy(
  () => import('pl-fe/features/auth-login/components/registration-page'),
);
export const Relays = lazy(() => import('pl-fe/features/admin/relays'));
export const RemoteTimeline = lazy(
  () => import('pl-fe/features/remote-timeline'),
);
export const Rules = lazy(() => import('pl-fe/features/admin/rules'));
export const ScheduledStatuses = lazy(
  () => import('pl-fe/features/scheduled-statuses'),
);
export const Search = lazy(() => import('pl-fe/features/search'));
export const ServerInfo = lazy(() => import('pl-fe/features/server-info'));
export const ServiceWorkerInfo = lazy(
  () => import('pl-fe/features/developers/service-worker-info'),
);
export const Settings = lazy(() => import('pl-fe/features/settings'));
export const SettingsStore = lazy(
  () => import('pl-fe/features/developers/settings-store'),
);
export const Share = lazy(() => import('pl-fe/features/share'));
export const Status = lazy(() => import('pl-fe/features/status'));
export const TestTimeline = lazy(() => import('pl-fe/features/test-timeline'));
export const ThemeEditor = lazy(() => import('pl-fe/features/theme-editor'));
export const UserIndex = lazy(() => import('pl-fe/features/admin/user-index'));

// Panels
export const AccountNotePanel = lazy(
  () => import('pl-fe/features/ui/components/panels/account-note-panel'),
);
export const AnnouncementsPanel = lazy(
  () => import('pl-fe/components/announcements/announcements-panel'),
);
export const BirthdayPanel = lazy(
  () => import('pl-fe/components/birthday-panel'),
);
export const CryptoDonatePanel = lazy(
  () => import('pl-fe/features/crypto-donate/components/crypto-donate-panel'),
);
export const GroupMediaPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/group-media-panel'),
);
export const InstanceInfoPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/instance-info-panel'),
);
export const InstanceModerationPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/instance-moderation-panel'),
);
export const LatestAccountsPanel = lazy(
  () => import('pl-fe/features/admin/components/latest-accounts-panel'),
);
export const MyGroupsPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/my-groups-panel'),
);
export const NewEventPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/new-event-panel'),
);
export const NewGroupPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/new-group-panel'),
);
export const PinnedAccountsPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/pinned-accounts-panel'),
);
export const ProfileFieldsPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/profile-fields-panel'),
);
export const ProfileInfoPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/profile-info-panel'),
);
export const ProfileMediaPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/profile-media-panel'),
);
export const PromoPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/promo-panel'),
);
export const SignUpPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/sign-up-panel'),
);
export const TrendsPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/trends-panel'),
);
export const UserPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/user-panel'),
);
export const WhoToFollowPanel = lazy(
  () => import('pl-fe/features/ui/components/panels/who-to-follow-panel'),
);

export const Audio = lazy(() => import('pl-fe/features/audio'));
export const ChatWidget = lazy(
  () => import('pl-fe/features/chats/components/chat-widget/chat-widget'),
);
export const CryptoAddress = lazy(
  () => import('pl-fe/features/crypto-donate/components/crypto-address'),
);
export const DatePicker = lazy(
  () => import('pl-fe/features/birthdays/date-picker'),
);
export const EmojiPicker = lazy(
  () => import('pl-fe/features/emoji/components/emoji-picker'),
);
export const EventHeader = lazy(
  () => import('pl-fe/features/event/components/event-header'),
);
export const LightningAddress = lazy(
  () => import('pl-fe/features/crypto-donate/components/lightning-address'),
);
export const MfaForm = lazy(() => import('pl-fe/features/security/mfa-form'));
export const ModalRoot = lazy(
  () => import('pl-fe/features/ui/components/modal-root'),
);
export const OnboardingWizard = lazy(
  () => import('pl-fe/features/onboarding/onboarding-wizard'),
);
export const ProfileHoverCard = lazy(
  () => import('pl-fe/components/profile-hover-card'),
);
export const SidebarMenu = lazy(() => import('pl-fe/components/sidebar-menu'));
export const StatusHoverCard = lazy(
  () => import('pl-fe/components/status-hover-card'),
);
export const Video = lazy(() => import('pl-fe/features/video'));
