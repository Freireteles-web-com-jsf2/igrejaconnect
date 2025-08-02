import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface FinancialChartProps {
  monthlyData?: {
    month: string;
    receitas: number;
    despesas: number;
    saldo: number;
  }[];
  categoryData?: {
    name: string;
    value: number;
    color: string;
  }[];
  memberGrowthData?: {
    month: string;
    membros: number;
  }[];
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];

export default function FinancialChart({ monthlyData, categoryData, memberGrowthData }: FinancialChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Financial Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receitas vs Despesas (Últimos 6 meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
              <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receitas por Categoria (Este Mês)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(categoryData || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Member Growth Chart */}
      {memberGrowthData && memberGrowthData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crescimento de Membros (Últimos 6 meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={memberGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="membros" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                name="Membros"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}