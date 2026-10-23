# frozen_string_literal: true

# Renderização local/offline. Nunca limpa nem sobrescreve o _site do mantenedor.
ENV["BUNDLE_FROZEN"] = "true"
ENV["BUNDLE_DISABLE_VERSION_CHECK"] = "true"
ENV["JEKYLL_ENV"] = "production"
require "bundler/setup"
require "jekyll"
require "nokogiri"
require "json"
require "optparse"
require "set"
require "pathname"

ROOT = File.expand_path("..", __dir__)
OPTIONS = { baseurl: "", url: "https://portal.example.test", baseline: false }
OptionParser.new do |p|
  p.on("--baseline", "Registra falhas sem convertê-las em aprovação") { OPTIONS[:baseline] = true }
  p.on("--baseurl PATH") { |v| OPTIONS[:baseurl] = v }
  p.on("--url URL", "Origem de teste; não configura a publicação") { |v| OPTIONS[:url] = v }
  p.on("--write PATH", "Grava apenas em um diretório NOVO dentro de .tmp") { |v| OPTIONS[:write] = v }
  p.on("--report PATH", "Relatório JSON em .tmp") { |v| OPTIONS[:report] = v }
end.parse!

def artifact_path(relative, must_be_new: false)
  path = File.expand_path(relative, ROOT)
  prefix = File.join(ROOT, ".tmp") + File::SEPARATOR
  raise "Artefato deve ficar dentro de .tmp" unless path.start_with?(prefix)
  raise "Destino já existe; use um diretório novo" if must_be_new && File.exist?(path)
  path
end

# A validação não depende de API GitHub, DNS, links externos ou credenciais.
require "socket"
network_guard = Module.new do
  def new(*) = raise("Rede não permitida na validação estática")
  def open(*) = raise("Rede não permitida na validação estática")
  def tcp(*) = raise("Rede não permitida na validação estática")
end
[TCPSocket, UDPSocket, Socket].each { |klass| klass.singleton_class.prepend(network_guard) }

Dir.chdir(ROOT)
Jekyll::PluginManager.require_from_bundler
configuration = Jekyll.configuration(
  "source" => ROOT, "incremental" => false,
  "url" => OPTIONS[:url], "baseurl" => OPTIONS[:baseurl],
  "repository" => "Portal-Pangolim/portal-pangolim.github.io"
)
configuration["exclude"] |= %w[tools test .tmp node_modules package.json package-lock.json]
destination = artifact_path(OPTIONS[:write], must_be_new: true) if OPTIONS[:write]
configuration["destination"] = destination if destination
site = Jekyll::Site.new(configuration)
site.read
site.generate
site.render

pages = site.pages.select { |p| p.output_ext == ".html" }
documents = pages.to_h { |p| [p.url, Nokogiri::HTML(p.output)] }
normalize = ->(path) { Addressable::URI.unencode(path).sub(%r{/index\.html\z}, "/") }
base = OPTIONS[:baseurl]
paths = (site.pages.map(&:url) + site.static_files.map(&:relative_path)).map { |path| normalize.call(path) }.to_set
errors = []
missing = []
fragments = []
checked = 0
seen_titles = {}
seen_descriptions = {}
heading_pages = []
mermaid_pages = 0
metadata_missing = 0

pages.each do |page|
  document = documents.fetch(page.url)
  source = page.path
  main = document.at_css("main")
  next if page.data["layout"].nil? && !main # sitemap et al. não são artigos

  %w[title description].each do |key|
    value = page.data[key].to_s.strip
    if value.empty?
      metadata_missing += 1
      errors << { check: "front_matter", source: source, field: key }
    else
      seen = key == "title" ? seen_titles : seen_descriptions
      errors << { check: "duplicate_#{key}", source: source, other: seen[value] } if seen.key?(value)
      seen[value] = source
    end
  end
  errors << { check: "layout", source: source } unless page.data["layout"] == "default"
  count = main ? main.css("h1").size : 0
  heading_pages << { source: source, h1: count } if count != 1
  unless count == 1 || page.data["heading_examples"] == true
    errors << { check: "article_h1", source: source, count: count }
  end
  mermaid_pages += 1 unless document.css("code.language-mermaid").empty?
  duplicate_ids = document.css("[id]").group_by { |n| n["id"] }.select { |_, nodes| nodes.size > 1 }.keys
  errors << { check: "duplicate_ids", source: source, ids: duplicate_ids } unless duplicate_ids.empty?
  document.css("img").each do |image|
    errors << { check: "image_alt", source: source } if image["alt"].nil?
    errors << { check: "image_dimensions", source: source } unless image["width"] && image["height"]
  end
  document.css("a[href], img[src], link[href], script[src]").each do |node|
    raw = node["href"] || node["src"]
    next if raw.nil? || raw.empty? || raw.match?(/\A(?:mailto|tel|data):/i)
    if raw.match?(/\Ajavascript:/i)
      errors << { check: "active_url", source: source }
      next
    end
    begin
      target = Addressable::URI.parse(OPTIONS[:url] + base + page.url).join(raw).normalize
      next unless target.origin == OPTIONS[:url]
      checked += 1
      path = Addressable::URI.unencode(target.path)
      unless base.empty?
        unless path == base || path.start_with?(base + "/")
          missing << { source: source, target: path, check: "baseurl" }
          next
        end
        path = path.delete_prefix(base)
        path = "/" if path.empty?
      end
      unless paths.include?(normalize.call(path))
        missing << { source: source, target: path, global: !!node.ancestors("aside").first }
        next
      end
      next if target.fragment.nil? || target.fragment.empty?
      other = documents[path] || documents[path.sub(%r{/\z}, "/index.html")]
      next unless other
      id = Addressable::URI.unencode(target.fragment)
      unless other.css("[id], [name]").any? { |n| n["id"] == id || n["name"] == id }
        fragments << { source: source, target: path + "#" + id }
      end
    rescue Addressable::URI::InvalidURIError
      errors << { check: "invalid_uri", source: source }
    end
  end
end

errors += missing.map { |row| row.merge(check: row[:check] || "missing_target") }
errors += fragments.map { |row| row.merge(check: "missing_fragment") }
report = {
  mode: OPTIONS[:baseline] ? "baseline_with_failures" : "validation",
  ruby: RUBY_VERSION, jekyll: Jekyll::VERSION,
  test_origin: OPTIONS[:url], baseurl: base,
  rendered_html: pages.size, static_files: site.static_files.size,
  references_checked: checked, missing_targets: missing.size,
  unique_missing_targets: missing.map { |r| r[:target] }.uniq.size,
  missing_global: missing.count { |r| r[:global] }, missing_fragments: fragments.size,
  metadata_errors: metadata_missing, non_single_h1: heading_pages,
  mermaid_pages: mermaid_pages, errors: errors, passed: errors.empty?
}
if destination
  site.write # somente o diretório novo, sem cleanup de nenhum artefato anterior
  report[:site_dir] = Pathname.new(destination).relative_path_from(Pathname.new(ROOT)).to_s.tr("\\", "/")
end
if OPTIONS[:report]
  path = artifact_path(OPTIONS[:report], must_be_new: true)
  FileUtils.mkdir_p(File.dirname(path))
  File.write(path, JSON.pretty_generate(report) + "\n")
end
puts JSON.generate(report.reject { |k, _| k == :errors })
unless errors.empty?
  errors.group_by { |row| row[:check] }.each { |check, rows| warn "#{check}: #{rows.size}" }
  errors.first(12).each { |row| warn JSON.generate(row) }
end
exit(errors.empty? || OPTIONS[:baseline] ? 0 : 1)
