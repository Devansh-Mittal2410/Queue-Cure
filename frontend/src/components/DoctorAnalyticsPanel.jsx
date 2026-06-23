import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Clock, BarChart3 } from 'lucide-react';

const DoctorAnalyticsPanel = ({ analytics }) => {
  const stats = [
    {
      label: 'Patients Served',
      value: analytics?.served || 0,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Avg. Time per Patient',
      value: `${analytics?.avgTime || 0}m`,
      icon: Clock,
      color: 'teal',
    },
    {
      label: 'Peak Hour',
      value: analytics?.peakHour || 'N/A',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      label: 'Current Queue',
      value: analytics?.queueLength || 0,
      icon: BarChart3,
      color: 'green',
    },
  ];

  const colorClasses = {
    blue: 'from-blue-50 to-blue-100',
    teal: 'from-teal-50 to-teal-100',
    purple: 'from-purple-50 to-purple-100',
    green: 'from-green-50 to-green-100',
  };

  const chartData = analytics?.queueTrend || [
    { time: '9am', count: 5 },
    { time: '10am', count: 12 },
    { time: '11am', count: 18 },
    { time: '12pm', count: 14 },
    { time: '1pm', count: 8 },
  ];

  const maxCount = Math.max(...chartData.map((d) => d.count), 20);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${colorClasses[stat.color]} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 + 0.1 }}
                    className="text-3xl font-bold text-gray-900"
                  >
                    {stat.value}
                  </motion.div>
                </div>
                <Icon className="w-8 h-8 opacity-30" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Queue Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-6">Queue Length Trend</h3>

        <div className="space-y-6">
          {chartData.map((data, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">{data.time}</span>
                <span className="text-gray-900 font-semibold">{data.count} patients</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-xl p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-3">Daily Summary</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-700">
            <span className="font-semibold">Peak Hour:</span> {analytics?.peakHour || 'N/A'}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Efficiency Score:</span> {analytics?.efficiency || 'N/A'}%
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Avg. Satisfaction:</span> {analytics?.satisfaction || 'N/A'}/5
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorAnalyticsPanel;
