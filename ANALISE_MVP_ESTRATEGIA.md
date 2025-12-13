# 📊 Análise Estratégica de MVP vs. Produto Final - MultClinic

## ÍNDICE

1. [Leitura Estratégica](#1-leitura-estratégica)
2. [Camadas de Produto Propostas](#2-camadas-de-produto)
3. [Status Atual do Desenvolvimento](#3-status-atual)
4. [Gap Analysis - O que Falta](#4-gap-analysis)
5. [Proposta de Planos](#5-proposta-de-planos)
6. [Roadmap Priorizado para MVP](#6-roadmap-priorizado)

---

## 1. LEITURA ESTRATÉGICA

### O que a Cliente Está Realmente Dizendo

**Insight Chave:** As clínicas NÃO começam pelo plano barato. Elas:

1. **Entrada (Mês 1)**: Contratam plano AVANÇADO (querem "tudo")
2. **Maturação (Mês 2-3)**: Entendem o que realmente usam
3. **Downgrade (Mês 4-6)**: Caem para intermediário ou essencial

### Por Que Isso Importa

- **Plano barato é isca**, não receita inicial
- **Plano intermediário é onde fica o dinheiro** (70% das clínicas)
- **Plano avançado é âncora de preço** (justifica os outros serem mais baratos)

### A Estratégia Correta de Preços (SaaS Maduro)

```
┌─────────────────────────────────────────────────┐
│  Plano Avançado (R$ X)  ← Ninguém quer pagar   │
│                             MAS cria âncora     │
├─────────────────────────────────────────────────┤
│  Plano Intermediário (R$ X/2) ← AQUI FICA $$$  │
│                                 (70% das vendas) │
├─────────────────────────────────────────────────┤
│  Plano Básico (R$ X/4)       ← Entrada gratuita│
│                                 (proof of concept)│
└─────────────────────────────────────────────────┘
```

---

## 2. CAMADAS DE PRODUTO

### 🟢 CAMADA ESSENCIAL (Plano Básico)

**Preço Proposto:** Gratuito ou R$ 99/mês

#### Funcionalidades:

- [x] Agenda de atendimentos
- [x] Agendamento/remarcação
- [x] Check-in/check-out
- [x] Cadastro de paciente
- [x] Status de convênio (básico)
- [ ] Fila de espera
- [ ] Confirmações/lembretes automáticas

#### Prontuário Clínico (Básico):

- [x] Prontuário eletrônico
- [x] Evoluções
- [x] Documentos (PDF)
- [ ] Prescrições simples

**Status Backend:** ✅ 95% pronto (faltam confirmações automáticas e fila)
**Status Frontend:** ✅ 80% pronto (falta fila e lembretes)

---

### 🟡 CAMADA INTERMEDIÁRIA (Plano Intermediário)

**Preço Proposto:** R$ 299/mês

**⚠️ AQUI FICA O DINHEIRO**

#### 1. Coordenação / Gerência

- [ ] Configurações de salas
- [ ] Configurações de especialidades
- [ ] Modelos de prontuário customizáveis
- [ ] Protocolos clínicos
- [x] Permissões e papéis (backend ready)
- [ ] Indicadores de produtividade
- [ ] Relatórios gerenciais (simples)

#### 2. Financeiro Básico (Muito Atrativo)

- [ ] Recebimentos por paciente
- [ ] Repasses aos profissionais
- [ ] Caixa diário
- [ ] Contas a pagar/receber
- [ ] Relatórios financeiros

**Status Backend:** ⚠️ 30% (roles existem, mas faltam muitos endpoints)
**Status Frontend:** ❌ 0% (nenhum módulo de gerência/financeiro iniciado)

**Impacto:** Esta camada é CRÍTICA para fidelização. Sem ela, não há razão para downgrade do plano avançado.

---

### 🔵 CAMADA AVANÇADA (Plano Avançado)

**Preço Proposto:** R$ 899/mês

#### 1. Faturamento e Convênios (TISS)

- [ ] Geração de guias TISS
- [ ] Controle de glosas
- [ ] Faturamento por período
- [ ] Relatórios de envio

#### 2. Estoque / Insumos

- [ ] Controle de materiais
- [ ] Baixa por procedimento
- [ ] Alertas de estoque
- [ ] Produtos e fornecedores

#### 3. Marketing / Relacionamento

- [ ] Campanhas segmentadas
- [ ] Listas segmentadas
- [ ] Integração WhatsApp/e-mail
- [ ] NPS de satisfação
- [ ] Relatórios de retorno

**Status Backend:** ❌ 0% (nenhum desses módulos)
**Status Frontend:** ❌ 0% (nenhuma tela iniciada)

---

### 🔴 CAMADA EXECUTIVA (Incluído em Planos Avançados)

**Preço:** Incluído no Avançado ou + R$ 200

- [ ] Dashboards executivos
- [ ] KPIs consolidados
- [ ] Rentabilidade por especialidade
- [ ] Visão macro da clínica

**Status:** ❌ 0%

---

## 3. STATUS ATUAL DO DESENVOLVIMENTO

### FRONTEND (Angular 20)

| Camada            | Componente           | Status          | % Concluído | Notas                                     |
| ----------------- | -------------------- | --------------- | ----------- | ----------------------------------------- |
| **ESSENCIAL**     | Agenda               | ✅ Pronto       | 95%         | FullCalendar integrado, modal de detalhes |
|                   | Agendamento (Portal) | ❌ Não iniciado | 0%          | Crítico para MVP                          |
|                   | Pacientes            | ✅ Pronto       | 85%         | Lista, cadastro e detalhes                |
|                   | Profissionais        | ✅ Pronto       | 85%         | Lista e detalhes                          |
|                   | Documentos           | ✅ Pronto       | 80%         | Upload e visualização                     |
|                   | Evoluções            | ✅ Pronto       | 80%         | Criação e listagem                        |
| **INTERMEDIÁRIA** | Configurações        | ❌ Não iniciado | 0%          | Salas, especialidades, modelos            |
|                   | Financeiro           | ❌ Não iniciado | 0%          | Crítico para diferenciação                |
|                   | Relatórios           | ❌ Não iniciado | 0%          | Pode ser básico no MVP                    |
| **AVANÇADA**      | TISS/Faturamento     | ❌ Não iniciado | 0%          | Fora do escopo MVP                        |
|                   | Estoque              | ❌ Não iniciado | 0%          | Fora do escopo MVP                        |
|                   | Marketing            | ❌ Não iniciado | 0%          | Fora do escopo MVP                        |

### BACKEND (Java Spring)

| Entidade            | GET | POST | PUT | DELETE | Filtros              | Status        |
| ------------------- | --- | ---- | --- | ------ | -------------------- | ------------- |
| Appointment         | ✅  | ✅   | ✅  | ✅     | clinic, patient, pro | ✅ Pronto     |
| Evolution           | ✅  | ✅   | ✅  | ✅     | patient, clinic      | ✅ Pronto     |
| Document            | ✅  | ✅   | ✅  | ✅     | patient, clinic      | ✅ Pronto     |
| Patient             | ✅  | ✅   | ✅  | ✅     | clinic, name         | ✅ Pronto     |
| Professional        | ✅  | ✅   | ✅  | ✅     | clinic, specialty    | ✅ Pronto     |
| ServiceProvided     | ✅  | ✅   | ✅  | ✅     | clinic               | ⚠️ Básico     |
| DoctorAvailableDay  | ✅  | ✅   | ❌  | ✅     | doctor               | ⚠️ Incompleto |
| AuditLog            | ✅  | ❌   | ❌  | ❌     | user, clinic         | ✅ Read-only  |
| **Faltam para MVP** |     |      |     |        |                      |               |
| Finance Entries     | ❌  | ❌   | ❌  | ❌     |                      | ❌ Crítico    |
| Clinic Settings     | ⚠️  | ⚠️   | ⚠️  | ❌     |                      | ⚠️ Parcial    |
| Payment             | ❌  | ❌   | ❌  | ❌     |                      | ❌ Crítico    |

---

## 4. GAP ANALYSIS - O QUE FALTA PARA MVP

### CRÍTICO (Bloqueia MVP) 🔴

#### 1. **Portal do Paciente - Agendamento Online**

- **Por quê:** Sem isso, é só admin visualizando calendário
- **Impacto:** Reduz 30% da operação manual
- **Esforço:** 2 semanas (3 endpoints + 2 telas)
- **Plano:** Essencial

#### 2. **Módulo Financeiro Básico**

- **Por quê:** Sem ele, não há diferença com plano intermediário
- **Impacto:** Aumenta validade proposta + 40%
- **Esforço:** 4 semanas (5 endpoints + 5 telas)
- **Plano:** Intermediário (bloqueia downgrade natural)

#### 3. **Confirmações/Lembretes Automáticas**

- **Por quê:** Reduz no-shows em 25-40%
- **Impacto:** ROI imediato para clínica
- **Esforço:** 2 semanas (backend + integração)
- **Plano:** Essencial

### IMPORTANTE (Melhora UX) 🟡

#### 4. **Relatórios Simples**

- Faturamento por mês
- Agendamentos por profissional
- Status dos agendamentos

#### 5. **Configurações de Salas e Especialidades**

- Sem isso, tudo é manual

#### 6. **Indicadores de Produtividade**

- Agendamentos por dia
- Receita por profissional

### NÃO É MVP (Pode ser adicionado depois) 🟢

- TISS/Faturamento convênios
- Estoque de insumos
- Campanhas de marketing
- Integrações WhatsApp

---

## 5. PROPOSTA DE PLANOS

### 5.1 PLANO BÁSICO (Gratuito ou R$ 99/mês)

**Posicionamento:** "Prova de conceito" + "Entrada de funil"

#### Incluído:

✅ Agenda de atendimentos
✅ Cadastro de pacientes
✅ Prontuário eletrônico
✅ Evoluções
✅ Documentos (5 por mês)
✅ 1 usuário
✅ 1 clínica
✅ Suporte por email

#### Não incluído:

❌ Portal do paciente (agendamento online)
❌ Relatórios
❌ Permissões avançadas
❌ Financeiro
❌ Integração

#### Limite de Dados:

- 10 pacientes
- 1 profissional
- 100 agendamentos/mês

#### Objetivo:

- Familiarizar com produto
- Validar fit
- Criar hábito

---

### 5.2 PLANO INTERMEDIÁRIO ⭐ (R$ 299/mês)

**Posicionamento:** "O Padrão da Indústria" (principal receita)

#### Incluído (tudo do Básico + ):

✅ Portal do paciente (agendamento online)
✅ Confirmações/lembretes automáticas
✅ Módulo financeiro:

- Recebimentos
- Repasses aos profissionais
- Caixa diário
- Contas a pagar/receber
  ✅ Relatórios gerenciais:
- Faturamento por período
- Produtividade por profissional
- Status de agendamentos
  ✅ Permissões e papéis (admin, médico, recepção)
  ✅ Configurações:
- Salas
- Especialidades
- Modelos de prontuário
  ✅ 5 usuários
  ✅ 1 clínica
  ✅ Documentos ilimitados
  ✅ Suporte por chat + email

#### Não incluído:

❌ TISS/Faturamento convênios
❌ Estoque
❌ Marketing/campanhas
❌ Integrações externas

#### Limite de Dados:

- 500 pacientes
- 20 profissionais
- 5.000 agendamentos/mês

#### Objetivo:

- **Maior ticket médio**
- **Melhor retenção** (por valor agregado)
- **Márgem de 65%+**

---

### 5.3 PLANO AVANÇADO (R$ 899/mês)

**Posicionamento:** "Solução Completa para Redes" (âncora de preço)

#### Incluído (tudo do Intermediário + ):

✅ TISS/Faturamento:

- Geração de guias TISS
- Controle de glosas
- Faturamento por período
  ✅ Estoque de insumos:
- Controle de materiais
- Baixa por procedimento
- Alertas de estoque
  ✅ Marketing:
- Listas segmentadas
- Campanhas (SMS/email)
- NPS de satisfação
  ✅ Integrações:
- WhatsApp
- Sistemas de pagamento
  ✅ Dashboards executivos:
- KPIs consolidados
- Rentabilidade
- Visão macro
  ✅ 15 usuários
  ✅ Até 3 clínicas
  ✅ Sem limites de dados
  ✅ Suporte prioritário (telefone + chat)
  ✅ Relatórios customizados

#### Objetivo:

- Clínicas maiores/redes
- Justificar preço alto
- Fazer intermediário parecer "barato"

---

### 5.4 COMPARATIVO VISUAL

```
┌──────────────────┬─────────────┬──────────────────┬─────────────┐
│    Recurso       │  BÁSICO     │  INTERMEDIÁRIO   │  AVANÇADO   │
├──────────────────┼─────────────┼──────────────────┼─────────────┤
│ Preço            │ Gratuito    │ R$ 299/mês       │ R$ 899/mês  │
│ Usuários         │ 1           │ 5                │ 15          │
│ Agenda           │ ✅          │ ✅               │ ✅          │
│ Agendamento      │ ❌          │ ✅               │ ✅          │
│ Pacientes        │ ✅ (10)     │ ✅ (500)         │ ✅ (∞)      │
│ Prontuário       │ ✅          │ ✅               │ ✅          │
│ Financeiro       │ ❌          │ ✅               │ ✅          │
│ Relatórios       │ ❌          │ ✅ (básicos)     │ ✅ (custom) │
│ TISS             │ ❌          │ ❌               │ ✅          │
│ Estoque          │ ❌          │ ❌               │ ✅          │
│ Marketing        │ ❌          │ ❌               │ ✅          │
│ Integrações      │ ❌          │ ❌               │ ✅          │
│ Suporte          │ Email       │ Chat+Email       │ Prioritário │
└──────────────────┴─────────────┴──────────────────┴─────────────┘
```

---

## 6. ROADMAP PRIORIZADO

### FASE 0: MVP LAUNCH (05/01/2025) - 6 SEMANAS

#### Sprint 1-2: Crítico para Viabilidade

- [x] Agenda de atendimentos (com modal)
- [ ] Portal do paciente - agendamento online
- [ ] Validação e confirmação de agendamentos
- [ ] Sistema de e-mail/SMS para lembretes

**Backend Necessário:**

- Endpoint: `POST /api/appointments/patient-portal` (criar agendamento)
- Endpoint: `GET /api/appointments/available-slots` (consultar disponibilidade)
- Implementar integração de e-mail
- Event listener para confirmação automática

**Frontend Necessário:**

- Tela de agendamento para pacientes (public route)
- Seleção de data/hora
- Validação de conflitos
- Confirmação por email

#### Sprint 3: Base de Receita

- [ ] Módulo financeiro básico (CRÍTICO para intermediário)
  - Recebimentos por paciente
  - Caixa diário
  - Relatório simples de receita
- [ ] Permissões por perfil (já está no backend)

**Backend Necessário:**

- Entidade: `Payment`
- Entidade: `DailyBalance`
- Endpoints: CRUD completo

**Frontend Necessário:**

- Tela de recebimentos
- Tela de caixa diário
- Relatório de receita (gráfico + tabela)

#### Sprint 4-5: MVP Completo

- [ ] Configurações básicas (salas, especialidades)
- [ ] Relatórios simples (produtividade, agendamentos)
- [ ] Testes e estabilização

#### Sprint 6: Go-Live

- [ ] Documentação
- [ ] Deploy em produção
- [ ] Onboarding de clientes-piloto

---

### FASE 1: Plano Intermediário Completo (02/2025) - 8 SEMANAS

- Tudo da Fase 0 +
- Modelos de prontuário customizáveis
- Relatórios gerenciais avançados
- Indicadores de produtividade
- Dashboard do admin

---

### FASE 2: Plano Avançado (03/2025) - 8 SEMANAS

- TISS/Faturamento
- Estoque
- Marketing/Campanhas
- Integrações externas

---

## 7. JUSTIFICATIVA DE ESTRATÉGIA

### Por Que Esse Ordem?

1. **Portal do Paciente** (Semana 1-2)
   - É o diferencial vs concorrentes
   - Reduz 30% da operação manual
   - Sem isso, é só admin olhando calendário

2. **Financeiro** (Semana 3)
   - É o "valor percebido" do plano intermediário
   - Clínicas querem saber se estão lucrando
   - Se não implementar no MVP, perde a única razão de downgrade

3. **Relatórios** (Semana 4)
   - Complementa financeiro
   - Executivos querem KPIs
   - Baixo esforço, alto impacto

4. **Configurações** (Semana 4)
   - Essencial para usabilidade
   - Hoje é tudo hardcoded

---

## 8. MATRIZ DE RISCO

| Risco                              | Impacto | Probabilidade | Mitigação                   |
| ---------------------------------- | ------- | ------------- | --------------------------- |
| Portal agendamento não fica pronto | Alto    | Média         | Começar HOJE                |
| Financeiro complexo demais         | Alto    | Média         | Versão 1.0 bem simples      |
| Não há demanda por intermediário   | Alto    | Baixa         | Validar com clientes-piloto |
| Backend não aguenta carga          | Médio   | Média         | Load testing na Fase 1      |
| UX confusa para end users          | Médio   | Alta          | UX testing com clínicas     |

---

## PRÓXIMOS PASSOS

### Imediato (Esta semana)

1. [ ] Priorizar portal do paciente (definir exatamente o escopo)
2. [ ] Especificar módulo financeiro básico
3. [ ] Criar endpoints backend para ambos
4. [ ] Começar desenvolvimento paralelo

### Curto Prazo (Próximas 2 semanas)

1. [ ] Portal do paciente em produção (MVP)
2. [ ] Testes de carga
3. [ ] Feedback de clientes-piloto

### Médio Prazo (Fevereiro)

1. [ ] Plano intermediário completo
2. [ ] Marketing para posicionar os 3 planos
3. [ ] Preparar go-live comercial

---

## RESUMO EXECUTIVO

### O Que Temos Hoje

✅ Agenda de atendimentos
✅ Prontuário eletrônico
✅ Gestão de pacientes e profissionais

### O Que Falta para MVP (Crítico)

❌ Portal do paciente (agendamento online)
❌ Módulo financeiro básico
❌ Confirmações/lembretes automáticas

### O Que Falta para Intermediário (Diferenciação)

❌ Relatórios gerenciais
❌ Indicadores de produtividade
❌ Configurações avançadas

### Estratégia de Preços

- **Básico:** Gratuito (isca)
- **Intermediário:** R$ 299 (principal receita - 70% das vendas)
- **Avançado:** R$ 899 (âncora de preço)

### Timeline Realista

- **MVP (Essencial):** 05/01/2025 (6 semanas)
- **Intermediário:** 02/2025 (+ 8 semanas)
- **Avançado:** 03/2025 (+ 8 semanas)

**Risco:** Se não implementar financeiro no MVP, perde a possibilidade de ter plano intermediário diferenciado.
