---
title: Minnen
layout: page.njk
permalink: /minnen/
---

<div class="grid gap-3">
  {% for item in collections.minnen | reverse %}
    <a class="no-underline" href="{{ item.url }}">
      <div class="rounded-2xl border border-zinc-800 bg-black/30 p-4 hover:border-zinc-600">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="text-sm font-semibold">{{ item.data.title }}</div>
          {% if item.data.period %}<div class="text-xs font-mono text-zinc-500">{{ item.data.period }}</div>{% endif %}
        </div>
        {% if item.data.teaser %}<div class="mt-1 text-sm text-zinc-400">{{ item.data.teaser }}</div>{% endif %}
      </div>
    </a>
  {% endfor %}
</div>
