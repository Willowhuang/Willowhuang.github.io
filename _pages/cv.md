---
title: CV
nav: cv
permalink: /cv/
description: "Curriculum vitae and academic background of Yuanliu Huang, M.S. student in Electrical and Computer Engineering at Carnegie Mellon University."
---

# Curriculum vitae

{% assign cv_file = site.static_files | where: 'path', site.cv | first %}
{% if site.cv and cv_file %}
<p class="page-intro">An overview of my academic background and research experience.</p>
<p><a class="button-link" href="{{ site.cv | relative_url }}">Download CV <span class="button-meta">PDF</span> <span aria-hidden="true">↗</span></a></p>
{% else %}
<div class="empty-state">
  <p class="empty-state-label">CV PDF forthcoming</p>
  <p>My curriculum vitae will be available here once the PDF has been added.</p>
</div>
{% endif %}

<div class="content-section">
  <h2>Academic background</h2>
  <p><strong>Carnegie Mellon University</strong><br>M.S. in Electrical and Computer Engineering<br>Expected graduation: December 2026<br>Research advisor: Prof. Zackory Erickson</p>
</div>

<div class="content-section">
  <h2>Research interests</h2>
  <p>{{ site.data.interests | join: ' · ' | escape }}</p>
  <a href="{{ '/research/' | relative_url }}">Explore my research <span aria-hidden="true">→</span></a>
</div>
