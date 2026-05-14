import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
import { Spinner } from './components/ui/Spinner'
import { Skeleton } from './components/ui/Skeleton'

function App() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-foreground">BarberPro</h1>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" loading>Loading</Button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Default Card">
              <p className="text-muted">Card content goes here.</p>
            </Card>
            <Card title="Clickable Card" onClick={() => {}} selected>
              <p className="text-muted">This card is selected and clickable.</p>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Spinner & Skeleton</h2>
          <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
          <div className="space-y-3 mt-4">
            <Skeleton variant="text" />
            <Skeleton variant="text" />
            <Skeleton variant="card" />
            <Skeleton variant="circle" />
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
