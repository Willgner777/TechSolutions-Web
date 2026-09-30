import React, { useEffect, useState } from 'react';
import { supabase } from './Admbases';
import { Truck, Users, Wrench, Fuel, AlertTriangle, TrendingUp } from 'lucide-react';

export default function DashboardPage({ userProfile }) {
  const [stats, setStats] = useState({ veiculos: 0, motoristas: 0, manutencoesPendentes: 0, gastoMes: 0 });
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.empresa_id) fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.empresa_id]);

  const fetchDashboardData = async () => {
    try {
      const empresaId = userProfile.empresa_id;

      // Consultas paralelas isoladas pelo tenant
      const [vRes, mRes, manRes, despRes, recAbs, recMan] = await Promise.all([
        supabase.from('veiculos').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId).eq('status', 'ativo'),
        supabase.from('motoristas').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId),
        supabase.from('manutencoes').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId).eq('status', 'pendente'),
        supabase.from('abastecimentos').select('valor_total').eq('empresa_id', empresaId),
        supabase.from('abastecimentos').select('id, data, valor_total, veiculos(placa)').eq('empresa_id', empresaId).order('data', { ascending: false }).limit(5),
        supabase.from('manutencoes').select('id, tipo, status, data_agendada, veiculos(placa)').eq('empresa_id', empresaId).order('data_agendada', { ascending: false }).limit(5)
      ]);

      const recentes = [
        ...(recAbs.data || []).map(a => ({
          id: 'a' + a.id, data: a.data, icon: 'fuel',
          texto: `Abastecimento ${a.veiculos?.placa || ''} - R$ ${Number(a.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        })),
        ...(recMan.data || []).map(m => ({
          id: 'm' + m.id, data: m.data_agendada, icon: 'wrench',
          texto: `Manutenção ${m.tipo || ''} ${m.veiculos?.placa || ''} (${m.status || 'pendente'})`
        }))
      ].sort((x, y) => String(y.data).localeCompare(String(x.data))).slice(0, 6);
      setAtividades(recentes);

      const totalGasto = despRes.data?.reduce((acc, curr) => acc + Number(curr.valor_total || 0), 0) || 0;

      setStats({
        veiculos: vRes.count || 0,
        motoristas: mRes.count || 0,
        manutencoesPendentes: manRes.count || 0,
        gastoMes: totalGasto
      });
    } catch (err) {
      console.error('Erro ao carregar métricas:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Veículos Ativos', value: stats.veiculos, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { title: 'Motoristas Registados', value: stats.motoristas, icon: Users, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Manutenções Pendentes', value: stats.manutencoesPendentes, icon: Wrench, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
    { title: 'Gasto Total Combustível', value: `R$ ${stats.gastoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Fuel, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Painel Operacional</h1>
        <p className="text-sm text-slate-500 mt-1">Bem-vindo à central de inteligência da sua frota.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse border border-slate-200"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className={`p-6 rounded-3xl bg-slate-50 border ${card.border} backdrop-blur-xl shadow-xl shadow-slate-200/60 flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-all`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">{card.title}</span>
                  <div className={`w-10 h-10 rounded-2xl ${card.bg} flex items-center justify-center ${card.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-800">{card.value}</h3>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-100/70 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Secção de Atalhos e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-50 border border-slate-200 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-600" /> Atividade Recente da Frota
          </h2>
          {atividades.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-2xl">
              Nenhuma atividade registada recentemente na base de dados.
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 text-sm">
              {atividades.map(a => (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    {a.icon === 'fuel' ? <Fuel size={16} /> : <Wrench size={16} />}
                  </span>
                  <span className="flex-1 text-slate-600">{a.texto}</span>
                  <span className="text-xs text-slate-400">{a.data ? String(a.data).split('-').reverse().join('/') : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-700" /> Alertas do Sistema
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {stats.manutencoesPendentes > 0
                ? `Existem ${stats.manutencoesPendentes} manutenção(ões) pendente(s) aguardando atendimento.`
                : 'Nenhum alerta no momento.'}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
            Segurança RLS ativa por tenant.
          </div>
        </div>
      </div>
    </div>
  );
}