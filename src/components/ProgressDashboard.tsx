import { Trophy, Target, Calendar, Star } from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';

export function ProgressDashboard() {
  const { stats, categoryProgress, completedCases, getAchievements } = useProgressStore();
  const achievements = getAchievements();

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Stats Overview */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.totalCases}</div>
            <div className="text-purple-200 mt-1">Cases Completed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.averageScore || '--'}%</div>
            <div className="text-purple-200 mt-1">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.currentStreak}</div>
            <div className="text-purple-200 mt-1">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.longestStreak}</div>
            <div className="text-purple-200 mt-1">Best Streak</div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Achievements ({unlockedAchievements.length}/{achievements.length})
        </h3>

        {unlockedAchievements.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Unlocked</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {unlockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{achievement.name}</div>
                    <div className="text-xs text-gray-500">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lockedAchievements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Locked</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {lockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3 opacity-60"
                >
                  <span className="text-2xl grayscale">🔒</span>
                  <div>
                    <div className="font-medium text-gray-700">{achievement.name}</div>
                    <div className="text-xs text-gray-500">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Progress */}
      {Object.keys(categoryProgress).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Category Mastery
          </h3>
          <div className="space-y-4">
            {Object.entries(categoryProgress).map(([category, progress]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-sm text-gray-500">
                    {progress.completed}/{progress.total} cases | {progress.avgScore}% avg
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Cases */}
      {completedCases.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {completedCases.slice(-10).reverse().map((caseRecord, idx) => (
              <div
                key={`${caseRecord.mrn}-${idx}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">{caseRecord.category}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(caseRecord.date).toLocaleDateString()}
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ${
                    caseRecord.score >= 80 ? 'text-green-600' :
                    caseRecord.score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}
                >
                  {caseRecord.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.totalCases === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Progress Yet</h3>
          <p className="text-gray-500">
            Complete your first case to start tracking your progress!
          </p>
        </div>
      )}
    </div>
  );
}
