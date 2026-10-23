---
layout: default
description: "Encaminhamento de consultas DNS com BIND: configuração, validação e diagnóstico do resolvedor."
title: BIND - Guia Completo de Encaminhamento Condicional
---

> **Exemplo fictício:** nomes sob example.com e endereços reservados para documentação; adapte e valide em laboratório antes do uso. Estes endereços não são destinos para testes na Internet.



# BIND: Guia Completo de Encaminhamento Condicional (*Conditional Forwarding*)
{:.no_toc}

> Material de estudo e de operação sobre encaminhamento condicional no BIND 9 (`named`): conceito, funcionamento interno, configuração, validação, troubleshooting e exercícios.

**Como usar este guia:** as seções 1 a 4 explicam a teoria; 5 a 8 são a prática (pode ser seguida como procedimento); 9 e 10 cobrem problemas e segurança; 11 e 12 são revisão (checklist, glossário e perguntas de fixação).

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

## 1. Conceitos básicos

### 1.1 Como o BIND resolve nomes normalmente

Um servidor DNS **recursivo** recebe uma pergunta do cliente e faz o trabalho de descobrir a resposta. Por padrão, ele percorre a hierarquia:

```mermaid
flowchart LR
  C[Cliente] --> R[BIND recursivo]
  R --> ROOT[Servidores raiz]
  ROOT --> TLD[Servidores do TLD .com]
  TLD --> AUT[Servidores autoritativos do domínio]
  AUT --> R
  R --> C
```

Se qualquer elo dessa cadeia falhar (autoritativo fora do ar, filtro de firewall, NS sem endereço resolvível), o cliente recebe `SERVFAIL`.

### 1.2 O que é encaminhamento (*forwarding*)

Em vez de percorrer a hierarquia, o BIND **repassa a pergunta a outro resolvedor** (o *forwarder*), que faz a resolução e devolve a resposta pronta. O BIND local guarda a resposta em cache e a entrega ao cliente.

### 1.3 O que é encaminhamento condicional

É o encaminhamento **aplicado apenas a domínios específicos**. A decisão é tomada pelo **nome consultado**: se o nome pertence à zona configurada (ou a qualquer subdomínio dela), a consulta segue para os forwarders definidos; todo o resto continua com a resolução normal.

**Analogia:** é como uma telefonista com uma lista de exceções. Para a maioria das ligações ela disca direto, mas para ligações com o prefixo "filial X" ela sempre transfere para o ramal de outra pessoa.

---

## 2. Quando usar

| Situação | Exemplo |
| --- | --- |
| **Falha de resolução em um domínio específico** | Um domínio externo retorna `SERVFAIL` na recursão normal, mas resolve em um DNS público. |
| **Ambiente híbrido / multicloud** | `corp.local` deve ir para o DNS do Active Directory; `internal.aws` para o resolvedor da VPC. |
| **Integração entre empresas ou filiais (VPN)** | O domínio do parceiro é resolvido pelo DNS dele, acessível pelo túnel. |
| **Split DNS** | O mesmo domínio tem visões diferentes por rede; um servidor específico responde a versão interna. |
| **Isolamento da mudança** | Ajusta-se apenas um domínio, sem tocar na política global de DNS. |

**Quando NÃO usar:** se o problema afeta muitos domínios, o defeito provavelmente está na recursão como um todo (rota, firewall, MTU, DNSSEC). Nesse caso investigue a causa em vez de criar exceções.

---

## 3. Comparativo: três formas de resolver

| Aspecto | Recursão padrão | Encaminhamento global | Encaminhamento condicional |
| --- | --- | --- | --- |
| **Onde se configura** | Padrão do BIND (sem forwarders) | `options { forwarders { ... }; };` | Bloco `zone "dominio" { type forward; ... };` |
| **Escopo** | Todos os domínios | Todos os domínios não locais | Só o domínio configurado e seus subdomínios |
| **Caminho** | Raiz → TLD → autoritativo | Tudo para os forwarders | Só a zona indicada vai aos forwarders |
| **Dependência externa** | Internet/raiz | Forwarders para tudo | Forwarders só para aquela zona |
| **Risco de mudança** | Nenhum | Alto (afeta toda a resolução) | Baixo (afeta um domínio) |

**Regra de precedência:** a configuração da `zone` tem prioridade sobre a de `options` para os nomes daquela zona.

---

## 4. Anatomia da diretiva

```conf
zone "sangfor.com" IN {
        type forward;
        forward only;
        forwarders {
                8.8.8.8;
                8.8.4.4;
        };
};
```

