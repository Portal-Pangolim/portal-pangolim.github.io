---
layout: default
title: Nmap — Segurança
description: Auditoria defensiva, vulnerabilidades, baseline de exposição e hardening com Nmap.
---

# Nmap: Auditoria, Vulnerabilidades e Hardening
{:.no_toc}

Use Nmap como fonte de evidência para reduzir superfície de ataque e confirmar controles. Uma varredura não substitui gestão de vulnerabilidades, inventário, patching, análise de configuração, monitoramento ou resposta a incidentes.

> **Uso autorizado:** execute varreduras apenas em redes, hosts e serviços próprios ou formalmente autorizados. Defina escopo, janela, responsáveis e critério de parada. Este material prioriza inventário, diagnóstico e hardening; não cobre exploração, força bruta, evasão ou negação de serviço.

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---

## 1. Princípios

```text
Porta aberta
não é igual a vulnerabilidade confirmada

Versão identificada
não é igual a exploração possível

Vulnerabilidade conhecida
não é igual a risco crítico automaticamente

Risco real
= exposição + criticidade + probabilidade + impacto - controles compensatórios
```

O Nmap mostra a perspectiva da rede. A decisão de risco precisa considerar dono do ativo, classificação de dados, autenticação, segmentação, patch, exposição externa e impacto no negócio.

## 2. Regras de engajamento

Antes de qualquer auditoria, registre:

| Item | Exemplo |
| --- | --- |
| Escopo | `192.168.56.20`, `192.168.56.53` |
| Exclusões | Gateway, impressoras, equipamentos legados |
| Janela | Domingo, 01:00–03:00 |
| Origem permitida | `192.168.56.10` |
| Técnicas | `-sT`, `-sV --version-light`, scripts NSE aprovados |
| Limites | Portas explícitas, `-T2`, sem `-Pn` amplo |
| Contatos | Plataforma, redes, segurança e plantão |
| Critério de parada | Latência, alertas ou indisponibilidade |
| Evidência | Diretório protegido e ticket de mudança |

## 3. Processo de auditoria

```text
Planejar e autorizar
        |
        v
Criar baseline esperado
        |
        v
Executar coleta limitada
        |
        v
Validar com host, firewall e inventário
        |
        v
Classificar e priorizar
        |
        v
Corrigir ou aceitar formalmente o risco
        |
        v
Retestar e registrar evidência
```

## 4. Baselines por perfil

| Perfil | Portas normalmente esperadas | Controles essenciais |
| --- | --- | --- |
| Bastion | 22/TCP a partir de VPN/rede administrativa | MFA, chaves, logs, origem restrita |
| Web público | 80/TCP e 443/TCP | TLS, WAF/reverse proxy, patch e monitoramento |
| DNS interno | 53/TCP e 53/UDP para redes internas | ACL de recursão e transferência de zona restrita |
| Banco de dados | Sem porta pública | Acesso apenas de sub-redes de aplicação |
| Monitoramento | Portas específicas por agente/servidor | ACL por origem e credenciais seguras |
| Kubernetes API | 6443/TCP para administradores/componentes | Segmentação, RBAC, autenticação forte |

Exemplo de validação pós-hardening:

```bash
nmap -n -sT --reason   -p 22,80,443,3306,5432,6443   192.168.56.20
```

## 5. Priorização de achados

| Prioridade | Exemplo | Tratamento esperado |
| --- | --- | --- |
| Crítica | Serviço administrativo exposto à Internet sem controle adequado | Conter, restringir e investigar imediatamente |
| Alta | Banco acessível fora da rede de aplicação | Restringir origem e validar necessidade com urgência |
| Média | Serviço legado interno sem patch conhecido | Plano de atualização, segmentação e prazo definido |
| Baixa | Banner ou cabeçalho com pouca exposição | Ajuste planejado de hardening |
| Informativa | Porta esperada e documentada | Registrar na baseline |

A prioridade deve mudar conforme o ativo. Uma porta 443 em um web server pode ser esperada; a mesma porta em um banco de dados pode indicar configuração inesperada.

## 6. Achados comuns

| Achado | Evidência | Validação | Correção recomendada |
| --- | --- | --- | --- |
| Banco exposto | `3306/tcp open` ou `5432/tcp open` | Processo, ACL, rede da aplicação | Restringir a CIDRs necessários ou remover exposição |
| SSH amplo | `22/tcp open` de origem não administrativa | Firewall, VPN, logs e necessidade | Limitar origem, chaves, MFA e monitoramento |
| HTTP sem TLS | `80/tcp open` sem redirecionamento | `curl -I` e configuração web | Habilitar TLS e redirecionar para HTTPS |
| DNS recursivo exposto | Resposta de recursão fora da rede interna | BIND/Unbound e ACL | Restringir recursão por ACL |
| Serviço legado | Versão/serviço sem suporte | Pacote real, patch e fornecedor | Atualizar, isolar ou descontinuar |
| Porta sem owner | Serviço não documentado | `ss`, systemd e CMDB | Identificar responsável ou remover |

