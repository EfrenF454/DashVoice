import { useEffect } from 'react';
import { useExpenseStore } from '@/store/expenseStore';

export function useExpenses() {
  const store = useExpenseStore();

  useEffect(() => {
    store.cargarGastos();
  }, []);

  return store;
}
