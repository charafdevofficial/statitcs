import { Header } from '@/components/header'
import { AuthGuard } from '@/components/auth-guard'
import { MoneySidebar } from '@/components/money-sidebar'

export default function MoneyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1">
          <div className="box-border relative mx-auto my-5 mb-12 min-w-[1020px] max-w-[1200px] py-2.5 flex gap-5">
            <div className="flex-shrink-0">
              <MoneySidebar />
            </div>
            <div className="bg-white box-border p-5 flex-1 min-w-0">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
