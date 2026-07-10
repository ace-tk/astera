import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/context/ThemeContext'
import { SoundProvider } from '@/context/SoundContext'
import { InterviewProvider } from '@/context/InterviewContext'
import { A11yProvider } from '@/context/A11yContext'
import App from './App'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SoundProvider>
          <A11yProvider>
            <InterviewProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </InterviewProvider>
          </A11yProvider>
        </SoundProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
