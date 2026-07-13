import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { GoalsScreen } from './components/GoalsScreen';
import { AIAssistantScreen } from './components/AIAssistantScreen';
import { SmartAllocationModal } from './components/SmartAllocationModal';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { TransactionHistoryScreen } from './components/TransactionHistoryScreen';
import { ManageWalletsScreen } from './components/ManageWalletsScreen';
import type { Wallet } from './components/ManageWalletsScreen';
import { GoalPrioritizationScreen } from './components/GoalPrioritizationScreen';
import type { PriorityStrategy, SAWWeights } from './components/GoalPrioritizationScreen';
import { EditProfileScreen } from './components/EditProfileScreen';
import type { UserProfile } from './components/EditProfileScreen';
import { PendingAllocationsScreen } from './components/PendingAllocationsScreen';
import type { PendingSuggestion } from './components/PendingAllocationsScreen';

export type Transaction = {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  note: string;
  incomeType?: 'allowance' | 'side-income';
};

export type Goal = {
  id: number;
  name: string;
  target: number;
  collected: number;
  rank: number;
  deadline: string;
  importance: number;
};

export type ActiveTab = 'home' | 'dashboard' | 'goals' | 'ai' | 'profile';
type AppView = 'login' | 'register' | 'app';
type ProfileSubScreen = 'history' | 'wallets' | 'prioritization' | 'edit-profile' | 'pending-suggestions' | null;

export const formatRupiah = (amount: number) =>
  `Rp ${amount.toLocaleString('id-ID')}`;

const initialTransactions: Transaction[] = [
  { id: 1, amount: 1500000, type: 'income', category: 'Allowance', date: '2026-07-01', note: 'Uang bulanan Juli', incomeType: 'allowance' },
  { id: 2, amount: 500000, type: 'income', category: 'Freelance Income', date: '2026-07-05', note: 'Project desain logo', incomeType: 'side-income' },
  { id: 3, amount: 320000, type: 'expense', category: 'Food & Drink', date: '2026-07-03', note: '' },
  { id: 4, amount: 150000, type: 'expense', category: 'Transportation', date: '2026-07-04', note: '' },
  { id: 5, amount: 200000, type: 'expense', category: 'Entertainment', date: '2026-07-06', note: 'Nonton bioskop' },
  { id: 6, amount: 80000, type: 'expense', category: 'Education', date: '2026-07-07', note: 'Buku catatan' },
  { id: 7, amount: 250000, type: 'expense', category: 'Bills', date: '2026-07-08', note: 'Pulsa & internet' },
  { id: 8, amount: 500000, type: 'expense', category: 'Housing', date: '2026-07-01', note: 'Kos bulan Juli' },
];

const initialGoals: Goal[] = [
  { id: 1, name: 'Beli Laptop', target: 8000000, collected: 3200000, rank: 1, deadline: '2026-12-31', importance: 5 },
  { id: 2, name: 'Dana Darurat', target: 5000000, collected: 3250000, rank: 2, deadline: '2026-09-30', importance: 4 },
  { id: 3, name: 'Liburan ke Bali', target: 3000000, collected: 390000, rank: 3, deadline: '2027-03-31', importance: 3 },
];

const initialWallets: Wallet[] = [
  { id: 1, name: 'Tunai', emoji: 'Banknote', balance: 350000, color: '#22C55E' },
  { id: 2, name: 'GoPay', emoji: 'Smartphone', balance: 280000, color: '#00AA13' },
  { id: 3, name: 'Bank BCA', emoji: 'Building2', balance: 1870000, color: '#005BAA' },
];

const initialWeights: SAWWeights = {
  importance: 30,
  progressGap: 25,
  capacity: 20,
  urgency: 15,
  targetAmount: 10,
};

const initialProfile: UserProfile = {
  name: 'Rania Putri',
  email: 'rania@mahasiswa.ac.id',
  phone: '0812-3456-7890',
  city: 'Jakarta',
};

