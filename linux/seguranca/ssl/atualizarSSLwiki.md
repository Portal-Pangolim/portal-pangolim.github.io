---
layout: default
description: "Procedimento de substituição de certificado SSL na Wiki, com verificações dos arquivos e do serviço."
title: Atualização de Certificado SSL da Wiki da Empresa Exemplo
---

# Atualização de Certificado SSL da Wiki da Empresa Exemplo (WikiJS + Docker + Nginx)
{:.no_toc}

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
### Objetivo

Atualizar o certificado SSL utilizado pela Wiki da Empresa Exemplo (`wiki.corp.example.com`) hospedada em containers Docker utilizando Nginx como proxy reverso.

---

## Ambiente

Servidor:

```bash
srv-wiki01.corp.example.com
```

Containers:

```bash
wikijs_nginx
wikijs
wikijs_db
```

Arquivos de certificado utilizados pelo Nginx:

```bash
/opt/wikijs/certs/wiki.crt
/opt/wikijs/certs/wiki.key
```

Mapeamento Docker:

```bash
/opt/wikijs/certs:/etc/nginx/certs:ro
```

---

## 1. Verificar validade do certificado atual

Executar:

```bash
docker exec -it wikijs_nginx openssl x509 \
-in /etc/nginx/certs/wiki.crt \
-noout -dates -issuer -subject
```

Exemplo:

```text
notBefore=Jan 1 00:00:00 2025 GMT
notAfter=Dec 31 23:59:59 2025 GMT
subject=CN=*.corp.example.com
issuer=GlobalSign RSA OV SSL CA 2018
```

Caso a data `notAfter` esteja expirada, realizar a atualização.

---

## 2. Localizar novo certificado

Exemplo de diretório recebido da equipe responsável:

```bash
/tmp/cert2026
```

Conteúdo:

```text
0_Empresa_Exemplo_OrganizationSSL_2026.cer
cadeia_completa_globalsign.pem
corp.example.com.pem
empresa_exemplo_certificado_2026.key
```

Verificar validade:

```bash
openssl x509 \
-in /tmp/cert2026/corp.example.com.pem \
-noout -dates -subject -issuer
```

Exemplo:

```text
notBefore=Jan 1 00:00:00 2026 GMT
notAfter=Dec 31 23:59:59 2026 GMT
subject=CN=*.corp.example.com
```

---

## 3. Validar se certificado e chave correspondem

Verificar hash do certificado:

```bash
openssl x509 -noout -modulus \
-in /tmp/cert2026/corp.example.com.pem | openssl md5
```

Verificar hash da chave:

```bash
openssl rsa -noout -modulus \
-in /tmp/cert2026/empresa_exemplo_certificado_2026.key | openssl md5
```

Os hashes devem ser idênticos.

Exemplo:

```text
MD5(stdin)= 0123456789abcdef0123456789abcdef
MD5(stdin)= 0123456789abcdef0123456789abcdef
```

---

## 4. Realizar backup do certificado atual

```bash
cd /opt/wikijs/certs

cp wiki.crt wiki.crt.bkp-$(date +%F)
cp wiki.key wiki.key.bkp-$(date +%F)
```

---

## 5. Atualizar arquivos

Substituir o certificado antigo:

```bash
cp /tmp/cert2026/corp.example.com.pem \
/opt/wikijs/certs/wiki.crt

cp /tmp/cert2026/empresa_exemplo_certificado_2026.key \
/opt/wikijs/certs/wiki.key
```

Ajustar permissões caso necessário:

```bash
chmod 644 /opt/wikijs/certs/wiki.crt
chmod 600 /opt/wikijs/certs/wiki.key
```

---

## 6. Validar configuração do Nginx

Executar:

```bash
docker exec wikijs_nginx nginx -t
```

Resultado esperado:

```text
syntax is ok
test is successful
```

---

## 7. Recarregar Nginx

Sem necessidade de reiniciar os containers:

```bash
docker exec wikijs_nginx nginx -s reload
```

---

## 8. Validar novo certificado publicado

Executar:

```bash
openssl s_client \
-connect wiki.corp.example.com:443 \
</dev/null 2>/dev/null | \
openssl x509 -noout -dates -subject
```

Resultado esperado:

```text
notBefore=Jan 1 00:00:00 2026 GMT
notAfter=Dec 31 23:59:59 2026 GMT
subject=CN=*.corp.example.com
```

---

## 9. Verificar cadeia de certificação

Executar:

```bash
openssl s_client \
-connect wiki.corp.example.com:443 \
-servername wiki.corp.example.com
```

Resultado esperado:

```text
Verify return code: 0 (ok)
```

---

## Troubleshooting

### Certificado e chave incompatíveis

Erro:

```text
certificate and private key do not match
```

Verificar novamente os hashes MD5 do certificado e da chave.

---

### Certificado expirado

Verificar:

```bash
openssl x509 -in wiki.crt -noout -dates
```

---

### Navegador exibindo "Inseguro"

Validar:

* Certificado atualizado.
* Cadeia completa da GlobalSign instalada.
* Cache do navegador limpo.
* Ausência de conteúdo misto (HTTP dentro de página HTTPS).

---

## Evidência de sucesso

```bash
curl -kI https://wiki.corp.example.com
```

Resultado:

```text
HTTP/1.1 200 OK
```

```bash
openssl s_client -connect wiki.corp.example.com:443
```

Resultado:

```text
Verify return code: 0 (ok)
```
