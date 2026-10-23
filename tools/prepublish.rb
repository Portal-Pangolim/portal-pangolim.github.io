# frozen_string_literal: true
require 'yaml'
require 'uri'

# Inspeção local: não publica, não consulta hospedagem nem altera configuração.
config = YAML.safe_load(File.read(ARGV[0] || '_config.yml'), permitted_classes: [], aliases: false)
url = config.fetch('url', '').to_s
baseurl = config.fetch('baseurl', '').to_s
uri = URI.parse(url)
unless uri.scheme == 'https' && uri.host && uri.path.to_s.match?(%r{\A/?\z}) && !uri.query && !uri.fragment && !uri.userinfo
  abort 'Publicação bloqueada: confirme url HTTPS com apenas a origem e sem credenciais.'
end
if uri.host.match?(/(?:\A|\.)(?:example|test|localhost)(?:\.|\z)/i) || uri.host.end_with?('.invalid', '.example', '.test')
  abort 'Publicação bloqueada: origem de teste não pode ser publicada.'
end
unless baseurl.empty? || baseurl.match?(%r{\A/[a-zA-Z0-9_-]+(?:/[a-zA-Z0-9_-]+)*\z})
  abort 'Publicação bloqueada: baseurl deve ser vazio ou um caminho absoluto sem barra final.'
end
puts 'Configuração sintaticamente válida. Hospedagem, domínio e autorização de publicação exigem confirmação humana.'
