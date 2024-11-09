import { useAppDispatch } from '@/store/hooks';
import { showToast as showToastAction, hideToast } from '@/store/slices/uiSlice';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export function useToast() {
  const dispatch = useAppDispatch();

  const showToast = (message: string, type: ToastType = 'info') => {
    dispatch(showToastAction({ message, type }));
    setTimeout(() => {
      dispatch(hideToast());
    }, 3000);
  };

  return { showToast };
}
