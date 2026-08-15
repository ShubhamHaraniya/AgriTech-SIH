import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import './styles/tokens.css';

// Pages
import Splash         from './pages/Splash';
import Login          from './pages/Login';
import Onboarding     from './pages/Onboarding';
import Setup          from './pages/Setup';
import Home           from './pages/Home';
import CropRecommendation from './pages/CropRecommendation';
import { FieldDetail, CropCalendar } from './pages/Crops';
import Weather        from './pages/Weather';
import { Scanner, DiseaseResult, DiseaseAdvisory } from './pages/Scanner';
import {
  LivestockDashboard, AnimalProfile, HealthAssessment,
  LivestockResult, LivestockAdvisory, VaccinationTracker,
} from './pages/Livestock';
import { FarmHistory, Expenses, Notifications, More } from './pages/Misc';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* ── Entry & Auth ── */}
          <Route path="/"                    element={<Navigate to="/splash" replace/>}/>
          <Route path="/splash"              element={<Splash/>}/>
          <Route path="/login"               element={<Login/>}/>
          <Route path="/onboarding"          element={<Onboarding/>}/>
          <Route path="/setup/*"             element={<Setup/>}/>

          {/* ── Main App ── */}
          <Route path="/home"                element={<Home/>}/>

          {/* ── Crops ── */}
          <Route path="/crops"               element={<FieldDetail/>}/>
          <Route path="/crops/recommend"     element={<CropRecommendation/>}/>
          <Route path="/crops/fields"        element={<FieldDetail/>}/>
          <Route path="/calendar"            element={<CropCalendar/>}/>

          {/* ── Weather ── */}
          <Route path="/weather"             element={<Weather/>}/>

          {/* ── Scanner (Crop Disease ONLY) ── */}
          <Route path="/scanner"             element={<Scanner/>}/>
          <Route path="/scanner/result"      element={<DiseaseResult/>}/>
          <Route path="/scanner/advisory"    element={<DiseaseAdvisory/>}/>

          {/* ── Livestock ── */}
          <Route path="/livestock"           element={<LivestockDashboard/>}/>
          <Route path="/livestock/:id"       element={<AnimalProfile/>}/>
          <Route path="/livestock/assess"    element={<HealthAssessment/>}/>
          <Route path="/livestock/result"    element={<LivestockResult/>}/>
          <Route path="/livestock/advisory"  element={<LivestockAdvisory/>}/>
          <Route path="/livestock/vaccination" element={<VaccinationTracker/>}/>

          {/* ── Records ── */}
          <Route path="/history"             element={<FarmHistory/>}/>
          <Route path="/expenses"            element={<Expenses/>}/>
          <Route path="/notifications"       element={<Notifications/>}/>

          {/* ── More ── */}
          <Route path="/more"                element={<More/>}/>
          <Route path="/more/*"              element={<More/>}/>

          {/* ── Fallback ── */}
          <Route path="*"                    element={<Navigate to="/home" replace/>}/>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
