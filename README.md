# Yuanliu Huang — academic website

A lightweight Jekyll site for `https://willowhuang.github.io/`, built on [Minimal Light](https://github.com/yaoyao-liu/minimal-light). No npm installation, remote fonts, analytics, or custom Jekyll plugins. Theme provenance is in [UPSTREAM.md](UPSTREAM.md).

## Editing guide

| Content | Location |
| --- | --- |
| Name, degree, affiliation, contact, portrait, CV | `_config.yml` |
| Biography and homepage sections | `index.md` |
| Research interests | `_data/interests.yml` |
| Research themes, methods, contributions, status | `_data/research.yml` |
| Project descriptions, media, links, contributions | `_data/projects.yml` |
| Project page shells / optional extra Markdown | `_projects/<id>.md` |
| Approved publications | `_data/publications.yml` |
| Life introduction, gallery, short notes | `_data/life.yml` |
| Top-level pages and navigation | `_pages/`, `_data/navigation.yml` |
| Reusable layouts and components | `_layouts/`, `_includes/` |
| Custom styling / media behavior | `_sass/academic.scss`, `assets/js/site.js` |

Edit the two biography paragraphs in `index.md`. Profile/contact fields live in `_config.yml`; leave unavailable links empty to hide them. Restart Jekyll after configuration changes. Replace the original portrait placeholder by uploading your photograph to `assets/images/` and setting `avatar` and `avatar_alt`.

## Projects and research

Edit existing entries in `_data/projects.yml`. `contribution` is intentionally empty until specific contributions are supplied. Keep status and descriptions factual, particularly for ongoing food scooping research.

To add a project, duplicate an entry, choose a unique `id`, and add `_projects/<id>.md`:

```yaml
---
title: "Your approved project title"
project_id: your-project-id
description: "A concise, factual description."
---
```

The project page uses the shared YAML data. Optional extra Markdown can follow its front matter. Set `featured: true` for a homepage preview and `public: true` to render the content. A project with `public: false` shows no details, but its page shell still exists; remove it or set `published: false` in its front matter if no route should be generated. Hidden flags are presentation controls, **not privacy protection**. Keep unpublished/private content outside the repository.

## Videos and images

In a project's `media` field, select `placeholder`, `image`, `autoplay`, `local`, or `youtube`. Real media render only with `approved: true`; use this only after confirming public release. Original human-subject media require explicit public-release approval. Upload only approved assets, since static assets can be reachable even when not referenced by a page.

For a short demonstration, upload a compressed H.264 MP4 to `assets/videos/` and an original poster image to `assets/images/`, then set:

```yaml
media:
  type: autoplay
  approved: true
  src: /assets/videos/your-demonstration.mp4
  poster: /assets/images/your-demonstration.jpg
  title: "Approved demonstration title"
  alt: "A concise description of the robot and scene."
  description: "Describe the actions and what the visitor should observe."
  caption: "A factual caption, including limitations if applicable."
```

Clips are muted, looping, inline, and loaded only when visible. Native controls and a play/pause button remain available. Clips pause off-screen and in background tabs; a visitor's manual pause persists. Reduced motion prevents autoplay and deferred video downloads until explicit play. Without JavaScript, a direct MP4 link works. Without IntersectionObserver, playback stays manual.

Use `type: local` for a longer MP4 with normal controls and `preload="none"`. Put optional `captions: /assets/videos/your-video.en.vtt` in the media object for speech/audio; provide a useful `description` for every demonstration. `full_video` takes the same object to add a full demonstration below project details. `type: image` uses `src`, `alt`, and optional `caption`.

For YouTube, supply the 11-character ID and an optional **local** poster:

```yaml
full_video:
  type: youtube
  approved: true
  youtube_id: "YOUR_REAL_ID" # replace with the actual 11-character ID
  poster: /assets/images/your-original-poster.jpg
  title: "Approved full demonstration"
  alt: "Description of this demonstration's poster."
  description: "A text description of the full demonstration."
  caption: "Full demonstration · YouTube"
```

No YouTube iframe, thumbnail request, cookie, or API script loads before the visitor clicks. The embed uses `youtube-nocookie.com`, stays silent until the visitor starts playback, and receives a pause request when off-screen or in a hidden tab. A normal YouTube link remains without JavaScript. External video or code links also fit in `links: [{ label: "Video", url: "https://…" }]`.

For multiple views, add `comparison: { title: "...", description: "...", items: [...] }`. Each item has `label` and a complete `media` object. `_includes/video-comparison.html` arranges them side by side on desktop and stacks them when needed. Playback is independent; only use comparison labels and conclusions supported by actual evidence. No comparison results are supplied in this starter.

Keep short clips around 5–15 seconds, 720p, 24–30 fps, ideally under 3–5 MB. Avoid uploading camera originals or long videos to Git. Host longer recordings externally. Example compression (requires ffmpeg):

```bash
ffmpeg -i original.mov -vf "scale=1280:-2" -r 24 \
  -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p \
  -movflags +faststart -an assets/videos/your-demonstration.mp4
ffmpeg -i assets/videos/your-demonstration.mp4 -frames:v 1 \
  -q:v 3 assets/images/your-demonstration.jpg
```

Use JPEG/WebP photos at reasonable sizes (roughly 1600px maximum for galleries, less for posters). The build check flags assets over 12 MiB. Replace placeholder illustrations with your own approved media; they are not evidence of robot behavior.

## Publications

`_data/publications.yml` starts empty. Add metadata **only after public release has been approved**:

```yaml
- title: "Approved public title"
  authors: "Approved author list, in the correct order"
  venue: "Approved venue or public preprint designation"
  year: 2027
  status: "Submitted" # use the actual status; never imply acceptance
  public: true
  release_approved: true
  # thumbnail: /assets/images/your-approved-thumbnail.jpg
  # thumbnail_alt: "Description of the figure"
  links:
    - label: PDF
      url: /assets/files/your-approved-paper.pdf
    # Optional labels: Project, Video, Code
```

Both flags must be boolean `true`. Cards support thumbnails, authors, venue/year, status, PDF, project, video, and code links. The homepage preview appears automatically when approved entries exist. Anonymous-review titles, author lists, venues, PDFs, and identifying submission details are deliberately absent. Store them separately; an excluded directory or a hidden page does not make files private in a public Git repository.

## Life and CV

In `_data/life.yml`, replace gallery tiles with `approved: true`, `src`, `alt`, `title`, and optional `caption` / `full` (full-size photo). Photos open directly without a gallery library. Update `intro` and the expandable `notes` entries; note text accepts Markdown. The initial categories and tiles make no claims about specific hobbies.

Upload your real CV to `assets/files/Yuanliu_Huang_CV.pdf`, then set `cv: /assets/files/Yuanliu_Huang_CV.pdf` in `_config.yml`. The download appears only if the file exists. The navigation and sidebar always link to the working CV page. Do not generate a substitute CV.

## Local preview and checks

Use Ruby 3.3 and Bundler (system Ruby on recent macOS installations may be too old):

```bash
bundle install
bundle exec jekyll serve --livereload
```

Open `http://127.0.0.1:4000/`. Before reviewing changes:

```bash
ruby scripts/check_content.rb
JEKYLL_ENV=production bundle exec jekyll build --strict_front_matter --trace
python3 scripts/check_site.py _site
node --test tests/media.test.cjs
```

Python 3.9+ and Node 18+ are used only for checks, not the website build. The checks cover editable data, generated routes/assets/fragments, metadata, private-source exclusion, and media behavior. Inspect desktop and mobile rendering after layout changes. To verify a project-site subpath, build with `--baseurl /preview` and run `check_site.py _site --baseurl /preview`.

## GitHub Pages and review

The intended repository is `Willowhuang/Willowhuang.github.io`. `url` is `https://willowhuang.github.io`, `baseurl` is empty, and no CNAME is needed. This checkout was empty and the target repository was not accessible through the connected GitHub account; no remote repository, PR, or deployment was created.

Changes are on `feature/academic-website`, based on a separate Minimal Light import commit. This environment prevents `.git` writes in the workspace, so its Git metadata is in `/private/tmp/yuanliu-academic-site.git`. A portable Git bundle and review patch are provided in the local `.review/` directory. To recover the feature branch into a normal checkout:

```bash
git clone -b feature/academic-website /absolute/path/to/academic-website.bundle academic-site
cd academic-site
```

Connect it to the intended repository, push the feature branch, and open a draft PR against the default branch. If that repository already has history, apply the supplied review patch on a feature branch based on its current default branch instead; inspect conflicts and build before pushing. Do not replace an existing history blindly.

The `Check site` workflow builds and checks feature-branch pushes and pull requests. After review and explicit approval to publish:

1. Merge the approved changes into `main` (adjust the workflow guard if the real default branch has another name).
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions**. Do not select branch deployment, which can publish on a push.
3. In **Actions → Deploy reviewed site → Run workflow**, select `main` and run it deliberately.

The deployment workflow has **only** a manual trigger, builds and checks before deployment, and uses the `github-pages` environment. No push/PR automatically publishes. No GitHub settings have been changed in this task. CI/deployment require a connected, writable repository and the usual Pages/Actions permissions.
