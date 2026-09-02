'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/useAuthStore'

const TABS = ['songs', 'albums', 'artists', 'podcasts']

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState('songs')
  const [items, setItems] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') {
      router.replace('/')
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    if (activeTab !== 'artists') fetchArtists()
    fetchItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/${activeTab}`, { params: { limit: 100 } })
      setItems(data[activeTab] || data.songs || data.albums || data.artists || data.podcasts || [])
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const fetchArtists = async () => {
    try {
      const { data } = await api.get('/artists', { params: { limit: 100 } })
      setArtists(data.artists || [])
    } catch (error) {
      console.error('Error fetching artists:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este elemento?')) return
    try {
      await api.delete(`/${activeTab}/${id}`)
      toast.success('Eliminado')
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo eliminar')
    }
  }

  const handleCreate = async () => {
    try {
      const payload = {}
      if (activeTab === 'songs') {
        payload.title = form.title
        payload.artistId = form.artistId
        payload.duration = parseInt(form.duration, 10) || 0
        payload.genre = form.genre
        payload.lyrics = form.lyrics
        payload.url = form.url
      } else if (activeTab === 'albums') {
        payload.title = form.title
        payload.artistId = form.artistId
        payload.genre = form.genre
        payload.releaseDate = form.releaseDate
      } else if (activeTab === 'artists') {
        payload.name = form.name
        payload.bio = form.bio
        payload.verified = !!form.verified
      } else if (activeTab === 'podcasts') {
        payload.title = form.title
        payload.hostId = form.hostId
        payload.genre = form.genre
        payload.description = form.description
      }
      await api.post(`/${activeTab}`, payload)
      toast.success('Creado correctamente')
      setShowCreate(false)
      setForm({})
      fetchItems()
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo crear')
    }
  }

  const renderField = (name, type = 'text', options) => (
    <div key={name}>
      <label className="block text-cyber-text text-sm mb-1">{name}</label>
      {type === 'select' ? (
        <select value={form[name] || ''} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="input-primary w-full">
          <option value="">Selecciona...</option>
          {options.map((opt) => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={form[name] || ''} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="input-primary w-full" rows={3} />
      ) : type === 'checkbox' ? (
        <input type="checkbox" checked={!!form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.checked })} className="accent-cyber-purple" />
      ) : (
        <input type={type} value={form[name] || ''} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="input-primary w-full" />
      )}
    </div>
  )

  const formFields = () => {
    if (activeTab === 'songs') {
      return (
        <>
          {renderField('title')}
          {renderField('artistId', 'select', artists.map((a) => ({ id: a.id, name: a.name })))}
          {renderField('genre')}
          {renderField('duration', 'number')}
          {renderField('url')}
          {renderField('lyrics', 'textarea')}
        </>
      )
    }
    if (activeTab === 'albums') {
      return (
        <>
          {renderField('title')}
          {renderField('artistId', 'select', artists.map((a) => ({ id: a.id, name: a.name })))}
          {renderField('genre')}
          {renderField('releaseDate', 'date')}
        </>
      )
    }
    if (activeTab === 'artists') {
      return (
        <>
          {renderField('name')}
          {renderField('bio', 'textarea')}
          {renderField('verified', 'checkbox')}
        </>
      )
    }
    return (
      <>
        {renderField('title')}
        {renderField('hostId', 'select', artists.map((a) => ({ id: a.id, name: a.name })))}
        {renderField('genre')}
        {renderField('description', 'textarea')}
      </>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Panel de Administración</h1>
          <p className="text-cyber-text">Gestiona el contenido de la plataforma</p>
        </div>
        <button onClick={() => setShowCreate((v) => !v)} className="btn-primary">
          + Crear
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setShowCreate(false); setForm({}) }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-gradient-cyber text-white shadow-neon' : 'bg-cyber-panel text-cyber-text hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {showCreate && (
        <div className="glass-panel p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-bold mb-4">Crear {activeTab.slice(0, -1)}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {formFields()}
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowCreate(false)} className="text-cyber-text hover:text-white px-4 py-2">Cancelar</button>
            <button onClick={handleCreate} className="btn-primary">Guardar</button>
          </div>
        </div>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-cyber-text px-6 py-4">Cargando...</p>
        ) : items.length === 0 ? (
          <p className="text-cyber-text px-6 py-4">No hay {activeTab}.</p>
        ) : (
          <div className="divide-y divide-cyber-border/40">
            {(items || []).map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-6 py-3 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 bg-gradient-cyber rounded-lg flex items-center justify-center text-white text-sm shrink-0">
                  {item.image || item.coverImage ? (
                    <img src={item.image || item.coverImage} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    '♪'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.title || item.name}</p>
                  <p className="text-cyber-text text-sm truncate">
                    {item.genre || item.description || ''}
                  </p>
                </div>
                {activeTab !== 'podcasts' && (
                  <Link
                    href={activeTab === 'songs' ? `/song/${item.id}` : activeTab === 'albums' ? `/album/${item.id}` : `/artist/${item.id}`}
                    className="text-cyber-cyan text-sm hover:underline shrink-0"
                  >
                    Ver
                  </Link>
                )}
                <button onClick={() => handleDelete(item.id)} className="text-cyber-text hover:text-rose-400 text-sm shrink-0 transition-colors">
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}