| Elemento | Função |
| --- | --- |
| `zone "sangfor.com" IN` | Domínio-alvo. Vale para `sangfor.com` **e todos os subdomínios** (`www.sangfor.com`, `mail.sangfor.com`...), sem entradas individuais. A classe `IN` (Internet) é o padrão e pode ser omitida. |
| `type forward;` | Indica que o servidor **não é autoritativo** para a zona; ele apenas repassa as consultas. Não existe arquivo de zona. |
| `forward only;` | Usa **somente** os forwarders. Se todos falharem, a resposta é `SERVFAIL`. |
| `forward first;` | Tenta os forwarders e, se não houver resposta, **cai para a recursão normal**. |
| `forwarders { ... };` | Lista de IPs dos resolvedores de destino, consultados em ordem/rodízio. Termine cada IP com `;`. |

### `forward only` ou `forward first`?

| | `forward only` | `forward first` |
| --- | --- | --- |
| Comportamento se o forwarder falha | Falha imediata (`SERVFAIL`) | Tenta a recursão normal |
| Vantagem | Previsível; garante que a consulta **nunca** sai por outro caminho | Mais resiliente |
| Desvantagem | Depende 100% dos forwarders | Pode mascarar problemas e usar o caminho que você queria evitar |
| Use quando | Domínios privados/internos, isolamento estrito | Domínios públicos onde o forwarder é só uma otimização ou contorno |

> **Dica:** para domínios **internos** que só o DNS do parceiro conhece, use `forward only`. Recursão normal jamais os resolveria, então o fallback não ajuda.

### Detalhes importantes

* **Subdomínios podem ter regra própria.** O BIND usa a zona mais específica que casa com o nome (*longest match*). Se existir `zone "sangfor.com"` e `zone "vpn.sangfor.com"`, o segundo prevalece para `vpn.sangfor.com` e abaixo.
* **Desativar encaminhamento numa zona:** dentro de uma zona `type forward`, uma lista `forwarders { };` vazia faz o BIND resolver aquele domínio por recursão normal, útil para abrir uma exceção quando há um `forwarders` global em `options`.
* **A ordem dos blocos não importa.** O casamento é sempre por especificidade.
* **Zonas do tipo `forward` não aparecem em `rndc zonestatus`**, pois não há zona carregada.

---

## 5. Organização dos arquivos

Isole as regras condicionais em um arquivo próprio. Isso facilita revisão, backup e rollback.

```text
/etc/
├── named.conf
└── named/
    └── conditional.conf
```

**Em `/etc/named.conf`**, ao final das inclusões de zona:

```conf
include "/etc/named.rfc1912.zones";
include "/etc/named.root.key";
include "/etc/named/conditional.conf";
```

**Em `/etc/named/conditional.conf`:**

```conf
// Encaminhamento condicional para hikvision.com
zone "hikvision.com" IN {
        type forward;
        forward only;
        forwarders {
                8.8.8.8;
                8.8.4.4;
        };
};

// Encaminhamento condicional para sangfor.com
zone "sangfor.com" IN {
        type forward;
        forward only;
        forwarders {
                8.8.8.8;
                8.8.4.4;
        };
};
```

> **Variação por distribuição:** os caminhos acima são de RHEL/CentOS/Rocky/Alma (serviço `named`). Em Debian/Ubuntu o serviço é `bind9` e a configuração fica em `/etc/bind/` (`named.conf.local` é o local usual para zonas próprias).

**Permissões:** o arquivo deve ser legível pelo usuário do BIND. Em sistemas com SELinux, crie-o em um local previsto ou rode `restorecon -v /etc/named/conditional.conf`.

---

## 6. Caso prático: `SERVFAIL` em `sangfor.com`

### Sintoma

O servidor DNS interno (`203.0.113.10`) não resolve o domínio:

```bash
dig sangfor.com @203.0.113.10
# ;; ->>HEADER<<- ... status: SERVFAIL
```

### Investigação (do mais simples ao mais detalhado)

**Passo 1: o domínio existe e resolve em outro resolvedor?**

```bash
dig www.sangfor.com @8.8.8.8
# status: NOERROR  (retorna CNAME e IPs da Cloudflare)
```

Conclusão: o domínio está saudável na Internet. O problema está **no caminho do servidor interno**, não no domínio.

**Passo 2: onde a cadeia quebra?**

```bash
dig www.sangfor.com +trace
```

O trace mostrou:

```text
couldn't get address for 'ns3.dnsv2.com': not found
```

