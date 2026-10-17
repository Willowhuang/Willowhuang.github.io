---
title: Publications
nav: publications
permalink: /publications/
description: "Publicly available research publications and materials from Yuanliu Huang."
---

# Publications

<p class="page-intro">Research papers and their accompanying materials.</p>

{% assign approved_publications = site.data.publications | where: 'public', true | where: 'release_approved', true %}
{% if approved_publications.size > 0 %}
{% for publication in approved_publications %}{% include publication-card.html publication=publication %}{% endfor %}
{% else %}
<div class="empty-state">
  <p class="empty-state-label">Publications forthcoming</p>
  <p>Publicly available papers and approved research materials will be listed here as they become available.</p>
</div>
{% endif %}

<p>For an overview of my current research directions, please see <a href="{{ '/research/' | relative_url }}">Research</a> and <a href="{{ '/projects/' | relative_url }}">Projects</a>.</p>
