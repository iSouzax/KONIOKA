# 📊 Simulador de Viabilidade Estratégica: Franquia Konioca (Maceió/AL)

Este projeto é uma aplicação web interativa desenvolvida para o Comitê de Inteligência Estratégica de um fundo regional. Ele atua como uma calculadora de viabilidade e Business Intelligence (BI) para avaliar a abertura de uma franquia da marca Konioca na cidade de Maceió, Alagoas.

## 🎯 Por que as Premissas valem mais que o Código?

Um simulador financeiro sem premissas claras é apenas uma interface bonita gerando dados incorretos. A exatidão deste modelo baseia-se na limitação de escopo: focamos em **6 variáveis de altíssimo impacto** com forte embasamento na realidade de mercado, evitando a pulverização de dados com variáveis não rastreáveis.

### As 6 Variáveis Ajustáveis:
1. **Ticket Médio:** Estipulado entre R$ 15,00 e R$ 40,00, refletindo o rendimento domiciliar litorâneo (IBGE/PNAD) e o prêmio de marca sobre a tapioca tradicional.
2. **Fluxo de Clientes/Dia:** De 20 a 200, testando desde a ociosidade total até a saturação da capacidade produtiva de um quiosque de shopping.
3. **Taxa de Retorno (WACC):** Representa o custo de oportunidade (Taxa Selic + Risco do Varejo), o verdadeiro termômetro do Valor Presente Líquido.
4. **Custo Fixo Mensal:** Aglutina os pesados custos de ocupação em shoppings de Maceió (aluguel, condomínio, fundo de promoção) e folha de pagamento local. É a base do *Burn Rate*.
5. **Royalties Konioca:** Variável contratual mandatória (2% a 15%) que incide sobre o faturamento bruto, ditando o ritmo do *breakeven*.
6. **Sazonalidade (%):** Fator crítico em Maceió. Injeta fluxo na alta temporada de turismo (Outubro a Março) e retrai na quadra chuvosa (Maio a Agosto).

---

## 🚀 Funcionalidades da Aplicação

* **Cálculo em Tempo Real:** Processamento dinâmico de VPL (Valor Presente Líquido), TIR (Taxa Interna de Retorno), Payback Simples/Descontado, Burn Rate e LTV estimado.
* **Cenários Pré-configurados:** Botões de acesso rápido para simular ambientes de estresse operacional (Conservador, Moderado e Otimista).
* **Dashboards Dinâmicos:** Geração instantânea de gráficos (Recharts) projetando o Fluxo de Caixa Acumulado e a relação de *Breakeven* (Receita vs. Custos) para os próximos 24 meses.

---

## 🏗️ Arquitetura do Projeto

A base de código foi estruturada com separação rigorosa de responsabilidades para facilitar a manutenção e leitura:
* `src/financeUtils.js`: Isola 100% da lógica matemática, iteradores e cálculos complexos de matrizes financeiras.
* `src/App.jsx`: Componente principal de interface, gerenciamento de estado das premissas e renderização dos gráficos interativos.
* `src/App.module.css`: Folha de estilo escopada, garantindo semântica visual e prevenção de conflitos de CSS em integrações futuras.

---

## 💻 Como Executar Localmente

Siga os passos abaixo para rodar o simulador no seu ambiente de desenvolvimento:

### Pré-requisitos
* [Node.js](https://nodejs.org/) instalado na máquina.

### Instalação

1. Clone este repositório:
   ```bash
   git clone [https://github.com/SEU_USUARIO/konioca-simulator.git](https://github.com/SEU_USUARIO/konioca-simulator.git)