O `+trace` percorre a hierarquia a partir da raiz. Os NS da zona (`*.dnsv2.com`) pertencem a **outro domínio**; para segui-los é preciso resolver primeiro o endereço deles, e essa etapa falhou no ambiente. É um problema de **resolução dos servidores autoritativos**, não de conteúdo da zona.

**Passo 3: decisão.** Como o resolvedor público consegue e o interno não, aplica-se encaminhamento condicional **somente para esse domínio**.

### Ferramentas de diagnóstico úteis

| Comando | Para que serve |
| --- | --- |
| `dig dominio @servidor` | Consulta um servidor específico. Olhe `status:` (`NOERROR`, `NXDOMAIN`, `SERVFAIL`, `REFUSED`). |
| `dig dominio +trace` | Percorre raiz → TLD → autoritativo. |
| `dig dominio NS +short` | Lista os servidores autoritativos. |
| `dig dominio @servidor +norecurse` | Pergunta só o que o servidor tem em cache/autoridade. |
| `dig dominio @servidor +tcp` | Testa consulta via TCP (útil para firewall/respostas grandes). |
| `rndc querylog on` | Liga o log de consultas no BIND (desligue depois). |

---

## 7. Procedimento operacional passo a passo

### Passo 1: confirmar que o serviço é BIND e ver os arquivos em uso

```bash
ps -ef | grep -E '[n]amed|[b]ind'
grep -nE '^(options|zone|forward|forwarders|include)' /etc/named.conf
```

### Passo 2: backup com timestamp

```bash
cp /etc/named/conditional.conf /etc/named/conditional.conf.$(date +%Y%m%d-%H%M%S).bak
```

Anote o nome exato do backup gerado; ele será usado no rollback.

### Passo 3: adicionar a zona em `/etc/named/conditional.conf`

```conf
zone "sangfor.com" IN {
        type forward;
        forward only;
        forwarders {
                8.8.8.8;
                8.8.4.4;
        };
};
```

### Passo 4: validar a sintaxe (obrigatório)

```bash
named-checkconf
```

Sem saída = sintaxe correta. Nunca recarregue sem este passo.

### Passo 5: recarregar

```bash
rndc reload
# server reload successful
```

`reload` aplica a configuração sem derrubar o serviço nem perder o cache.

### Passo 6: limpar o cache do nome problemático

Falhas ficam guardadas em cache por um curto período. Sem limpar, você pode continuar vendo `SERVFAIL` mesmo com a configuração correta.

```bash
rndc flushtree sangfor.com
```

`flushtree` remove o nome e **todos os subdomínios** (`rndc flushname` remove só o nome exato).

### Passo 7: validar

```bash
dig www.sangfor.com @203.0.113.10
# status: NOERROR
```

Valide também a raiz do domínio e um domínio não relacionado:

```bash
dig sangfor.com @203.0.113.10
dig www.google.com @203.0.113.10
```

---

## 8. Rollback e erros comuns

### Erros de sintaxe

```text
/etc/named/conditional.conf:9: unknown option 'i'
/etc/named/conditional.conf:9: unexpected token near '}'
```

**Ação:** não execute `rndc reload`. Abra o arquivo na linha indicada, remova caracteres inválidos e rode `named-checkconf` novamente. Causas típicas:

* `;` faltando ao final de uma linha ou de um bloco `};`
* Chaves `{ }` desbalanceadas
* Caracteres colados de páginas web (aspas "inteligentes", links em Markdown, espaços especiais)
* Bloco `zone` duplicado para o mesmo domínio

### Rollback

Use o **nome exato do backup** criado no Passo 2:

```bash
cp /etc/named/conditional.conf.AAAAMMDD-HHMMSS.bak /etc/named/conditional.conf
named-checkconf
rndc reload
rndc flushtree sangfor.com
```

---

## 9. Troubleshooting: e se continuar falhando?

| Sintoma | Causa provável | O que verificar |
| --- | --- | --- |
| Continua `SERVFAIL` | Cache antigo | `rndc flushtree dominio` |
| `SERVFAIL` só com `forward only` | Servidor não alcança o forwarder | Do servidor BIND: `dig dominio @8.8.8.8`; verifique firewall UDP/TCP 53 de saída |
| `REFUSED` | O forwarder não aceita consultas do seu IP | Comum em DNS corporativo/parceiro: peça liberação (ACL) do seu IP |
| Resposta antiga ou de outra "visão" | Resolvedor do cliente diferente | Confirme qual DNS o cliente usa (`resolvectl`, `nslookup`, `/etc/resolv.conf`) |
| `named-checkconf` ok, mas sem efeito | Arquivo não incluído | Confira o `include` em `named.conf` |
| Falha só com respostas grandes | TCP/EDNS bloqueado | `dig dominio @forwarder +tcp` |
| Falha de validação (DNSSEC) | Forwarder ou caminho quebra a cadeia | Veja `journalctl -u named` por mensagens `validating`/`DNSSEC` |
| Erro após reinício | Falha de permissão/SELinux | `journalctl -u named`, `restorecon` |

