const sections = [
  {
    title: 'engine/',
    description: 'Core gameplay logic and quest engine runtime.',
  },
  {
    title: 'ui/',
    description: 'React components and shadcn/ui-powered interface.',
  },
  {
    title: 'cli/',
    description: 'Command-line tools and automation.',
  },
  {
    title: 'shared/',
    description: 'Shared types, utilities, and contracts.',
  },
]

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            ContextQuest
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Vite + React + Tailwind + shadcn/ui is ready.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            This scaffold wires up the UI stack, linting, and formatting so you can focus on
            building the quest engine and companion interfaces.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

export default App
