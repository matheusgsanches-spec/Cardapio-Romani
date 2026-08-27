export default function PublicMenuSkeleton() {
  return (
    <div className="public-skeleton" aria-label="Carregando cardápio" role="status">
      <section className="public-skeleton__hero">
        <span /><strong /><i /><small />
      </section>
      <section className="public-skeleton__grid">
        {[0, 1, 2, 3].map((item) => (
          <article key={item}>
            <header><span /><strong /><i /></header>
            <div><b /><b /><b /></div>
          </article>
        ))}
      </section>
    </div>
  )
}
