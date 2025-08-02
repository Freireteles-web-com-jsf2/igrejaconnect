import { useState, useEffect } from 'react';
import Layout from '@/react-app/components/Layout';
import { useApi, apiRequest } from '@/react-app/hooks/useApi';
import {
  Settings as SettingsIcon,
  Save,
  Upload,
  Palette,
  Globe,
  Building,
  Loader2,
  Check
} from 'lucide-react';

interface ChurchSettings {
  id?: number;
  church_name: string;
  church_address: string;
  church_phone: string;
  church_email: string;
  church_website: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  timezone: string;
  currency: string;
  language: string;
}

export default function Settings() {
  const { data: settings, loading } = useApi<ChurchSettings>('/api/settings');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState<ChurchSettings>({
    church_name: '',
    church_address: '',
    church_phone: '',
    church_email: '',
    church_website: '',
    logo_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    language: 'pt-BR',
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      // Recarregar a página após 1 segundo para mostrar as mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const timezones = [
    { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
    { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
    { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-5)' },
    { value: 'America/Noronha', label: 'Fernando de Noronha (GMT-2)' },
  ];

  const currencies = [
    { value: 'BRL', label: 'Real Brasileiro (R$)' },
    { value: 'USD', label: 'Dólar Americano ($)' },
    { value: 'EUR', label: 'Euro (€)' },
  ];

  const languages = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-ES', label: 'Español (España)' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <SettingsIcon className="w-7 h-7 mr-3 text-blue-600" />
                Configurações da Igreja
              </h1>
              <p className="text-gray-600 mt-1">
                Personalize as informações e aparência do sistema
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${saved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvo!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Básicas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados da Igreja */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <Building className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Dados da Igreja</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Igreja *</label>
                  <input
                    type="text"
                    value={formData.church_name}
                    onChange={(e) => setFormData({ ...formData, church_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Igreja Batista Central"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={formData.church_address}
                    onChange={(e) => setFormData({ ...formData, church_address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Rua, número, bairro, cidade - UF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={formData.church_phone}
                    onChange={(e) => setFormData({ ...formData, church_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.church_email}
                    onChange={(e) => setFormData({ ...formData, church_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contato@igreja.com.br"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.church_website}
                    onChange={(e) => setFormData({ ...formData, church_website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://www.igreja.com.br"
                  />
                </div>
              </div>
            </div>

            {/* Configurações do Sistema */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <Globe className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Configurações do Sistema</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuso Horário</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {currencies.map(curr => (
                      <option key={curr.value} value={curr.value}>{curr.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Personalização Visual */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <Upload className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Logo da Igreja</h3>
              </div>

              <div className="text-center">
                {formData.logo_url ? (
                  <div className="mb-4">
                    <img
                      src={formData.logo_url}
                      alt="Logo da Igreja"
                      className="w-32 h-32 object-contain mx-auto border border-gray-200 rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL do Logo</label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>
              </div>
            </div>

            {/* Cores do Tema */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <Palette className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Cores do Tema</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor Primária</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor Secundária</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                      placeholder="#10B981"
                    />
                  </div>
                </div>

                {/* Preview das cores */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                  <div className="space-y-2">
                    <div
                      className="h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: formData.primary_color }}
                    >
                      Cor Primária
                    </div>
                    <div
                      className="h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: formData.secondary_color }}
                    >
                      Cor Secundária
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}