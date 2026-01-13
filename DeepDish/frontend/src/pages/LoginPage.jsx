import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { LockClosedIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { token, expiresIn } = response.data;
      
      login(token, expiresIn);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-brand-100">
        <CardHeader className="text-center pb-2 bg-white border-b-0">
            <div className="mx-auto bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-brand-600 ring-4 ring-brand-50/50">
                <LockClosedIcon className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Bienvenido a SACC</CardTitle>
            <p className="text-gray-500 mt-2 text-sm">Sistema de Asistencia Culinaria Contextual</p>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 text-center animate-fadeIn font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
                <Input
                  label="Usuario"
                  name="username"
                  type="text"
                  placeholder="admin"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
                
                <Input
                  label="Contraseña"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
            </div>

            <Button 
                type="submit" 
                className="w-full shadow-lg shadow-brand-500/20" 
                size="lg" 
                isLoading={isLoading}
                disabled={!formData.username || !formData.password}
            >
              Iniciar Sesión
            </Button>
            
            <p className="text-xs text-center text-gray-400 mt-4">
                Credenciales predeterminadas definidas en el servidor.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
