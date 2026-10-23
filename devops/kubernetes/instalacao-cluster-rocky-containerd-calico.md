---
layout: default
validation: pending-lab
description: "Roteiro de cluster Kubernetes no Rocky Linux com containerd e Calico; instalação integral ainda pendente de laboratório."
title: Instalação de Cluster Kubernetes com Rocky Linux, containerd e Calico
---

# Instalação de Cluster Kubernetes com Rocky Linux, containerd e Calico

> **Roteiro não homologado:** os comandos foram revisados como documentação, sem instalação de cluster. Não interprete números de versão como prova de suporte ou compatibilidade. A combinação abaixo precisa passar pela matriz e pelo laboratório descritos ao final.
{:.no_toc}

> As seções de limpeza deste guia removem componentes do Kubernetes e dados locais do nó. Confirme o hostname, o contexto e a necessidade de descomissionar o nó antes de executar comandos `rm -rf` ou `kubeadm reset`.

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## 1. Objetivo

Este procedimento apresenta a instalação de um cluster Kubernetes com três máquinas:

| Servidor      | Função        | IP         |
| ------------- | ------------- | ---------- |
| k8s-control01 | Control Plane | 192.0.2.21 |
| k8s-worker01  | Worker        | 192.0.2.17 |
| k8s-worker02  | Worker        | 192.0.2.20 |

Tecnologias utilizadas:

```text
Rocky Linux 9
Kubernetes 1.34
containerd
kubeadm
Calico 3.32
Tigera Operator
```

---

## 2. Pré-requisitos

Cada máquina deve possuir, no mínimo:

```text
2 CPUs
2 GB de memória RAM
20 GB de disco
Acesso à internet
Comunicação de rede entre os nós
Endereço IP estável
```

O Control Plane deve possuir preferencialmente pelo menos 4 GB de RAM.

Todos os comandos devem ser executados como usuário `root`, salvo indicação contrária.

---

## 3. Configuração dos nomes dos servidores

No Control Plane:

```bash
hostnamectl set-hostname k8s-control01
```

No Worker 01:

```bash
hostnamectl set-hostname k8s-worker01
```

No Worker 02:

```bash
hostnamectl set-hostname k8s-worker02
```

Configure o arquivo `/etc/hosts` nos três servidores:

```bash
vi /etc/hosts
```

Adicione:

```text
192.0.2.21 k8s-control01
192.0.2.17 k8s-worker01
192.0.2.20 k8s-worker02
```

Teste a resolução dos nomes:

```bash
ping -c 2 k8s-control01
ping -c 2 k8s-worker01
ping -c 2 k8s-worker02
```

---

## 4. Atualização do sistema

Execute em todos os servidores:

```bash
dnf update -y
```

Instale os utilitários básicos:

```bash
dnf install -y curl wget vim git tar
```

---

## 5. Desabilitar a swap

O kubelet deve operar sem swap, salvo quando houver uma configuração específica para suportá-la.

Execute em todos os nós:

```bash
swapoff -a
```

Confirme:

```bash
free -h
```

Edite o arquivo `/etc/fstab`:

```bash
vi /etc/fstab
```

Comente a linha referente à swap.

Exemplo:

```text
#/dev/mapper/rl-swap none swap defaults 0 0
```

Confirme que nenhuma swap está ativa:

```bash
swapon --show
```

O comando não deve retornar nenhuma entrada.

---

## 6. Configuração do SELinux

Para este laboratório, coloque o SELinux em modo permissivo:

```bash
setenforce 0
```

Edite:

```bash
vi /etc/selinux/config
```

Altere:

```text
SELINUX=enforcing
```

Para:

```text
SELINUX=permissive
```

Confirme:

```bash
getenforce
```

Resultado esperado:

```text
Permissive
```

---

## 7. Configuração do firewall

Para simplificar o ambiente de laboratório, desabilite o firewalld:

```bash
systemctl disable --now firewalld
```

Confirme:

