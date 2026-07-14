import HomePage from '@/pages/HomePage';
import SettingsPage from '@/pages/SettingsPage';

// Простейший роутинг по pathname (SPA, сервер отдаёт index.html на любой путь):
//   /user/:token — страница настроек
//   всё остальное — главная
export default function App() {
  const segments = window.location.pathname.split('/').filter(Boolean);

  if (segments[0] === 'user' && segments[1]) {
    return <SettingsPage token={segments[1]} />;
  }

  return <HomePage />;
}
