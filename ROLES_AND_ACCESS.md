# Configuração de Roles e Acessos

## Enum de Roles

```typescript
enum UserRole {
  SYSTEM_ADMIN, // Administrador do sistema (acesso a tudo)
  CLINIC_ADMIN, // Administrador da clínica
  PATIENT, // Paciente
  PROFESSIONAL, // Médico/Profissional
  FINANCE, // Financeiro
  RECEPTIONIST, // Recepcionista
}
```

## Permissões por Role

### SYSTEM_ADMIN

- **Descrição**: Administrador do sistema com acesso total a todas as clínicas
- **Acesso**:
  - ✅ Dashboard
  - ✅ Agenda
  - ✅ Pacientes
  - ✅ Profissionais
  - ✅ Admin (Usuários, Profissionais)
  - ✅ Financeiro (quando implementado)

### CLINIC_ADMIN

- **Descrição**: Administrador da clínica com acesso total dentro da clínica
- **Acesso**:
  - ✅ Dashboard
  - ✅ Agenda
  - ✅ Pacientes
  - ✅ Profissionais
  - ✅ Admin (Usuários, Profissionais)
  - ✅ Financeiro (quando implementado)

### PATIENT

- **Descrição**: Paciente do sistema
- **Acesso**:
  - ✅ Dashboard
  - ✅ Agenda (para agendar consultas)
  - ❌ Pacientes
  - ✅ Profissionais (para buscar e escolher)
  - ❌ Admin
  - ❌ Financeiro

### PROFESSIONAL

- **Descrição**: Médico/Profissional de saúde
- **Acesso**:
  - ✅ Dashboard
  - ✅ Agenda (pacientes agendados para ele)
  - ✅ Pacientes (seus pacientes)
  - ❌ Profissionais
  - ❌ Admin
  - ❌ Financeiro

### FINANCE

- **Descrição**: Responsável pelo módulo financeiro
- **Acesso**:
  - ✅ Dashboard
  - ❌ Agenda
  - ❌ Pacientes
  - ❌ Profissionais
  - ❌ Admin
  - ✅ Financeiro (quando implementado)

### RECEPTIONIST

- **Descrição**: Recepcionista da clínica
- **Acesso**:
  - ✅ Dashboard
  - ✅ Agenda (para gerenciar agendamentos)
  - ✅ Pacientes (para cadastrar novos)
  - ✅ Profissionais (para visualizar)
  - ❌ Admin
  - ❌ Financeiro

## Implementação

### Métodos de Verificação (CurrentUserService)

```typescript
// Verifica se o usuário tem uma ou mais roles
hasRole(role: UserRole | UserRole[]): boolean

// Verifica acesso ao painel admin
canAccessAdmin(): boolean

// Verifica acesso a pacientes
canAccessPatients(): boolean

// Verifica acesso a agenda
canAccessAppointments(): boolean

// Verifica acesso a profissionais
canAccessProfessionals(): boolean

// Verifica acesso a financeiro
canAccessFinance(): boolean
```

### Proteção de Rotas (Role Guard)

```typescript
// Exemplo de uso:
{
  path: 'patients',
  canActivate: [roleGuard([
    UserRole.SYSTEM_ADMIN,
    UserRole.CLINIC_ADMIN,
    UserRole.RECEPTIONIST,
    UserRole.PROFESSIONAL
  ])],
  loadChildren: () => import('./features/patients/patients.routes')
}
```

### Controle na Sidebar

O sidebar automaticamente mostra/oculta os links baseado nas roles do usuário:

- **Dashboard**: Sempre visível para todos os roles autenticados
- **Agenda**: Mostra apenas para SYSTEM_ADMIN, CLINIC_ADMIN, RECEPTIONIST, PROFESSIONAL, PATIENT
- **Pacientes**: Mostra apenas para SYSTEM_ADMIN, CLINIC_ADMIN, RECEPTIONIST, PROFESSIONAL
- **Profissionais**: Mostra apenas para SYSTEM_ADMIN, CLINIC_ADMIN, PATIENT, RECEPTIONIST
- **Admin**: Mostra apenas para SYSTEM_ADMIN, CLINIC_ADMIN

## Exemplo de Integração no Template

```html
@if (canAccessPatients()) {
<a routerLink="/app/patients">
  <app-icon [name]="'users'"></app-icon>
  <span>Pacientes</span>
</a>
}
```

## Próximas Etapas

1. ✅ Configurar enum de roles com todos os tipos
2. ✅ Implementar role guards nas rotas
3. ✅ Adicionar controle de acesso na sidebar
4. ⏳ Implementar módulo de financeiro
5. ⏳ Filtrar dados por clínica para CLINIC_ADMIN
6. ⏳ Implementar RLS (Row Level Security) no backend
