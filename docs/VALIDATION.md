# Implementation and validation

Validation performed October 17, 2026. No remote repository, pull request, GitHub settings, merge, or deployment was created or changed.

## Checks completed

- Actual **Jekyll 3.10.0** production build, with strict front matter: successful. Output contains 11 HTML pages: About, Research, Publications, Projects, Life, CV, four project details, and 404.
- Root-site check: **210 local references** resolve, including assets, routes, fragments, and accessibility references. Descriptions, canonical links, h1 counts, image alt text, and duplicate IDs pass.
- A separate build with `baseurl: /preview` passes the same route/asset checks.
- Editable YAML check passes: four projects, three research themes, no approved publication entries, no missing configured assets or fictitious social links.
- **10 JavaScript behavior tests pass**: deferred loading, muted autoplay, off-screen pause/resume, persistent user pause, reduced-motion start/change, background-tab handling, manual fallback without IntersectionObserver, full-video behavior, blocked autoplay, YouTube deferral/pause requests, and mobile menu state/Escape handling.
- A separate, temporary Jekyll source copy renders synthetic H.264 video, full video, YouTube thumbnail component, and side-by-side comparison components. Its 12 HTML pages / 254 local references pass. No YouTube iframe is emitted before interaction; all player/description IDs are unique. An unapproved publication sentinel is absent, while an explicitly public synthetic publication fixture renders. Test-only content was never added to the site's source or Git history.
- Source/private directories and documentation are absent from generated output. No anonymous-review identifying details, unapproved papers, participant media, placeholder analytics, or custom-domain records are included.
- JavaScript syntax and Git whitespace checks pass.

## Environment and limits

The workspace was empty and was not a Git checkout. Its managed permissions prevent creating `.git` here. The Minimal Light import and `feature/academic-website` branch use external metadata at `/private/tmp/yuanliu-academic-site.git`. The local `.review/` directory contains a portable Git bundle and patch so the work is recoverable in a normal checkout. The default branch contains only the separate official-template baseline; all site changes are on the feature branch.

Shell network access prevented `bundle install`. For validation only, official tagged upstream Jekyll and pure Ruby dependency sources were retrieved through the GitHub connector into `/private/tmp/yuanliu-jekyll-runtime`, then the actual `Jekyll::Site` build ran under the installed Ruby 2.6. The site did not need dependency modifications, custom plugins, or an alternate renderer. The standard Ruby 3.3 + Bundler workflow is configured for CI but has **not** run on GitHub. No dependency source was added to this repository.

The sandbox disallowed binding a local HTTP port. A portable file preview was generated from the actual Jekyll output, rewriting only local HTML resource/navigation paths for `file://` use. It is in `.review/preview/`, excluded from Jekyll and Git. The production source retains correct root-relative GitHub Pages paths.

Browser access was attempted through Computer Use. macOS screen-capture access was declined, so desktop/mobile screenshots, visual overflow checks, native playback, and real browser reduced-motion behavior were **not visually verified**. The automated behavior tests use a mocked DOM. Actual YouTube remote playback, audio/captions, external link availability, and real research media remain untested. The YouTube component fixture used an inactive example ID and was never loaded remotely.

## Before publication

Supply the portrait, CV, approved contact links, specific technical contributions, original robotics photos/videos, approved publication metadata, and personal Life content. Add any participant media only after explicit public-release approval. Review the real rendered desktop/mobile pages and native video behavior, then run the CI build in the connected repository.

After review and approval, use Settings → Pages → GitHub Actions and deliberately run `Deploy reviewed site` from `main`. Pushing or opening a PR does not deploy the site. The target repository returned 404 through the connected account, so a remote PR could not be prepared in this session.
