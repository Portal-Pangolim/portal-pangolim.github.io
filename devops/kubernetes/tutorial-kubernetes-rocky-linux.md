---
layout: default
status: historical
validation: pending-lab
description: "Registro histórico de Kubernetes 1.31 no Rocky Linux; série sem suporte, inadequada para novas instalações."
title: Kubernetes 1.31 no Rocky Linux — registro histórico
---

# Tutorial: Instalação do Kubernetes (kubeadm) no Rocky Linux
{:.no_toc}

> **Registro histórico — não usar para novas instalações.** Kubernetes 1.31 encerrou suporte em 11/11/2025. Os comandos abaixo registram uma combinação antiga com Calico 3.28; não constituem uma instalação suportada. Não execute em produção. Consulte o [roteiro de revisão de compatibilidade](instalacao-cluster-rocky-containerd-calico.html#revisão-de-compatibilidade-e-laboratório) antes de planejar um laboratório novo.

Cenário histórico: 2 VMs no VirtualBox
- `vm-01` (control-plane) — 10.0.97.55
- `vm-02` (worker) — 10.0.97.33

> Passos marcados **[AMBAS]** rodam em vm-01 e vm-02. Passos marcados **[vm-01]** ou **[vm-02]** rodam só naquela VM.

---

<div class="toc-title">Sumário</div>
* Sumário:
{:toc}

---
## 1. Preparar o /etc/hosts **[AMBAS]**

```bash
cat <<EOF >> /etc/hosts
10.0.97.55 vm-01
10.0.97.33 vm-02
EOF
```

Teste com `ping -c1 vm-01` e `ping -c1 vm-02` de cada máquina.

---

## 2. Atualizar o sistema **[AMBAS]**

```bash
dnf update -y
dnf install -y curl wget vim git tar
```

---

## 3. Desabilitar swap **[AMBAS]**

O kubelet exige swap desligado.

```bash
swapoff -a
sed -i '/ swap / s/^/#/' /etc/fstab
```

Confirme com `free -h` (coluna Swap deve ficar zerada).

---

## 4. Ajustar SELinux **[AMBAS]**

```bash
setenforce 0
sed -i 's/^SELINUX=enforcing/SELINUX=permissive/' /etc/selinux/config
```

---

## 5. Configurar firewall **[AMBAS]**

Mais simples em laboratório é desativar o firewalld (em produção você liberaria portas específicas):

```bash
systemctl disable --now firewalld
```

Se preferir manter o firewall ativo, portas mínimas:
- Control plane: 6443, 2379-2380, 10250, 10259, 10257
- Worker: 10250, 30000-32767

---

## 6. Módulos de kernel e parâmetros de rede **[AMBAS]**

```bash
cat <<EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

modprobe overlay
modprobe br_netfilter

cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sysctl --system
```

---

## 7. Instalar containerd (runtime de containers) **[AMBAS]**

```bash
dnf install -y dnf-plugins-core
dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
dnf install -y containerd.io

mkdir -p /etc/containerd
containerd config default | tee /etc/containerd/config.toml
```

Editar `/etc/containerd/config.toml` e trocar `SystemdCgroup = false` para `true` (o kubelet espera cgroup driver systemd):

```bash
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
```

```bash
systemctl enable --now containerd
systemctl restart containerd
```

---

## 8. Instalar kubeadm, kubelet e kubectl **[AMBAS]**

```bash
cat <<EOF | tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.31/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.31/rpm/repodata/repomd.xml.key
exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
EOF

dnf install -y kubelet kubeadm kubectl --disableexcludes=kubernetes

systemctl enable --now kubelet
```

> Não atualize apenas o número do repositório. Escolha patches suportados, valide o runtime e a CNI e ensaie a instalação em VMs descartáveis. [Ciclo oficial da série 1.31](https://kubernetes.io/releases/1.31/).

---

## 9. Inicializar o control plane **[vm-01]**

```bash
kubeadm init \
  --apiserver-advertise-address=10.0.97.55 \
  --pod-network-cidr=192.168.0.0/16
```

- `--apiserver-advertise-address`: IP da vm-01.
- `--pod-network-cidr`: precisa bater com o CNI escolhido (aqui uso Calico, que usa `192.168.0.0/16` por padrão).

Ao final, o comando mostra duas coisas importantes — **guarde-as**:

1. Comandos para configurar o kubectl:

```bash
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config
```

2. O comando `kubeadm join ...` com o token — você vai usar na vm-02.

Se perder o token, gere de novo depois com:

```bash
kubeadm token create --print-join-command
```

---

## 10. Instalar o CNI (rede de pods) **[vm-01]**

Sem CNI os pods do CoreDNS ficam em `Pending`. Exemplo com Calico:

```bash
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/calico.yaml
```

Aguarde os pods ficarem `Running`:

```bash
kubectl get pods -n kube-system -w
```

---

## 11. Adicionar o worker ao cluster **[vm-02]**

Rode o comando que o `kubeadm init` te deu na vm-01, algo assim:

```bash
kubeadm join 10.0.97.55:6443 --token <token> \
  --discovery-token-ca-cert-hash sha256:<hash>
```

---

## 12. Validar o cluster **[vm-01]**

```bash
kubectl get nodes
```

Esperado:

```
NAME     STATUS   ROLES           AGE   VERSION
vm-01    Ready    control-plane   5m    v1.31.x
vm-02    Ready    <none>          1m    v1.31.x
```

Se o STATUS ficar `NotReady`, geralmente é o CNI ainda subindo — aguarde um pouco e confira `kubectl get pods -n kube-system`.

---

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `kubeadm init` trava em "waiting for kubelet" | containerd com cgroup driver errado | conferir `SystemdCgroup = true` no config.toml e reiniciar containerd |
| Node fica `NotReady` | CNI não instalado/quebrado | reaplicar manifesto do Calico/Flannel |
| `kubeadm join` falha com erro de conexão | firewall ou porta 6443 fechada | checar `firewalld` ou grupo de rede do VirtualBox |
| Swap voltando após reboot | fstab não editado | conferir `/etc/fstab`, linha da swap comentada |

---

## Dica para o VirtualBox

Garanta que as duas VMs estão na mesma rede (Host-Only ou Bridged, não NAT isolado), senão vm-01 e vm-02 não vão se enxergar. Como você já validou os IPs com `hostname -I` e o SSH entre elas funciona, a rede já está OK.