export default function App() {
  const [appView, setAppView] = useState<AppView>('login');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [profileSubScreen, setProfileSubScreen] = useState<ProfileSubScreen>(null);

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [wallets, setWallets] = useState<Wallet[]>(initialWallets);
  const [strategy, setStrategy] = useState<PriorityStrategy>('quick-win');
  const [weights, setWeights] = useState<SAWWeights>(initialWeights);
  const [showAllocation, setShowAllocation] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [pendingSuggestions, setPendingSuggestions] = useState<PendingSuggestion[]>([]);
  // Suggestion being reviewed from the Pending screen
  const [reviewingSuggestion, setReviewingSuggestion] = useState<PendingSuggestion | null>(null);

  const balance = transactions.reduce(
    (acc, t) => (t.type === 'income' ? acc + t.amount : acc - t.amount),
    0
  );

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{ ...t, id: Date.now() }, ...prev]);
  };

  const addTransactions = (ts: Omit<Transaction, 'id'>[]) => {
    const now = Date.now();
    setTransactions(prev => [
      ...ts.map((t, i) => ({ ...t, id: now + i })),
      ...prev,
    ]);
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const editTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  };

  const updateGoalProgress = (goalId: number, amount: number) => {
    setGoals(prev =>
      prev.map(g =>
        g.id === goalId
          ? { ...g, collected: Math.min(g.collected + amount, g.target) }
          : g
      )
    );
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'rank' | 'collected'>) => {
    setGoals(prev => [
      ...prev,
      { ...goal, id: Date.now(), rank: prev.length + 1, collected: 0 },
    ]);
  };

  const addWallet = (name: string, emoji: string, balance: number, color: string) => {
    setWallets(prev => [...prev, { id: Date.now(), name, emoji, balance, color }]);
  };

  const editWallet = (id: number, name: string, emoji: string, balance: number, color: string) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, name, emoji, balance, color } : w));
  };

  const deleteWallet = (id: number) => {
    setWallets(prev => prev.filter(w => w.id !== id));
  };

  const addPendingSuggestion = (goalId: number, goalName: string, amount: number) => {
    setPendingSuggestions(prev => [
      {
        id: Date.now(),
        goalId,
        goalName,
        amount,
        suggestedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const removePendingSuggestion = (id: number) => {
    setPendingSuggestions(prev => prev.filter(s => s.id !== id));
  };

  // ─── AUTH SCREENS ─────────────────────────────────────────────────────────
  if (appView === 'login') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', backgroundColor: '#E8EEF4' }}>
        <div style={{ width: '100%', maxWidth: 430, height: '100%', boxShadow: '0 0 60px rgba(7,37,72,0.18)', overflow: 'hidden' }}>
          <LoginScreen
            onLogin={() => setAppView('app')}
            onGoRegister={() => setAppView('register')}
          />
        </div>
      </div>
    );
  }

  if (appView === 'register') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', backgroundColor: '#E8EEF4' }}>
        <div style={{ width: '100%', maxWidth: 430, height: '100%', boxShadow: '0 0 60px rgba(7,37,72,0.18)', overflow: 'hidden' }}>
          <RegisterScreen
            onRegister={() => setAppView('app')}
            onGoLogin={() => setAppView('login')}
          />
        </div>
      </div>
    );
  }

  // ─── MAIN APP ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', justifyContent: 'center',
        backgroundColor: '#E8EEF4',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 430,
          display: 'flex', flexDirection: 'column',
          height: '100%', backgroundColor: '#FCFCFC',
          boxShadow: '0 0 60px rgba(7,37,72,0.18)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {activeTab === 'home' && (
            <HomeScreen
              balance={balance}
              goals={goals}
              transactions={transactions}
              addTransaction={addTransaction}
              addTransactions={addTransactions}
              onShowAllocation={() => setShowAllocation(true)}
              updateGoalProgress={updateGoalProgress}
            />
          )}
          {activeTab === 'dashboard' && (
            <DashboardScreen transactions={transactions} goals={goals} />
          )}
          {activeTab === 'goals' && (
            <GoalsScreen
              goals={goals}
              addGoal={addGoal}
              updateGoalProgress={updateGoalProgress}
            />
          )}
          {activeTab === 'ai' && (
            <AIAssistantScreen goals={goals} transactions={transactions} />
          )}
          {activeTab === 'profile' && (
            <>
              {profileSubScreen === null && (
                <ProfileScreen
                  balance={balance}
                  transactionCount={transactions.length}
                  goalCount={goals.length}
                  pendingSuggestionsCount={pendingSuggestions.length}
                  onNavigateHistory={() => setProfileSubScreen('history')}
                  onNavigateWallets={() => setProfileSubScreen('wallets')}
                  onNavigatePrioritization={() => setProfileSubScreen('prioritization')}
                  onNavigatePendingSuggestions={() => setProfileSubScreen('pending-suggestions')}
                  onNavigateEditProfile={() => setProfileSubScreen('edit-profile')}
                  onLogout={() => setAppView('login')}
                />
              )}
              {profileSubScreen === 'history' && (
                <TransactionHistoryScreen
                  transactions={transactions}
                  onDelete={deleteTransaction}
                  onEdit={editTransaction}
                  onBack={() => setProfileSubScreen(null)}
                />
              )}
              {profileSubScreen === 'wallets' && (
                <ManageWalletsScreen
                  wallets={wallets}
                  onAddWallet={addWallet}
                  onEditWallet={editWallet}
                  onDeleteWallet={deleteWallet}
                  onBack={() => setProfileSubScreen(null)}
                />
              )}
              {profileSubScreen === 'prioritization' && (
                <GoalPrioritizationScreen
                  strategy={strategy}
                  weights={weights}
                  onStrategyChange={setStrategy}
                  onWeightsChange={setWeights}
                  onBack={() => setProfileSubScreen(null)}
                />
              )}
              {profileSubScreen === 'edit-profile' && (
                <EditProfileScreen
                  profile={profile}
                  onSave={p => setProfile(p)}
                  onBack={() => setProfileSubScreen(null)}
                />
              )}
              {profileSubScreen === 'pending-suggestions' && (
                <PendingAllocationsScreen
                  suggestions={pendingSuggestions}
                  goals={goals}
                  onReview={s => {
                    setReviewingSuggestion(s);
                    setProfileSubScreen(null);
                    setActiveTab('home');
                    setShowAllocation(true);
                  }}
                  onDismissAll={() => setPendingSuggestions([])}
                  onBack={() => setProfileSubScreen(null)}
                />
              )}
            </>
          )}
        </div>

        {/* Bottom Navigation — hide on sub-screens */}
        {!(activeTab === 'profile' && profileSubScreen !== null) && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={tab => {
              setProfileSubScreen(null);
              setActiveTab(tab);
            }}
          />
        )}

        {/* Smart Allocation Modal */}
        {showAllocation && (
          <SmartAllocationModal
            goals={goals}
            onConfirm={(goalId, amount) => {
              updateGoalProgress(goalId, amount);
              if (reviewingSuggestion) {
                removePendingSuggestion(reviewingSuggestion.id);
                setReviewingSuggestion(null);
              }
              setShowAllocation(false);
            }}
            onClose={() => {
              setReviewingSuggestion(null);
              setShowAllocation(false);
            }}
            onDismiss={(goalId, goalName, amount) => {
              addPendingSuggestion(goalId, goalName, amount);
            }}
          />
        )}
      </div>
    </div>
  );
}
