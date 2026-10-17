---
nav: about
description: "Yuanliu Huang — human-centered robotics at Carnegie Mellon University. Research in assistive robotics, adaptive manipulation, and human–robot interaction."
---

<h1>About me</h1>

I am an M.S. student in Electrical and Computer Engineering at **Carnegie Mellon University**, advised by **Prof. Zackory Erickson**. I expect to graduate in December 2026.

My research is in **human-centered robotics**: developing technically rigorous robotic systems and algorithms motivated by people's needs and the constraints of the physical world. My interests span robot learning, manipulation, physical interaction, assistive robotics, and human–robot interaction.

<p class="application-note">I am preparing applications for PhD programs beginning in <strong>Fall 2027</strong>.</p>

<div class="content-section interests-section">
  <h2>Research interests</h2>
  <ul class="interest-list">
    {% for interest in site.data.interests %}<li>{{ interest | escape }}</li>{% endfor %}
  </ul>
</div>

<div class="content-section">
  <div class="section-heading">
    <h2>Selected work</h2>
    <a href="{{ '/research/' | relative_url }}">Research overview <span aria-hidden="true">→</span></a>
  </div>
  <div class="project-list project-list--compact">
    {% for project in site.data.projects %}
    {% if project.featured and project.public %}
      {% include project-card.html project=project compact=true context='home' %}
    {% endif %}
    {% endfor %}
  </div>
  <p class="section-end-link"><a href="{{ '/projects/' | relative_url }}">All projects &amp; demonstrations <span aria-hidden="true">→</span></a></p>
</div>

{% assign approved_publications = site.data.publications | where: 'public', true | where: 'release_approved', true %}
{% if approved_publications.size > 0 %}
<div class="content-section">
  <div class="section-heading"><h2>Selected publications</h2><a href="{{ '/publications/' | relative_url }}">Full list <span aria-hidden="true">→</span></a></div>
  {% for publication in approved_publications limit:2 %}{% include publication-card.html publication=publication %}{% endfor %}
</div>
{% endif %}

<div class="content-section beyond-research">
  <h2>Beyond research</h2>
  <p>There is life beyond the lab, too. I’m making room here for photographs, personal notes, and the things I enjoy along the way.</p>
  <a href="{{ '/life/' | relative_url }}">A little more about life <span aria-hidden="true">→</span></a>
</div>
