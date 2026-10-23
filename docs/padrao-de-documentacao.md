# Padrão de documentação

Use esta estrutura para novos procedimentos. Remova seções que não se aplicarem, mas mantenha as informações necessárias para outra pessoa executar e validar o trabalho com segurança.

```markdown
# Nome do procedimento

## Objetivo

Explique o resultado esperado e quando usar este procedimento.

## Pré-requisitos

- Acessos, versões, permissões e dependências necessários.
- Backup, janela de manutenção ou aprovação, se aplicável.

## Procedimento

Apresente os passos em ordem, explicando comandos não óbvios.

## Validação

Mostre como confirmar que o resultado foi alcançado.

## Troubleshooting

Liste falhas comuns, diagnóstico e solução.

## Rollback

Explique como reverter a alteração ou informe explicitamente quando não houver reversão segura.

## Segurança e boas práticas

Registre riscos, dados sensíveis e cuidados operacionais.
```

> Antes de comandos que removem dados, sobrescrevem configurações ou atuam em produção, informe o impacto, a confirmação do alvo e a alternativa de rollback.
