---
layout: default
title: Nmap — Troubleshooting
description: Diagnóstico de conectividade, DNS, firewall, serviços e resultados Nmap.
---

# Nmap: Troubleshooting de Conectividade e Serviços
{:.no_toc}

Use este roteiro para investigar resultados de Nmap sem assumir que um scan isolado representa o estado real do ambiente.

> **Uso autorizado:** execute varreduras apenas em redes, hosts e serviços próprios ou formalmente autorizados. Defina escopo, janela, responsáveis e critério de parada. Este material prioriza inventário, diagnóstico e hardening; não cobre exploração, força bruta, evasão ou negação de serviço.

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---

## 1. Método de diagnóstico

```text
Confirmar escopo e IP correto
            |
            v
Validar nome, DNS, rota e origem
            |
            v
Executar scan pequeno com --reason
            |
            v
Validar firewall, processo e logs no alvo
            |
            v
Corrigir, registrar e retestar
```

Comando inicial recomendado:

```bash
nmap -n -sT --reason -p 22,80,443 192.168.56.20
```

## 2. Matriz de sintomas

| Sintoma | Hipóteses | Cliente | Alvo |
| --- | --- | --- | --- |
| `Host seems down` | Rota, ACL, descoberta bloqueada, IP errado | `ip route get`, `ping`, `getent hosts` | Interface, gateway, firewall |
| `filtered` | Firewall, security group, ACL, rota assimétrica | Origem, VPN e caminho | `firewall-cmd`, `nft`, regra cloud |
| `closed` | Serviço não escuta, porta errada | Confirmar porta esperada | `ss`, `systemctl`, logs |
| `open` inesperada | Serviço residual ou regra antiga | Comparar baseline | Processo, owner e necessidade |
| Versão imprecisa | Proxy, NAT, banner mascarado | `curl`, `openssl`, `ssh -v` | Pacote e configuração real |
| Scan lento | DNS reverso, UDP, perda ou filtro silencioso | Usar `-n`, limitar portas | Logs de drop e latência |

## 3. Host parece indisponível

Sintoma:

```text
Note: Host seems down.
```

No cliente:

```bash
getent hosts web-lab
ip route get 192.168.56.20
ping -c 2 192.168.56.20
ip addr
```

Descoberta sem portas:

```bash
nmap -sn -n 192.168.56.20
```

Quando houver confirmação operacional de que o host está ativo, mas a descoberta é bloqueada, teste somente portas necessárias:

```bash
nmap -Pn -n -sT --reason -p 22,443 192.168.56.20
```

Registre o motivo do `-Pn`; não o use como padrão.

## 4. Porta `filtered`

O Nmap não conseguiu concluir se a porta está aberta porque uma política de rede provavelmente filtrou a sonda.

No alvo Rocky/RHEL:

```bash
sudo ss -lntup
sudo firewall-cmd --state
sudo firewall-cmd --list-all
sudo firewall-cmd --list-ports
sudo nft list ruleset
```

Verifique também:

- A origem do scan está no CIDR permitido?
- A regra é TCP ou UDP?
- Há VPN, NAT, load balancer ou security group no caminho?
- O serviço escuta na interface correta?
- O firewall do host e o firewall de perímetro concordam?

Não abra a porta “para testar”. Use mudança aprovada e defina origem, protocolo, porta e justificativa.

## 5. Porta `closed`

O host respondeu, mas não há serviço aceitando a conexão naquela porta.

No alvo:

```bash
sudo ss -lntp '( sport = :443 )'
sudo systemctl status nginx
sudo journalctl -u nginx --since '30 minutes ago'
```

Causas frequentes:

- Serviço está parado ou falhou ao iniciar
- Serviço usa porta diferente
- Serviço está limitado a `127.0.0.1`
- Proxy/balanceador encaminha para destino incorreto
- Inventário ou documentação está desatualizado

Para confirmar escuta por endereço:

```bash
sudo ss -lntp
```

Compare `Local Address:Port` com o IP esperado do servidor.

## 6. Serviço aberto inesperadamente

Se o Nmap retornar uma porta aberta que não deveria existir:

```bash
nmap -n -sT -sV --version-light --reason   -p 22,80,443,3306,5432   192.168.56.20
```

