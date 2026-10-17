---
title: Projects
nav: projects
permalink: /projects/
description: "Robotics research and demonstrations by Yuanliu Huang, including assistive feeding, adaptive food scooping, and Magic Bubbles."
---

# Projects & demonstrations

<p class="page-intro">Experiences with physical robots, from assistive manipulation to interactive demonstrations.</p>

<p class="media-note">Original photographs and videos will be added here. The illustrations below are clearly labeled media placeholders.</p>

<div class="project-list">
  {% for project in site.data.projects %}{% include project-card.html project=project context='projects' %}{% endfor %}
</div>
