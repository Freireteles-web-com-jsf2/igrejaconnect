import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@supabase/supabase-js';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono<{ Bindings: Env; Variables: { user: any } }>();

app.use('*', cors({
  origin: (origin) => origin || '*',
  credentials: true,
}));

// Criar cliente Supabase
function createSupabaseClient(env: Env) {
  return createClient(
    env.VITE_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Middleware de autenticação Supabase
async function supabaseAuthMiddleware(c: any, next: any) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Token de autorização necessário' }, 401);
  }

  const token = authHeader.substring(7);
  const supabase = createSupabaseClient(c.env);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    c.set('user', user);
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Erro de autenticação' }, 401);
  }
}



// Rota de teste para verificar se o Supabase está configurado
app.get('/api/health', async (c) => {
  try {
    if (!c.env.VITE_SUPABASE_URL || !c.env.SUPABASE_SERVICE_ROLE_KEY) {
      return c.json({
        status: 'error',
        message: 'Variáveis de ambiente do Supabase não configuradas'
      }, 500);
    }

    const supabase = createSupabaseClient(c.env);

    // Teste simples de conexão
    const { error } = await supabase.from('church_users').select('count').limit(1);

    if (error) {
      return c.json({
        status: 'error',
        message: 'Erro ao conectar com Supabase',
        error: error.message
      }, 500);
    }

    return c.json({
      status: 'ok',
      message: 'Supabase configurado corretamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      status: 'error',
      message: 'Erro interno',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Dashboard stats (temporariamente sem auth para debug)
app.get('/api/dashboard/stats', async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    console.log('=== Fetching Dashboard Stats ===');

    // Total members
    const { count: totalMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });

    // Active members
    const { count: activeMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Birthday members this month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Buscar aniversariantes do mês atual
    const { data: birthdayMembersData } = await supabase
      .from('members')
      .select('id, name, birth_date')
      .eq('is_active', true)
      .not('birth_date', 'is', null);

    const birthdayMembers = birthdayMembersData?.filter(member => {
      if (!member.birth_date) return false;
      const birthDate = new Date(member.birth_date);
      return birthDate.getMonth() + 1 === currentMonth;
    }).length || 0;

    // Department stats
    const { count: totalDepartments } = await supabase
      .from('departments')
      .select('*', { count: 'exact', head: true });

    const { count: activeDepartments } = await supabase
      .from('departments')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Financial stats for current month
    const currentMonthStr = currentMonth.toString().padStart(2, '0');
    const monthStart = `${currentYear}-${currentMonthStr}-01`;
    const monthEnd = `${currentYear}-${currentMonthStr}-31`;

    const { data: incomeData } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'receita')
      .gte('date', monthStart)
      .lte('date', monthEnd);

    const { data: expenseData } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'despesa')
      .gte('date', monthStart)
      .lte('date', monthEnd);

    const monthlyIncome = incomeData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const monthlyExpenses = expenseData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    // Total financial stats (all time)
    const { data: totalIncomeData } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'receita');

    const { data: totalExpenseData } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'despesa');

    const totalIncome = totalIncomeData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const totalExpenses = totalExpenseData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    // Recent transactions count
    const { count: recentTransactions } = await supabase
      .from('financial_transactions')
      .select('*', { count: 'exact', head: true })
      .gte('date', monthStart)
      .lte('date', monthEnd);

    // Events this month
    const { count: monthlyEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('date', monthStart)
      .lte('date', monthEnd);

    const stats = {
      totalMembers: totalMembers || 0,
      activeMembers: activeMembers || 0,
      birthdayMembers,
      monthlyIncome,
      monthlyExpenses,
      netBalance: monthlyIncome - monthlyExpenses,
      totalDepartments: totalDepartments || 0,
      activeDepartments: activeDepartments || 0,
      totalIncome,
      totalExpenses,
      totalBalance: totalIncome - totalExpenses,
      recentTransactions: recentTransactions || 0,
      monthlyEvents: monthlyEvents || 0,
    };

    console.log('Dashboard stats calculated:', stats);
    return c.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return c.json({
      error: 'Erro ao carregar estatísticas',
      // Fallback data
      totalMembers: 0,
      activeMembers: 0,
      birthdayMembers: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      netBalance: 0,
      totalDepartments: 0,
      activeDepartments: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalBalance: 0,
      recentTransactions: 0,
      monthlyEvents: 0,
    }, 500);
  }
});

// Dashboard charts data (temporariamente sem auth para debug)
app.get('/api/dashboard/charts', async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    console.log('=== Fetching Dashboard Charts ===');
    const currentDate = new Date();
    const monthlyData = [];
    const categoryData: { name: string; value: number; color: string }[] = [];
    const memberGrowthData = [];

    // Get last 6 months financial data
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthStart = `${year}-${month}-01`;
      const monthEnd = `${year}-${month}-31`;

      const { data: incomeData } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('type', 'receita')
        .gte('date', monthStart)
        .lte('date', monthEnd);

      const { data: expenseData } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('type', 'despesa')
        .gte('date', monthStart)
        .lte('date', monthEnd);

      const monthlyIncome = incomeData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      const monthlyExpenses = expenseData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

      monthlyData.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        receitas: monthlyIncome,
        despesas: monthlyExpenses,
        saldo: monthlyIncome - monthlyExpenses,
      });

      // Member growth data
      const { count: membersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', `${year}-${month}-31T23:59:59`);

      memberGrowthData.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        membros: membersCount || 0,
      });
    }

    // Get category data for current month (receitas only)
    const currentYear = currentDate.getFullYear();
    const currentMonthStr = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const monthStart = `${currentYear}-${currentMonthStr}-01`;
    const monthEnd = `${currentYear}-${currentMonthStr}-31`;

    const { data: categoryTransactions } = await supabase
      .from('financial_transactions')
      .select('category, amount, type')
      .eq('type', 'receita')
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .not('category', 'is', null);

    // Group by category
    const categoryMap = new Map();
    categoryTransactions?.forEach(transaction => {
      const category = transaction.category || 'Outros';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, 0);
      }
      categoryMap.set(category, categoryMap.get(category) + transaction.amount);
    });

    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280', '#EC4899', '#14B8A6'];
    let colorIndex = 0;

    // Sort categories by value and get top 6
    const sortedCategories = Array.from(categoryMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);

    sortedCategories.forEach(([key, value]) => {
      categoryData.push({
        name: key,
        value: value,
        color: colors[colorIndex % colors.length]
      });
      colorIndex++;
    });

    // Top contributors (members with most donations this month)
    const { data: memberContributions } = await supabase
      .from('financial_transactions')
      .select(`
        amount,
        member:members(id, name)
      `)
      .eq('type', 'receita')
      .in('category', ['Dízimos', 'Ofertas'])
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .not('member_id', 'is', null);

    const contributorMap = new Map();
    memberContributions?.forEach(transaction => {
      if (transaction.member && Array.isArray(transaction.member) && transaction.member.length > 0) {
        const memberName = transaction.member[0].name;
        if (!contributorMap.has(memberName)) {
          contributorMap.set(memberName, 0);
        }
        contributorMap.set(memberName, contributorMap.get(memberName) + transaction.amount);
      } else if (transaction.member && typeof transaction.member === 'object' && 'name' in transaction.member) {
        const memberName = (transaction.member as any).name;
        if (!contributorMap.has(memberName)) {
          contributorMap.set(memberName, 0);
        }
        contributorMap.set(memberName, contributorMap.get(memberName) + transaction.amount);
      }
    });

    const topContributors = Array.from(contributorMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    const result = {
      monthlyData,
      categoryData,
      memberGrowthData,
      topContributors,
    };

    console.log('Dashboard charts data:', result);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching dashboard charts:', error);
    return c.json({
      error: 'Erro ao carregar dados dos gráficos',
      monthlyData: [],
      categoryData: [],
      memberGrowthData: [],
      topContributors: [],
    }, 500);
  }
});

// ===== MEMBERS API =====

// Schema para validação de membros
const MemberSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  email: z.union([z.string().email('Email inválido'), z.literal(''), z.null()]).optional(),
  phone: z.string().max(20, 'Telefone muito longo').optional(),
  birth_date: z.union([z.string(), z.literal(''), z.null()]).optional().refine((date) => {
    if (!date) return true;
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 0 && age <= 150;
  }, 'Data de nascimento inválida'),
  address: z.string().max(200, 'Endereço muito longo').optional(),
  baptism_date: z.union([z.string(), z.literal(''), z.null()]).optional().refine((date) => {
    if (!date) return true;
    const baptismDate = new Date(date);
    const today = new Date();
    return baptismDate <= today;
  }, 'Data de batismo não pode ser no futuro'),
  gender: z.union([z.enum(['masculino', 'feminino', 'outro']), z.literal(''), z.null()]).optional(),
  marital_status: z.union([z.enum(['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel']), z.literal(''), z.null()]).optional(),
  is_active: z.boolean().default(true),
  notes: z.string().max(500, 'Observações muito longas').optional(),
});

// GET /api/members - Listar todos os membros (temporariamente sem auth para debug)
app.get('/api/members', async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching members:', error);
      return c.json({ error: 'Erro ao carregar membros' }, 500);
    }

    return c.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/members:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/members/:id - Buscar membro específico
