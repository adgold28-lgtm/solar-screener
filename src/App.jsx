import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout          from './components/shared/Layout'
import Home            from './pages/Home'
import DeveloperWizard from './pages/DeveloperWizard'
import OwnerWizard     from './pages/OwnerWizard'
import FAQ             from './pages/FAQ'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/developer" element={<DeveloperWizard />} />
          <Route path="/owner"     element={<OwnerWizard />} />
          <Route path="/faq"       element={<FAQ />} />
          <Route path="*"          element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
