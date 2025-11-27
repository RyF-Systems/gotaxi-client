import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Text } from '@/components/common/Text';
import { useToast } from '@/hooks/toastContext';
import { useApi } from '@/hooks/useApi';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

const LoginScreen = () => {
  const [formState, setFormState] = React.useState({
    role: {
      value: '',
      error: '',
      required: true,
    },
    username: {
      value: '',
      error: '',
      required: true,
    },
    password: {
      value: '',
      error: '',
      required: true,
    },
  });

  const toast = useToast();
  const { execute: executeLogin, isLoading } = useApi(authService.login);
  const setAuthData = useAuthStore((state) => state.setAuthData);

  const updateField = (field: keyof typeof formState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        error: '',
      },
    }));
  };

  const setFieldError = (field: keyof typeof formState, errorMessage: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error: errorMessage,
      },
    }));

    setTimeout(() => {
      setFormState(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          error: '',
        },
      }));
    }, 5000);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (formState.role.required && !formState.role.value) {
      setFieldError('role', 'Debes seleccionar un rol');
      isValid = false;
    }

    if (formState.username.required && !formState.username.value) {
      setFieldError('username', 'El usuario es requerido');
      isValid = false;
    }

    if (formState.password.required && !formState.password.value) {
      setFieldError('password', 'La contraseña es requerida');
      isValid = false;
    } else if (formState.password.value && formState.password.value.length < 6) {
      setFieldError('password', 'La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }

    return isValid;
  };

  const handleLoginPress = async () => {
    if (!validateForm()) {
      toast.error('Formulario incompleto', 'Por favor completa todos los campos correctamente');
      return;
    }

    try {
      const response = await executeLogin({
        username: formState.username.value,
        password: formState.password.value,
        roleId: parseInt(formState.role.value),
      });
      setAuthData(response);
      toast.success('¡Bienvenido!', 'Inicio de sesión exitoso');
      
    } catch (error: any) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      if (status === 400) {
        const validationErrors = errorData?.errors;
        
        if (validationErrors) {
          Object.keys(validationErrors).forEach((field) => {
            if (field in formState) {
              setFieldError(field as keyof typeof formState, validationErrors[field]);
            }
          });
          toast.error('Datos inválidos', 'Por favor revisa los campos marcados');
        } else {
          toast.error('Datos inválidos', errorData?.message || 'Verifica tus credenciales');
        }
      } else if (status === 401) {
        setFieldError('password', 'Credenciales incorrectas');
        toast.error('Error de autenticación', errorData?.message || 'Usuario o contraseña incorrectos');
      } else if (status === 500) {
        toast.error('Error del servidor', 'Por favor intenta más tarde');
      } else if (!error.response) {
        toast.error('Error de conexión', 'Verifica tu conexión a internet');
      } else {
        toast.error('Error', errorData?.message || 'Ocurrió un error inesperado');
      }
    }
  };

  const handleRegisterPress = () => {
    console.log('Registro');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      style={styles.container}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.innerContainer}>
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="car" size={48} color="#2563eb" />
            </View>
            <View style={styles.titleContainer}>
              <Text variant="h1" weight="bold" style={styles.title}>
                Bienvenido a TaxiApp
              </Text>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <Select
              label="Selecciona tu rol"
              placeholder="Selecciona una opción"
              options={[
                { label: 'Cliente', value: '4' },
                { label: 'Conductor', value: '3' },
              ]}
              value={formState.role.value}
              onValueChange={(value) => updateField('role', value)}
              error={formState.role.error}
            />
            <Input
              label="Usuario"
              placeholder="Usuario"
              value={formState.username.value}
              onChangeText={(value) => updateField('username', value)}
              error={formState.username.error}
            />
            <Input
              label="Contraseña"
              placeholder="Contraseña"
              value={formState.password.value}
              onChangeText={(value) => updateField('password', value)}
              error={formState.password.error}
              secureTextEntry
            />
            <Button
              title="Iniciar sesión"
              variant="primary"
              onPress={handleLoginPress}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText} color={colors.text.secondary}>
              ¿Eres nuevo?{' '}
              <Link href={"/register"} asChild>
                <Text
                  style={styles.footerLink}
                  weight="semiBold"
                  onPress={handleRegisterPress}
                >
                  Regístrate ahora
                </Text>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    minHeight: '100%',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 448,
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  footer: {
    paddingTop: spacing.md,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  footerLink: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;