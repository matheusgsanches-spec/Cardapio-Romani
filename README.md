# Cardápio Romani

Sistema web de gestão de cardápios semanais para buffet, com painel administrativo, construtor visual por drag and drop e menu público que exibe somente o dia atual.

## Recursos

- Autenticação administrativa com Firebase Authentication.
- Categorias e alimentos ativos/inativos no Cloud Firestore.
- Construtor semanal com `@dnd-kit` para copiar, mover, reordenar e remover alimentos.
- Salvamento manual, indicador de alterações pendentes e proteção ao trocar de semana.
- Navegação entre semana anterior, atual, próxima e seletor de data.
- Tabela semanal responsiva organizada por categoria.
- Menu público em `/menu`, sem login e filtrado automaticamente pelo dia atual.
- Layout adaptado para desktop, tablet e celular.
- Modo local de desenvolvimento quando o Firebase ainda não foi configurado.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Sem um arquivo `.env`, a aplicação inicia em modo local. Categorias e alimentos de demonstração ficam no `localStorage` do navegador. Esse modo existe apenas para desenvolvimento e validação visual.

## Configurar o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Adicione um aplicativo Web ao projeto.
3. Em **Authentication > Sign-in method**, habilite **E-mail/senha**.
4. Em **Authentication > Users**, crie pelo menos um usuário administrador.
5. Crie o banco do **Cloud Firestore**.
6. Copie `.env.example` para `.env` e preencha os valores do aplicativo Web:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_RESTAURANT_NAME=Romani
VITE_RESTAURANT_TAGLINE=Buffet & Sabores
VITE_RESTAURANT_TIME_ZONE=America/Sao_Paulo
VITE_RESTAURANT_SERVICE_HOURS=
```

Ao reiniciar o Vite, a aplicação detecta essas variáveis e passa a usar exclusivamente Authentication e Firestore. O modo local não é usado quando a configuração está completa.

## Modelo do Firestore

```text
categories/{categoryId}
  name: string
  order: number
  active: boolean
  createdAt: timestamp
  updatedAt: timestamp

foods/{foodId}
  name: string
  categoryId: string
  description: string
  active: boolean
  createdAt: timestamp
  updatedAt: timestamp

menus/{YYYY-MM-DD}
  weekStart: "2026-08-24"
  weekEnd: "2026-08-30"
  status: "draft" | "published"
  hasUnpublishedChanges: boolean
  draftDays:
    monday: [{ instanceId, foodId, order }]
    tuesday: [{ instanceId, foodId, order }]
    ...
  createdAt: timestamp
  updatedAt: timestamp
  publishedAt: timestamp

publishedMenus/{YYYY-MM-DD}
  weekStart: "2026-08-24"
  weekEnd: "2026-08-30"
  status: "published"
  days:
    monday: [{ instanceId, foodId, order }]
    ...
  publishedAt: timestamp
  updatedAt: timestamp
```

O ID semanal é sempre a data ISO da segunda-feira. `menus` guarda o espaço de trabalho administrativo; `publishedMenus` é um snapshot público que só muda quando o administrador publica. Assim, salvar um rascunho nunca altera o buffet que os clientes já estão vendo. `instanceId` identifica a ocorrência no cardápio e `foodId` aponta para o cadastro original.

Documentos legados com `menus.status == "published"` e `days` continuam disponíveis. Na primeira gravação administrativa eles são migrados para o snapshot público sem perder a versão publicada.

## Regras e deploy

O arquivo `firestore.rules` permite ao público apenas leituras individuais de `publishedMenus`, alimentos e categorias referenciados. Listagens, rascunhos e todas as gravações exigem autenticação. Um fallback de leitura mantém compatibilidade somente com documentos publicados no modelo legado.

Com a Firebase CLI instalada e o projeto selecionado:

```bash
npm run build
firebase deploy --only firestore:rules,hosting
```

Antes de produção, considere trocar a verificação genérica de usuário autenticado por uma custom claim `admin` se o projeto tiver outros tipos de usuários.

## Fluxo de publicação

1. O administrador edita os dias localmente no React.
2. **Salvar rascunho** grava apenas `menus/{weekStart}.draftDays`.
3. **Publicar cardápio** grava o rascunho e `publishedMenus/{weekStart}` no mesmo batch.
4. `/menu` calcula a data no fuso configurado, acessa diretamente o snapshot da semana e seleciona apenas o dia atual.
5. Somente os documentos de alimentos e categorias referenciados naquele dia são lidos.

Para validar as regras principais de data, agrupamento, rascunho e publicação:

```bash
npm run validate:public
```

## Estrutura principal

```text
src/
  components/
    auth/            proteção de rotas
    categories/      formulário de categoria
    foods/           formulário de alimento
    layout/          shell administrativo
    menu-builder/    biblioteca, dias, drag and drop e tabela
    public/          apresentação do buffet diário
    ui/              botões, modal, toast, busca e estados
  context/           autenticação, dados e notificações
  domain/            datas, semanas e modelo do cardápio
  pages/
    admin/           páginas protegidas
    public/          rota pública
  services/
    firebase/        configuração e repositório Firestore
    local/           suporte exclusivo ao desenvolvimento
  styles/            sistema visual responsivo
```

## Exportação XLSX

`MenuTable` já recebe um modelo normalizado (`menu`, `foods`, `categories`). Uma futura camada `services/export` pode transformar os mesmos dados em linhas e gerar XLSX sem alterar o Firestore nem os componentes de edição.
