import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UtensilsCrossed, Store, Bike, ShoppingBag, ArrowRight } from "lucide-react"

const roles = [
  {
    icon: ShoppingBag,
    title: "Order as a Customer",
    desc: "Browse nearby restaurants, build your cart, and track every order.",
  },
  {
    icon: Store,
    title: "Sell as a Restaurant",
    desc: "Publish your menu, manage food items, and receive incoming orders.",
  },
  {
    icon: Bike,
    title: "Deliver as a Rider",
    desc: "Pick up assigned orders and deliver them to hungry customers.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">
              <UtensilsCrossed className="size-3.5 text-primary" />
              Food ordering & delivery
            </span>
            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Great food, delivered to your door
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              One account for everyone. Sign up once, then choose to order food, run a restaurant, or deliver as a
              rider.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/signup" />}>
                Get started
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/login" />}>
                I already have an account
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((r) => (
              <Card key={r.title} className="p-6">
                <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <r.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{r.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
