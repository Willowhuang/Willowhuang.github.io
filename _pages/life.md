---
title: Life
nav: life
permalink: /life/
description: "Photographs, personal notes, and life beyond robotics. Original content forthcoming."
---

<p class="eyebrow">Beyond research</p>

# Life, outside the lab

<p class="page-intro">{{ site.data.life.intro | escape }}</p>

<div class="content-section">
  <h2>A few moments</h2>
  <p class="media-note">A little space for future photographs. The tiles below are placeholders.</p>
  {% include life-gallery.html %}
</div>

<div class="content-section life-notes">
  <h2>Notes along the way</h2>
  {% for note in site.data.life.notes %}
  <details>
    <summary>{{ note.title | escape }}{% if note.placeholder %}<span class="details-meta">Forthcoming</span>{% endif %}</summary>
    <div class="note-content">{{ note.text | markdownify }}</div>
  </details>
  {% endfor %}
</div>