**Logs úteis:**

```bash
journalctl -u named --since "10 min ago"
rndc querylog on     # ative, reproduza o problema, desative
rndc status
```

---

## 10. Boas práticas e segurança

* **Forwarders públicos vazam consultas.** O Google/Cloudflare passam a ver os nomes consultados. Para domínios sensíveis, use resolvedores da própria organização.
* **Nunca encaminhe zonas internas para DNS público.** Nomes privados (`corp.local`, `intranet.empresa.com`) não existem lá e ainda expõem sua topologia. Encaminhe para o DNS interno correspondente.
* **Use pelo menos dois forwarders** por zona para redundância.
* **Documente cada zona:** motivo, data, responsável, ticket. Exceções sem dono viram dívida técnica.
* **Revise periodicamente.** Se a falha original foi corrigida, remova a exceção.
* **Restrinja quem consulta o servidor** (`allow-recursion`/`allow-query`) para não operar um resolvedor aberto.
* **Teste em homologação** quando possível e sempre use `named-checkconf` antes de `rndc reload`.

---

## 11. Checklist rápido

* [ ] Confirmei que o serviço é BIND (`named`/`bind9`).
* [ ] Diagnostiquei com `dig` (interno vs. externo) e `+trace`.
* [ ] Arquivo `/etc/named/conditional.conf` existe e está incluído no `named.conf`.
* [ ] Fiz backup com timestamp e anotei o nome.
* [ ] Bloco `zone` com `type forward;`, `forward only;` (ou `first`) e `forwarders`.
* [ ] `named-checkconf` sem erros.
* [ ] `rndc reload` com sucesso.
* [ ] `rndc flushtree dominio` executado.
* [ ] `dig dominio @IP_DNS_LOCAL` retorna `NOERROR`.
* [ ] Domínios internos e externos gerais continuam funcionando.
* [ ] Registrei a mudança e o motivo.

---

## 12. Glossário

| Termo | Significado |
| --- | --- |
| **Resolvedor recursivo** | Servidor que resolve nomes em nome do cliente, percorrendo a hierarquia DNS. |
| **Servidor autoritativo** | Servidor que detém os registros oficiais de uma zona. |
| **Forwarder** | Servidor DNS para o qual outro servidor repassa consultas. |
| **Zona** | Porção do espaço de nomes DNS sob uma administração. |
| **`SERVFAIL`** | O servidor não conseguiu completar a resolução. |
| **`NXDOMAIN`** | O nome não existe. |
| **`NOERROR`** | Consulta bem-sucedida. |
| **`REFUSED`** | O servidor recusou responder (política/ACL). |
| **Cache** | Armazenamento temporário de respostas, com validade (TTL). |
| **Split DNS** | Responder de forma diferente conforme a origem da consulta. |
| **`rndc`** | Ferramenta de controle do `named` em execução. |

---

## 13. Perguntas de fixação

1. Qual a diferença entre `options { forwarders {...}; }` e `zone ... { type forward; }`?
2. Por que `zone "sangfor.com"` também resolve `mail.sangfor.com`?
3. Em que situação `forward first` mascararia um problema que `forward only` revelaria?
4. Por que, mesmo após configurar corretamente, ainda é possível ver `SERVFAIL`? Qual comando resolve?
5. Um domínio interno (`corp.local`) deve usar `forward only` ou `forward first`? Justifique.
6. Se existirem `zone "empresa.com"` e `zone "vpn.empresa.com"`, qual regra vale para `host.vpn.empresa.com`?
7. Qual comando valida a sintaxe e por que ele deve vir antes do `rndc reload`?

<details>
<summary>Respostas</summary>

1. O global encaminha **tudo**; o de zona encaminha **só aquele domínio**.
2. Porque a zona abrange todos os nomes abaixo dela.
3. Quando o forwarder falha: `first` cai silenciosamente na recursão normal (que pode estar quebrada ou ser o caminho indesejado); `only` retorna erro imediatamente.
4. Cache de falha; use `rndc flushtree dominio`.
5. `forward only`: só o DNS interno conhece o domínio, então o fallback não tem utilidade e ainda pode vazar a consulta.
6. A de `vpn.empresa.com` (correspondência mais específica).
7. `named-checkconf`; evita recarregar uma configuração inválida em produção.

</details>