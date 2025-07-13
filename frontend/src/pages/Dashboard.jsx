import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ReposSection from "../components/GitHub/ReposSection";
import DevToSection from "../components/DevTo/DevToSection";
import EventCalendar from "../components/Calendar/EventCalendar";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("repos");
  const { user } = useAuth();

  const tabs = [
    { 
      id: "repos", 
      label: "Repositories", 
      component: <ReposSection />,
      icon: "🚀",
      color: "from-violet-500 to-indigo-500"
    },
    { 
      id: "articles", 
      label: "Articles", 
      component: <DevToSection />,
      icon: "📚",
      color: "from-emerald-500 to-teal-500"
    },
    { 
      id: "calendar", 
      label: "Calendar", 
      component: <EventCalendar />,
      icon: "📅",
      color: "from-amber-500 to-orange-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-400/10 via-transparent to-indigo-400/10 pointer-events-none"></div>
      
      <Header />
      
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="space-y-12">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl shadow-violet-500/25 p-12 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
                    <span className="text-2xl">👋</span>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-violet-100 bg-clip-text text-transparent">
                      Welcome back, {user?.displayName || user?.username}!
                    </h1>
                    <p className="text-violet-100 text-lg mt-2">
                      Ready to build something amazing today?
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  {tabs.map((tab) => (
                    <div key={tab.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{tab.icon}</span>
                        <h3 className="text-lg font-semibold text-white">{tab.label}</h3>
                      </div>
                      <p className="text-violet-100 text-sm">
                        {tab.id === 'repos' && 'Manage your GitHub repositories'}
                        {tab.id === 'articles' && 'Discover Dev.to articles'}
                        {tab.id === 'calendar' && 'Organize your events'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-violet-500/10 border border-violet-200/50 overflow-hidden">
            <div className="flex border-b border-violet-200/50 bg-gradient-to-r from-violet-50/50 to-indigo-50/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative px-10 py-6 font-semibold transition-all duration-300 flex items-center gap-3 ${
                    activeTab === tab.id
                      ? "text-violet-700 bg-white/60 backdrop-blur-xl"
                      : "text-slate-600 hover:text-violet-600 hover:bg-white/40"
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="text-lg">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.color} rounded-full`}></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              ))}
            </div>

            <div className="p-12 bg-gradient-to-br from-white/60 via-white/80 to-violet-50/60 backdrop-blur-xl">
              <div className="animate-fadeIn">
                {tabs.find((tab) => tab.id === activeTab)?.component}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}