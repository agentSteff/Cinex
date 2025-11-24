import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const URL_BASE = import.meta.env.VITE_API_URL;

const instanciaAxios = axios.create({ baseURL: URL_BASE });

// Adjuntar token a cada petición
instanciaAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.headers && !('Content-Type' in config.headers)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Manejo unificado de respuestas
instanciaAxios.interceptors.response.use(
  (response) => {
    // Tratar 204 No Content como null
    if (response.status === 204) return null;
    // Retornar response.data directamente para desenvolver la respuesta
    return response.data;
  },
  (error: AxiosError<{ error?: string; message?: string }>) => {
    // Manejo centralizado de 401
    if (error.response && error.response.status === 401) {
      console.log('[API] 401 No autorizado detectado');
      // Limpiar datos de autenticación
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      // No redirigir si ya está en la raíz (login) o si se usa hash routing
      // Esto previene bucles infinitos de recarga durante el login
      const estaEnPaginaLogin = window.location.pathname === '/' || window.location.pathname === '/login';
      if (!estaEnPaginaLogin) {
        console.log('[API] Redirigiendo a login debido a 401');
        window.location.href = '/';
      }
    }

    // Normalizar error a un objeto con mensaje y estado
    const mensaje =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'La petición a la API falló';
    const estado = error.response?.status || 0;
    return Promise.reject({ message: mensaje, status: estado, original: error });
  }
);

// Crear un cliente API tipado que retorna datos desenvueltos
const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return instanciaAxios.get(url, config);
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return instanciaAxios.post(url, data, config);
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return instanciaAxios.put(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return instanciaAxios.delete(url, config);
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return instanciaAxios.patch(url, data, config);
  },
};

export default api;
