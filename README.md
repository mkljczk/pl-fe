`pl-fe` is a social networking client app forked from [Soapbox](https://gitlab.com/soapbox-pub/soapbox/). It is intended to be used with [`pl`](https://github.com/mkljczk/pl) backend, but works with any Mastodon API-compatible software.

## Differences compared to Soapbox

- **Broader compatibility**: The compatibility matrix has been updated to support more features on various backends. Support for features specific to GoToSocial and Akkoma has been added, more are coming soon.
- **WYSIWYG status composer**: You can use the WYSIWYG editor for advanced text formatting on any backend with Markdown support.
- **Language detection**: When you write a post, the language gets detected automatically with great accuracy. You can always select it manually.
- **Drafts**: You can save a post you are working on and finish it later. Drafts are only stored locally and work with any backend.
- **Quote anywhere**: If your backend supports quote posts, you can now quote a post by simply putting the link in your post, so you can now quote other posts in a reply.
- **Interaction circles**: A fun feature you might know from third-party tools for Twitter. You can generate a picture that represents the accounts you interact the most with.

There is more to mention. `pl-fe` includes various minor improvements and visual changes.

## Try it out

Want to test `pl-fe` with **any existing MastoAPI-compatible server?** Try [pl.mkljczk.pl](https://pl.mkljczk.pl) — enter your server's domain name to use `pl-fe` on any server!

# License

`pl-fe` is a fork of Soapbox, which was forked from [Gab Social](https://github.com/GabOpenSource/gab-social), which is a fork of [Mastodon](https://github.com/mastodon/mastodon/).

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
