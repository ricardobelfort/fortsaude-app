# 🏥 MultiClinic - Frontend SaaS para Gestão de Clínica Multidisciplinar

Sistema moderno e escalável para gestão de clínicas multidisciplinares de saúde, desenvolvido com **Angular 21**, **PrimeNG 21**, **Tailwind CSS 4** e **FullCalendar**.

## 🎯 Características

- ✅ **Autenticação JWT** - Login seguro com Bearer tokens
- ✅ **Gestão de Pacientes** - CRUD completo
- ✅ **Agenda Visual** - FullCalendar integrado
- ✅ **Prontuário Eletrônico** - Acompanhamento clínico
- ✅ **Profissionais Multidisciplinares** - Suporte a todas as áreas de saúde
- ✅ **Painel Administrativo** - Gestão completa
- ✅ **Design Responsivo** - Mobile-first com Tailwind CSS
- ✅ **PrimeNG Components** - UI enterprise-grade
- ✅ **Guards de Autenticação e Autorização** - Segurança por role

## 🚀 Quick Start

### Requisitos

- Node.js 18+
- npm 9+

### Instalação

```bash
cd /Users/ricardobelfort/dev/fortsaude-app

# Instalar dependências
npm install

# Inicia servidor de desenvolvimento
npm start

# Abre em http://localhost:57930 (ou outra porta)
```

### Build para Produção

```bash
npm run build
# Output: dist/fortsaude-app/
```

### Executar Testes

```bash
npm test
```

## 📁 Estrutura do Projeto

```
src/app/
├── core/                   # Camada central
│   ├── auth/              # Autenticação e guards
│   ├── interceptors/       # HTTP interceptors
│   ├── models/            # Types globais
│   ├── services/          # Serviços de API
│   └── layout/            # Layout principal
├── shared/                # Componentes reutilizáveis
├── features/              # Módulos lazy-loaded
│   ├── dashboard/
│   ├── patients/
│   ├── professionals/
│   ├── appointments/
│   ├── medical-records/
│   └── admin/
└── app.routes.ts          # Rotas principais
```

## 🔐 Autenticação

1. Usuário faz login em `/auth/login`
2. Backend retorna token JWT e dados do usuário
3. HttpInterceptor adiciona `Authorization: Bearer <token>` em todas as requisições
4. Guards protegem rotas (authGuard e roleGuard)
5. Logout limpa token e redireciona para login

**Roles suportados:**

- `CLINIC_ADMIN` - Administrador da clínica
- `PROFESSIONAL` - Profissional de saúde
- `RECEPTIONIST` - Recepcionista
- `FINANCE` - Financeiro
- `ASSISTANT` - Assistente

## 📦 Stack Técnico

| Tecnologia   | Versão | Uso                 |
| ------------ | ------ | ------------------- |
| Angular      | 21     | Framework principal |
| TypeScript   | 5      | Linguagem           |
| PrimeNG      | 21     | Componentes UI      |
| Tailwind CSS | 4      | Estilos e layout    |
| FullCalendar | 6      | Calendário/agenda   |
| RxJS         | 7      | Reatividade         |
| Signals      | 21+    | Estado local        |

## 🎨 Componentes Implementados

### ✅ Já Disponíveis

- [x] LoginComponent - Página de autenticação
- [x] DashboardComponent - Painel principal com KPIs
- [x] ProfessionalsListComponent - Lista de profissionais
- [x] PatientsListComponent - CRUD de pacientes
- [x] MainLayoutComponent - Sidebar e topbar
- [x] UnauthorizedComponent - Página 403

### ⏳ Em Desenvolvimento

- [ ] PatientDetailComponent - Detalhes com tabs
- [ ] AppointmentsComponent - Agenda FullCalendar
- [ ] MedicalRecordComponent - Prontuário
- [ ] EvolutionsComponent - Timeline de evoluções
- [ ] DocumentsComponent - Upload/download

### 📋 Planejado

- [ ] Admin dashboard
- [ ] Bulk operations
- [ ] Relatórios
- [ ] Integração com pagamentos
- [ ] Notificações

## 📖 Documentação

Para detalhes de arquitetura, padrões e boas práticas, veja:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura e estrutura
- **[best-practices.md](./best-practices.md)** - Diretrizes de código

## 🔗 Integração com Backend

A aplicação espera um backend REST em `http://localhost:8080/api`.

### Endpoints Esperados

**Autenticação:**

```
POST   /api/auth/login        { email, password } → { token, user }
GET    /api/auth/me           → User
```

**Pacientes:**

```
GET    /api/patients          [?search, ?professional]
POST   /api/patients          { fullName, ... }
PUT    /api/patients/:id      { ... }
DELETE /api/patients/:id
```

**Profissionais:**

```
GET    /api/professionals     [?category, ?search]
POST   /api/professionals     { firstName, ... }
PUT    /api/professionals/:id
DELETE /api/professionals/:id
```

Veja [ARCHITECTURE.md](./ARCHITECTURE.md) para lista completa.

## 💡 Padrões de Desenvolvimento

### Componentes Standalone

Todos os componentes são `standalone: true`:

```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, ...],
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {}
```

### Signals para Estado Local

```typescript
users = signal<User[]>([]);
isLoading = signal(false);
filteredUsers = computed(() => this.users().filter(...));
```

### Injeção de Dependências

```typescript
private readonly userService = inject(UserService);
private readonly messageService = inject(MessageService);
```

### Serviços Reutilizáveis

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  getAll(): Observable<User[]> { ... }
  getById(id: string): Observable<User> { ... }
  create(dto: CreateUserDto): Observable<User> { ... }
}
```

## 🧪 Testes

Tests estão configurados com Jasmine. Estrutura de exemplo:

```bash
npm test -- --watch
```

## 📱 Responsividade

Totalmente responsivo com breakpoints Tailwind:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🌍 i18n (Futuro)

Pronto para internacionalização com:

- Textos em português (atual)
- Labels customizáveis
- Formatação de datas e números

## 🔒 Segurança

- ✅ Autenticação JWT
- ✅ HttpOnly cookies (futuro)
- ✅ Guards para rotas
- ✅ CORS configurado
- ✅ Sanitização de inputs
- ✅ Validação de formulários

## 📞 Suporte

Para dúvidas ou issues:

1. Verifique [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Abra uma issue no repositório
3. Consulte a documentação do Angular: https://angular.dev

## 📄 Licença

Propriedade intelectual do cliente.

---

**Desenvolvido com ❤️ em Angular 21** | Dezembro 2025
To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
