export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <div className="page-header">
        <h1>{title}</h1>
      </div>
      <div className="card empty-state">
        <p>Este módulo ainda está em desenvolvimento.</p>
      </div>
    </>
  )
}
