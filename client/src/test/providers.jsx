import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { SoundProvider } from '@/context/SoundContext'
import { ToastProvider } from '@/context/ToastContext'

/** Wraps components in the providers they need for isolated unit tests. */
export function AllProviders({ children, route = '/' }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SoundProvider>
            <ToastProvider>
              <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                {children}
              </MemoryRouter>
            </ToastProvider>
          </SoundProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