app.get('/api/members/:id', supabaseAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseClient(c.env);

  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Membro não encontrado' }, 404);
      }
      console.error('Error fetching member:', error);
      return c.json({ error: 'Erro ao carregar membro' }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error('Error in GET /api/members/:id:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// POST /api/members - Criar novo membro
app.post('/api/members', supabaseAuthMiddleware, zValidator('json', MemberSchema), async (c) => {
  const memberData = c.req.valid('json');
  const supabase = createSupabaseClient(c.env);

  try {
    // Limpar dados vazios
    const cleanData = {
      name: memberData.name.trim(),
      email: memberData.email && memberData.email.trim() ? memberData.email.trim() : null,
      phone: memberData.phone && memberData.phone.trim() ? memberData.phone.trim() : null,
      birth_date: memberData.birth_date && memberData.birth_date.trim() ? memberData.birth_date.trim() : null,
      address: memberData.address && memberData.address.trim() ? memberData.address.trim() : null,
      baptism_date: memberData.baptism_date && memberData.baptism_date.trim() ? memberData.baptism_date.trim() : null,
      gender: memberData.gender && memberData.gender.trim() ? memberData.gender.trim() : null,
      marital_status: memberData.marital_status && memberData.marital_status.trim() ? memberData.marital_status.trim() : null,
      is_active: memberData.is_active,
      notes: memberData.notes && memberData.notes.trim() ? memberData.notes.trim() : null,
    };

    const { data, error } = await supabase
      .from('members')
      .insert([cleanData])
      .select()
      .single();

    if (error) {
      console.error('Error creating member:', error);
      return c.json({ error: 'Erro ao criar membro' }, 500);
    }

    return c.json(data, 201);
  } catch (error) {
    console.error('Error in POST /api/members:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// PUT /api/members/:id - Atualizar membro
app.put('/api/members/:id', supabaseAuthMiddleware, zValidator('json', MemberSchema), async (c) => {
  const id = c.req.param('id');
  const memberData = c.req.valid('json');
  const supabase = createSupabaseClient(c.env);

  try {
    // Limpar dados vazios
    const cleanData = {
      name: memberData.name.trim(),
      email: memberData.email && memberData.email.trim() ? memberData.email.trim() : null,
      phone: memberData.phone && memberData.phone.trim() ? memberData.phone.trim() : null,
      birth_date: memberData.birth_date && memberData.birth_date.trim() ? memberData.birth_date.trim() : null,
      address: memberData.address && memberData.address.trim() ? memberData.address.trim() : null,
      baptism_date: memberData.baptism_date && memberData.baptism_date.trim() ? memberData.baptism_date.trim() : null,
      gender: memberData.gender && memberData.gender.trim() ? memberData.gender.trim() : null,
      marital_status: memberData.marital_status && memberData.marital_status.trim() ? memberData.marital_status.trim() : null,
      is_active: memberData.is_active,
      notes: memberData.notes && memberData.notes.trim() ? memberData.notes.trim() : null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('members')
      .update(cleanData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Membro não encontrado' }, 404);
      }
      console.error('Error updating member:', error);
      return c.json({ error: 'Erro ao atualizar membro' }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error('Error in PUT /api/members/:id:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// DELETE /api/members/:id - Excluir membro
app.delete('/api/members/:id', supabaseAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseClient(c.env);

  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting member:', error);
      return c.json({ error: 'Erro ao excluir membro' }, 500);
    }

    return c.json({ message: 'Membro excluído com sucesso' });
  } catch (error) {
    console.error('Error in DELETE /api/members/:id:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ===== DEPARTMENTS API =====

// Schema para validação de departamentos
const DepartmentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  category: z.string().min(1, 'Categoria é obrigatória').max(50, 'Categoria muito longa'),
  leaders: z.array(z.number().positive('ID de líder inválido')).max(10, 'Máximo 10 líderes por departamento').default([]),
  meeting_datetime: z.union([z.string(), z.literal(''), z.null()]).optional().refine((datetime) => {
    if (!datetime) return true;
    const meetingDate = new Date(datetime);
    return !isNaN(meetingDate.getTime());
  }, 'Data e hora de reunião inválida'),
  is_active: z.boolean().default(true),
  notes: z.string().max(500, 'Observações muito longas').optional(),
});

// GET /api/departments - Listar todos os departamentos (temporariamente sem auth para debug)
app.get('/api/departments', async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    const { data: departments, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching departments:', error);
      return c.json({ error: 'Erro ao carregar departamentos' }, 500);
    }

    // Buscar nomes dos líderes para cada departamento
    const departmentsWithLeaders = await Promise.all(
      (departments || []).map(async (dept) => {
        let leaderIds: number[] = [];

        // Processar leaders baseado no tipo (PostgreSQL array ou SQLite JSON string)
        if (dept.leaders) {
          if (Array.isArray(dept.leaders)) {
            // PostgreSQL - já é um array
            leaderIds = dept.leaders;
          } else if (typeof dept.leaders === 'string') {
            // SQLite - é uma string JSON
            try {
              leaderIds = JSON.parse(dept.leaders);
            } catch (e) {
              console.warn('Error parsing leaders JSON:', e);
              leaderIds = [];
            }
          }
        }

        if (leaderIds.length > 0) {
          const { data: members } = await supabase
            .from('members')
            .select('id, name')
            .in('id', leaderIds);

          return {
            ...dept,
            leaders: leaderIds, // Normalizar para array
            leader_names: members?.map(m => m.name) || []
          };
        }
        return {
          ...dept,
          leaders: [],
          leader_names: []
        };
      })
    );

    return c.json(departmentsWithLeaders);
  } catch (error) {
    console.error('Error in GET /api/departments:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// POST /api/departments - Criar novo departamento
app.post('/api/departments', supabaseAuthMiddleware, zValidator('json', DepartmentSchema), async (c) => {
  const departmentData = c.req.valid('json');
  const supabase = createSupabaseClient(c.env);

  try {
    // Detectar se estamos usando PostgreSQL (Supabase) ou SQLite
    const isPostgreSQL = c.env.VITE_SUPABASE_URL && c.env.VITE_SUPABASE_URL.includes('supabase.co');

    const cleanData = {
      name: departmentData.name.trim(),
      category: departmentData.category.trim(),
      leaders: isPostgreSQL
        ? departmentData.leaders // PostgreSQL aceita array diretamente
        : JSON.stringify(departmentData.leaders), // SQLite precisa de JSON string
      meeting_datetime: departmentData.meeting_datetime && departmentData.meeting_datetime.trim()
        ? departmentData.meeting_datetime.trim()
        : null,
      is_active: departmentData.is_active,
      notes: departmentData.notes && departmentData.notes.trim() ? departmentData.notes.trim() : null,
    };

    const { data, error } = await supabase
      .from('departments')
      .insert([cleanData])
      .select()
      .single();

    if (error) {
      console.error('Error creating department:', error);
      return c.json({ error: 'Erro ao criar departamento' }, 500);
    }

    return c.json(data, 201);
  } catch (error) {
    console.error('Error in POST /api/departments:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// PUT /api/departments/:id - Atualizar departamento
app.put('/api/departments/:id', supabaseAuthMiddleware, zValidator('json', DepartmentSchema), async (c) => {
  const id = c.req.param('id');
  const departmentData = c.req.valid('json');
  const supabase = createSupabaseClient(c.env);

  try {
    // Detectar se estamos usando PostgreSQL (Supabase) ou SQLite
    const isPostgreSQL = c.env.VITE_SUPABASE_URL && c.env.VITE_SUPABASE_URL.includes('supabase.co');

    const cleanData = {
      name: departmentData.name.trim(),
      category: departmentData.category.trim(),
      leaders: isPostgreSQL
        ? departmentData.leaders // PostgreSQL aceita array diretamente
        : JSON.stringify(departmentData.leaders), // SQLite precisa de JSON string
      meeting_datetime: departmentData.meeting_datetime && departmentData.meeting_datetime.trim()
        ? departmentData.meeting_datetime.trim()
        : null,
      is_active: departmentData.is_active,
      notes: departmentData.notes && departmentData.notes.trim() ? departmentData.notes.trim() : null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('departments')
      .update(cleanData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Departamento não encontrado' }, 404);
      }
      console.error('Error updating department:', error);
      return c.json({ error: 'Erro ao atualizar departamento' }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error('Error in PUT /api/departments/:id:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// DELETE /api/departments/:id - Excluir departamento
app.delete('/api/departments/:id', supabaseAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseClient(c.env);

  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting department:', error);
      return c.json({ error: 'Erro ao excluir departamento' }, 500);
    }

    return c.json({ message: 'Departamento excluído com sucesso' });
  } catch (error) {
    console.error('Error in DELETE /api/departments/:id:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ===== FINANCIAL API =====

// Schema para validação de transações financeiras
const FinancialTransactionSchema = z.object({
  type: z.enum(['receita', 'despesa'], { required_error: 'Tipo é obrigatório' }),
  amount: z.number().positive('Valor deve ser maior que zero').max(1000000, 'Valor muito alto'),
  description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres').max(200, 'Descrição muito longa'),
  category: z.union([z.string().max(50, 'Categoria muito longa'), z.literal(''), z.null()]).optional(),
  date: z.string().min(1, 'Data é obrigatória').refine((date) => {
    const transactionDate = new Date(date);
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);

    return transactionDate >= oneYearAgo && transactionDate <= oneYearFromNow;
  }, 'Data deve estar entre um ano atrás e um ano no futuro'),
  member_id: z.number().optional().nullable(),
});

// GET /api/financial/transactions - Listar todas as transações (temporariamente sem auth para debug)
app.get('/api/financial/transactions', async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select(`
        *,
        member:members(id, name)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching financial transactions:', error);
      return c.json({ error: 'Erro ao carregar transações financeiras' }, 500);
    }

    return c.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/financial/transactions:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/financial/transactions/:id - Buscar transação específica
app.get('/api/financial/transactions/:id', supabaseAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseClient(c.env);

  try {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select(`
        *,
        member:members(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Transação não encontrada' }, 404);
      }
      console.error('Error fetching financial transaction:', error);
      return c.json({ error: 'Erro ao carregar transação' }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error('Error in GET /api/financial/transactions/:id:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/financial/members - Listar membros ativos para seleção (temporariamente sem auth para debug)
app.get('/api/financial/members', async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    const { data, error } = await supabase
      .from('members')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching members for financial transactions:', error);
      return c.json({ error: 'Erro ao carregar membros' }, 500);
    }

    return c.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/financial/members:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});



// GET /api/financial/categories/simple - Versão simplificada para debug
app.get('/api/financial/categories/simple', async (c) => {
  const categories = {
    receita: ['Dízimos', 'Ofertas', 'Doações', 'Eventos', 'Vendas', 'Outros'],
    despesa: ['Aluguel', 'Energia Elétrica', 'Água', 'Internet/Telefone', 'Material de Limpeza', 'Material de Escritório', 'Equipamentos', 'Manutenção', 'Eventos', 'Missões', 'Ajuda Social', 'Outros']
  };

  return c.json(categories);
});

// GET /api/financial/debug - Debug das transações financeiras
app.get('/api/financial/debug', async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    console.log('=== DEBUG: Verificando transações financeiras ===');
    
    const { data, error, count } = await supabase
      .from('financial_transactions')
      .select('*', { count: 'exact' });

    console.log('Transações encontradas:', count);
    console.log('Dados:', data);
    console.log('Erro:', error);

    return c.json({
      count,
      data: data || [],
      error: error?.message || null
    });
  } catch (error) {
    console.error('Error in debug:', error);
    return c.json({ error: 'Erro no debug' }, 500);
  }
});

// GET /api/financial/categories - Listar categorias disponíveis (temporariamente sem auth para debug)
app.get('/api/financial/categories', async (c) => {
  console.log('=== Financial Categories API Called ===');
  const supabase = createSupabaseClient(c.env);
  const type = c.req.query('type'); // 'receita' ou 'despesa'
  console.log('Query type:', type);

  try {
    let query = supabase
      .from('financial_categories')
      .select('name, type')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (type && (type === 'receita' || type === 'despesa')) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    console.log('Supabase query result:', { data, error });

    // Se a tabela não existir ou houver erro, usar categorias padrão
    if (error) {
      console.warn('Financial categories table not found, using default categories:', error);

      const defaultCategories = {
        receita: [
          'Dízimos',
          'Ofertas',
          'Doações',
          'Eventos',
          'Vendas',
          'Outros'
        ],
        despesa: [
          'Aluguel',
          'Energia Elétrica',
          'Água',
          'Internet/Telefone',
          'Material de Limpeza',
          'Material de Escritório',
          'Equipamentos',
          'Manutenção',
          'Eventos',
          'Missões',
          'Ajuda Social',
          'Outros'
        ]
      };

      if (type && (type === 'receita' || type === 'despesa')) {
        console.log('Returning default categories for type:', type, defaultCategories[type]);
        return c.json(defaultCategories[type]);
      }

      console.log('Returning all default categories:', defaultCategories);
      return c.json(defaultCategories);
    }

    if (type && (type === 'receita' || type === 'despesa')) {
      // Retornar apenas os nomes das categorias para o tipo específico
      const result = (data || []).map(cat => cat.name);
      console.log('Returning categories for type:', type, result);
      return c.json(result);
    }

    // Retornar categorias agrupadas por tipo
    const categoriesGrouped = {
      receita: (data || []).filter(cat => cat.type === 'receita').map(cat => cat.name),
      despesa: (data || []).filter(cat => cat.type === 'despesa').map(cat => cat.name)
    };

    console.log('Returning grouped categories:', categoriesGrouped);
    return c.json(categoriesGrouped);
  } catch (error) {
    console.error('Error in GET /api/financial/categories:', error);

    // Fallback para categorias padrão em caso de erro
    const defaultCategories = {
      receita: [
        'Dízimos',
        'Ofertas',
        'Doações',
        'Eventos',
        'Vendas',
        'Outros'
      ],
      despesa: [
        'Aluguel',
        'Energia Elétrica',
        'Água',
        'Internet/Telefone',
        'Material de Limpeza',
        'Material de Escritório',
        'Equipamentos',
        'Manutenção',
        'Eventos',
        'Missões',
        'Ajuda Social',
        'Outros'
      ]
    };

    if (type && (type === 'receita' || type === 'despesa')) {
      return c.json(defaultCategories[type]);
    }

    return c.json(defaultCategories);
  }
});

// GET /api/financial/stats - Obter estatísticas financeiras (temporariamente sem auth para debug)
app.get('/api/financial/stats', async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    // Buscar todas as transações
    const { data: transactions, error } = await supabase
      .from('financial_transactions')
      .select('type, amount, date');

    if (error) {
      console.error('Error fetching financial stats:', error);
      return c.json({ error: 'Erro ao carregar estatísticas' }, 500);
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calcular totais gerais
    const totalIncome = (transactions || [])
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = (transactions || [])
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Calcular totais mensais
    const monthlyTransactions = (transactions || []).filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyBalance = monthlyIncome - monthlyExpenses;

    return c.json({
      total: {
        income: totalIncome,
        expenses: totalExpenses,
        balance: balance,
        transactionCount: transactions?.length || 0
      },
      monthly: {
        income: monthlyIncome,
        expenses: monthlyExpenses,
        balance: monthlyBalance,
        transactionCount: monthlyTransactions.length
      }
    });
  } catch (error) {
    console.error('Error in GET /api/financial/stats:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// POST /api/financial/transactions - Criar nova transação
app.post('/api/financial/transactions', supabaseAuthMiddleware, zValidator('json', FinancialTransactionSchema), async (c) => {
  const transactionData = c.req.valid('json');
  const user = c.get('user');
  const supabase = createSupabaseClient(c.env);

  console.log('=== Creating Financial Transaction ===');
  console.log('Transaction data received:', transactionData);
  console.log('User:', user?.id);

  try {
    const cleanData = {
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description.trim(),
      category: transactionData.category && transactionData.category.trim() ? transactionData.category.trim() : null,
      date: transactionData.date,
      user_id: user?.id || null,
      member_id: transactionData.member_id || null,
    };

    console.log('Clean data to insert:', cleanData);

    const { data, error } = await supabase
      .from('financial_transactions')
      .insert([cleanData])
      .select()
      .single();

    if (error) {
      console.error('Error creating financial transaction:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return c.json({ error: 'Erro ao criar transação financeira', details: error.message }, 500);
    }

    console.log('Transaction created successfully:', data);
    return c.json(data, 201);
  } catch (error) {
    console.error('Error in POST /api/financial/transactions:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// PUT /api/financial/transactions/:id - Atualizar transação
app.put('/api/financial/transactions/:id', supabaseAuthMiddleware, zValidator('json', FinancialTransactionSchema), async (c) => {
  const id = c.req.param('id');
  const transactionData = c.req.valid('json');
  const supabase = createSupabaseClient(c.env);

  try {
    const cleanData = {
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description.trim(),
      category: transactionData.category && transactionData.category.trim() ? transactionData.category.trim() : null,
      date: transactionData.date,
      member_id: transactionData.member_id || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('financial_transactions')
      .update(cleanData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Transação não encontrada' }, 404);
      }
      console.error('Error updating financial transaction:', error);
      return c.json({ error: 'Erro ao atualizar transação financeira' }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error('Error in PUT /api/financial/transactions/:id:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// DELETE /api/financial/transactions/:id - Excluir transação
app.delete('/api/financial/transactions/:id', supabaseAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseClient(c.env);

  try {
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting financial transaction:', error);
      return c.json({ error: 'Erro ao excluir transação financeira' }, 500);
    }

    return c.json({ message: 'Transação financeira excluída com sucesso' });
  } catch (error) {
    console.error('Error in DELETE /api/financial/transactions/:id:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ===== NOTIFICATIONS API =====

// Schema para validação de notificações
const NotificationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  message: z.string().min(1, 'Mensagem é obrigatória').max(500, 'Mensagem muito longa'),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  target_users: z.array(z.string().uuid('ID de usuário inválido')).optional(),
  send_to_all: z.boolean().default(false),
});

// GET /api/notifications - Listar notificações do usuário atual
app.get('/api/notifications', supabaseAuthMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = createSupabaseClient(c.env);

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return c.json({ error: 'Erro ao carregar notificações' }, 500);
    }

    return c.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/notifications:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/notifications/unread-count - Contar notificações não lidas
app.get('/api/notifications/unread-count', supabaseAuthMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = createSupabaseClient(c.env);

  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .eq('is_read', false);

    if (error) {
      console.error('Error counting unread notifications:', error);
      return c.json({ error: 'Erro ao contar notificações' }, 500);
    }

    return c.json({ count: count || 0 });
  } catch (error) {
    console.error('Error in GET /api/notifications/unread-count:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// POST /api/notifications - Criar nova notificação
app.post('/api/notifications', supabaseAuthMiddleware, zValidator('json', NotificationSchema), async (c) => {
  const notificationData = c.req.valid('json');
  const user = c.get('user');
  const supabase = createSupabaseClient(c.env);

  try {
    const notifications = [];

    if (notificationData.send_to_all) {
      // Enviar para todos os usuários
      const { data: users, error: usersError } = await supabase
        .from('church_users')
        .select('id')
        .eq('is_active', true);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return c.json({ error: 'Erro ao buscar usuários' }, 500);
      }

      for (const targetUser of users || []) {
        notifications.push({
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          user_id: targetUser.id,
          created_by: user.id,
        });
      }
    } else if (notificationData.target_users && notificationData.target_users.length > 0) {
      // Enviar para usuários específicos
      for (const userId of notificationData.target_users) {
        notifications.push({
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          user_id: userId,
          created_by: user.id,
        });
      }
    } else {
      // Notificação geral (sem usuário específico)
      notifications.push({
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        user_id: null,
        created_by: user.id,
      });
    }

    const { error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('Error creating notifications:', error);
      return c.json({ error: 'Erro ao criar notificação' }, 500);
    }

    return c.json({ 
      message: 'Notificação criada com sucesso',
      count: notifications.length
    }, 201);
  } catch (error) {
    console.error('Error in POST /api/notifications:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// PUT /api/notifications/:id/read - Marcar notificação como lida
app.put('/api/notifications/:id/read', supabaseAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const supabase = createSupabaseClient(c.env);

  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Notificação não encontrada' }, 404);
      }
      console.error('Error marking notification as read:', error);
      return c.json({ error: 'Erro ao marcar notificação como lida' }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error('Error in PUT /api/notifications/:id/read:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// PUT /api/notifications/mark-all-read - Marcar todas as notificações como lidas
app.put('/api/notifications/mark-all-read', supabaseAuthMiddleware, async (c) => {
  const user = c.get('user');
  const supabase = createSupabaseClient(c.env);

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return c.json({ error: 'Erro ao marcar notificações como lidas' }, 500);
    }

    return c.json({ message: 'Todas as notificações foram marcadas como lidas' });
  } catch (error) {
    console.error('Error in PUT /api/notifications/mark-all-read:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// DELETE /api/notifications/:id - Excluir notificação
app.delete('/api/notifications/:id', supabaseAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const supabase = createSupabaseClient(c.env);

  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .or(`user_id.eq.${user.id},created_by.eq.${user.id}`);

    if (error) {
      console.error('Error deleting notification:', error);
      return c.json({ error: 'Erro ao excluir notificação' }, 500);
    }

    return c.json({ message: 'Notificação excluída com sucesso' });
  } catch (error) {
    console.error('Error in DELETE /api/notifications/:id:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/notifications/users - Listar usuários para envio de notificações
app.get('/api/notifications/users', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    const { data, error } = await supabase
      .from('church_users')
      .select('id, name, email, role')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching users for notifications:', error);
      return c.json({ error: 'Erro ao carregar usuários' }, 500);
    }

    return c.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/notifications/users:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// POST /api/notifications/auto/birthday - Criar notificações automáticas de aniversário
app.post('/api/notifications/auto/birthday', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    const today = new Date();

    // Buscar aniversariantes de hoje
    const { data: birthdayMembers, error: membersError } = await supabase
      .from('members')
      .select('id, name, birth_date')
      .eq('is_active', true)
      .not('birth_date', 'is', null);

    if (membersError) {
      console.error('Error fetching birthday members:', membersError);
      return c.json({ error: 'Erro ao buscar aniversariantes' }, 500);
    }

    const todayBirthdays = birthdayMembers?.filter((member: { birth_date: string | null; }) => {
      if (!member.birth_date) return false;
      const birthDate = new Date(member.birth_date);
      return birthDate.getMonth() === today.getMonth() && birthDate.getDate() === today.getDate();
    }) || [];

    if (todayBirthdays.length === 0) {
      return c.json({ message: 'Nenhum aniversariante hoje', count: 0 });
    }

    // Criar notificações para cada aniversariante
    const notifications = [];
    for (const member of todayBirthdays) {
      const age = today.getFullYear() - new Date(member.birth_date!).getFullYear();
      notifications.push({
        title: '🎉 Aniversário Hoje!',
        message: `${member.name} está fazendo ${age} anos hoje! Não esqueça de parabenizar.`,
        type: 'info',
        user_id: null, // Notificação geral
      });
    }

    const { error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('Error creating birthday notifications:', error);
      return c.json({ error: 'Erro ao criar notificações de aniversário' }, 500);
    }

    return c.json({ 
      message: 'Notificações de aniversário criadas com sucesso',
      count: notifications.length,
      birthdays: todayBirthdays.map((m: { name: string }) => m.name)
    });
  } catch (error) {
    console.error('Error in POST /api/notifications/auto/birthday:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// POST /api/notifications/auto/meetings - Criar notificações automáticas de reuniões
app.post('/api/notifications/auto/meetings', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const tomorrowEnd = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59);

    // Buscar reuniões de amanhã
    const { data: meetings, error: meetingsError } = await supabase
      .from('departments')
      .select('id, name, meeting_datetime')
      .eq('is_active', true)
      .not('meeting_datetime', 'is', null)
      .gte('meeting_datetime', tomorrowStart.toISOString())
      .lte('meeting_datetime', tomorrowEnd.toISOString());

    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
      return c.json({ error: 'Erro ao buscar reuniões' }, 500);
    }

    if (!meetings || meetings.length === 0) {
      return c.json({ message: 'Nenhuma reunião amanhã', count: 0 });
    }

    // Criar notificações para cada reunião
    const notifications = [];
    for (const meeting of meetings) {
      const meetingTime = new Date(meeting.meeting_datetime!).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      notifications.push({
        title: '📅 Reunião Amanhã',
        message: `Lembrete: ${meeting.name} tem reunião amanhã às ${meetingTime}.`,
        type: 'info',
        user_id: null, // Notificação geral
      });
    }

    const { error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('Error creating meeting notifications:', error);
      return c.json({ error: 'Erro ao criar notificações de reunião' }, 500);
    }

    return c.json({ 
      message: 'Notificações de reunião criadas com sucesso',
      count: notifications.length,
      meetings: meetings.map(m => m.name)
    });
  } catch (error) {
    console.error('Error in POST /api/notifications/auto/meetings:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ===== EVENTOS =====

// Schema de validação para eventos
const EventSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').nullable().optional(),
  event_type: z.enum(['culto', 'reuniao', 'evento_especial'], {
    errorMap: () => ({ message: 'Tipo deve ser: culto, reuniao ou evento_especial' })
  }),
  start_datetime: z.string().datetime('Data/hora de início deve estar no formato ISO 8601'),
  end_datetime: z.string().datetime('Data/hora de fim deve estar no formato ISO 8601').nullable().optional(),
  location: z.string().max(200, 'Local deve ter no máximo 200 caracteres').nullable().optional(),
  max_participants: z.number().positive('Máximo de participantes deve ser positivo').nullable().optional(),
  requires_confirmation: z.boolean().default(false),
  department_id: z.number().positive('ID do departamento deve ser positivo').nullable().optional(),
  is_active: z.boolean().default(true)
});

// GET /api/events - Listar todos os eventos (temporariamente sem auth para debug)
app.get('/api/events', async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    // Buscar eventos primeiro
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('start_datetime', { ascending: true });

    if (error) {
      console.error('Erro ao buscar eventos:', error);
      return c.json({ error: 'Erro ao buscar eventos' }, 500);
    }

    if (!events || events.length === 0) {
      return c.json([]);
    }

    // Buscar departamentos e usuários separadamente para evitar problemas de JOIN
    const departmentIds = events.map(e => e.department_id).filter(id => id);
    const userIds = events.map(e => e.created_by).filter(id => id);

    let departments: any[] = [];
    let users: any[] = [];

    if (departmentIds.length > 0) {
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name')
        .in('id', departmentIds);
      departments = deptData || [];
    }

    if (userIds.length > 0) {
      const { data: userData } = await supabase
        .from('church_users')
        .select('id, name')
        .in('id', userIds);
      users = userData || [];
    }

    // Combinar os dados
    const eventsWithRelations = events.map(event => ({
      ...event,
      departments: departments.find(d => d.id === event.department_id) || null,
      church_users: users.find(u => u.id === event.created_by) || null
    }));

    return c.json(eventsWithRelations);
  } catch (error) {
    console.error('Erro interno ao buscar eventos:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/events/:id - Buscar evento específico
app.get('/api/events/:id', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);
  const eventId = parseInt(c.req.param('id'));

  if (isNaN(eventId)) {
    return c.json({ error: 'ID do evento deve ser um número' }, 400);
  }

  try {
    // Buscar evento
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Evento não encontrado' }, 404);
      }
      console.error('Erro ao buscar evento:', error);
      return c.json({ error: 'Erro ao buscar evento' }, 500);
    }

    // Buscar dados relacionados separadamente
    let department = null;
    let creator = null;
    let participants: any[] = [];

    if (event.department_id) {
      const { data: deptData } = await supabase
        .from('departments')
        .select('name')
        .eq('id', event.department_id)
        .single();
      department = deptData;
    }

    if (event.created_by) {
      const { data: userData } = await supabase
        .from('church_users')
        .select('name')
        .eq('id', event.created_by)
        .single();
      creator = userData;
    }

    // Buscar participantes
    const { data: participantsData } = await supabase
      .from('event_participants')
      .select('id, status, registered_at, notes, member_id')
      .eq('event_id', eventId);

    if (participantsData && participantsData.length > 0) {
      const memberIds = participantsData.map((p: any) => p.member_id);
      const { data: membersData } = await supabase
        .from('members')
        .select('id, name, email, phone')
        .in('id', memberIds);

      participants = participantsData.map((p: any) => ({
        ...p,
        members: membersData?.find((m: any) => m.id === p.member_id) || null
      }));
    }

    const eventWithRelations = {
      ...event,
      departments: department,
      church_users: creator,
      event_participants: participants
    };

    return c.json(eventWithRelations);
  } catch (error) {
    console.error('Erro interno ao buscar evento:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// POST /api/events - Criar novo evento
app.post('/api/events', supabaseAuthMiddleware, zValidator('json', EventSchema), async (c) => {
  const supabase = createSupabaseClient(c.env);
  const user = c.get('user');
  const eventData = c.req.valid('json');

  try {
    // Buscar o ID do usuário na tabela church_users
    const { data: churchUser, error: userError } = await supabase
      .from('church_users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (userError || !churchUser) {
      return c.json({ error: 'Usuário não encontrado no sistema' }, 404);
    }

    // Validar se o departamento existe (se fornecido)
    if (eventData.department_id) {
      const { data: department, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('id', eventData.department_id)
        .single();

      if (deptError || !department) {
        return c.json({ error: 'Departamento não encontrado' }, 404);
      }
    }

    // Validar datas
    const startDate = new Date(eventData.start_datetime);
    const endDate = eventData.end_datetime ? new Date(eventData.end_datetime) : null;

    if (endDate && endDate <= startDate) {
      return c.json({ error: 'Data de fim deve ser posterior à data de início' }, 400);
    }

    const { data: newEvent, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        created_by: churchUser.id,
        description: eventData.description?.trim() || null,
        location: eventData.location?.trim() || null,
        end_datetime: eventData.end_datetime || null,
        max_participants: eventData.max_participants || null,
        department_id: eventData.department_id || null
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar evento:', error);
      return c.json({ error: 'Erro ao criar evento' }, 500);
    }

    return c.json(newEvent, 201);
  } catch (error) {
    console.error('Erro interno ao criar evento:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// PUT /api/events/:id - Atualizar evento
app.put('/api/events/:id', supabaseAuthMiddleware, zValidator('json', EventSchema.partial()), async (c) => {
  const supabase = createSupabaseClient(c.env);
  const eventId = parseInt(c.req.param('id'));
  const eventData = c.req.valid('json');

  if (isNaN(eventId)) {
    return c.json({ error: 'ID do evento deve ser um número' }, 400);
  }

  try {
    // Verificar se o evento existe
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('id, created_by')
      .eq('id', eventId)
      .single();

    if (fetchError || !existingEvent) {
      return c.json({ error: 'Evento não encontrado' }, 404);
    }

    // Validar se o departamento existe (se fornecido)
    if (eventData.department_id) {
      const { data: department, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('id', eventData.department_id)
        .single();

      if (deptError || !department) {
        return c.json({ error: 'Departamento não encontrado' }, 404);
      }
    }

    // Validar datas se fornecidas
    if (eventData.start_datetime && eventData.end_datetime) {
      const startDate = new Date(eventData.start_datetime);
      const endDate = new Date(eventData.end_datetime);

      if (endDate <= startDate) {
        return c.json({ error: 'Data de fim deve ser posterior à data de início' }, 400);
      }
    }

    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update({
        ...eventData,
        description: eventData.description?.trim() || null,
        location: eventData.location?.trim() || null,
        end_datetime: eventData.end_datetime || null,
        max_participants: eventData.max_participants || null,
        department_id: eventData.department_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar evento:', error);
      return c.json({ error: 'Erro ao atualizar evento' }, 500);
    }

    return c.json(updatedEvent);
  } catch (error) {
    console.error('Erro interno ao atualizar evento:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// DELETE /api/events/:id - Excluir evento
app.delete('/api/events/:id', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);
  const eventId = parseInt(c.req.param('id'));

  if (isNaN(eventId)) {
    return c.json({ error: 'ID do evento deve ser um número' }, 400);
  }

  try {
    // Verificar se o evento existe
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (fetchError || !existingEvent) {
      return c.json({ error: 'Evento não encontrado' }, 404);
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Erro ao excluir evento:', error);
      return c.json({ error: 'Erro ao excluir evento' }, 500);
    }

    return c.json({ message: 'Evento excluído com sucesso' });
  } catch (error) {
    console.error('Erro interno ao excluir evento:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/events/:id/participants - Listar participantes do evento
app.get('/api/events/:id/participants', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);
  const eventId = parseInt(c.req.param('id'));

  if (isNaN(eventId)) {
    return c.json({ error: 'ID do evento deve ser um número' }, 400);
  }

  try {
    const { data: participants, error } = await supabase
      .from('event_participants')
      .select(`
        *,
        members(id, name, email, phone)
      `)
      .eq('event_id', eventId)
      .order('registered_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar participantes:', error);
      return c.json({ error: 'Erro ao buscar participantes' }, 500);
    }

    return c.json(participants || []);
  } catch (error) {
    console.error('Erro interno ao buscar participantes:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// POST /api/events/:id/participants - Inscrever membro no evento
app.post('/api/events/:id/participants', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);
  const eventId = parseInt(c.req.param('id'));
  const { member_id, notes } = await c.req.json();

  if (isNaN(eventId)) {
    return c.json({ error: 'ID do evento deve ser um número' }, 400);
  }

  if (!member_id || isNaN(member_id)) {
    return c.json({ error: 'ID do membro é obrigatório e deve ser um número' }, 400);
  }

  try {
    // Verificar se o evento existe
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, max_participants')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return c.json({ error: 'Evento não encontrado' }, 404);
    }

    // Verificar se o membro existe
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id')
      .eq('id', member_id)
      .single();

    if (memberError || !member) {
      return c.json({ error: 'Membro não encontrado' }, 404);
    }

    // Verificar se já está inscrito
    const { data: existingParticipant } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('member_id', member_id)
      .single();

    if (existingParticipant) {
      return c.json({ error: 'Membro já está inscrito neste evento' }, 409);
    }

    // Verificar limite de participantes
    if (event.max_participants) {
      const { count, error: countError } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      if (countError) {
        console.error('Erro ao contar participantes:', countError);
        return c.json({ error: 'Erro ao verificar limite de participantes' }, 500);
      }

      if (count && count >= event.max_participants) {
        return c.json({ error: 'Evento já atingiu o limite máximo de participantes' }, 409);
      }
    }

    const { data: newParticipant, error } = await supabase
      .from('event_participants')
      .insert({
        event_id: eventId,
        member_id: member_id,
        status: 'confirmed',
        notes: notes?.trim() || null
      })
      .select(`
        *,
        members(id, name, email, phone)
      `)
      .single();

    if (error) {
      console.error('Erro ao inscrever participante:', error);
      return c.json({ error: 'Erro ao inscrever participante' }, 500);
    }

    return c.json(newParticipant, 201);
  } catch (error) {
    console.error('Erro interno ao inscrever participante:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// DELETE /api/events/:id/participants/:memberId - Cancelar inscrição
app.delete('/api/events/:id/participants/:memberId', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);
  const eventId = parseInt(c.req.param('id'));
  const memberId = parseInt(c.req.param('memberId'));

  if (isNaN(eventId) || isNaN(memberId)) {
    return c.json({ error: 'IDs devem ser números válidos' }, 400);
  }

  try {
    // Verificar se a inscrição existe
    const { data: participant, error: fetchError } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('member_id', memberId)
      .single();

    if (fetchError || !participant) {
      return c.json({ error: 'Inscrição não encontrada' }, 404);
    }

    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('member_id', memberId);

    if (error) {
      console.error('Erro ao cancelar inscrição:', error);
      return c.json({ error: 'Erro ao cancelar inscrição' }, 500);
    }

    return c.json({ message: 'Inscrição cancelada com sucesso' });
  } catch (error) {
    console.error('Erro interno ao cancelar inscrição:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ===== COMMUNICATION API =====

// Schema para validação de avisos
const AnnouncementSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(200, 'Título muito longo'),
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres').max(2000, 'Conteúdo muito longo'),
  announcement_type: z.enum(['general', 'urgent', 'department', 'event', 'financial']),
  target_audience: z.enum(['all', 'members', 'leaders', 'department', 'specific']),
  department_id: z.union([z.number().positive(), z.string(), z.null()]).optional().nullable(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  expires_at: z.string().optional().nullable(),
  is_published: z.boolean().default(false),
  is_pinned: z.boolean().default(false),
});

// GET /api/announcements - Listar avisos (temporariamente sem auth para debug)
app.get('/api/announcements', async (c) => {
  const supabase = createSupabaseClient(c.env);
  const { published, type, audience, limit } = c.req.query();

  try {
    let query = supabase
      .from('announcements')
      .select(`
        *,
        department:departments(id, name)
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    // Filtros opcionais
    if (published === 'true') {
      query = query.eq('is_published', true);
    }
    if (type) {
      query = query.eq('announcement_type', type);
    }
    if (audience) {
      query = query.eq('target_audience', audience);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching announcements:', error);
      return c.json({ error: 'Erro ao carregar avisos' }, 500);
    }

    // Filtrar avisos expirados
    const now = new Date();
    const validAnnouncements = (data || []).filter(announcement => {
      if (!(announcement as any).expires_at) return true;
      return new Date((announcement as any).expires_at) > now;
    });

    return c.json(validAnnouncements);
  } catch (error) {
    console.error('Error in GET /api/announcements:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/announcements/:id - Buscar aviso específico (temporariamente sem auth para debug)
app.get('/api/announcements/:id', async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseClient(c.env);

  try {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        department:departments(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Aviso não encontrado' }, 404);
      }
      console.error('Error fetching announcement:', error);
      return c.json({ error: 'Erro ao carregar aviso' }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error('Error in GET /api/announcements/:id:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// POST /api/announcements - Criar novo aviso
app.post('/api/announcements', supabaseAuthMiddleware, zValidator('json', AnnouncementSchema), async (c) => {
  const announcementData = c.req.valid('json');
  const user = c.get('user');
  const supabase = createSupabaseClient(c.env);

  try {
    const cleanData = {
      title: announcementData.title.trim(),
      content: announcementData.content.trim(),
      announcement_type: announcementData.announcement_type,
      target_audience: announcementData.target_audience,
      department_id: announcementData.department_id && announcementData.department_id !== ''
        ? (typeof announcementData.department_id === 'string'
          ? parseInt(announcementData.department_id)
          : announcementData.department_id)
        : null,
      priority: announcementData.priority,
      expires_at: announcementData.expires_at && announcementData.expires_at !== ''
        ? announcementData.expires_at
        : null,
      is_published: announcementData.is_published,
      is_pinned: announcementData.is_pinned,
      created_by: user.id,
      published_at: announcementData.is_published ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('announcements')
      .insert([cleanData])
      .select(`
        *,
        department:departments(id, name)
      `)
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return c.json({ error: 'Erro ao criar aviso' }, 500);
    }

    return c.json(data, 201);
  } catch (error) {
    console.error('Error in POST /api/announcements:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// PUT /api/announcements/:id - Atualizar aviso
app.put('/api/announcements/:id', supabaseAuthMiddleware, zValidator('json', AnnouncementSchema), async (c) => {
  const id = c.req.param('id');
  const announcementData = c.req.valid('json');
  const supabase = createSupabaseClient(c.env);

  try {
    const cleanData = {
      title: announcementData.title.trim(),
      content: announcementData.content.trim(),
      announcement_type: announcementData.announcement_type,
      target_audience: announcementData.target_audience,
      department_id: announcementData.department_id || null,
      priority: announcementData.priority,
      expires_at: announcementData.expires_at || null,
      is_published: announcementData.is_published,
      is_pinned: announcementData.is_pinned,
      updated_at: new Date().toISOString(),
    };

    // Se está sendo publicado agora, definir published_at
    if (announcementData.is_published) {
      const { data: current } = await supabase
        .from('announcements')
        .select('is_published')
        .eq('id', id)
        .single();

      if (current && !current.is_published) {
        (cleanData as any).published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('announcements')
      .update(cleanData)
      .eq('id', id)
      .select(`
        *,
        department:departments(id, name)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Aviso não encontrado' }, 404);
      }
      console.error('Error updating announcement:', error);
      return c.json({ error: 'Erro ao atualizar aviso' }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error('Error in PUT /api/announcements/:id:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// DELETE /api/announcements/:id - Excluir aviso
app.delete('/api/announcements/:id', supabaseAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseClient(c.env);

  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting announcement:', error);
      return c.json({ error: 'Erro ao excluir aviso' }, 500);
    }

    return c.json({ message: 'Aviso excluído com sucesso' });
  } catch (error) {
    console.error('Error in DELETE /api/announcements/:id:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// POST /api/announcements/:id/read - Marcar aviso como lido
app.post('/api/announcements/:id/read', supabaseAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const supabase = createSupabaseClient(c.env);

  try {
    const { error } = await supabase
      .from('announcement_reads')
      .upsert([{
        announcement_id: parseInt(id),
        user_id: user.id,
        read_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error marking announcement as read:', error);
      return c.json({ error: 'Erro ao marcar como lido' }, 500);
    }

    return c.json({ message: 'Aviso marcado como lido' });
  } catch (error) {
    console.error('Error in POST /api/announcements/:id/read:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/announcements/stats - Estatísticas de avisos (temporariamente sem auth para debug)
app.get('/api/announcements/stats', async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('id, announcement_type, target_audience, is_published, is_pinned, created_at');

    if (error) {
      console.error('Error fetching announcement stats:', error);
      return c.json({ error: 'Erro ao carregar estatísticas' }, 500);
    }

    const stats = {
      total: announcements?.length || 0,
      published: announcements?.filter(a => a.is_published).length || 0,
      pinned: announcements?.filter(a => a.is_pinned).length || 0,
      byType: {
        general: announcements?.filter(a => a.announcement_type === 'general').length || 0,
        urgent: announcements?.filter(a => a.announcement_type === 'urgent').length || 0,
        department: announcements?.filter(a => a.announcement_type === 'department').length || 0,
        event: announcements?.filter(a => a.announcement_type === 'event').length || 0,
        financial: announcements?.filter(a => a.announcement_type === 'financial').length || 0,
      },
      byAudience: {
        all: announcements?.filter(a => a.target_audience === 'all').length || 0,
        members: announcements?.filter(a => a.target_audience === 'members').length || 0,
        leaders: announcements?.filter(a => a.target_audience === 'leaders').length || 0,
        department: announcements?.filter(a => a.target_audience === 'department').length || 0,
        specific: announcements?.filter(a => a.target_audience === 'specific').length || 0,
      }
    };

    return c.json(stats);
  } catch (error) {
    console.error('Error in GET /api/announcements/stats:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ===== CHURCH SETTINGS API =====

// GET /api/settings - Obter configurações da igreja
app.get('/api/settings', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    const { data, error } = await supabase
      .from('church_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching church settings:', error);
      return c.json({ error: 'Erro ao carregar configurações' }, 500);
    }

    return c.json(data || {});
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// PUT /api/settings - Atualizar configurações da igreja
app.put('/api/settings', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    const body = await c.req.json();

    // Validar dados básicos
    const settingsData = {
      church_name: body.church_name?.trim() || 'Minha Igreja',
      church_address: body.church_address?.trim() || null,
      church_phone: body.church_phone?.trim() || null,
      church_email: body.church_email?.trim() || null,
      church_website: body.church_website?.trim() || null,
      logo_url: body.logo_url?.trim() || null,
      primary_color: body.primary_color?.trim() || '#3B82F6',
      secondary_color: body.secondary_color?.trim() || '#10B981',
      timezone: body.timezone?.trim() || 'America/Sao_Paulo',
      currency: body.currency?.trim() || 'BRL',
      language: body.language?.trim() || 'pt-BR',
      updated_at: new Date().toISOString(),
    };

    // Verificar se já existe configuração
    const { data: existing } = await supabase
      .from('church_settings')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existing) {
      // Atualizar configuração existente
      const { data, error } = await supabase
        .from('church_settings')
        .update(settingsData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating church settings:', error);
        return c.json({ error: 'Erro ao atualizar configurações' }, 500);
      }
      result = data;
    } else {
      // Criar nova configuração
      const { data, error } = await supabase
        .from('church_settings')
        .insert([settingsData])
        .select()
        .single();

      if (error) {
        console.error('Error creating church settings:', error);
        return c.json({ error: 'Erro ao criar configurações' }, 500);
      }
      result = data;
    }

    return c.json(result);
  } catch (error) {
    console.error('Error in PUT /api/settings:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ===== REPORTS API =====

// GET /api/reports/members - Relatório de membros
app.get('/api/reports/members', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);
  const { status, department_id, age_min, age_max } = c.req.query();

  try {
    let query = supabase
      .from('members')
      .select(`
        id, name, email, phone, birth_date, address, baptism_date,
        gender, marital_status, is_active, notes, created_at
      `)
      .order('name', { ascending: true });

    // Filtros opcionais
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    const { data: members, error } = await query;

    if (error) {
      console.error('Error fetching members report:', error);
      return c.json({ error: 'Erro ao gerar relatório de membros' }, 500);
    }

    // Filtrar por idade se especificado
    let filteredMembers = members || [];
    if (age_min || age_max) {
      filteredMembers = filteredMembers.filter(member => {
        if (!member.birth_date) return false;
        const age = new Date().getFullYear() - new Date(member.birth_date).getFullYear();
        if (age_min && age < parseInt(age_min)) return false;
        if (age_max && age > parseInt(age_max)) return false;
        return true;
      });
    }

    // Calcular estatísticas
    const stats = {
      total: filteredMembers.length,
      active: filteredMembers.filter(m => m.is_active).length,
      inactive: filteredMembers.filter(m => !m.is_active).length,
      withEmail: filteredMembers.filter(m => m.email).length,
      withPhone: filteredMembers.filter(m => m.phone).length,
      baptized: filteredMembers.filter(m => m.baptism_date).length,
      byGender: {
        masculino: filteredMembers.filter(m => m.gender === 'masculino').length,
        feminino: filteredMembers.filter(m => m.gender === 'feminino').length,
        outro: filteredMembers.filter(m => m.gender === 'outro').length,
        naoInformado: filteredMembers.filter(m => !m.gender).length,
      },
      byMaritalStatus: {
        solteiro: filteredMembers.filter(m => m.marital_status === 'solteiro').length,
        casado: filteredMembers.filter(m => m.marital_status === 'casado').length,
        divorciado: filteredMembers.filter(m => m.marital_status === 'divorciado').length,
        viuvo: filteredMembers.filter(m => m.marital_status === 'viuvo').length,
        uniao_estavel: filteredMembers.filter(m => m.marital_status === 'uniao_estavel').length,
        naoInformado: filteredMembers.filter(m => !m.marital_status).length,
      }
    };

    return c.json({
      members: filteredMembers,
      stats,
      generatedAt: new Date().toISOString(),
      filters: { status, department_id, age_min, age_max }
    });
  } catch (error) {
    console.error('Error in GET /api/reports/members:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/reports/financial - Relatório financeiro
app.get('/api/reports/financial', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);
  const { start_date, end_date, type, category } = c.req.query();

  try {
    console.log('=== Filtros de Relatório Financeiro ===');
    console.log('start_date:', start_date);
    console.log('end_date:', end_date);
    console.log('type:', type);
    console.log('category:', category);

    let query = supabase
      .from('financial_transactions')
      .select(`
        id, type, amount, description, category, date,
        created_at, updated_at
      `)
      .order('date', { ascending: false });

    // Aplicar filtros na query do Supabase
    if (start_date) {
      console.log('Aplicando filtro start_date:', start_date);
      query = query.gte('date', start_date);
    }
    if (end_date) {
      console.log('Aplicando filtro end_date:', end_date);
      query = query.lte('date', end_date);
    }
    if (type) {
      console.log('Aplicando filtro type:', type);
      query = query.eq('type', type);
    }
    if (category) {
      console.log('Aplicando filtro category:', category);
      query = query.ilike('category', `%${category}%`);
    }

    const { data: transactions, error } = await query;

    if (error) {
      console.error('Error fetching financial report:', error);
      return c.json({ error: 'Erro ao gerar relatório financeiro' }, 500);
    }

    console.log('=== Transações Encontradas ===');
    console.log('Total de transações:', transactions?.length || 0);

    // Log das primeiras 3 transações para debug
    if (transactions && transactions.length > 0) {
      console.log('Primeiras transações:');
      transactions.slice(0, 3).forEach((t, i) => {
        console.log(`${i + 1}. Data: ${t.date}, Tipo: ${t.type}, Valor: ${t.amount}, Descrição: ${t.description}`);
      });
    }

    // Filtrar rigorosamente no código para garantir que as datas estão corretas
    let filteredTransactions = transactions || [];

    if (start_date || end_date) {
      console.log('=== Aplicando Filtro Rigoroso de Data ===');
      console.log('Período solicitado:', start_date, 'até', end_date);

      filteredTransactions = filteredTransactions.filter(transaction => {
        // Normalizar datas para comparação
        const transactionDate = new Date(transaction.date + 'T00:00:00.000Z');
        const startDateObj = start_date ? new Date(start_date + 'T00:00:00.000Z') : null;
        const endDateObj = end_date ? new Date(end_date + 'T23:59:59.999Z') : null;

        let isInRange = true;

        if (startDateObj) {
          isInRange = isInRange && transactionDate >= startDateObj;
          console.log(`Data transação: ${transaction.date} (${transactionDate.toISOString()}) >= ${start_date} (${startDateObj.toISOString()}) = ${transactionDate >= startDateObj}`);
        }

        if (endDateObj) {
          isInRange = isInRange && transactionDate <= endDateObj;
          console.log(`Data transação: ${transaction.date} (${transactionDate.toISOString()}) <= ${end_date} (${endDateObj.toISOString()}) = ${transactionDate <= endDateObj}`);
        }

        if (!isInRange) {
          console.log(`❌ REMOVIDA: ${transaction.date} - ${transaction.description} - ${transaction.type} - R$ ${transaction.amount}`);
        } else {
          console.log(`✅ INCLUÍDA: ${transaction.date} - ${transaction.description} - ${transaction.type} - R$ ${transaction.amount}`);
        }

        return isInRange;
      });

      console.log('=== Resultado Final ===');
      console.log('Total após filtro:', filteredTransactions.length);
      console.log('Transações no período:');
      filteredTransactions.forEach(t => {
        console.log(`  - ${t.date}: ${t.description} (${t.type}) - R$ ${t.amount}`);
      });
    }

    // Calcular estatísticas usando as transações filtradas
    const receitas = filteredTransactions.filter(t => t.type === 'receita') || [];
    const despesas = filteredTransactions.filter(t => t.type === 'despesa') || [];

    const totalReceitas = receitas.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalDespesas = despesas.reduce((sum, t) => sum + (t.amount || 0), 0);

    // Agrupar por categoria
    const receitasPorCategoria = receitas.reduce((acc, t) => {
      const cat = t.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const despesasPorCategoria = despesas.reduce((acc, t) => {
      const cat = t.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    // Agrupar por mês (apenas transações filtradas)
    const transacoesPorMes = filteredTransactions.reduce((acc, t) => {
      const mes = new Date(t.date).toISOString().substring(0, 7); // YYYY-MM
      if (!acc[mes]) {
        acc[mes] = { receitas: 0, despesas: 0, saldo: 0 };
      }
      if (t.type === 'receita') {
        acc[mes].receitas += t.amount;
      } else {
        acc[mes].despesas += t.amount;
      }
      acc[mes].saldo = acc[mes].receitas - acc[mes].despesas;
      return acc;
    }, {} as Record<string, any>);

    const stats = {
      totalTransactions: filteredTransactions.length,
      totalReceitas,
      totalDespesas,
      saldoTotal: totalReceitas - totalDespesas,
      receitasPorCategoria,
      despesasPorCategoria,
      transacoesPorMes,
      periodoAnalise: {
        inicio: start_date || 'Início dos registros',
        fim: end_date || 'Hoje',
        dias: start_date && end_date
          ? Math.ceil((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
          : null
      }
    };

    console.log('=== Estatísticas Calculadas ===');
    console.log('Total transações filtradas:', stats.totalTransactions);
    console.log('Total receitas:', stats.totalReceitas);
    console.log('Total despesas:', stats.totalDespesas);
    console.log('Período:', stats.periodoAnalise);

    return c.json({
      transactions: filteredTransactions,
      stats,
      generatedAt: new Date().toISOString(),
      filters: { start_date, end_date, type, category }
    });
  } catch (error) {
    console.error('Error in GET /api/reports/financial:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/reports/departments - Relatório de departamentos
app.get('/api/reports/departments', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);
  const { status, category } = c.req.query();

  try {
    let query = supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    // Filtros opcionais
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data: departments, error } = await query;

    if (error) {
      console.error('Error fetching departments report:', error);
      return c.json({ error: 'Erro ao gerar relatório de departamentos' }, 500);
    }

    // Buscar nomes dos líderes para cada departamento
    const departmentsWithLeaders = await Promise.all(
      (departments || []).map(async (dept) => {
        let leaderIds: number[] = [];

        if (dept.leaders) {
          if (Array.isArray(dept.leaders)) {
            leaderIds = dept.leaders;
          } else if (typeof dept.leaders === 'string') {
            try {
              leaderIds = JSON.parse(dept.leaders);
            } catch {
              leaderIds = [];
            }
          }
        }

        if (leaderIds.length > 0) {
          const { data: members } = await supabase
            .from('members')
            .select('id, name, email, phone')
            .in('id', leaderIds);

          return {
            ...dept,
            leaders: leaderIds,
            leader_details: members || []
          };
        }
        return {
          ...dept,
          leaders: [],
          leader_details: []
        };
      })
    );

    // Calcular estatísticas
    const stats = {
      total: departmentsWithLeaders.length,
      active: departmentsWithLeaders.filter(d => d.is_active).length,
      inactive: departmentsWithLeaders.filter(d => !d.is_active).length,
      withLeaders: departmentsWithLeaders.filter(d => d.leaders.length > 0).length,
      withoutLeaders: departmentsWithLeaders.filter(d => d.leaders.length === 0).length,
      withMeetings: departmentsWithLeaders.filter(d => d.meeting_datetime).length,
      byCategory: departmentsWithLeaders.reduce((acc, d) => {
        const cat = d.category || 'Outros';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalLeaders: departmentsWithLeaders.reduce((sum, d) => sum + d.leaders.length, 0)
    };

    return c.json({
      departments: departmentsWithLeaders,
      stats,
      generatedAt: new Date().toISOString(),
      filters: { status, category }
    });
  } catch (error) {
    console.error('Error in GET /api/reports/departments:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/reports/events - Relatório de eventos
app.get('/api/reports/events', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);
  const { start_date, end_date, event_type, status } = c.req.query();

  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('start_datetime', { ascending: false });

    // Filtros opcionais
    if (start_date) {
      query = query.gte('start_datetime', start_date);
    }
    if (end_date) {
      query = query.lte('start_datetime', end_date);
    }
    if (event_type) {
      query = query.eq('event_type', event_type);
    }
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching events report:', error);
      return c.json({ error: 'Erro ao gerar relatório de eventos' }, 500);
    }

    // Calcular estatísticas
    const now = new Date();
    const eventosPassados = events?.filter(e => new Date(e.start_datetime) < now) || [];
    const eventosFuturos = events?.filter(e => new Date(e.start_datetime) >= now) || [];

    const stats = {
      total: events?.length || 0,
      active: events?.filter(e => e.is_active).length || 0,
      inactive: events?.filter(e => !e.is_active).length || 0,
      passados: eventosPassados.length,
      futuros: eventosFuturos.length,
      byType: {
        culto: events?.filter(e => e.event_type === 'culto').length || 0,
        reuniao: events?.filter(e => e.event_type === 'reuniao').length || 0,
        evento_especial: events?.filter(e => e.event_type === 'evento_especial').length || 0,
      },
      withLocation: events?.filter(e => e.location).length || 0,
      withMaxParticipants: events?.filter(e => e.max_participants).length || 0,
      requireConfirmation: events?.filter(e => e.requires_confirmation).length || 0,
    };

    return c.json({
      events: events || [],
      stats,
      generatedAt: new Date().toISOString(),
      filters: { start_date, end_date, event_type, status }
    });
  } catch (error) {
    console.error('Error in GET /api/reports/events:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ===== USERS AND PERMISSIONS API =====

// GET /api/users/test - Teste sem autenticação
app.get('/api/users/test', async (c) => {
  return c.json([
    {
      id: '1',
      email: 'test@igreja.com',
      name: 'Usuário Teste',
      role: 'Administrador',
      permissions: [],
      is_active: true,
      userPermissions: [],
      churchRole: 'Administrador',
      google_user_data: {
        name: 'Usuário Teste',
        picture: null
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);
});

// GET /api/check-migration - Verificar se as tabelas existem
app.get('/api/check-migration', async (c) => {
  const supabase = createSupabaseClient(c.env);
  
  try {
    // Tentar acessar a tabela church_users
    const { error } = await supabase
      .from('church_users')
      .select('count')
      .limit(1);
    
    if (error) {
      return c.json({ 
        migrationNeeded: true, 
        error: error.message,
        message: 'Tabela church_users não existe. Execute a migração.' 
      });
    }
    
    return c.json({ 
      migrationNeeded: false, 
      message: 'Migração já executada. Tabelas existem.' 
    });
  } catch (error) {
    return c.json({ 
      migrationNeeded: true, 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      message: 'Erro ao verificar migração. Execute a migração.' 
    });
  }
});

// GET /api/debug/users - Debug: listar usuários sem autenticação
app.get('/api/debug/users', async (c) => {
  const supabase = createSupabaseClient(c.env);
  
  try {
    const { data: users, error } = await supabase
      .from('church_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return c.json({ 
        error: error.message,
        message: 'Erro ao buscar usuários' 
      });
    }
    
    return c.json({ 
      users: users || [],
      count: users?.length || 0,
      message: 'Usuários encontrados na tabela church_users' 
    });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      message: 'Erro ao buscar usuários' 
    });
  }
});

// GET /api/users - Listar todos os usuários (temporariamente sem auth para debug)
app.get('/api/users', async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    console.log('=== API /api/users chamada (sem auth) ===');

    const { data: users, error } = await supabase
      .from('church_users')
      .select(`
        id, email, name, role, permissions, is_active, phone, birth_date, 
        address, avatar_url, created_at, updated_at
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      return c.json({ error: 'Erro ao carregar usuários', details: error.message }, 500);
    }

    console.log('Users found:', users?.length || 0);

    // Enriquecer dados dos usuários com informações do Google
    const enrichedUsers = users?.map(user => ({
      ...user,
      userPermissions: user.permissions || [],
      churchRole: user.role || 'Membro',
      google_user_data: {
        name: user.name,
        picture: user.avatar_url
      }
    })) || [];

    console.log('Enriched users:', enrichedUsers.length);
    return c.json(enrichedUsers);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return c.json({ error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// GET /api/debug/permissions - Debug: listar permissões sem autenticação
app.get('/api/debug/permissions', async (c) => {
  const supabase = createSupabaseClient(c.env);
  
  try {
    const { data: permissions, error } = await supabase
      .from('permissions')
      .select('*')
      .order('module', { ascending: true })
      .order('action', { ascending: true });
    
    if (error) {
      return c.json({ 
        error: error.message,
        message: 'Erro ao buscar permissões' 
      });
    }
    
    return c.json({ 
      permissions: permissions || [],
      count: permissions?.length || 0,
      message: 'Permissões encontradas na tabela permissions' 
    });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      message: 'Erro ao buscar permissões' 
    });
  }
});

// GET /api/debug/announcements - Debug: listar avisos sem autenticação
app.get('/api/debug/announcements', async (c) => {
  const supabase = createSupabaseClient(c.env);
  
  try {
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return c.json({ 
        error: error.message,
        message: 'Erro ao buscar avisos' 
      });
    }
    
    return c.json({ 
      announcements: announcements || [],
      count: announcements?.length || 0,
      message: 'Avisos encontrados na tabela announcements' 
    });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      message: 'Erro ao buscar avisos' 
    });
  }
});

// GET /api/permissions - Listar todas as permissões disponíveis (temporariamente sem auth para debug)
app.get('/api/permissions', async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    console.log('=== API /api/permissions chamada (sem auth) ===');

    const { data: permissions, error } = await supabase
      .from('permissions')
      .select('*')
      .order('module', { ascending: true })
      .order('action', { ascending: true });

    if (error) {
      console.error('Error fetching permissions:', error);
      return c.json({ error: 'Erro ao carregar permissões', details: error.message }, 500);
    }

    console.log('Permissions found:', permissions?.length || 0);
    return c.json(permissions || []);
  } catch (error) {
    console.error('Error in GET /api/permissions:', error);
    return c.json({ error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// PUT /api/users/:id/permissions - Atualizar permissões de um usuário
app.put('/api/users/:id/permissions', supabaseAuthMiddleware, async (c) => {
  const userId = c.req.param('id');
  const currentUser = c.get('user');
  const supabase = createSupabaseClient(c.env);

  try {
    // Verificar se o usuário atual tem permissão para gerenciar usuários
    const { data: currentUserData } = await supabase
      .from('church_users')
      .select('role, permissions')
      .eq('id', currentUser.id)
      .single();

    if (!currentUserData || currentUserData.role !== 'Administrador') {
      return c.json({ error: 'Acesso negado. Apenas administradores podem gerenciar permissões.' }, 403);
    }

    const body = await c.req.json();
    const { role, permissions } = body;

    // Validar dados
    if (!role || !Array.isArray(permissions)) {
      return c.json({ error: 'Dados inválidos. Role e permissions são obrigatórios.' }, 400);
    }

    // Atualizar usuário
    const { data, error } = await supabase
      .from('church_users')
      .update({
        role: role,
        permissions: permissions,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user permissions:', error);
      return c.json({ error: 'Erro ao atualizar permissões do usuário' }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error('Error in PUT /api/users/:id/permissions:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/users/current - Obter dados do usuário atual
app.get('/api/users/current', supabaseAuthMiddleware, async (c) => {
  const currentUser = c.get('user');
  const supabase = createSupabaseClient(c.env);

  try {
    const { data: userData, error } = await supabase
      .from('church_users')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('Error fetching current user:', error);
      return c.json({ error: 'Erro ao carregar dados do usuário' }, 500);
    }

    return c.json({
      ...userData,
      userPermissions: userData.permissions || [],
      churchRole: userData.role || 'Membro'
    });
  } catch (error) {
    console.error('Error in GET /api/users/current:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// PUT /api/users/:id/status - Ativar/desativar usuário
app.put('/api/users/:id/status', supabaseAuthMiddleware, async (c) => {
  const userId = c.req.param('id');
  const currentUser = c.get('user');
  const supabase = createSupabaseClient(c.env);

  try {
    // Verificar se o usuário atual tem permissão para gerenciar usuários
    const { data: currentUserData } = await supabase
      .from('church_users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (!currentUserData || currentUserData.role !== 'Administrador') {
      return c.json({ error: 'Acesso negado. Apenas administradores podem gerenciar usuários.' }, 403);
    }

    const body = await c.req.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return c.json({ error: 'Status inválido' }, 400);
    }

    // Não permitir desativar o próprio usuário
    if (userId === currentUser.id && !is_active) {
      return c.json({ error: 'Você não pode desativar sua própria conta' }, 400);
    }

    const { data, error } = await supabase
      .from('church_users')
      .update({
        is_active: is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user status:', error);
      return c.json({ error: 'Erro ao atualizar status do usuário' }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error('Error in PUT /api/users/:id/status:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/roles - Listar papéis disponíveis
app.get('/api/roles', supabaseAuthMiddleware, async (c) => {
  const supabase = createSupabaseClient(c.env);

  try {
    const { data: roles, error } = await supabase
      .from('custom_roles')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching roles:', error);
      return c.json({ error: 'Erro ao carregar papéis' }, 500);
    }

    return c.json(roles || []);
  } catch (error) {
    console.error('Error in GET /api/roles:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// GET /api/roles/:name/permissions - Obter permissões de um papel
app.get('/api/roles/:name/permissions', supabaseAuthMiddleware, async (c) => {
  const roleName = c.req.param('name');
  const supabase = createSupabaseClient(c.env);

  try {
    const { data: rolePermissions, error } = await supabase
      .from('role_permissions')
      .select(`
        permission_id,
        permissions (
          id, name, description, module, action
        )
      `)
      .eq('role_name', roleName);

    if (error) {
      console.error('Error fetching role permissions:', error);
      return c.json({ error: 'Erro ao carregar permissões do papel' }, 500);
    }

    const permissions = rolePermissions?.map(rp => rp.permissions).filter(Boolean) || [];
    return c.json(permissions);
  } catch (error) {
    console.error('Error in GET /api/roles/:name/permissions:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// POST /api/users/sync - Sincronizar usuário após login
app.post('/api/users/sync', supabaseAuthMiddleware, async (c) => {
  const currentUser = c.get('user');
  const supabase = createSupabaseClient(c.env);

  try {
    // Verificar se o usuário já existe na tabela church_users
    const { data: existingUser, error: fetchError } = await supabase
      .from('church_users')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing user:', fetchError);
      return c.json({ error: 'Erro ao verificar usuário' }, 500);
    }

    if (!existingUser) {
      // Criar novo usuário na tabela church_users
      const { data: newUser, error: insertError } = await supabase
        .from('church_users')
        .insert([{
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email,
          avatar_url: currentUser.user_metadata?.avatar_url || null,
          role: 'Membro',
          permissions: [],
          is_active: true
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating new user:', insertError);
        return c.json({ error: 'Erro ao criar usuário' }, 500);
      }

      return c.json(newUser);
    }

    // Atualizar dados do usuário existente se necessário
    const updatedData: any = {};
    if (currentUser.user_metadata?.full_name && currentUser.user_metadata.full_name !== existingUser.name) {
      updatedData.name = currentUser.user_metadata.full_name;
    }
    if (currentUser.user_metadata?.avatar_url && currentUser.user_metadata.avatar_url !== existingUser.avatar_url) {
      updatedData.avatar_url = currentUser.user_metadata.avatar_url;
    }

    if (Object.keys(updatedData).length > 0) {
      updatedData.updated_at = new Date().toISOString();

      const { data: updatedUser, error: updateError } = await supabase
        .from('church_users')
        .update(updatedData)
        .eq('id', currentUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return c.json({ error: 'Erro ao atualizar usuário' }, 500);
      }

      return c.json(updatedUser);
    }

    return c.json(existingUser);
  } catch (error) {
    console.error('Error in POST /api/users/sync:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Catch-all para rotas não encontradas
app.all('*', (c) => {
  return c.json({ error: 'Rota não encontrada' }, 404);
});

export default app;
