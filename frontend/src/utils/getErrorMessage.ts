import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (data?.errors?.length) {
      return data.errors[0].message;
    }

    if (data?.error) {
      return data.error;
    }

    if (data?.message) {
      return data.message;
    }
  }

  return 'Erro inesperado';
}