## 7. Avaliação responsável de vulnerabilidades

Use detecção de serviço como ponto de partida:

```bash
nmap -n -sT -sV --version-light -p 22,443 192.168.56.20
```

Depois valide no host:

```bash
rpm -qa | grep -i nome-do-pacote
sudo systemctl status nome-do-servico
sudo dnf updateinfo info --cves nome-do-pacote
```

Fluxo recomendado:

```text
Versão observada na rede
          |
          v
Confirmar pacote e versão no host
          |
          v
Consultar boletim do fornecedor
          |
          v
Verificar patch/backport e configuração
          |
          v
Avaliar exposição e controles
          |
          v
Corrigir e retestar
```

Não trate banner ou CVE como confirmação automática de comprometimento ou exploração possível.

## 8. Hardening de rede

- Exponha somente serviços necessários, documentados e monitorados.
- Restrinja a origem por firewall, ACL, VPN, security group e segmentação.
- Separe redes de usuário, administração, aplicação, banco e monitoramento.
- Remova regras temporárias após a mudança.
- Use inventário de portas esperado por perfil de servidor.
- Centralize logs de firewall, proxy, WAF e autenticação.
- Monitore alterações de regras, serviços e listeners.

## 9. Hardening por serviço

### SSH

```bash
sudo sshd -T | sort
sudo ss -lntp '( sport = :22 )'
```

- Permitir origem somente administrativa.
- Preferir chaves e MFA, conforme política.
- Desabilitar autenticação por senha quando aplicável.
- Desabilitar login direto de root quando não necessário.
- Revisar algoritmos e manter OpenSSH atualizado.

### HTTP/HTTPS

```bash
nmap -n -sT -p 443   --script ssl-cert,http-security-headers   192.168.56.20
```

- Usar TLS e certificados válidos.
- Redirecionar HTTP para HTTPS quando aplicável.
- Aplicar cabeçalhos de segurança adequados à aplicação.
- Manter proxy, framework e servidor web atualizados.
- Restringir painéis administrativos por VPN, ACL ou autenticação forte.

### DNS

```bash
sudo named-checkconf
sudo ss -lnptu | grep ':53'
```

- Restringir recursão para redes internas autorizadas.
- Restringir transferência de zona.
- Evitar exposição de informações de versão.
- Permitir TCP/53 quando o desenho do DNS exigir.

### Bancos de dados

```bash
sudo ss -lntp | grep -E ':3306|:5432'
```

- Não expor porta de banco publicamente.
- Permitir somente sub-redes de aplicação e administração autorizada.
- Exigir autenticação forte, TLS e logs.
- Remover contas e bancos de teste.

## 10. Reteste

Todo achado corrigido deve ter evidência antes e depois.

```bash
# Antes da mudança
nmap -n -sT --reason -p 3306 192.168.56.20

# Aplicar mudança aprovada no firewall/serviço

# Depois da mudança, a partir da origem que não deve ter acesso
nmap -n -sT --reason -p 3306 192.168.56.20
```

Registre também o teste positivo: a partir da origem que deve manter acesso, valide aplicação, conexão e monitoramento. Hardening não pode interromper um serviço necessário sem detecção.

## 11. Modelo de relatório

| Campo | Exemplo |
| --- | --- |
| ID | `NMAP-2026-001` |
| Ativo | `srv-app-01` / `192.168.56.20` |
| Escopo e autorização | Ticket e janela de mudança |
| Evidência | Comando, data, origem e arquivo de saída protegido |
| Achado | `3306/tcp` exposta fora da rede de aplicação |
| Impacto | Aumento de superfície e desvio do baseline |
| Recomendação | Limitar ACL ao CIDR da aplicação |
| Responsável | Time de plataforma/banco |
| Prazo | Data acordada |
| Reteste | Saída comparativa pós-correção |
| Status | Aberto, mitigado, aceito ou encerrado |

## 12. Checklist

### Antes

- [ ] Autorização, escopo e exclusões registrados
- [ ] Baseline do perfil disponível
- [ ] Janela e contatos confirmados
- [ ] Comando revisado e testado em laboratório
- [ ] Local seguro para evidências definido

### Durante

- [ ] Alvos e portas estão dentro do escopo
- [ ] Não há degradação ou alertas inesperados
- [ ] Logs de firewall/IDS são acompanhados quando necessário
- [ ] Execução pode ser interrompida rapidamente

### Depois

- [ ] Resultado foi validado no host e no inventário
- [ ] Achados possuem owner, criticidade e prazo
- [ ] Mudanças foram retestadas
- [ ] Evidências foram protegidas e tiveram retenção definida

## 13. Conclusão

O uso mais valioso do Nmap em segurança é comparar o que a rede expõe com o que o ambiente **deveria** expor. Uma operação madura usa baseline, menor privilégio, segmentação, patches, evidências e reteste — não apenas uma lista de portas abertas.
