# Simulador Financeiro Konioca - Maceio/AL

Simulador em React + Vite baseado no arquivo `Estudo_de_Caso_Konioca_Maceio_Final.pdf`.
O modelo avalia a viabilidade de uma loja compacta/quiosque Konioca em shopping
center em Maceio/AL, com investimento inicial estimado em R$ 160.000 e horizonte
financeiro de 24 meses.

## Como rodar

```bash
npm install
npm run dev
```

Depois acesse a URL indicada pelo Vite, normalmente:

```text
http://127.0.0.1:5173/
```

Para validar antes da entrega:

```bash
npm run lint
npm run build
```

## Entregavel 1 - Simulador de Viabilidade

Esta aplicacao funciona como uma calculadora interativa de viabilidade da
franquia Konioca em Maceio. O dashboard atualiza as metricas em tempo real
conforme as premissas sao ajustadas.

Atende aos itens pedidos:

- 8 variaveis ajustaveis: ticket medio, clientes/dia, WACC, custo fixo,
  royalties, sazonalidade, retencao recorrente e frequencia mensal de compra.
- Saidas em tempo real: VPL, TIR, Payback simples, Payback descontado,
  Burn rate e LTV estimado por cliente recorrente.
- Visualizacoes dinamicas: fluxo de caixa projetado em 24 meses e breakeven
  em clientes por dia.
- 3 cenarios pre-configurados por botao: Conservador, Moderado e Otimista.
- Preparado para hospedagem publica no GitHub Pages via GitHub Actions.

## Premissas ajustaveis

O estudo de caso recomenda limitar o nucleo do simulador a 6 variaveis de alto
impacto. A interface mantem essas 6 variaveis obrigatorias e adiciona 2
premissas comerciais para calcular LTV recorrente:

| Variavel | Faixa | Fonte/justificativa |
| --- | --- | --- |
| Ticket medio | R$ 15 a R$ 40 | IBGE PNAD Continua e ABRASEL. Reflete rendimento local e premio de conveniencia. |
| Fluxo de clientes/dia | 20 a 200 | Hipotese declarada. Assume captacao de 0,5% a 1% do fluxo do corredor comercial. |
| WACC anual | 5% a 30% | Banco Central e premio de risco do varejo. Usado no VPL e payback descontado. |
| Custo fixo mensal | R$ 10.000 a R$ 40.000 | IPECE-AL adaptado. Inclui ocupacao, condominio, fundo de promocao e folha base. |
| Royalties Konioca | 2% a 15% | Circular de Oferta de Franquia. Incide sobre faturamento bruto. |
| Sazonalidade | 0% a 50% | SETUR/AL. Alta entre outubro e marco; retracao na quadra chuvosa entre maio e agosto. |
| Retencao recorrente | 1 a 18 meses | Hipotese comportamental para estimar permanencia do cliente recorrente. |
| Frequencia mensal | 1 a 5 compras | Hipotese de consumo para estimar compras mensais por cliente recorrente. |

## Cenarios do estudo

Os botoes do simulador carregam os tres cenarios descritos no PDF:

| Cenario | Clientes/dia | Ticket | Faturamento mensal base |
| --- | ---: | ---: | ---: |
| Conservador | 40 | R$ 22 | R$ 26.400 |
| Moderado | 75 | R$ 25 | R$ 56.250 |
| Otimista | 110 | R$ 28 | R$ 92.400 |

O faturamento mensal base segue:

```text
faturamento = clientes_por_dia * ticket_medio * 30 dias
```

## Formulas usadas

```text
clientes_mes = clientes_dia * 30 * fator_sazonal
receita = clientes_mes * ticket_medio
cmv = receita * 42%
royalties = receita * percentual_royalties
custos_totais = custo_fixo + cmv + royalties
fluxo_caixa = receita - custos_totais
VPL = -investimento + soma(fluxo_mes / (1 + WACC_mensal) ^ mes)
TIR = taxa que zera o VPL dos fluxos projetados
payback_simples = primeiro mes em que o fluxo acumulado fica positivo
payback_descontado = primeiro mes em que o fluxo descontado acumulado fica positivo
burn_rate = valor mensal queimado quando o fluxo de caixa e negativo
LTV = margem_contribuicao_unitaria * frequencia_mensal * retencao_meses
breakeven_clientes_dia = custo_fixo / (margem_contribuicao_unitaria * 30)
```

O CMV de 42% nao e variavel ajustavel porque o escopo da AV2 pede 6 variaveis.
Ele fica como hipotese operacional fixa para representar insumos e perdas, e
deve ser substituido por cotacoes reais quando o grupo tiver dados primarios.

## Regras estrategicas incorporadas

- O simulador destaca o teto de ocupacao de 12% do faturamento, conforme a
  recomendacao final do comite.
- A sazonalidade aumenta o fluxo em outubro-marco e reduz em maio-agosto.
- O benchmark exibido no app reproduz as metricas do relatorio: VPL, TIR,
  payback descontado e LTV/CAC dos tres cenarios.
- O parecer de referencia e "investir com condicionais", dependente de controle
  de ocupacao, logistica e autorizacao para compra local de insumos em Alagoas.

## Hospedagem publica no GitHub Pages

O projeto inclui o workflow `.github/workflows/deploy-pages.yml`. Para publicar:

1. Envie esta pasta para um repositorio no GitHub.
2. No GitHub, abra `Settings > Pages`.
3. Em `Build and deployment`, selecione `GitHub Actions`.
4. Faca push na branch `main` ou `master`.
5. Aguarde a Action `Deploy GitHub Pages` concluir.

O Vite ajusta automaticamente o `base` quando o build roda no GitHub Actions,
entao a aplicacao funciona em URLs do tipo:

```text
https://usuario.github.io/nome-do-repositorio/
```

## Referencias do estudo de caso

- Estudo de Caso Konioca - Maceio/AL. Comite de Inteligencia Estrategica, 2026.
- IBGE. PNAD Continua.
- ABRASEL. Indicadores do setor de alimentacao fora do lar.
- Banco Central do Brasil. Taxa Selic.
- IPECE-AL. Dados macroeconomicos adaptados.
- SETUR/AL. Relatorio de Fluxo Turistico.
- Circular de Oferta de Franquia (COF) Konioca.
