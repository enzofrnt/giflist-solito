'use client'

import AlertModal from '@/components/AlertModal'
import PasswordInput from '@/components/PasswordInput'
import { useAlert } from '@/hooks/useAlert'
import { useAuthContext } from '@/contexts/AuthContext'
import { getAuthToken } from '@/lib/authStorage'
import { validatePassword } from '@/lib/passwordValidation'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProfileClient() {
  const [updating, setUpdating] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const router = useRouter()
  const { alert, showSuccess, showError, showConfirm, hideAlert } = useAlert()
  const { user } = useAuthContext()

  // Synchroniser avec l'utilisateur du contexte
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email
      })
    }
  }, [user])

  async function updateProfile() {
    if (!formData.name.trim()) {
      showError('Erreur', 'Le nom est requis')
      return
    }

    setUpdating(true)
    try {
      const token = getAuthToken()
      if (!token) {
        showError('Erreur', 'Non authentifié')
        return
      }
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim()
        })
      })

      if (response.ok) {
        showSuccess('Succès', 'Profil mis à jour avec succès !')
        // Recharger l'auth pour mettre à jour le contexte
        window.location.reload()
      } else {
        const errorData = await response.json()
        showError('Erreur', errorData.error || 'Erreur lors de la mise à jour du profil')
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error)
      showError('Erreur', 'Erreur lors de la mise à jour du profil')
    } finally {
      setUpdating(false)
    }
  }

  async function changePassword() {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showError('Erreur', 'Tous les champs sont requis')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Erreur', 'Les nouveaux mots de passe ne correspondent pas')
      return
    }

    const validation = validatePassword(passwordData.newPassword)
    if (!validation.isValid) {
      showError('Erreur', validation.errors[0])
      return
    }

    setChangingPassword(true)
    try {
      const token = getAuthToken()
      if (!token) {
        showError('Erreur', 'Non authentifié')
        return
      }
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        showSuccess('Succès', 'Mot de passe modifié avec succès !')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setShowPasswordForm(false)
      } else {
        const errorData = await response.json()
        showError('Erreur', errorData.error || 'Erreur lors du changement de mot de passe')
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error)
      showError('Erreur', 'Erreur lors du changement de mot de passe')
    } finally {
      setChangingPassword(false)
    }
  }

  function logout() {
    showConfirm(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      () => {
        localStorage.removeItem('auth-token')
        router.push('/')
      }
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon compte</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et vos préférences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo.webp"
                    alt="Logo Liste de cadeaux"
                    width={40}
                    height={40}
                    className="rounded-lg object-contain border border-indigo-200"
                  />
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                updateProfile()
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d&apos;utilisateur <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2 font-normal">(obligatoire)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    placeholder="Votre nom"
                    minLength={1}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">L&apos;adresse e-mail ne peut pas être modifiée</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={!formData.name.trim() || updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updating ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  {showPasswordForm ? 'Annuler' : 'Changer le mot de passe'}
                </button>
              </div>

              {showPasswordForm && (
                <form onSubmit={(e) => {
                  e.preventDefault()
                  changePassword()
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2 font-normal">(obligatoire)</span>
                    </label>
                    <PasswordInput
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Votre mot de passe actuel"
                      showStrength={false}
                      showGuide={false}
                      required={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2 font-normal">(obligatoire)</span>
                    </label>
                    <PasswordInput
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Nouveau mot de passe"
                      showStrength={true}
                      showGuide={true}
                      required={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2 font-normal">(obligatoire)</span>
                    </label>
                    <PasswordInput
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirmer le nouveau mot de passe"
                      showStrength={false}
                      showGuide={false}
                      required={true}
                    />
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {changingPassword ? 'Modification...' : 'Modifier le mot de passe'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Statut</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Actif
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  📋 Mes listes de cadeaux
                </button>
                <button
                  onClick={() => router.push('/home')}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  🏠 Page d&apos;accueil
                </button>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left"
                >
                  🚪 Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {alert && (
        <AlertModal
          isOpen={!!alert}
          onClose={hideAlert}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          confirmText={alert.confirmText}
          onConfirm={alert.onConfirm}
          showCancel={alert.showCancel}
          cancelText={alert.cancelText}
        />
      )}
    </div>
  )
}

