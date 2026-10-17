---
title: Research
nav: research
permalink: /research/
description: "Yuanliu Huang's research themes: human–robot interaction and assistance, adaptive robot manipulation, shared autonomy, and safety-aware robotics."
---

# Research

<p class="page-intro">Robotic systems and algorithms shaped by human needs.</p>

I am interested in the technical challenges that arise when robots act in the physical world alongside people: learning to manipulate changing materials, providing physical assistance, and adapting interaction to an ongoing activity.

Human-centered robotics connects these questions. For me, it spans robot learning, manipulation, and physical interaction as well as human–robot interaction.

<p class="media-note">The themes below describe research experience and directions. Ongoing work is labeled as such.</p>

{% for theme in site.data.research %}{% include research-card.html theme=theme %}{% endfor %}
