/* ===================================
   ORANGE — Admin Dashboard
   Users, analytics, system health.
   =================================== */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import api from '@/services/api';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  documentsProcessed: number;
  revenue: number;
  services: {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    latencyMs: number;
    requestsToday: number;
  }[];
  recentActivity: {
    user: string;
    action: string;
    service: string;
    timestamp: string;
  }[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch {
        // Mock data for development
        setStats({
          totalUsers: 247,
          activeUsers: 83,
          documentsProcessed: 12_458,
          revenue: 8_940,
          services: [
            { name: 'Google Vision (OCR)', status: 'healthy', latencyMs: 342, requestsToday: 156 },
            { name: 'DeepL (Translation)', status: 'healthy', latencyMs: 218, requestsToday: 89 },
            { name: 'ElevenLabs (TTS)', status: 'healthy', latencyMs: 1240, requestsToday: 34 },
            { name: 'Supabase (Vault)', status: 'healthy', latencyMs: 45, requestsToday: 312 },
          ],
          recentActivity: [
            { user: 'maria@law.gr', action: 'OCR Processing', service: 'ocr', timestamp: '2 min ago' },
            { user: 'george@pub.gr', action: 'Batch Translation', service: 'translate', timestamp: '5 min ago' },
            { user: 'athena@media.gr', action: 'Audiobook Generated', service: 'audiobook', timestamp: '12 min ago' },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-orange-text-muted">Loading admin data...</div>;
  }

  const kpis = [
    { label: 'Σύνολο Χρηστών', value: stats.totalUsers.toLocaleString(), icon: Users, color: '#3498db' },
    { label: 'Ενεργοί Σήμερα', value: stats.activeUsers.toLocaleString(), icon: Activity, color: '#2ecc71' },
    { label: 'Έγγραφα Processed', value: stats.documentsProcessed.toLocaleString(), icon: FileText, color: '#9b59b6' },
    { label: 'MRR', value: `€${stats.revenue.toLocaleString()}`, icon: DollarSign, color: '#f39c12' },
  ];

  return (
    <div className="min-h-screen bg-orange-bg-primary p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-orange-text-primary">Admin Dashboard</h1>
          <p className="text-sm text-orange-text-muted mt-1">ORANGE Platform Overview</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-orange-bg-secondary border border-orange-border rounded-xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${kpi.color}15` }}
                  >
                    <Icon size={20} style={{ color: kpi.color }} />
                  </div>
                  <span className="text-xs text-orange-text-muted">{kpi.label}</span>
                </div>
                <p className="text-2xl font-bold text-orange-text-primary font-mono">{kpi.value}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Health */}
          <div className="bg-orange-bg-secondary border border-orange-border rounded-xl p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-orange-text-primary mb-5">
              <Server size={16} className="text-orange-gold-mid" />
              Service Health
            </h3>
            <div className="space-y-3">
              {stats.services.map((svc) => (
                <div key={svc.name} className="flex items-center justify-between py-2 border-b border-orange-border last:border-0">
                  <div className="flex items-center gap-3">
                    {svc.status === 'healthy' ? (
                      <CheckCircle2 size={16} className="text-green-400" />
                    ) : (
                      <AlertTriangle size={16} className="text-yellow-400" />
                    )}
                    <span className="text-sm text-orange-text-primary">{svc.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-orange-text-muted">
                    <span className="font-mono">{svc.latencyMs}ms</span>
                    <span>{svc.requestsToday} req/day</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-orange-bg-secondary border border-orange-border rounded-xl p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-orange-text-primary mb-5">
              <TrendingUp size={16} className="text-orange-gold-mid" />
              Πρόσφατη Δραστηριότητα
            </h3>
            <div className="space-y-3">
              {stats.recentActivity.map((act, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-orange-border last:border-0">
                  <div>
                    <p className="text-sm text-orange-text-primary">{act.action}</p>
                    <p className="text-xs text-orange-text-muted">{act.user}</p>
                  </div>
                  <span className="text-xs text-orange-text-muted">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}