```bash
systemctl status firewalld
```

Em ambiente de produção, mantenha o firewall habilitado e libere somente as portas necessárias.

---

## 8. Carregamento dos módulos do kernel

Execute em todos os servidores:

```bash
cat > /etc/modules-load.d/k8s.conf <<EOF
overlay
br_netfilter
EOF
```

Carregue os módulos imediatamente:

```bash
modprobe overlay
modprobe br_netfilter
```

Confirme:

```bash
lsmod | grep overlay
lsmod | grep br_netfilter
```

---

## 9. Configuração dos parâmetros de rede

Crie o arquivo:

```bash
cat > /etc/sysctl.d/99-kubernetes.conf <<EOF
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
```

Aplique as configurações:

```bash
sysctl --system
```

Confirme:

```bash
sysctl net.bridge.bridge-nf-call-iptables
sysctl net.bridge.bridge-nf-call-ip6tables
sysctl net.ipv4.ip_forward
```

Resultado esperado:

```text
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward = 1
```

---

## 10. Instalação do containerd

Execute em todos os nós.

Instale o gerenciador de repositórios:

```bash
dnf install -y dnf-plugins-core
```

Adicione o repositório Docker:

```bash
dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

Instale o containerd:

```bash
dnf install -y containerd.io
```

Crie o diretório de configuração:

```bash
mkdir -p /etc/containerd
```

Gere a configuração padrão:

```bash
containerd config default > /etc/containerd/config.toml
```

Altere o uso de cgroups para `systemd`:

```bash
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
```

Confirme:

```bash
grep SystemdCgroup /etc/containerd/config.toml
```

Resultado esperado:

```text
SystemdCgroup = true
```

Habilite e inicie o containerd:

```bash
systemctl enable --now containerd
```

Reinicie o serviço:

```bash
systemctl restart containerd
```

Valide:

```bash
systemctl status containerd --no-pager
```

---

## 11. Instalação do Kubernetes

Execute em todos os servidores.

Crie o repositório:

```bash
cat > /etc/yum.repos.d/kubernetes.repo <<EOF
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.34/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.34/rpm/repodata/repomd.xml.key
exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
EOF
```

Instale os componentes:

```bash
dnf install -y kubelet kubeadm kubectl \
--disableexcludes=kubernetes
```

Habilite o kubelet:

```bash
systemctl enable --now kubelet
```

Verifique a versão instalada:

```bash
kubeadm version
kubectl version --client
kubelet --version
```

O kubelet poderá apresentar reinicializações até que o nó seja inicializado ou adicionado ao cluster.

---

## 12. Inicialização do Control Plane

Execute somente no servidor `k8s-control01`.

Inicialize o cluster:

```bash
kubeadm init \
--apiserver-advertise-address=192.0.2.21 \
--pod-network-cidr=192.168.0.0/16
```

Ao final, o kubeadm exibirá um comando semelhante a:

```bash
kubeadm join 192.0.2.21:6443 \
--token TOKEN_GERADO \
--discovery-token-ca-cert-hash sha256:HASH_GERADO
```

Guarde esse comando. Ele será utilizado nos workers.

---

## 13. Configuração do kubectl

Execute no Control Plane.

Para o usuário root:

```bash
mkdir -p /root/.kube
cp /etc/kubernetes/admin.conf /root/.kube/config
chown root:root /root/.kube/config
```

Teste:

```bash
kubectl get nodes
```

Neste momento, o Control Plane poderá aparecer como:

```text
NotReady
```

Isso é esperado porque o plugin de rede ainda não foi instalado.

---

## 14. Instalação do Calico

Execute somente no Control Plane.

Instale o Tigera Operator:

```bash
kubectl create -f \
https://raw.githubusercontent.com/projectcalico/calico/v3.32.0/manifests/tigera-operator.yaml
```

Baixe o manifesto de recursos personalizados:

```bash
curl -O \
https://raw.githubusercontent.com/projectcalico/calico/v3.32.0/manifests/custom-resources.yaml
```

Verifique a rede configurada:

```bash
grep -A5 cidr custom-resources.yaml
```

O CIDR deve corresponder ao utilizado no `kubeadm init`:

```text
192.168.0.0/16
```

Aplique o manifesto:

```bash
kubectl create -f custom-resources.yaml
```

Acompanhe a instalação:

```bash
kubectl get pods -n tigera-operator
```

```bash
kubectl get pods -n calico-system -o wide
```

Também é possível acompanhar continuamente:

```bash
watch kubectl get pods -n calico-system
```

Aguarde até que os principais pods fiquem em estado `Running`.

---

## 15. Adição dos workers ao cluster

Execute o comando `kubeadm join` nos servidores `k8s-worker01` e `k8s-worker02`.

Exemplo:

```bash
kubeadm join 192.0.2.21:6443 \
--token TOKEN_GERADO \
--discovery-token-ca-cert-hash sha256:HASH_GERADO
```

Caso o comando tenha sido perdido ou o token tenha expirado, gere um novo no Control Plane:

```bash
kubeadm token create --print-join-command
```

Execute o novo comando nos workers.

---

## 16. Validação dos nós

No Control Plane:

```bash
kubectl get nodes -o wide
```

Resultado esperado:

```text
NAME            STATUS   ROLES           INTERNAL-IP
k8s-control01   Ready    control-plane   192.0.2.21
k8s-worker01    Ready    <none>          192.0.2.17
k8s-worker02    Ready    <none>          192.0.2.20
```

Caso algum nó ainda esteja `NotReady`, aguarde a inicialização do Calico e verifique os pods.

---

## 17. Validação dos componentes

### 17.1 Ver todos os pods

```bash
kubectl get pods -A -o wide
```

Os componentes devem ficar em estado `Running`.

Entre eles:

```text
calico-node
calico-kube-controllers
calico-typha
csi-node-driver
coredns
kube-apiserver
kube-controller-manager
kube-scheduler
kube-proxy
etcd
tigera-operator
```

---

### 17.2 Ver os pods do Calico

```bash
kubectl get pods -n calico-system -o wide
```

Resultado esperado para o `calico-node`:

```text
1/1 Running
```

Resultado esperado para o CSI:

```text
2/2 Running
```

---

### 17.3 Ver os pods do Kubernetes

```bash
kubectl get pods -n kube-system -o wide
```

---

### 17.4 Ver os pods do Tigera Operator

```bash
kubectl get pods -n tigera-operator -o wide
```

---

## 18. Teste de criação de pod

Crie um pod de teste:

```bash
kubectl run nginx-test \
--image=nginx:latest \
--restart=Never
```

Acompanhe:

```bash
kubectl get pod nginx-test -o wide
```

Resultado esperado:

```text
Running
```

Veja os detalhes:

```bash
kubectl describe pod nginx-test
```

---

## 19. Teste com Deployment

Crie um Deployment:

```bash
kubectl create deployment nginx \
--image=nginx:latest
```

Crie três réplicas:

```bash
kubectl scale deployment nginx --replicas=3
```

Verifique:

```bash
kubectl get deployments
kubectl get pods -o wide
```

Os pods devem ser distribuídos entre os workers disponíveis.

---

## 20. Criação de um Service

Exponha o Deployment:

```bash
kubectl expose deployment nginx \
--port=80 \
--target-port=80 \
--type=NodePort
```

Verifique:

```bash
kubectl get svc nginx
```

Exemplo de resultado:

```text
NAME    TYPE       CLUSTER-IP     PORT(S)
nginx   NodePort   10.96.x.x      80:30xxx/TCP
```

Teste utilizando o IP de um dos nós e a porta NodePort:

```bash
curl http://192.0.2.17:PORTA
```

Ou:

```bash
curl http://192.0.2.20:PORTA
```

---

## 21. Teste de comunicação entre pods

Veja os IPs:

```bash
kubectl get pods -o wide
```

Entre em um pod:

```bash
kubectl exec -it POD -- /bin/bash
```

Ou, caso a imagem não possua Bash:

```bash
kubectl exec -it POD -- /bin/sh
```

Teste outro pod:

```bash
curl http://IP_DO_OUTRO_POD
```

---

## 22. Comandos de diagnóstico

### Ver os nós

```bash
kubectl get nodes -o wide
```

### Ver todos os pods

```bash
kubectl get pods -A -o wide
```

### Ver eventos recentes

```bash
kubectl get events -A \
--sort-by=.metadata.creationTimestamp
```

### Descrever um pod

```bash
kubectl describe pod -n NAMESPACE NOME_DO_POD
```

### Ver logs

```bash
kubectl logs -n NAMESPACE NOME_DO_POD
```

Caso o pod possua mais de um container:

```bash
kubectl logs -n NAMESPACE NOME_DO_POD \
-c NOME_DO_CONTAINER
```

### Ver logs do container anterior

```bash
kubectl logs -n NAMESPACE NOME_DO_POD \
--previous
```

### Ver logs do kubelet

Execute no nó com problema:

```bash
journalctl -u kubelet -n 100 --no-pager
```

Para acompanhar em tempo real:

```bash
journalctl -u kubelet -f
```

### Ver logs do containerd

```bash
journalctl -u containerd -n 100 --no-pager
```

### Ver imagens locais

```bash
ctr -n k8s.io images list
```

Ou:

```bash
crictl images
```

---

## 23. Reinicialização dos serviços

O kubelet é um serviço do sistema operacional e não deve ser reiniciado pelo `kubectl`.

Comando incorreto:

```bash
kubectl restart kubelet
```

Comando correto:

```bash
systemctl restart kubelet
```

Verifique:

```bash
systemctl status kubelet --no-pager
```

Para reiniciar o containerd:

```bash
systemctl restart containerd
```

---

## 24. Configuração opcional do kubectl nos workers

Normalmente, o `kubectl` é utilizado apenas no Control Plane ou em uma estação administrativa.

Ao executar `kubectl` em um worker sem configuração, poderá aparecer:

```text
The connection to the server localhost:8080 was refused
```

Para permitir o uso administrativo do kubectl em um worker, copie o arquivo de configuração do Control Plane.

No Control Plane:

```bash
scp /etc/kubernetes/admin.conf \
root@192.0.2.17:/root/admin.conf
```

```bash
scp /etc/kubernetes/admin.conf \
root@192.0.2.20:/root/admin.conf
```

No worker:

```bash
mkdir -p /root/.kube
mv /root/admin.conf /root/.kube/config
chmod 600 /root/.kube/config
```

Teste:

```bash
kubectl get nodes
```

Essa configuração concede privilégios administrativos. Utilize somente em ambiente controlado.

---

## 25. Remoção de um pod de teste

Remova o pod criado manualmente:

```bash
kubectl delete pod nginx-test
```

Remova o Deployment e o Service:

```bash
kubectl delete service nginx
kubectl delete deployment nginx
```

---

## 26. Remoção de um worker do cluster

Primeiro, no Control Plane, drene o nó:

```bash
kubectl drain k8s-worker02 \
--ignore-daemonsets \
--delete-emptydir-data
```

Remova o nó:

```bash
kubectl delete node k8s-worker02
```

No próprio worker:

```bash
kubeadm reset -f
```

Remova configurações residuais:

```bash
rm -rf /etc/cni/net.d
rm -rf /var/lib/cni
rm -rf /var/lib/kubelet
rm -rf /etc/kubernetes
```

Reinicie os serviços:

```bash
systemctl restart containerd
systemctl restart kubelet
```

---

## 27. Reinicialização completa do laboratório

Para apagar o cluster, execute primeiro nos workers:

```bash
kubeadm reset -f
```

Depois, no Control Plane:

```bash
kubeadm reset -f
```

Remova os arquivos residuais:

```bash
rm -rf /etc/cni/net.d
rm -rf /var/lib/cni
rm -rf /var/lib/calico
rm -rf /etc/kubernetes
rm -rf /root/.kube
```

Limpe regras de iptables somente se necessário:

```bash
iptables -F
iptables -t nat -F
iptables -t mangle -F
iptables -X
```

Reinicie:

```bash
systemctl restart containerd
systemctl restart kubelet
```

---

## 28. Checklist final

Confirme os seguintes itens:

```text
[ ] Swap desabilitada
[ ] SELinux permissivo
[ ] Módulos overlay e br_netfilter carregados
[ ] IP forwarding habilitado
[ ] containerd em execução
[ ] SystemdCgroup habilitado
[ ] kubelet habilitado
[ ] Control Plane inicializado
[ ] kubectl configurado
[ ] Calico instalado
[ ] Workers adicionados
[ ] Todos os nós em Ready
[ ] Todos os pods essenciais em Running
[ ] Teste com pod realizado
[ ] Teste com Deployment realizado
[ ] Teste com Service realizado
```

---

## 29. Resultado esperado

Ao final da instalação:

```bash
kubectl get nodes -o wide
```

Deve mostrar:

```text
k8s-control01   Ready
k8s-worker01    Ready
k8s-worker02    Ready
```

E:

```bash
kubectl get pods -A
```

Não deve apresentar pods em:

```text
Pending
Error
ImagePullBackOff
ErrImagePull
CrashLoopBackOff
Init:Error
```

O cluster estará pronto para criação de Deployments, Services, ConfigMaps, Secrets, volumes e demais recursos Kubernetes.


## Revisão de compatibilidade e laboratório

Antes de executar este roteiro, registre uma matriz com versões patch, origem dos pacotes e data de consulta. A página `latest` de uma CNI não comprova compatibilidade de uma versão antiga do manifesto.

| Componente do roteiro | Verificação obrigatória | Situação desta revisão |
| --- | --- | --- |
| Rocky Linux 9 | Kernel, módulos, NetworkManager, SELinux e política de firewall | Não instalado em laboratório |
| Kubernetes 1.34 | Suporte vigente e patch disponível na [lista de versões](https://kubernetes.io/releases/) | Reconfirmar antes da instalação |
| containerd | CRI v1 ativo e mesma estratégia de cgroups do kubelet | Versão não fixada no roteiro; combinação ainda não homologada |
| Calico 3.32 | Requisitos da série exata, kernel e Kubernetes suportados; operador e CRDs da mesma versão | Matriz da série exata não confirmada nesta revisão |

A [documentação de runtimes do Kubernetes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/) distingue configuração de containerd 1.x e 2.x. Não aplique o mesmo caminho de plugin TOML às duas séries. Em hosts systemd com cgroup v2, alinhe o driver de kubelet/runtime e confirme que CRI não está em `disabled_plugins`.

Os [requisitos atuais do Calico](https://docs.tigera.io/calico/latest/getting-started/kubernetes/requirements) já descrevem outra série. Portanto, não justificam automaticamente os comandos 3.32 deste artigo. Antes de escolher a combinação, confira os requisitos arquivados e release notes da versão exata. Valide kernel real do Rocky, controle de interfaces pelo NetworkManager, portas do modo de encapsulamento escolhido e interação do firewall com as regras da CNI. Desabilitar proteções por tentativa não substitui essa análise.

Em VMs descartáveis e rede isolada: instale control plane e workers; verifique nós Ready, CoreDNS, resolução entre Pods, Services, tráfego entre nós e NetworkPolicy de aceitação/negação; teste reinício e recuperação. Registre versões e resultados, sem tokens, kubeconfig ou credenciais. Para atualizar um cluster existente, siga a ordem e o version skew oficiais, faça backup verificável do etcd e ensaie restauração; não reutilize as seções de limpeza como procedimento de upgrade.
