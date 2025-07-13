export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-300 py-8 border-t border-slate-700">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-white">DevDash</span>
          </div>
          <p className="text-slate-400">
            © {new Date().getFullYear()} DevDash. Crafted with passion for developers.
          </p>
        </div>
      </div>
    </footer>
  );
}