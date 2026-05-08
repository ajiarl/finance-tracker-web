import { Link } from 'react-router-dom'
import { Tag, ChevronRight, User, Bell, LogOut } from 'lucide-react'
import { useAuth } from '../store/authStore'

export default function Settings() {
  const { logout } = useAuth()

  const menuItems = [
    { label: 'Kelola Kategori', icon: Tag, path: '/categories', color: 'bg-[#FAFF00]' },
    { label: 'Profil Saya', icon: User, path: '/profile', color: 'bg-blue-400' },
    { label: 'Notifikasi', icon: Bell, path: '/notifications', color: 'bg-pink-400' },
  ]

  return (
    <div className="px-4 pt-4 pb-24 text-left">
      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Preferensi</p>
      <h1 className="text-2xl font-black text-black uppercase tracking-tight mb-6">Pengaturan</h1>
      
      <div className="flex flex-col gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center justify-between p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${item.color} border-2 border-black flex items-center justify-center rounded-none shadow-[2px_2px_0px_0px_#000]`}>
                <item.icon size={20} strokeWidth={3} className="text-black" />
              </div>
              <span className="font-black uppercase tracking-tight text-black">{item.label}</span>
            </div>
            <ChevronRight size={20} strokeWidth={3} className="text-black" />
          </Link>
        ))}

        <button
          onClick={logout}
          className="flex items-center gap-4 p-4 mt-4 bg-red-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none"
        >
          <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center rounded-none shadow-[2px_2px_0px_0px_#000]">
            <LogOut size={20} strokeWidth={3} className="text-red-500" />
          </div>
          <span className="font-black uppercase tracking-tight">Keluar Akun</span>
        </button>
      </div>
    </div>
  )
}
