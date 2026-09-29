import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchXianyuAccounts } from './xianyuApi';
import type { XianyuAccount } from './types';

// 当前账号本地存储键。
const CURRENT_ACCOUNT_STORAGE_KEY = 'sidejob.currentXianyuAccountId';

/** 闲鱼账号上下文值。 */
interface XianyuAccountContextValue {
  accounts: XianyuAccount[];
  currentAccount?: XianyuAccount;
  currentAccountId: string;
  isLoading: boolean;
  errorMessage: string;
  setCurrentAccountId: (accountId: string) => void;
  refreshAccounts: () => Promise<XianyuAccount[]>;
}

// 闲鱼账号上下文。
const XianyuAccountContext = createContext<XianyuAccountContextValue | null>(null);

/** 提供全站当前闲鱼账号及切换能力。 */
export function XianyuAccountProvider({ children }: { children: ReactNode }) {
  // 全部闲鱼账号。
  const [accounts, setAccounts] = useState<XianyuAccount[]>([]);
  // 当前账号 ID。
  const [currentAccountId, setCurrentAccountIdState] = useState(() => window.localStorage.getItem(CURRENT_ACCOUNT_STORAGE_KEY) ?? 'default');
  // 账号列表加载状态。
  const [isLoading, setIsLoading] = useState(true);
  // 账号列表错误。
  const [errorMessage, setErrorMessage] = useState('');

  /** 拉取账号列表并修正失效的当前选择。 */
  async function refreshAccounts(): Promise<XianyuAccount[]> {
    setIsLoading(true);
    try {
      const response = await fetchXianyuAccounts();
      const nextAccounts = response?.list ?? [];
      setAccounts(nextAccounts);
      setErrorMessage('');
      if (!nextAccounts.some((account) => account.id === currentAccountId)) {
        const fallbackAccount = nextAccounts.find((account) => account.isDefault) ?? nextAccounts[0];
        if (fallbackAccount) {
          setCurrentAccountIdState(fallbackAccount.id);
          window.localStorage.setItem(CURRENT_ACCOUNT_STORAGE_KEY, fallbackAccount.id);
        }
      }
      return nextAccounts;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '闲鱼账号读取失败');
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  /** 切换当前账号并持久化选择。 */
  function setCurrentAccountId(accountId: string) {
    setCurrentAccountIdState(accountId);
    window.localStorage.setItem(CURRENT_ACCOUNT_STORAGE_KEY, accountId);
  }

  useEffect(() => {
    void refreshAccounts();
  }, []);

  // 当前选中的闲鱼账号。
  const currentAccount = accounts.find((account) => account.id === currentAccountId) ?? accounts[0];
  // 稳定的上下文值。
  const contextValue = useMemo<XianyuAccountContextValue>(() => ({ accounts, currentAccount, currentAccountId: currentAccount?.id ?? currentAccountId, isLoading, errorMessage, setCurrentAccountId, refreshAccounts }), [accounts, currentAccount, currentAccountId, isLoading, errorMessage]);

  return <XianyuAccountContext.Provider value={contextValue}>{children}</XianyuAccountContext.Provider>;
}

/** 读取全站当前闲鱼账号。 */
export function useXianyuAccount(): XianyuAccountContextValue {
  const context = useContext(XianyuAccountContext);
  if (!context) {
    throw new Error('useXianyuAccount 必须在 XianyuAccountProvider 中使用');
  }
  return context;
}
