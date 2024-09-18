<!-- more badges plz! -->
 ![GitHub contributors](https://img.shields.io/github/contributors/mkljczk/pl-fe)
 ![GitHub last commit (branch)](https://img.shields.io/github/last-commit/mkljczk/pl-fe/develop)
 ![GitHub commit activity](https://img.shields.io/github/commit-activity/m/mkljczk/pl-fe)

## Description

`pl-fe` is a social networking client app forked from [Soapbox](https://gitlab.com/soapbox-pub/soapbox/). It is intended to be used with [`pl`](https://github.com/mkljczk/pl) backend, but works with any Mastodon API-compatible software.

### Differences compared to Soapbox

- **Broader compatibility**: The compatibility matrix has been updated to support more features on various backends. Support for features specific to Mitra, Toki, GoToSocial and Akkoma has been added, more are coming soon.
- **WYSIWYG status composer**: You can use the WYSIWYG editor for advanced text formatting on any backend with Markdown support.
- **Language detection**: When you write a post, the language gets detected automatically with great accuracy. You can always select it manually.
- **Drafts**: You can save a post you are working on and finish it later. Drafts are only stored locally and work with any backend.
- **Quote anywhere**: If your backend supports quote posts, you can now quote a post by simply putting the link in your post, so you can now quote other posts in a reply.
- **Interaction circles**: A fun feature you might know from third-party tools for Twitter. You can generate a picture that represents the accounts you interact the most with.

There is more to mention. `pl-fe` includes various minor improvements and visual changes.

## Try it out

No need to install or download. You just want to preview `pl-fe` connectedo to **any existing MastoAPI-compatible server?** Try opening [pl.mkljczk.pl](https://pl.mkljczk.pl) — enter server's domain name to use `pl-fe` on any server!

It's working with this APIs:

<!-- This list can be switched to a comparison table -->

* Mastodon
* Pleroma
* PL
* Rebased
* Akkoma
* Mitra
* Toki
* GoToSocial

When you're done and want to use `pl-fe` as the default frontend on your server, just download the latest build from [pl.mkljczk.pl/pl-fe.zip](http://pl.mkljczk.pl/pl-fe.zip) and install it following the instructions for your backend. 

For example, on a Pleroma compatible installation you can use:

```sh
curl -O http://pl.mkljczk.pl/pl-fe.zip
unzip pl-fe.zip -d /opt/pleroma/instance/static/
rm pl-fe.zip
```

## Contribute

Code contributions are welcome.

You can easily build your development environment by cloning this repository.

There's a VSCode / [VsCodium](https://vscodium.com/) special configuration already in. 

By using a terminal, install the source code and run a local client in your device. 

### Requirements
* **NodeJS** stable version (you can get it by using the tool `nvm`).
* **yarn** installed, you can install by using NodeJS.
* \> 8GB ram device to run everything altogether.

```sh
# install the sources
yarn

# run the local environment
yarn dev
```

Contributions are accepted as **Pull Requests** on GitHub. Remember to keep them simple and atomic, just focus on one thing per contribution. Try to edit fewer files as possible. Always do your best!

## Translate

Even if can't contribute proposing code, maybe you can join the project translating `pl-fe` in your spoken language. 

[Weblate](https://hosted.weblate.org/projects/pl-fe/) is used for project translation. Simply create your account in the App by linking it with your GitHub account and start translating.

Contributions will be peridiocally merged in the source code with their author's attributions.  

<a href="https://hosted.weblate.org/engage/pl-fe/">
<img src="https://hosted.weblate.org/widget/pl-fe/287x66-grey.png" alt="Translation status" />
</a>

## License

`pl-fe` is a fork of Soapbox, which was forked from [Gab Social](https://github.com/GabOpenSource/gab-social), which is a fork of [Mastodon](https://github.com/mastodon/mastodon/).

This program is free software: you can redistribute it and/or modify
it under the terms of the **GNU Affero General Public License** as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

---

Follow [my Pleroma account](https://pl.fediverse.pl/@mkljczk) to stay up to date on `pl-fe` development. You can also join the [project community on Discord](https://discord.gg/NCZZsqqgUH).
