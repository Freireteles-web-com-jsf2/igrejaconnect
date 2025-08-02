import { useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { apiRequest } from '@/react-app/hooks/useApi';
import {
  FileText,
  Download,
  Users,
  DollarSign,
  Building2,
  Calendar,
  Filter,
  Eye,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  TrendingUp,
  Info,
  X
} from 'lucide-react';

interface ReportData {
  members?: any[];
  transactions?: any[];
  departments?: any[];
  events?: any[];
  stats?: any;
  generatedAt?: string;
  filters?: any;
}

type ReportType = 'members' | 'financial' | 'departments' | 'events';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('members');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  // Função para formatar datas evitando problemas de timezone
  const formatDateSafe = (dateString: string): string => {
    try {
      // Adicionar horário meio-dia para evitar problemas de timezone
      const date = new Date(dateString + 'T12:00:00');
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', dateString, error);
      return dateString;
    }
  };
  const [filters, setFilters] = useState({
    // Filtros para membros
    memberStatus: '',
    ageMin: '',
    ageMax: '',

    // Filtros para financeiro
    startDate: '',
    endDate: '',
    transactionType: '',
    category: '',

    // Filtros para departamentos
    departmentStatus: '',
    departmentCategory: '',

    // Filtros para eventos
    eventStartDate: '',
    eventEndDate: '',
    eventType: '',
    eventStatus: '',
  });

  const reportTypes = [
    {
      id: 'members' as ReportType,
      name: 'Relatório de Membros',
      description: 'Lista completa de membros com estatísticas',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      id: 'financial' as ReportType,
      name: 'Relatório Financeiro',
      description: 'Receitas, despesas e análise financeira',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      id: 'departments' as ReportType,
      name: 'Relatório de Departamentos',
      description: 'Departamentos, líderes e atividades',
      icon: Building2,
      color: 'bg-purple-500'
    },
    {
      id: 'events' as ReportType,
      name: 'Relatório de Eventos',
      description: 'Eventos passados e futuros',
      icon: Calendar,
      color: 'bg-orange-500'
    }
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      let url = `/api/reports/${selectedReport}`;
      const params = new URLSearchParams();

      // Adicionar filtros baseados no tipo de relatório
      if (selectedReport === 'members') {
        if (filters.memberStatus) params.append('status', filters.memberStatus);
        if (filters.ageMin) params.append('age_min', filters.ageMin);
        if (filters.ageMax) params.append('age_max', filters.ageMax);
      } else if (selectedReport === 'financial') {
        if (filters.startDate) {
          // Garantir formato YYYY-MM-DD
          const startDate = new Date(filters.startDate).toISOString().split('T')[0];
          params.append('start_date', startDate);
          console.log('Frontend - Data início enviada:', startDate);
        }
        if (filters.endDate) {
          // Garantir formato YYYY-MM-DD
          const endDate = new Date(filters.endDate).toISOString().split('T')[0];
          params.append('end_date', endDate);
          console.log('Frontend - Data fim enviada:', endDate);
        }
        if (filters.transactionType) params.append('type', filters.transactionType);
        if (filters.category) params.append('category', filters.category);
      } else if (selectedReport === 'departments') {
        if (filters.departmentStatus) params.append('status', filters.departmentStatus);
        if (filters.departmentCategory) params.append('category', filters.departmentCategory);
      } else if (selectedReport === 'events') {
        if (filters.eventStartDate) params.append('start_date', filters.eventStartDate);
        if (filters.eventEndDate) params.append('end_date', filters.eventEndDate);
        if (filters.eventType) params.append('event_type', filters.eventType);
        if (filters.eventStatus) params.append('status', filters.eventStatus);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('Frontend - URL da requisição:', url);
      console.log('Frontend - Filtros aplicados:', { 
        startDate: filters.startDate, 
        endDate: filters.endDate, 
        transactionType: filters.transactionType,
        category: filters.category 
      });

      const data = await apiRequest(url) as ReportData;
      
      console.log('Frontend - Dados recebidos:', data);
      console.log('Frontend - Filtros retornados pelo backend:', data.filters);
      console.log('Frontend - Transações recebidas:', data.transactions?.length || 0);
      
      if (data.transactions && data.transactions.length > 0) {
        console.log('Frontend - Primeiras transações:');
        data.transactions.slice(0, 5).forEach((t: any, i: number) => {
          console.log(`${i + 1}. ${t.date} - ${t.description} - ${t.type} - R$ ${t.amount}`);
        });
      }

      // Debug: Comparar filtros do frontend com os do backend
      console.log('=== Comparação de Filtros ===');
      console.log('Frontend startDate:', filters.startDate);
      console.log('Backend start_date:', data.filters?.start_date);
      console.log('Frontend endDate:', filters.endDate);
      console.log('Backend end_date:', data.filters?.end_date);
      
      // Debug: Conversão de datas
      console.log('=== Debug de Conversão de Datas ===');
      if (data.filters?.start_date) {
        const startDateObj = new Date(data.filters.start_date);
        console.log('Backend start_date como Date:', startDateObj);
        console.log('Backend start_date formatada:', startDateObj.toLocaleDateString('pt-BR'));
        console.log('Backend start_date ISO:', startDateObj.toISOString());
      }
      if (data.filters?.end_date) {
        const endDateObj = new Date(data.filters.end_date);
        console.log('Backend end_date como Date:', endDateObj);
        console.log('Backend end_date formatada:', endDateObj.toLocaleDateString('pt-BR'));
        console.log('Backend end_date ISO:', endDateObj.toISOString());
      }

      setReportData(data);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportData) return;

    try {
      // Importar jsPDF dinamicamente
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Configurar fonte
      doc.setFont('helvetica');

      // Título
      doc.setFontSize(20);
      doc.text('IgrejaConnect - Relatório', 20, 20);

      // Subtítulo
      doc.setFontSize(16);
      const reportType = reportTypes.find(r => r.id === selectedReport);
      doc.text(reportType?.name || 'Relatório', 20, 35);

      // Data de geração
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 45);

      let yPosition = 60;

      // Estatísticas
      if (reportData.stats) {
        doc.setFontSize(14);
        doc.text('Estatísticas:', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        Object.entries(reportData.stats).forEach(([key, value]) => {
          if (typeof value === 'object') return;
          doc.text(`${key}: ${value}`, 25, yPosition);
          yPosition += 8;
        });
        yPosition += 10;
      }

      // Dados principais
      if (selectedReport === 'members' && reportData.members) {
        doc.setFontSize(14);
        doc.text('Lista de Membros:', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(8);
        reportData.members.slice(0, 30).forEach((member: any) => {
          const line = `${member.name} - ${member.email || 'Sem email'} - ${member.phone || 'Sem telefone'}`;
          doc.text(line, 25, yPosition);
          yPosition += 6;

          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
        });
      }

      // Salvar PDF
      const fileName = `relatorio-${selectedReport}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    }
  };

  const exportToExcel = async () => {
    if (!reportData) return;

    try {
      // Importar XLSX dinamicamente
      const XLSX = await import('xlsx');

      const workbook = XLSX.utils.book_new();

      // Aba de estatísticas
      if (reportData.stats) {
        const statsData = Object.entries(reportData.stats).map(([key, value]) => ({
          Métrica: key,
          Valor: typeof value === 'object' ? JSON.stringify(value) : value
        }));

        const statsSheet = XLSX.utils.json_to_sheet(statsData);
        XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estatísticas');
      }

      // Aba de dados principais
      if (selectedReport === 'members' && reportData.members) {
        const membersSheet = XLSX.utils.json_to_sheet(reportData.members);
        XLSX.utils.book_append_sheet(workbook, membersSheet, 'Membros');
      } else if (selectedReport === 'financial' && reportData.transactions) {
        const transactionsSheet = XLSX.utils.json_to_sheet(reportData.transactions);
        XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transações');
      } else if (selectedReport === 'departments' && reportData.departments) {
        const departmentsSheet = XLSX.utils.json_to_sheet(reportData.departments);
        XLSX.utils.book_append_sheet(workbook, departmentsSheet, 'Departamentos');
      } else if (selectedReport === 'events' && reportData.events) {
        const eventsSheet = XLSX.utils.json_to_sheet(reportData.events);
        XLSX.utils.book_append_sheet(workbook, eventsSheet, 'Eventos');
      }

      // Salvar arquivo
      const fileName = `relatorio-${selectedReport}-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao exportar Excel. Tente novamente.');
    }
  };

  const renderFilters = () => {
    switch (selectedReport) {
      case 'members':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.memberStatus}
                onChange={(e) => setFilters({ ...filters, memberStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idade Mínima</label>
              <input
                type="number"
                value={filters.ageMin}
                onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 18"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idade Máxima</label>
              <input
                type="number"
                value={filters.ageMax}
                onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 65"
              />
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filters.transactionType}
                onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <input
                type="text"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Dízimos"
              />
            </div>
          </div>
        );

      case 'departments':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.departmentStatus}
                onChange={(e) => setFilters({ ...filters, departmentStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <input
                type="text"
                value={filters.departmentCategory}
                onChange={(e) => setFilters({ ...filters, departmentCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Louvor"
              />
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                value={filters.eventStartDate}
                onChange={(e) => setFilters({ ...filters, eventStartDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={filters.eventEndDate}
                onChange={(e) => setFilters({ ...filters, eventEndDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filters.eventType}
                onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="culto">Culto</option>
                <option value="reuniao">Reunião</option>
                <option value="evento_especial">Evento Especial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.eventStatus}
                onChange={(e) => setFilters({ ...filters, eventStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStats = () => {
    if (!reportData?.stats) return null;

    const getStatIcon = (key: string) => {
      if (key.includes('total') || key.includes('Total')) return Users;
      if (key.includes('active') || key.includes('Active')) return CheckCircle;
      if (key.includes('receita') || key.includes('Income')) return TrendingUp;
      if (key.includes('despesa') || key.includes('Expense')) return DollarSign;
      if (key.includes('department') || key.includes('Department')) return Building2;
      if (key.includes('event') || key.includes('Event')) return Calendar;
      return FileText;
    };

    const getStatColor = (key: string) => {
      if (key.includes('total') || key.includes('Total')) return 'bg-blue-50 text-blue-600 border-blue-200';
      if (key.includes('active') || key.includes('Active')) return 'bg-green-50 text-green-600 border-green-200';
      if (key.includes('receita') || key.includes('Income')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      if (key.includes('despesa') || key.includes('Expense')) return 'bg-red-50 text-red-600 border-red-200';
      if (key.includes('department') || key.includes('Department')) return 'bg-purple-50 text-purple-600 border-purple-200';
      if (key.includes('event') || key.includes('Event')) return 'bg-orange-50 text-orange-600 border-orange-200';
      return 'bg-gray-50 text-gray-600 border-gray-200';
    };

    const formatStatValue = (key: string, value: any) => {
      if (typeof value === 'object') return null;

      // Formatar valores monetários
      if (key.includes('receita') || key.includes('despesa') || key.includes('saldo') ||
        key.includes('Income') || key.includes('Expense') || key.includes('Balance')) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      }

      return value.toString();
    };

    const formatStatLabel = (key: string) => {
      const labels: Record<string, string> = {
        total: 'Total',
        totalMembers: 'Total de Membros',
        activeMembers: 'Membros Ativos',
        totalReceitas: 'Total de Receitas',
        totalDespesas: 'Total de Despesas',
        saldoTotal: 'Saldo Total',
        totalDepartments: 'Total de Departamentos',
        activeDepartments: 'Departamentos Ativos',
        totalEvents: 'Total de Eventos',
        activeEvents: 'Eventos Ativos',
        published: 'Publicados',
        pinned: 'Fixados',
        futuros: 'Eventos Futuros',
        passados: 'Eventos Passados',
        withEmail: 'Com Email',
        withPhone: 'Com Telefone',
        baptized: 'Batizados'
      };

      return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Resumo Estatístico</h3>
          <p className="text-sm text-gray-600 mt-1">
            Principais métricas do relatório gerado
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(reportData.stats).map(([key, value]) => {
              if (typeof value === 'object') return null;

              const StatIcon = getStatIcon(key);
              const colorClass = getStatColor(key);
              const formattedValue = formatStatValue(key, value);
              const label = formatStatLabel(key);

              return (
                <div key={key} className={`p-4 rounded-lg border-2 ${colorClass} transition-all duration-200 hover:shadow-md`}>
                  <div className="flex items-center justify-between mb-2">
                    <StatIcon className="w-5 h-5" />
                    <span className="text-xs font-medium opacity-75">
                      {selectedReport.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {formattedValue}
                  </div>
                  <div className="text-sm font-medium opacity-80">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="w-7 h-7 mr-3 text-blue-600" />
                Sistema de Relatórios
              </h1>
              <p className="text-gray-600 mt-1">
                Gere relatórios detalhados e exporte em PDF ou Excel
              </p>
            </div>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Selecione o Tipo de Relatório</h2>
            <p className="text-sm text-gray-600">
              Escolha o tipo de dados que deseja exportar e analisar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const isSelected = selectedReport === report.id;

              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`group p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg transform hover:-translate-y-1 ${isSelected
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 transition-all duration-200 ${isSelected ? report.color + ' shadow-lg' : report.color + ' group-hover:shadow-md'
                    }`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="space-y-2">
                    <h3 className={`font-semibold transition-colors duration-200 ${isSelected ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-800'
                      }`}>
                      {report.name}
                    </h3>
                    <p className={`text-sm transition-colors duration-200 ${isSelected ? 'text-blue-700' : 'text-gray-600 group-hover:text-blue-600'
                      }`}>
                      {report.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="mt-4 flex items-center text-blue-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Selecionado</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          </div>
          {renderFilters()}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                setReportData(null);
                console.log('Frontend - Dados do relatório limpos');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Limpar</span>
            </button>
            <button
              onClick={generateReport}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Gerar Relatório</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Results */}
        {reportData && (
          <>
            {/* Stats */}
            {renderStats()}

            {/* Export Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Exportar Relatório</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Baixe os dados em diferentes formatos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Gerado em: {reportData.generatedAt ? new Date(reportData.generatedAt).toLocaleString('pt-BR') : 'Agora'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedReport === 'members' && reportData.members ? `${reportData.members.length} registros` :
                        selectedReport === 'financial' && reportData.transactions ? `${reportData.transactions.length} transações` :
                          selectedReport === 'departments' && reportData.departments ? `${reportData.departments.length} departamentos` :
                            selectedReport === 'events' && reportData.events ? `${reportData.events.length} eventos` :
                              'Dados carregados'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={exportToPDF}
                    className="group flex items-center justify-center p-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Download className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-lg">Exportar PDF</h4>
                        <p className="text-red-100 text-sm">Documento formatado para impressão</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={exportToExcel}
                    className="group flex items-center justify-center p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-lg">Exportar Excel</h4>
                        <p className="text-green-100 text-sm">Planilha para análise de dados</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Dica de Exportação</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Use PDF para relatórios formais e apresentações. Use Excel para análises detalhadas e manipulação de dados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Preview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Preview dos Dados</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Visualização dos dados que serão exportados
                </p>
              </div>

              <div className="p-6">
                {selectedReport === 'members' && reportData?.members ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{reportData.members.length}</div>
                        <div className="text-sm text-blue-700">Total de Membros</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {reportData.members.filter((m: any) => m.is_active).length}
                        </div>
                        <div className="text-sm text-green-700">Membros Ativos</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {reportData.members.filter((m: any) => m.email).length}
                        </div>
                        <div className="text-sm text-purple-700">Com Email</div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.members.slice(0, 10).map((member: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{member.email || '-'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{member.phone || '-'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                  }`}>
                                  {member.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {reportData.members.length > 10 && (
                        <div className="px-6 py-3 bg-gray-50 text-center">
                          <span className="text-sm text-gray-500">
                            ... e mais {reportData.members.length - 10} membros
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : selectedReport === 'financial' && reportData?.transactions ? (
                  <div className="space-y-4">
                    {/* Informações do Período */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-blue-900">Período Selecionado</h4>
                        </div>
                        <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          Atualizado: {reportData.generatedAt ? new Date(reportData.generatedAt).toLocaleTimeString('pt-BR') : 'Agora'}
                        </div>
                      </div>
                      <div className="text-sm text-blue-700">
                        <span className="font-medium">De:</span> {reportData.filters?.start_date ? 
                          formatDateSafe(reportData.filters.start_date) : 
                          'Início dos registros'}
                        {' '}
                        <span className="font-medium">até:</span> {reportData.filters?.end_date ? 
                          formatDateSafe(reportData.filters.end_date) : 
                          'Hoje'}
                        {reportData.stats?.periodoAnalise?.dias && (
                          <span className="ml-2 text-blue-600 font-medium">
                            ({reportData.stats.periodoAnalise.dias} dias)
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-blue-600">
                        <strong>Filtros aplicados:</strong>
                        {reportData.filters?.start_date && ` Início: ${formatDateSafe(reportData.filters.start_date)}`}
                        {reportData.filters?.end_date && ` | Fim: ${formatDateSafe(reportData.filters.end_date)}`}
                        {reportData.filters?.type && ` | Tipo: ${reportData.filters.type === 'receita' ? 'Receitas' : 'Despesas'}`}
                        {reportData.filters?.category && ` | Categoria: ${reportData.filters.category}`}
                        {!reportData.filters?.start_date && !reportData.filters?.end_date && !reportData.filters?.type && !reportData.filters?.category && ' Nenhum filtro aplicado'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{reportData.transactions.length}</div>
                        <div className="text-sm text-blue-700">Total Transações</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-lg font-bold text-green-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(reportData.stats?.totalReceitas || 0)}
                        </div>
                        <div className="text-sm text-green-700">Total Receitas</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <div className="text-lg font-bold text-red-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(reportData.stats?.totalDespesas || 0)}
                        </div>
                        <div className="text-sm text-red-700">Total Despesas</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className={`text-lg font-bold ${(reportData.stats?.saldoTotal || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(reportData.stats?.saldoTotal || 0)}
                        </div>
                        <div className="text-sm text-purple-700">Saldo Total</div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.transactions.slice(0, 10).map((transaction: any, index: number) => {
                            // Debug: verificar se a transação está no período
                            const transactionDate = new Date(transaction.date);
                            const startDate = filters.startDate ? new Date(filters.startDate) : null;
                            const endDate = filters.endDate ? new Date(filters.endDate) : null;
                            
                            let isInPeriod = true;
                            if (startDate) isInPeriod = isInPeriod && transactionDate >= startDate;
                            if (endDate) {
                              const endOfDay = new Date(endDate);
                              endOfDay.setHours(23, 59, 59, 999);
                              isInPeriod = isInPeriod && transactionDate <= endOfDay;
                            }
                            
                            return (
                            <tr key={index} className={`hover:bg-gray-50 ${!isInPeriod ? 'bg-red-50 border-l-4 border-red-400' : ''}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm ${!isInPeriod ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                  {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                  {!isInPeriod && (
                                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                      Fora do período
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{transaction.category || '-'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.type === 'receita'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                  }`}>
                                  {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className={`text-sm font-medium ${transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  }).format(transaction.amount)}
                                </div>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {reportData.transactions.length > 10 && (
                        <div className="px-6 py-3 bg-gray-50 text-center">
                          <span className="text-sm text-gray-500">
                            ... e mais {reportData.transactions.length - 10} transações
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : selectedReport === 'departments' && reportData?.departments ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{reportData.departments.length}</div>
                        <div className="text-sm text-blue-700">Total Departamentos</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {reportData.departments.filter((d: any) => d.is_active).length}
                        </div>
                        <div className="text-sm text-green-700">Ativos</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {reportData.departments.reduce((sum: number, d: any) => sum + (d.leaders?.length || 0), 0)}
                        </div>
                        <div className="text-sm text-purple-700">Total Líderes</div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Líderes</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.departments.map((department: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{department.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{department.category}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-600">
                                  {department.leader_details?.map((leader: any) => leader.name).join(', ') || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${department.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                  }`}>
                                  {department.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : selectedReport === 'events' && reportData?.events ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{reportData.events.length}</div>
                        <div className="text-sm text-blue-700">Total Eventos</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {reportData.stats?.futuros || 0}
                        </div>
                        <div className="text-sm text-green-700">Futuros</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {reportData.stats?.passados || 0}
                        </div>
                        <div className="text-sm text-purple-700">Passados</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {reportData.stats?.active || 0}
                        </div>
                        <div className="text-sm text-orange-700">Ativos</div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.events.slice(0, 10).map((event: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{event.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${event.event_type === 'culto' ? 'bg-blue-100 text-blue-800' :
                                    event.event_type === 'reuniao' ? 'bg-green-100 text-green-800' :
                                      'bg-purple-100 text-purple-800'
                                  }`}>
                                  {event.event_type === 'culto' ? 'Culto' :
                                    event.event_type === 'reuniao' ? 'Reunião' : 'Evento Especial'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(event.start_datetime).toLocaleString('pt-BR')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{event.location || '-'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${event.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                  }`}>
                                  {event.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {reportData.events.length > 10 && (
                        <div className="px-6 py-3 bg-gray-50 text-center">
                          <span className="text-sm text-gray-500">
                            ... e mais {reportData.events.length - 10} eventos
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum dado para visualizar</h3>
                    <p className="text-gray-600">
                      Gere um relatório primeiro para ver o preview dos dados
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}