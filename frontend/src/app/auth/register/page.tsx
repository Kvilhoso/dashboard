'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import Image from 'next/image';
import * as yup from 'yup';

import { useAuthStore } from '@/store/authStore';
import { CopyRight, GenericButton, TextField } from '@/components';
import { email, fullname, passwords } from '@/validations';

interface RegisterFormData {
  fullname: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const schema = yup.object().shape({
  fullname,
  email,
  ...passwords,
});

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const { control, watch, handleSubmit } = useForm<RegisterFormData>({
    defaultValues: {
      fullname: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
    resolver: yupResolver(schema),
  });

  const isDisabled =
    !watch('fullname') ||
    !watch('email') ||
    !watch('password') ||
    !watch('passwordConfirm');

  const onSubmit = handleSubmit(async data => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setToken('demo-token-' + Date.now());
    setUser({ id: '1', name: data.fullname, email: data.email, plan: null });
    router.push('/auth/onboarding');
    setLoading(false);
  });

  return (
    <main className='min-h-screen w-full flex flex-col items-center justify-center bg-black px-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-8 relative z-10'
      >
        <div className='flex flex-col items-center gap-2 mb-8'>
          <Image
            src='/logo-circle.png'
            alt='projeKt Rage logo'
            width={48}
            height={48}
            className='size-12'
          />
          <h1 className='text-2xl font-bold text-white tracking-tight'>
            projeKt Rage
          </h1>
        </div>

        <form onSubmit={onSubmit} className='flex flex-col my-4'>
          <Controller
            name='fullname'
            control={control}
            render={({ field, formState }) => (
              <TextField
                {...field}
                eyebrow='Nome completo'
                placeholder='Seu nome completo'
                disabled={loading}
                hint={formState.errors.fullname?.message ?? undefined}
                state={formState.errors.fullname ? 'error' : 'default'}
              />
            )}
          />

          <div className='mt-4'>
            <Controller
              name='email'
              control={control}
              render={({ field, formState }) => (
                <TextField
                  {...field}
                  eyebrow='E-mail'
                  type='email'
                  placeholder='seu@email.com'
                  disabled={loading}
                  hint={formState.errors.email?.message ?? undefined}
                  state={formState.errors.email ? 'error' : 'default'}
                />
              )}
            />
          </div>

          <div className='mt-4'>
            <Controller
              name='password'
              control={control}
              render={({ field, formState }) => (
                <TextField
                  {...field}
                  eyebrow='Senha'
                  type='password'
                  placeholder='Sua senha'
                  disabled={loading}
                  hint={formState.errors.password?.message ?? undefined}
                  state={formState.errors.password ? 'error' : 'default'}
                />
              )}
            />
          </div>

          <div className='mt-4 mb-8'>
            <Controller
              name='passwordConfirm'
              control={control}
              render={({ field, formState }) => (
                <TextField
                  {...field}
                  eyebrow='Confirmar senha'
                  type='password'
                  placeholder='Repita a senha'
                  disabled={loading}
                  hint={formState.errors.passwordConfirm?.message ?? undefined}
                  state={formState.errors.passwordConfirm ? 'error' : 'default'}
                />
              )}
            />
          </div>

          <GenericButton
            type='submit'
            layout='outline'
            loading={loading}
            disabled={isDisabled}
          >
            Criar conta
          </GenericButton>
        </form>

        <Link href='/auth/login' className='block mt-4' tabIndex={-1}>
          <GenericButton disabled={loading} tabIndex={0}>
            Já tenho conta
          </GenericButton>
        </Link>

        <div className='text-center mt-8'>
          <CopyRight />
        </div>
      </motion.div>
    </main>
  );
}
