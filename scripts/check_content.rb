# frozen_string_literal: true
# Validate editable metadata before Jekyll builds. Ruby standard library only.
require 'yaml'

ROOT = File.expand_path('..', __dir__)
errors = []
data = {}
Dir[File.join(ROOT, '_data', '*.yml')].each do |file|
  begin
    data[File.basename(file, '.yml')] = YAML.safe_load(File.read(file))
  rescue StandardError => e
    errors << "#{file}: #{e.message}"
  end
end
config = YAML.safe_load(File.read(File.join(ROOT, '_config.yml')))

check_url = lambda do |url, context|
  if !url.is_a?(String) || url !~ %r{\A(?:https://|mailto:|/(?!/)|#)}
    errors << "#{context}: use an https URL or a root-relative local path"
  elsif url.start_with?('/')
    path = File.join(ROOT, url.split(/[?#]/).first)
    # Page links are checked against generated output instead of source files.
    if File.extname(path) != '' && !File.file?(path)
      errors << "#{context}: missing local file #{url}"
    end
  end
end
check_media = lambda do |media, context|
  next unless media
  unless [true, false].include?(media['approved'])
    errors << "#{context}: approved must be a boolean"
  end
  if media['approved'] == true
    type = media['type']
    if type == 'youtube'
      errors << "#{context}: invalid YouTube ID" unless media['youtube_id'].to_s.match?(/\A[\w-]{11}\z/)
    elsif %w[image local autoplay].include?(type)
      check_url.call(media['src'], context)
    else
      errors << "#{context}: unknown media type #{type.inspect}"
    end
    errors << "#{context}: add meaningful alt text" if media['alt'].to_s.strip.empty?
    if type == 'autoplay' && media['poster'].to_s.empty?
      errors << "#{context}: autoplay clips need a poster"
    end
    if %w[local autoplay youtube].include?(type) && media['description'].to_s.strip.empty?
      errors << "#{context}: add a text description of the demonstration"
    end
    %w[poster captions].each { |key| check_url.call(media[key], "#{context}.#{key}") if media[key] }
  elsif media['placeholder']
    check_url.call(media['placeholder'], context)
  end
end
check_links = lambda do |links, context|
  (links || []).each do |link|
    errors << "#{context}: resource link needs a label" if link['label'].to_s.strip.empty?
    check_url.call(link['url'], context)
  end
end

projects = data['projects'] || []
ids = projects.map { |p| p['id'] }
errors << 'Project IDs must be unique' unless ids.uniq == ids
projects.each do |project|
  context = "project #{project['id']}"
  errors << "#{context}: invalid ID" unless project['id'].to_s.match?(/\A[a-z0-9]+(?:-[a-z0-9]+)*\z/)
  errors << "#{context}: public must be a boolean" unless [true, false].include?(project['public'])
  %w[title summary status].each { |key| errors << "#{context}: missing #{key}" if project[key].to_s.strip.empty? }
  page = File.join(ROOT, '_projects', "#{project['id']}.md")
  errors << "#{context}: missing detail page" unless File.file?(page)
  check_media.call(project['media'], context)
  check_media.call(project['full_video'], "#{context}.full_video")
  (project.dig('comparison', 'items') || []).each_with_index do |item, i|
    check_media.call(item['media'], "#{context}.comparison.#{i}")
  end
  check_links.call(project['links'], context)
end
(data['research'] || []).each do |theme|
  errors << "Research theme #{theme['id']}: unknown project" if theme['project'] && !ids.include?(theme['project'])
  check_media.call(theme['media'], "research #{theme['id']}")
end
(data['publications'] || []).each_with_index do |paper, i|
  context = "publication #{i + 1}"
  approved = paper['public'] == true && paper['release_approved'] == true
  if approved
    %w[title authors venue year status].each do |key|
      errors << "#{context}: missing #{key}" if paper[key].to_s.strip.empty?
    end
    check_links.call(paper['links'], context)
    if paper['thumbnail']
      check_url.call(paper['thumbnail'], context)
      errors << "#{context}: add thumbnail_alt" if paper['thumbnail_alt'].to_s.empty?
    end
  elsif %w[title authors venue links thumbnail].any? { |key| paper[key] && !paper[key].empty? }
    errors << "#{context}: keep unapproved identifying metadata outside this public repository"
  end
end
((data['life'] || {})['gallery'] || []).each_with_index do |photo, i|
  next unless photo['approved'] == true
  check_url.call(photo['src'], "life photo #{i + 1}")
  check_url.call(photo['full'], "life photo #{i + 1}") if photo['full']
  errors << "life photo #{i + 1}: add alt text" if photo['alt'].to_s.empty?
end
%w[avatar cv].each { |key| check_url.call(config[key], key) if config[key] }
check_url.call(config['favicon'], 'favicon')
unless errors.empty?
  warn errors.join("\n")
  exit 1
end
puts "Content OK: #{projects.size} projects, #{(data['research'] || []).size} research themes, #{(data['publications'] || []).size} approved/publication entries."