No alvo, identifique o processo:

```bash
sudo ss -lntup
sudo systemctl --type=service --state=running
sudo rpm -qf /caminho/do/binario
```

Ações possíveis:

| Situação | Ação |
| --- | --- |
| Serviço necessário, origem ampla | Restringir firewall/ACL |
| Serviço não utilizado | Parar, desabilitar e remover regra |
| Serviço em host errado | Corrigir deployment ou segmentação |
| Serviço sem owner | Abrir incidente/ticket e identificar responsável |
| Porta de banco exposta | Restringir à rede da aplicação |

## 7. DNS e hostname

Verificar resolução:

```bash
getent hosts web-lab.lab.local
resolvectl query web-lab.lab.local
cat /etc/resolv.conf
```

Em NetworkManager:

```bash
nmcli device show | grep -E 'IP4.DNS|IP4.GATEWAY'
```

Comparar hostname e IP:

```bash
nmap -n -sT -p 443 192.168.56.20
nmap -sT -p 443 web-lab.lab.local
```

Resultados diferentes podem indicar split DNS, registros antigos, IPv4/IPv6 distintos, proxy ou balanceador.

## 8. HTTP e HTTPS

Para analisar aplicação web:

```bash
curl -vkI https://web-lab.lab.local/
openssl s_client -connect 192.168.56.20:443 -servername web-lab.lab.local </dev/null
```

Nmap com coleta limitada:

```bash
nmap -n -sT -p 443   --script ssl-cert,http-title,http-headers   192.168.56.20
```

Pontos de validação:

- O virtual host exige `Host` ou SNI?
- HTTP redireciona corretamente para HTTPS?
- O certificado contém o nome esperado?
- Há proxy reverso ou load balancer?
- O serviço responde pelo IP, mas não pelo hostname?

## 9. SSH

```bash
ssh -v usuario@192.168.56.20
nc -vz 192.168.56.20 22
nmap -n -sT -sV -p 22 192.168.56.20
```

No alvo:

```bash
sudo systemctl status sshd
sudo sshd -T | sort
sudo ss -lntp '( sport = :22 )'
sudo journalctl -u sshd --since '30 minutes ago'
```

Confirme `ListenAddress`, porta configurada, firewall, grupo de origem e política de autenticação.

## 10. DNS TCP e UDP

DNS pode usar UDP e TCP. Valide ambos quando necessário:

```bash
nmap -n -sU -p 53 192.168.56.53
nmap -n -sT -p 53 192.168.56.53

dig @192.168.56.53 example.internal A
dig @192.168.56.53 example.internal A +tcp
```

No servidor BIND:

```bash
sudo systemctl status named
sudo ss -lnptu | grep ':53'
sudo named-checkconf
sudo journalctl -u named --since '30 minutes ago'
```

## 11. Kubernetes e portas de gestão

Em clusters autorizados, trate portas de gestão como sensíveis. Não faça descoberta ampla nem execute scripts não revisados.

| Serviço | Porta comum | Validação |
| --- | ---: | --- |
| API server | 6443/TCP | Restringir a administradores e componentes do cluster |
| Kubelet | 10250/TCP | Não expor a redes amplas |
| NodePort | 30000-32767/TCP | Validar necessidade e firewall |
| Ingress | 80/443 TCP | Validar TLS, WAF e origem |

Validação limitada:

```bash
nmap -n -sT --reason -p 6443,10250 192.168.56.30
```

## 12. Permissões e execução

Algumas técnicas exigem privilégios. Para diagnóstico sem privilégios especiais, use TCP connect:

```bash
nmap -n -sT -p 22,443 192.168.56.20
```

Não execute como `root` por hábito. Use o menor privilégio necessário e registre o motivo quando privilégios administrativos forem exigidos.

## 13. Checklist de evidências

- Comando completo e versão do Nmap
- Data, horário, fuso e IP de origem
- Autorização e escopo
- Hostname, IP e portas verificadas
- Saída Nmap normal/XML, quando permitido
- Rota e DNS usados
- Regra de firewall relevante
- Estado do serviço e logs relacionados
- Correção aplicada e resultado do reteste
